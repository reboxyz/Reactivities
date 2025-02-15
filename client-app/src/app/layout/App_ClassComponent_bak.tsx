import React, {Component} from 'react';
import axios from 'axios';
import { Header, Icon, List } from 'semantic-ui-react'
import { IActivity } from '../models/activity';

interface IState{
  activities: IActivity[];
}

//const App: React.FC = () => {
class App extends Component<{}, IState> {
    readonly state: IState = {
      activities: []
    }
    
    componentDidMount() {
      axios.get<IActivity[]>('http://localhost:5000/api/activities')
        .then((response) => {
          this.setState({
            activities: response.data
          });
        });
    }

    render() {
      return (
        <div>
            <Header as='h2'>
              <Icon name='users' />
              <Header.Content>
                Reactivities
              </Header.Content>
            </Header>
            <List>
              { this.state.activities.map((activity) => (<List.Item key={activity.id}>{activity.title}</List.Item> )) }
            </List>
        </div>
      );
    }  
}

export default App;
