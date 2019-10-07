export interface IActivity {
    id: string;
    title: string; 
    description: string;
    category: string;
    date: Date; 
    city: string;
    venue: string;
    isGoing: boolean;   // Note! This refers to the current login User if he is going to the activity
    isHost: boolean;    // Note! This refers to the current login User if he is hosting the activity
    attendees: IAttendee[];
    comments: IComment[];
}

export interface IComment {
    id: string;
    createdAt: Date;
    body: string;
    username: string;
    displayName: string;
    image: string;
}

export interface IActivityFormValues extends Partial<IActivity> {
    time?: Date
}

export class ActivityFormValues implements IActivityFormValues {
    id?: string = undefined;                 
    title: string = '';
    category: string = '';
    description: string = '';
    date?: Date = undefined;   // Note! To be combined with time
    time?: Date = undefined;   // Note! To be combined with date
    city: string = '';
    venue: string = '';
    
    constructor(init?: IActivityFormValues) {
        if (init && init.date) {
            init.time = init.date;
            //Object.assign(this, init);
        }

        Object.assign(this, init);
    }
}

export interface IAttendee {
    username: string;
    displayName: string;
    image: string;
    isHost: boolean;
}