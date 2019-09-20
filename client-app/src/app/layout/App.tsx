import React, {useState, useEffect, Fragment} from 'react';
import axios from 'axios';
import { List, Container } from 'semantic-ui-react'
import { IActivity } from '../models/activity';
import NavBar from '../../features/nav/NavBar';
import ActivityDashboard from '../../features/activities/dashboard/ActivityDashboard';


//const App: React.FC = () => {
const App = () => {
    const [activities, setActivities] = useState<IActivity[]>([]);
    const [selectedActivity ,setSelectedActivity] = useState<IActivity | null>();
    const [editMode, setEditMode] = useState(false);

    const handleSelectedActivity = (id: string) => {
      setSelectedActivity(activities.filter(a => a.id === id)[0]);
      setEditMode(false);
    }

    const handleOpenCreateForm = () => {
      setSelectedActivity(null);
      setEditMode(true);
    }

    const handleCreateActivity = (activity: IActivity) => {
      setActivities([...activities, activity]);
      setSelectedActivity(activity);
      setEditMode(false);
    }

    const handleEditActivity = (activity: IActivity) => {
       setActivities([...activities.filter(a => a.id !== activity.id), activity]);
       setSelectedActivity(activity);
       setEditMode(false);
    }

    const handleDeleteActivity = (id: string) => {
      setActivities([...activities].filter(a => a.id !== id));
      setSelectedActivity(null); // erwin add
      setEditMode(false);        // erwin add
    }

    useEffect(() => {
      axios.get<IActivity[]>('http://localhost:5000/api/activities')
         .then((response) => {
           let activities: IActivity[] = [];
           response.data.forEach(activity => {
            activity.date = activity.date.split('.')[0];  // Note! Remove the parts of the date after the decimal point
            activities.push(activity);
           });
           setActivities(activities);
         });
    }, []);  // Note! 2nd param empty array will ensure that this will execute only once
    
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
                />
            </List>
          </Container>
      </Fragment>
    );
      
}

export default App;
