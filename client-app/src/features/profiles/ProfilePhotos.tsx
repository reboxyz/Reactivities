import React, { useContext, useState } from 'react';
import { Tab, Header, Card, Image, Button, Grid, ButtonGroup } from 'semantic-ui-react';
import { RootStoreContext } from '../../app/stores/rootStore';
import { observer } from 'mobx-react-lite';
import PhotoUploadWidget from '../../app/common/photoUpload/PhotoUploadWidget';

const ProfilePhotos = () => {
    const rootStore = useContext(RootStoreContext);
    const {profile, isCurrentUser, uploadPhoto, uploadingPhoto, setMainPhoto, loading, deletePhoto} = rootStore.profileStore;
    const [addPhotoMode, setAddPhotoMode] = useState(false);
    const [target, setTarget] = useState<string | undefined>(undefined);
    const [deleteTarget, setDeleteTarget] = useState<string | undefined>(undefined);

    const handleUploadImage = (photo: Blob) => {
        uploadPhoto(photo).then(() => setAddPhotoMode(false));
    }

    return (
        <Tab.Pane>
            <Grid>
                <Grid.Column width={16} style={{ paddingBottom: 0 }}>
                    <Header floated='left' icon='image' content='Photos' />
                    {isCurrentUser && (
                        <Button 
                            floated='right' 
                            basic 
                            content={addPhotoMode ? 'Cancel' : 'Add Photo'} 
                            onClick={() => setAddPhotoMode(!addPhotoMode)}
                        />
                    )}
                </Grid.Column>
                <Grid.Column width={16}>
                    {addPhotoMode ? (
                        <PhotoUploadWidget uploadPhoto={handleUploadImage} loading={uploadingPhoto} />
                    ) : (
                        <Card.Group itemsPerRow={5}>
                        {profile && profile.photos.map((photo) => (
                            <Card key={photo.id}>
                                <Image src={photo.url} />
                                {isCurrentUser && 
                                    <ButtonGroup fluid widths={2}>
                                        <Button 
                                            name={photo.id}
                                            onClick={(e) => {
                                                setMainPhoto(photo);
                                                setTarget(e.currentTarget.name)
                                            }} 
                                            loading={loading && target === photo.id} 
                                            disabled={photo.isMain}
                                            basic 
                                            positive 
                                            content="Main" 
                                        />
                                        <Button 
                                            name={photo.id}
                                            disabled={photo.isMain}
                                            onClick={(e) => {
                                                deletePhoto(photo);
                                                setDeleteTarget(e.currentTarget.name)
                                            }}
                                            loading={loading && deleteTarget === photo.id}
                                            basic 
                                            negative 
                                            icon='trash' 
                                        />
                                    </ButtonGroup>
                                }
                            </Card>
                        ))}
                    </Card.Group>        
                    )}
                </Grid.Column>
            </Grid>
        </Tab.Pane>
    )
}

export default observer(ProfilePhotos);
