import React from 'react';
import { Form as FinalForm, Field } from 'react-final-form';
import { combineValidators, isRequired } from 'revalidate';
import { Form, Button } from 'semantic-ui-react';
import TextInput from '../../app/common/form/TextInput';
import TextAreaInput from '../../app/common/form/TextAreaInput';
import { observer } from 'mobx-react-lite';
import { IProfile } from '../../app/models/profile';

const validate = combineValidators({
    displayName: isRequired('displayName'),
});

interface IProps {
    updateProfile: (profile: IProfile) => void;
    profile: IProfile;
}

const ProfileEditForm: React.FC<IProps> = ({updateProfile, profile }) => {
    return (
        <FinalForm
            onSubmit={updateProfile}
            validate={validate}
            initialValues={profile!}
            render={({ handleSubmit, invalid, pristine, submitting}) => (
                <Form onSubmit={handleSubmit} error>
                    <Field
                        name='displayName'
                        component={TextInput}
                        placeholder='Display Name'
                        value={profile!.displayName}
                    />
                    <Field
                        name='bio'
                        component={TextAreaInput}
                        placeholder='Bio'
                        value={profile!.bio}
                    />
                    <Button
                        loading={submitting}
                        floated='right'
                        disabled={invalid || pristine}
                        positive
                        content='Update profile'
                        type='submit' 
                    />
                </Form>
            )}

        />
    )
}

export default  observer(ProfileEditForm);
