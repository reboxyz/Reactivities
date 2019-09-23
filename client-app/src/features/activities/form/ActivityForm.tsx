import React, { useState, FormEvent, useContext, useEffect } from 'react'
import { Segment, Form, Button } from 'semantic-ui-react'
import { IActivity } from '../../../app/models/activity'
import { v4 as uuid}  from 'uuid';
import ActivityStore from '../../../app/stores/activityStore';
import { observer } from 'mobx-react-lite';
import { RouteComponentProps } from 'react-router';

interface DetailParams {
    id: string
}

const ActivityForm: React.FC<RouteComponentProps<DetailParams>> = ({match, history}) => {
    const activityStore = useContext(ActivityStore);
    const {createActivity, editActivity, submitting, activity: initialFormSate, loadActivity, clearActivity } = activityStore;
    
    const [activity, setActivity] = useState<IActivity>({
        id: '',                 // Note! The object must match with the property defined in IActivity type
        title: '',
        category: '',
        description: '',
        date: '', 
        city: '', 
        venue: ''
    });

    // If params 'id' is set then retrieve from API
    useEffect(() => {
        if (match.params.id && activity.id.length === 0) { 
            // Note! id.length checking is to avoid memory leak warning. This will manifest when we edit the Details and redisplay the details
            loadActivity(match.params.id).then(() => {
                initialFormSate && setActivity(initialFormSate);
                console.log('useEffect called with activity details');
            });
        }   
        // useEffect with cleanUp method which is equivalent to the UnMount React Class Component
        return () => {
            clearActivity();
        }
    },[loadActivity, clearActivity, match.params.id, initialFormSate, activity.id.length]);  // Note! Second param is the set of dependencies in the useEffect

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
            createActivity(newActivity).then(() => history.push(`/activities/${newActivity.id}`));
        } else {
            editActivity(activity).then(() => history.push(`/activities/${activity.id}`));;
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
                <Button loading={submitting} floated='right' positive type='submit' content='Submit' />
                <Button 
                    onClick={() => history.push('/activities')} 
                    floated='right'  
                    type='button' 
                    content='Cancel' />
            </Form>
        </Segment>
    )
}

export default observer(ActivityForm);
