import React, { Fragment, useContext, useEffect } from 'react';
import { Container } from 'semantic-ui-react'
import NavBar from '../../features/nav/NavBar';
import ActivityDashboard from '../../features/activities/dashboard/ActivityDashboard';
import { observer } from 'mobx-react-lite';   // High-Order Component
import { Route, withRouter, RouteComponentProps, Switch } from 'react-router-dom';
import HomePage from '../../features/home/HomePage';
import ActivityForm from '../../features/activities/form/ActivityForm';
import ActivityDetails from '../../features/activities/details/ActivityDetails';
import NotFound from './NotFound';
import {ToastContainer} from 'react-toastify';
import { RootStoreContext } from '../stores/rootStore';
import LoadingComponent from './LoadingComponent';
import ModalContainer from '../common/modals/ModalContainer';
import ProfilePage from '../../features/profiles/ProfilePage';
import PrivateRoute from '../layout/PrivateRoute';

//const App: React.FC = () => {
const App: React.FC<RouteComponentProps> = ({location}) => {
    const rootStore = useContext(RootStoreContext);
    const {setAppLoaded, token, appLoaded} = rootStore.commonStore;
    const {getUser} = rootStore.userStore;

    useEffect(() => {
      if (token) {
        getUser().finally(() => setAppLoaded())
      } else {
        setAppLoaded();
      }
    }, [getUser, setAppLoaded, token]);

    if (!appLoaded) return <LoadingComponent content='Loading app...' />
    
    return (
      <Fragment>
          <ModalContainer />
          <ToastContainer position="bottom-right" />
          <Route exact path='/' component={HomePage} />
          <Route exact path={'/(.+)'} render={() => (
            <Fragment>
              <NavBar />
              <Container style={{ marginTop: '5.5em'}}>
                <Switch>
                  <PrivateRoute exact path='/activities' component={ActivityDashboard} />
                  <PrivateRoute path='/activities/:id' component={ActivityDetails} />
                  {/* key is a mechanism to enforce force loading of ActivityForm when the key changes. This is called fully uncontrolled component with a key. */}
                  <PrivateRoute 
                    key={location.key}  
                    path={['/createActivity', '/manage/:id']} 
                    component={ActivityForm} 
                  />
                  <PrivateRoute path='/profile/:username' component={ProfilePage} />
                  <Route component={NotFound} />
                </Switch>
              </Container>
            </Fragment>
          )} />
      </Fragment>
    );     
}

// Note! withRouter HOC will inject the location params and other params available in the RouteComponentProps
export default withRouter(observer(App));
