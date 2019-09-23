import React, { Fragment } from 'react';
import { Container } from 'semantic-ui-react'
import NavBar from '../../features/nav/NavBar';
import ActivityDashboard from '../../features/activities/dashboard/ActivityDashboard';
import { observer } from 'mobx-react-lite';   // High-Order Component
import { Route, withRouter, RouteComponentProps } from 'react-router-dom';
import HomePage from '../../features/home/HomePage';
import ActivityForm from '../../features/activities/form/ActivityForm';
import ActivityDetails from '../../features/activities/details/ActivityDetails';

//const App: React.FC = () => {
const App: React.FC<RouteComponentProps> = ({location}) => {
    return (
      <Fragment>
          <Route exact path='/' component={HomePage} />
          <Route exact path={'/(.+)'} render={() => (
            <Fragment>
              <NavBar />
              <Container style={{ marginTop: '5.5em'}}>
              <Route exact path='/activities' component={ActivityDashboard} />
              <Route path='/activities/:id' component={ActivityDetails} />
              {/* key is a mechanism to enforce force loading of ActivityForm when the key changes. This is called fully uncontrolled component with a key. */}
              <Route 
                key={location.key}  
                path={['/createActivity', '/manage/:id']} 
                component={ActivityForm} 
              />
              </Container>
            </Fragment>
          )} />
      </Fragment>
    );     
}

// Note! withRouter HOC will inject the location params and other params available in the RouteComponentProps
export default withRouter(observer(App));
