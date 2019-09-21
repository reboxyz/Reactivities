import React, {useState, useEffect, Fragment, SyntheticEvent} from 'react';
import { List, Container } from 'semantic-ui-react'
import { IActivity } from '../models/activity';
import NavBar from '../../features/nav/NavBar';
import ActivityDashboard from '../../features/activities/dashboard/ActivityDashboard';
import agent from '../api/agent';
import LoadingComponent from './LoadingComponent';


//const App: React.FC = () => {
const App = () => {
    const [activities, setActivities] = useState<IActivity[]>([]);
    const [selectedActivity ,setSelectedActivity] = useState<IActivity | null>();
    const [editMode, setEditMode] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [target, setTarget] = useState('');  // State to represent the Button Name used in deleting activity to make use togethe with submitting state

    const handleSelectedActivity = (id: string) => {
      setSelectedActivity(activities.filter(a => a.id === id)[0]);
      setEditMode(false);
    }

    const handleOpenCreateForm = () => {
      setSelectedActivity(null);
      setEditMode(true);
    }

    const handleCreateActivity = (activity: IActivity) => {
      setSubmitting(true);
      agent.Activities.create(activity).then(() => {
        setActivities([...activities, activity]);
        setSelectedActivity(activity);
        setEditMode(false); 
      }).then(() => {
        setSubmitting(false);
      });
    }

    const handleEditActivity = (activity: IActivity) => {
      setSubmitting(true);
      agent.Activities.update(activity).then(() => {
        setActivities([...activities.filter(a => a.id !== activity.id), activity]);
       setSelectedActivity(activity);
       setEditMode(false);
      }).then(() => {
        setSubmitting(false);
      });
    }

    const handleDeleteActivity = (event: SyntheticEvent<HTMLButtonElement>,id: string) => {
      setSubmitting(true);
      setTarget(event.currentTarget.name); // Effectively the Activity.id
      agent.Activities.delete(id).then(() => {
        setActivities([...activities].filter(a => a.id !== id));
        setSelectedActivity(null); // erwin add
        setEditMode(false);        // erwin add
      }).then(() => {
        setSubmitting(false);
      });
    }

    useEffect(() => {
      agent.Activities.list()
         .then((response) => {
           let activities: IActivity[] = [];
           response.forEach((activity) => {
            activity.date = activity.date.split('.')[0];  // Note! Remove the parts of the date after the decimal point
            activities.push(activity);
           });
           setActivities(activities);
         }).then(() => setLoading(false));
    }, []);  // Note! 2nd param empty array will ensure that this will execute only once
    
    if (loading) return <LoadingComponent inverted={true} content='Loading activities...' />

    return (
      <Fragment>
          <NavBar openCreateForm={handleOpenCreateForm} />
          <Container style={{ marginTop: '5.5em'}}>
            <List>
              <ActivityDashboard 
                activities={activities} 
                selectActivity={handleSelectedActivity}  
                selectedActivity={selectedActivity!}  
                editMode={editMode}
                setEditMode={setEditMode}
                setSelectedActivity={setSelectedActivity}
                createActivity={handleCreateActivity}
                editActivity={handleEditActivity}
                deleteActivity={handleDeleteActivity}
                submitting={submitting}
                target={target}
                />
            </List>
          </Container>
      </Fragment>
    );
      
}

export default App;
