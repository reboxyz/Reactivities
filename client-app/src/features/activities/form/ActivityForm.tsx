import React, { useState, useContext, useEffect } from 'react'
import { Segment, Form, Button, Grid } from 'semantic-ui-react'
import { ActivityFormValues } from '../../../app/models/activity'
import { v4 as uuid}  from 'uuid';
import { observer } from 'mobx-react-lite';
import { RouteComponentProps } from 'react-router';
import {Form as FinalForm, Field} from 'react-final-form';
import TextInput from '../../../app/common/form/TextInput';
import TextAreaInput from '../../../app/common/form/TextAreaInput';
import SelectInput from '../../../app/common/form/SelectInput';
import { category } from '../../../app/common/options/categoryOptions';
import DateInput from '../../../app/common/form/DateInput';
import { combineDateAndTime } from '../../../app/common/util/util';
import {combineValidators, isRequired, composeValidators, hasLengthGreaterThan} from 'revalidate';
import { RootStoreContext } from '../../../app/stores/rootStore';

const validate = combineValidators({
    title: isRequired({message: 'The event title is required'}),
    category: isRequired({message: 'Category is required'}),
    description: composeValidators(
        isRequired('Description'),
        hasLengthGreaterThan(4)({message: 'Description needs to be at least 5 characters'})
    )(),
    city: isRequired('City'),
    venue: isRequired('Venue'),
    date: isRequired('Date'),
    time: isRequired('Time')
});
 

interface DetailParams {
    id: string
}

const ActivityForm: React.FC<RouteComponentProps<DetailParams>> = ({match, history}) => {
    const rootStore = useContext(RootStoreContext);
    const {createActivity, editActivity, submitting, loadActivity } = rootStore.activityStore;
    
    const [activity, setActivity] = useState(new ActivityFormValues());
    const [loading, setLoading] = useState(false);

    // If params 'id' is set then retrieve from API
    useEffect(() => {
        if (match.params.id) { 
            setLoading(true);
            // Note! id.length checking is to avoid memory leak warning. This will manifest when we edit the Details and redisplay the details
            loadActivity(match.params.id).then(
                (activity) => { 
                    setActivity(new ActivityFormValues(activity));
                    console.log('useEffect called with activity details', activity);
                })
                .finally(() => setLoading(false));
        }   
        // useEffect with cleanUp method which is equivalent to the UnMount React Class Component
        /*
        return () => {
            clearActivity();
        }
        */
    },[loadActivity, match.params.id]);  // Note! Second param is the set of dependencies in the useEffect

    const handleFinalFormSubmit = (values: any) => {
        const dateAndTime = combineDateAndTime(values.date, values.time);
        const {date, time, ...activity} = values;  // Special spread operator wherein remaining fields in 'values' will be set to 'activity'
        activity.date = dateAndTime
        
        if (!activity.id) {
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
        <Grid>
            <Grid.Column width={10}>
                <Segment clearing>
                    {/* onChange Event handler is handled automatically by FinalForm  */ }
                    <FinalForm 
                        validate={validate}
                        initialValues={activity}
                        onSubmit={handleFinalFormSubmit}
                        render={({handleSubmit, invalid, pristine}) => (
                            <Form onSubmit={handleSubmit} loading={loading} >
                                <Field 
                                    name="title" 
                                    placeholder='Title' 
                                    value={activity.title} 
                                    component={TextInput}
                                />
                                <Field
                                    name="description" 
                                    placeholder='Description' 
                                    value={activity.description} 
                                    component={TextAreaInput}
                                    rows={3}
                                />
                                <Field
                                    name="category" 
                                    placeholder='Category' 
                                    value={activity.category} 
                                    component={SelectInput}
                                    options={category}
                                />
                                <Form.Group widths='equal'>
                                    <Field
                                        name="date" 
                                        date={true}
                                        placeholder='Date' 
                                        value={activity.date} 
                                        component={DateInput}
                                    />
                                    <Field
                                        name="time" 
                                        time={true}
                                        placeholder='Time' 
                                        value={activity.time} 
                                        component={DateInput}
                                    />
                                </Form.Group>
                                <Field
                                    name="city" 
                                    placeholder='City' 
                                    value={activity.city} 
                                    component={TextInput}
                                />
                                <Field
                                    name="venue" 
                                    placeholder='Venue' 
                                    value={activity.venue} 
                                    component={TextInput}
                                />
                                <Button 
                                    loading={submitting} 
                                    disabled={loading || invalid || pristine}
                                    floated='right' positive 
                                    type='submit' 
                                    content='Submit' />
                                <Button 
                                    onClick={() => {
                                        activity.id ? history.push(`/activities/${activity.id}`)
                                        : history.push('/activities')
                                    }} 
                                    disabled={loading}
                                    floated='right'  
                                    type='button' 
                                    content='Cancel' />
                            </Form>
                        )}

                        
                    />
                    
                </Segment>
            </Grid.Column>
        </Grid>
        
    )
}

export default observer(ActivityForm);
