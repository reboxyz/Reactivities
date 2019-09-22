import React, { useEffect, Fragment, useContext} from 'react';
import { List, Container } from 'semantic-ui-react'
import NavBar from '../../features/nav/NavBar';
import ActivityDashboard from '../../features/activities/dashboard/ActivityDashboard';
import LoadingComponent from './LoadingComponent';
import ActivityStore from '../stores/activityStore';
import {observer} from 'mobx-react-lite';   // High-Order Component

//const App: React.FC = () => {
const App = () => {
    const activityStore = useContext(ActivityStore);

    useEffect(() => {
      activityStore.loadActivities()
    }, [activityStore]);  // Note! 2nd param empty array will ensure that this will execute only once
    
    if (activityStore.loadingInitial) return <LoadingComponent inverted={true} content='Loading activities...' />

    return (
      <Fragment>
          <NavBar />
          <Container style={{ marginTop: '5.5em'}}>
            <List>
              <ActivityDashboard />
            </List>
          </Container>
      </Fragment>
    );
      
}

export default observer(App);
