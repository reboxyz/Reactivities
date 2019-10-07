import React, { Fragment, useState, useEffect } from 'react';
import { Header, Grid, Image, Button } from 'semantic-ui-react';
import { observer } from 'mobx-react-lite';
import PhotoWidgetDropzone from './PhotoWidgetDropzone';
import { convertImageUrlToBlob } from '../util/util';
//import PhotoWidgetCropper from './PhotoWidgetCropper';

interface IProps {
  loading: boolean;
  uploadPhoto: (file: Blob) => void;
}

const PhotoUploadWidget: React.FC<IProps> = ({loading, uploadPhoto}) => {
    const [files, setFiles] = useState<any[]>([]);
    //const [image, setImage] = useState<Blob | null>(null);

    // ComponentWillUnmount equivalent and perform cleanup in the memory
    useEffect(() => {
        return () => {
            files.forEach(file => URL.revokeObjectURL(file.preview))
        }
    });

    return (
        <Fragment>
          <Grid>
            <Grid.Column width={4}>
              <Header color='teal' sub content='Step 1 - Add Photo' />
              <PhotoWidgetDropzone setFiles={setFiles} />
            </Grid.Column>
            <Grid.Column width={1} />
            <Grid.Column width={4}>
              <Header sub color='teal' content='Step 2 - Resize image (TODO FEATURE)' />
              {/* files.length > 0 &&
                <PhotoWidgetCropper setImage={setImage} imagePreview={files[0].preview} />
              */}
            </Grid.Column>
            <Grid.Column width={1} />
            <Grid.Column width={4}>
              <Header sub color='teal' content='Step 3 - Preview & Upload' />
              {files.length > 0 && 
                <Fragment>
                  <div className='img-preview' style={{minHeight: '200px', overflow: 'hidden'}}>
                    <Image src={files[0].preview} />
                  </div>
                  <Button.Group widths={2}>
                    <Button positive icon='check' loading={loading} onClick={async () => {
                      // Note! This is erwin's hack. Convent the image to blob
                      /*
                      const response = await fetch(files[0].preview);
                      const blob = await response.blob();
                      */
                      const blob = await convertImageUrlToBlob(files[0].preview); 
                      uploadPhoto(blob);
                      }}
                    />
                    <Button icon='close' disabled={loading} onClick={() => setFiles([])} />
                  </Button.Group>
                </Fragment>
                
              }
            </Grid.Column>
          </Grid>
        </Fragment>
      );
}

export default observer(PhotoUploadWidget);
