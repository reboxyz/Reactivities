import { observable, action, computed, runInAction, reaction } from 'mobx';
import { SyntheticEvent } from 'react';
import { IActivity, IAttendee } from '../models/activity';
import agent from '../api/agent';
import { history } from '../../index';
import { toast } from 'react-toastify';
import { RootStore } from './rootStore';
import { setActivityProps, createAttendee } from '../common/util/util';
import {HubConnection, HubConnectionBuilder, LogLevel} from '@aspnet/signalr';

const LIMIT = 2;


export default class ActivityStore {
    rootStore: RootStore;

    constructor(rootStore: RootStore) {
        this.rootStore = rootStore;

        // When a Activity filter predicate changes then perform below
        reaction(
            () => this.predicate.keys(),
            () => {
                this.page = 0;
                this.activityRegistry.clear();
                this.loadActivities();
            }
        )
    }

    //@observable activityRegistry = new Map<string, IActivity | undefined>(); // erwin add Map Generic types
    @observable activityRegistry = new Map();                                  // Note! Generic types is not used intentionally
    @observable activity: IActivity | null = null;
    @observable loadingInitial = false;
    @observable submitting = false;
    @observable target = '';
    @observable loading = false;
    @observable.ref hubConnection: HubConnection | null = null;   // Note! Observing only the Reference and not the value
    @observable activityCount = 0;
    @observable page = 0;
    @observable predicate = new Map();  // Activity filtering

    @computed get totalPages() {
        return Math.ceil(this.activityCount / LIMIT);
    }

    @computed get axiosParams() {
        const params = new URLSearchParams();
        params.append('limit', String(LIMIT));
        params.append('offset', `${this.page ? this.page * LIMIT : 0}`);
        this.predicate.forEach((value, key) => {
            if (key === 'startDate') {
                params.append(key, value.toISOString());
            } else {
                params.append(key, value);
            }
        });
        return params;
    }

    @action setPredicate = (predicate: string, value: string | Date) => {
        this.predicate.clear();
        if (predicate !== 'all') {
            this.predicate.set(predicate, value);
        }
    }

    @action setPage = (page: number) => {
        this.page = page;
    }

    @action createHubConnection = () => {
        this.hubConnection = new HubConnectionBuilder()
            .withUrl('http://localhost:5000/chat', {
                accessTokenFactory: () => this.rootStore.commonStore.token!
            })
            .configureLogging(LogLevel.Information)
            .build();

        this.hubConnection
        .start()
        .then(() => console.log(this.hubConnection!.state))
        .catch(error => console.log('Error establishing connection', error));

        // Handler when a message/comment is received. Note! "ReceiveComment" should be equal with what is set in the ChatHub.cs
        this.hubConnection.on("ReceiveComment", comment => {
            runInAction(() => {
                this.activity!.comments.push(comment);
            });
        });
    }

    @action stopHubConnection = () => {
        this.hubConnection!.stop();
    }

    // Note! values came from Form input and should be identical with Application.Comments.Create.Command object
    @action addComment = async (values: any) => {
        values.activityId = this.activity!.id;
        try {
            // Should match the 'SendComment' method from API.SignalR.ChatHub.SendComment.
            // This is effectively invoking the server method from the client
            await this.hubConnection!.invoke('SendComment', values)
        }catch(error) {
            console.log(error);
        }
    }

    @computed get activitiesByDate() {
        return this.groupActivitiesByDate(Array.from(this.activityRegistry.values()));
    }

    groupActivitiesByDate(activities: IActivity[]) {
        const sortedActivities = activities.sort(
            (a,b) => a.date.getTime() - b.date.getTime()
        );

        // Dictionary keyed by date where value is array of IActivity. Same date will have mutiliple array values
        return Object.entries(sortedActivities.reduce((activities, activity) => {
            const date = activity.date.toISOString().split('T')[0]; // retrieve the date element
            activities[date] = activities[date] ? [...activities[date], activity] : [activity];
            return activities;
        }, {} as {[key: string]: IActivity[]} ));
    }

