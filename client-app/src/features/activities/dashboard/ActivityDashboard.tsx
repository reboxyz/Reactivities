import React, { useContext, useEffect, useState } from 'react';
import { Grid, Loader } from 'semantic-ui-react';
import ActivityList from './ActivityList';
import { observer } from 'mobx-react-lite';
//import LoadingComponent from '../../../app/layout/LoadingComponent';
import { RootStoreContext } from '../../../app/stores/rootStore';
import InfiniteScroll from 'react-infinite-scroller';
import ActivityFilters from './ActivityFilters';
import ActivityListItemPlaceholder from './ActivityListItemPlaceholder';

const ActivityDashboard: React.FC = () => {  
    const rootStore = useContext(RootStoreContext);
    const { loadActivities, loadingInitial, setPage, page, totalPages } = rootStore.activityStore;
    const [loadingNext, setLoadingNext] = useState(false);

    const handleGetNext = () => {
      setLoadingNext(true);
      setPage(page + 1);
      loadActivities().then(() => setLoadingNext(false));
    }
    
    useEffect(() => {
      loadActivities()
    }, [loadActivities]);  // Note! 2nd param empty array will ensure that this will execute only once
    
    //if (loadingInitial && page === 0) return <LoadingComponent inverted={true} content='Loading activities...' />

    return (
      <Grid>
          <Grid.Column width={10}>
              {loadingInitial && page === 0 ? <ActivityListItemPlaceholder/> :
                <InfiniteScroll 
                  pageStart={0}
                  loadMore={handleGetNext}
                  hasMore={!loadingNext && page + 1 < totalPages}
                  initialLoad={false}  // Set to false coz we rely on useEffect
                >
                  <ActivityList />
                </InfiniteScroll>
                }
          </Grid.Column>
          <Grid.Column width={6}>
              <ActivityFilters />
          </Grid.Column>
          <Grid.Column width={10}   // width should have the same value with the main Component
          >
              <Loader active={loadingNext} /> 
          </Grid.Column>
      </Grid>
    )
}

export default observer(ActivityDashboard);
