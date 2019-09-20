import React, { useState, FormEvent } from 'react'
import { Segment, Form, Button } from 'semantic-ui-react'
import { IActivity } from '../../../app/models/activity'
import { v4 as uuid}  from 'uuid';

interface IProps {
    setEditMode: (editMode: boolean) => void;
    activity: IActivity | null;
    createActivity: (activity: IActivity) => void;
    editActivity: (activity: IActivity) => void;
}

// Note! activity is alias to 'initialFormState'
const ActivityForm: React.FC<IProps> = ({setEditMode, activity: initialFormSate, createActivity, editActivity }) => {
    const initializeForm = () => {
        if (initialFormSate) {
            return initialFormSate;
        } else {
            return {
                id: '',                 // Note! The object must match with the property defined in IActivity type
                title: '',
                category: '',
                description: '',
                date: '', 
                city: '', 
                venue: ''
            };
        }
    }

    const [activity, setActivity] = useState<IActivity>(initializeForm());
    const handleInputChange = (event: FormEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = event.currentTarget;
        setActivity({...activity, [name]: value });
    }

    const handleSubmit = () => {
        if (activity.id.length === 0) {
            let newActivity = {
                ...activity,
                id: uuid()
            };
            createActivity(newActivity);
        } else {
            editActivity(activity);
        }
    }

    return (
        <Segment clearing>
            <Form onSubmit={handleSubmit}>
                <Form.Input 
                    onChange={handleInputChange} 
                    name="title" 
                    placeholder='Title' 
                    value={activity.title} 
                />
                <Form.TextArea 
                    rows={2} 
                    onChange={handleInputChange} 
                    name="description" 
                    placeholder='Description' 
                    value={activity.description} 
                />
                <Form.Input 
                    onChange={handleInputChange} 
                    name="category" 
                    placeholder='Category' 
                    value={activity.category} 
                />
                <Form.Input 
                    onChange={handleInputChange} 
                    name="date" 
                    type='datetime-local' 
                    placeholder='Date' 
                    value={activity.date} 
                />
                <Form.Input 
                    onChange={handleInputChange} 
                    name="city" 
                    placeholder='City' 
                    value={activity.city} 
                />
                <Form.Input 
                    onChange={handleInputChange} 
                    name="venue" 
                    placeholder='Venue' 
                    value={activity.venue} 
                />
                <Button floated='right' positive type='submit' content='Submit' />
                <Button 
                    onClick={() => setEditMode(false)} 
                    floated='right'  
                    type='button' 
                    content='Cancel' />
            </Form>
        </Segment>
    )
}

export default ActivityForm;