    @action loadActivities = async () => {
        this.loadingInitial = true;
        const user = this.rootStore.userStore.user!; // Get current login user
        try{
            const activitiesEnvelope = await agent.Activities.list(this.axiosParams);
            const {activities, activityCount} = activitiesEnvelope;
            //console.log(activities, activityCount);
            runInAction('loading activities', () => {
                activities.forEach((activity) => {
                    setActivityProps(activity, user);
                    this.activityRegistry.set(activity.id, activity);
                });
                this.activityCount = activityCount;
                this.loadingInitial=false;
            });
            //console.log(this.groupActivitiesByDate(activities));
        }catch(error) {
            runInAction('loading activities error', () => {
                this.loadingInitial=false;
            });
            console.log(error);
        }

        /* Note! Promise-chaining approach
        agent.Activities.list()
         .then((activities) => {
            activities.forEach((activity) => {
            activity.date = activity.date.split('.')[0];  // Note! Remove the parts of the date after the decimal point
            this.activities.push(activity);
           });
         })
         .catch(error => console.log(error))
         .finally(() => {
            this.loadingInitial = false;
         });
         */
    }

    @action loadActivity = async(id: string) => {
        // Note! Check if present in the registry. Otherwise, retrieve from the API
        let activity = this.getActivity(id);
        const user = this.rootStore.userStore.user!; // Get current logged-in user

        if (activity) {
            this.activity = activity;
            return activity;    // Note! Explicitly return activity to be used in the useState
        } else {
            this.loadingInitial = true;
            try {
                activity = await agent.Activities.details(id);
                runInAction('getting activity', () => {
                    setActivityProps(activity, user);
                    this.activity = activity;
                    this.activityRegistry.set(activity.id, activity);
                    this.loadingInitial = false;
                });
                return activity;    // Note! Explicitly return activity to be used in the useState
            }catch(error) {
                runInAction('get activity error', () => {
                    this.loadingInitial = false;
                })
                console.log(error);
            }
        }
    }

    @action clearActivity = () => {
        this.activity = null;
    }

    // Helper method (Not an action method)
    getActivity = (id: string) => {
        return this.activityRegistry.get(id);
    }

    @action createActivity = async (activity: IActivity) => {
        this.submitting = true;
        try {
            await agent.Activities.create(activity);
            const attendee = createAttendee(this.rootStore.userStore.user!);
            attendee.isHost = true;
            let attendees: IAttendee[] = [];
            attendees.push(attendee);
            activity.attendees = attendees;
            activity.comments = [];
            activity.isHost = true;

            runInAction('creating activity', () => {
                this.activityRegistry.set(activity.id, activity);
                this.submitting = false;
                this.activity = activity;   // erwin add
            });
            history.push(`/activities/${activity.id}`);
        }catch(error){
            runInAction('create activity error', () => {
                this.submitting = false;
            });
            toast.error('Problem submitting data');
            console.log(error.response);
        }
    }

    @action editActivity = async (activity: IActivity) => {
        this.submitting = true;
        try {
            await agent.Activities.update(activity);
            runInAction('editing activity', () => {
                this.activityRegistry.set(activity.id, activity);
                this.activity = activity;
                this.submitting = false;
            });
            history.push(`/activities/${activity.id}`);
        } catch(error) {
            runInAction('edit activity error', () => {
                this.submitting = false;
            });
            toast.error('Problem submitting data');
            console.log(error.response);
        }
    }

    @action deleteActivity = async (event: SyntheticEvent<HTMLButtonElement>, id: string) => {
        this.submitting = true;
        this.target = event.currentTarget.name;
        try {
            await agent.Activities.delete(id);
            runInAction('deleting activity', () => {
                this.activityRegistry.delete(id);
                this.submitting = false;
                this.target = '';
                this.activity = null;               // erwin add
            });
        }catch(error) {
            runInAction('delete activity error', () => {
                this.submitting = false;
                this.target = '';
            });
            console.log(error);
        }
    }   

    @action attendActivity = async () => {
        const attendee = createAttendee(this.rootStore.userStore.user!);
        this.loading = true;
        try {
            await agent.Activities.attend(this.activity!.id);
            runInAction(() => {
                if (this.activity) {
                    this.activity.attendees.push(attendee);
                    this.activity.isGoing = true;
                    this.activityRegistry.set(this.activity.id, this.activity);
                }
                this.loading = false;
            });
        }catch(error) {
            runInAction(() => {
                this.loading = false;
            });
            toast.error('Problem signing up to activity');
        }   
    }

    @action cancelAttendance = async () => {
        this.loading = true;
        try {
            await agent.Activities.unattend(this.activity!.id);
            runInAction(() => {
                if (this.activity) {
                    this.activity.attendees = this.activity.attendees.filter(
                        a => a.username !== this.rootStore.userStore.user!.username);
                    this.activity.isGoing = false;
                    this.activityRegistry.set(this.activity.id, this.activity);
                }
                this.loading = false;
            });
        }catch(error) {
            runInAction(() => {
                this.loading = false;
            });
            toast.error('Problem cancelling attendance');
        }
        
    }

}

