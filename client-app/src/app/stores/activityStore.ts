import { observable, action, computed, configure, runInAction } from 'mobx';
import { createContext, SyntheticEvent } from 'react';
import { IActivity } from '../models/activity';
import agent from '../api/agent';

configure({enforceActions: 'always'}); // enable strict mode for MOBX

class ActivityStore {
    @observable activityRegistry = new Map<string, IActivity>(); // // erwin add Map Generic types
    //@observable activities: IActivity[] = [];
    @observable selectedActivity: IActivity | undefined;
    @observable loadingInitial = false;
    @observable editMode = false;
    @observable submitting = false;
    @observable target = '';

    @computed get activitiesByDate() {
        return Array.from(this.activityRegistry.values()).sort((a,b) => Date.parse(a.date) - Date.parse(b.date));
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

    @action createActivity = async (activity: IActivity) => {
        this.submitting = true;
        try {
            await agent.Activities.create(activity);
            runInAction('creating activity', () => {
                this.activityRegistry.set(activity.id, activity);
                this.editMode = false;
                this.submitting = false;
                this.selectedActivity = activity;   // erwin add
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
                this.selectedActivity = activity;
                this.editMode = false;
                this.submitting = false;
            });
        } catch(error) {
            runInAction('edit activity error', () => {
                this.submitting = false;
            });
            console.log(error);
            console.log(activity);
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
                this.selectedActivity = undefined;  // erwin add
                this.editMode = false;              // erwin add
            });
        }catch(error) {
            runInAction('delete activity error', () => {
                this.submitting = false;
                this.target = '';
            });
            console.log(error);
        }
    }

    @action openCreateForm = () => {
        this.editMode = true;
        this.selectedActivity = undefined;
    }

    @action openEditForm = (id: string) => {
        this.selectedActivity = this.activityRegistry.get(id);
        this.editMode = true;
    }

    @action cancelSelectedActivity = () => {
        this.selectedActivity = undefined;
    }

    @action cancelFormOpen = () => {
        this.editMode = false;
    }

    @action selectActivity = (id: string) => {
        this.selectedActivity = this.activityRegistry.get(id);
        this.editMode = false;
    }

}

export default createContext(new ActivityStore());