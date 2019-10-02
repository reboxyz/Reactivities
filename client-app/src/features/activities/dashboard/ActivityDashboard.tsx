import React, { useContext, useEffect } from 'react';
import { Grid } from 'semantic-ui-react';
import ActivityList from './ActivityList';
import { observer } from 'mobx-react-lite';
import LoadingComponent from '../../../app/layout/LoadingComponent';
import { RootStoreContext } from '../../../app/stores/rootStore';

const ActivityDashboard: React.FC = () => {  

    const rootStore = useContext(RootStoreContext);
    const { loadActivities, loadingInitial } = rootStore.activityStore;
    
    useEffect(() => {
      loadActivities()
    }, [loadActivities]);  // Note! 2nd param empty array will ensure that this will execute only once
    
    if (loadingInitial) return <LoadingComponent inverted={true} content='Loading activities...' />


    return (
      <Grid>
          <Grid.Column width={10}>
              <ActivityList />
          </Grid.Column>
          <Grid.Column width={6}>
              <h2>Activity Filters</h2>
          </Grid.Column>
      </Grid>
    )
}

export default observer(ActivityDashboard);
