import React, { useContext } from 'react';
import { Segment, Item, Header, Button, Image } from 'semantic-ui-react';
import { IActivity } from '../../../app/models/activity';
import { observer } from 'mobx-react-lite';
import { Link } from 'react-router-dom';
import {format} from 'date-fns';
import { RootStoreContext } from '../../../app/stores/rootStore';

const activityImageStyle = {
  filter: 'brightness(30%)'
};

const activityImageTextStyle = {
  position: 'absolute',
  bottom: '5%',
  left: '5%',
  width: '100%',
  height: 'auto',
  color: 'white'
};

const ActivityDetailedHeader: React.FC<{activity: IActivity}> = ({activity}) => {
    const rootStore = useContext(RootStoreContext);
    const {attendActivity, cancelAttendance, loading} = rootStore.activityStore;
    const host = activity.attendees.filter((attendee) => attendee.isHost)[0];

    return (
        <Segment.Group>
            <Segment basic attached='top' style={{ padding: '0' }}>
                <Image src={`/assets/categoryImages/${activity.category}.jpg`} fluid style={activityImageStyle} />
                <Segment basic style={activityImageTextStyle}>
                    <Item.Group>
                        <Item>
                            <Item.Content>
                            <Header
                                size='huge'
                                content={activity.title}
                                style={{ color: 'white' }}
                            />
                            <p>{format(activity.date, 'eeee do MMMM')}</p>
                            <p>
                                Hosted by <Link to={`/profile/${host.username}`}><strong>{host.displayName}</strong></Link> 
                            </p>
                            </Item.Content>
                        </Item>
                    </Item.Group>
                </Segment>
            </Segment>
            <Segment clearing attached='bottom'>
                {activity.isHost ? (
                    <Button as={Link} to={`/manage/${activity.id}`} color='orange' floated='right'>
                        Manage Event
                    </Button>
                ) : activity.isGoing ? 
                (
                    <Button onClick={cancelAttendance} loading={loading}>Cancel attendance</Button>
                ) :
                (
                    <Button onClick={attendActivity} loading={loading} color='teal'>Join Activity</Button>
                )}
            </Segment>
        </Segment.Group>
    )
}

export default observer(ActivityDetailedHeader);
