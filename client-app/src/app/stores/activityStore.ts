import { observable, action, computed, configure, runInAction } from 'mobx';
import { createContext, SyntheticEvent } from 'react';
import { IActivity } from '../models/activity';
import agent from '../api/agent';

configure({enforceActions: 'always'}); // enable strict mode for MOBX

class ActivityStore {
    //@observable activityRegistry = new Map<string, IActivity | undefined>(); // erwin add Map Generic types
    @observable activityRegistry = new Map();                                  // Note! Generic types is not used intentionally
    @observable activity: IActivity | null = null;
    @observable loadingInitial = false;
    @observable submitting = false;
    @observable target = '';

    @computed get activitiesByDate() {
        return this.groupActivitiesByDate(Array.from(this.activityRegistry.values()));
    }

    groupActivitiesByDate(activities: IActivity[]) {
        const sortedActivities = activities.sort(
            (a,b) => Date.parse(a.date) - Date.parse(b.date)
        );

        // Dictionary keyed by date where value is array of IActivity. Same date will have mutiliple array values
        return Object.entries(sortedActivities.reduce((activities, activity) => {
            const date = activity.date.split('T')[0]; // retrieve the date element
            activities[date] = activities[date] ? [...activities[date], activity] : [activity];
            return activities;
        }, {} as {[key: string]: IActivity[]} ));
    }

    @action loadActivities = async () => {
        this.loadingInitial = true;
        try{
            const activities = await agent.Activities.list();
            runInAction('loading activities', () => {
                activities.forEach((activity) => {
                    activity.date = activity.date.split('.')[0];  // Note! Remove the parts of the date after the decimal point
                    this.activityRegistry.set(activity.id, activity);
                });
                this.loadingInitial=false;
            });
            console.log(this.groupActivitiesByDate(activities));
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
        if (activity) {
            this.activity = activity;
        } else {
            this.loadingInitial = true;
            try {
                activity = await agent.Activities.details(id);
                runInAction('getting activity', () => {
                    this.activity = activity;
                    this.loadingInitial = false;
                });
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
            runInAction('creating activity', () => {
                this.activityRegistry.set(activity.id, activity);
                this.submitting = false;
                this.activity = activity;   // erwin add
            });
            
        }catch(error){
            runInAction('create activity error', () => {
                this.submitting = false;
            });
            console.log(error);
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
        } catch(error) {
            runInAction('edit activity error', () => {
                this.submitting = false;
            });
            console.log(error);
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
}

export default createContext(new ActivityStore());