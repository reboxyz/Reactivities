import React, { useContext } from 'react';
import { Form as FinalForm, Field } from 'react-final-form';
import { Form, Button, Header } from 'semantic-ui-react';
import TextInput from '../../app/common/form/TextInput';
import { RootStoreContext } from '../../app/stores/rootStore';
import { IUserFormValues } from '../../app/models/user';
import { FORM_ERROR } from 'final-form';
import { combineValidators, isRequired } from 'revalidate';
import ErrorMessage from '../../app/common/form/ErrorMessage';

const validate = combineValidators({
    email: isRequired('email'),
    password: isRequired('password')
});

const LoginForm = () => {
    const rootStore = useContext(RootStoreContext);
    const { login } = rootStore.userStore;

    return (
        <FinalForm 
            onSubmit={(values: IUserFormValues) => login(values).catch(error => ({ 
                [FORM_ERROR]: error   // Note! This is how the way it is!!!! Pay attention to the wierd syntax
            })) }
            validate={validate}
            render={({handleSubmit, submitting, form, submitError, invalid, pristine, dirtySinceLastSubmit }) => (
                <Form onSubmit={handleSubmit} error>  
                    <Header as='h2' content='Login to Reactivities' color='teal' textAlign='center' />
                    <Field
                        name='email'
                        component={TextInput}
                        placeholder='Email'
                    />
                    <Field
                        name='password'
                        component={TextInput}
                        placeholder='Password'
                        type='password'
                    />    
                    {submitError && !dirtySinceLastSubmit && 
                        (
                         <ErrorMessage error={submitError} text='Invalid email or password' />
                        )
                    }
                    <Button 
                        color='teal' 
                        content='Login' 
                        loading={submitting} 
                        disabled={(invalid && !dirtySinceLastSubmit) || pristine } 
                        fluid
                    />
                    {/*
                    <pre>{JSON.stringify(form.getState(), null, 2)}</pre>
                    */}
                </Form>
            )}
        />
    );
}

export default LoginForm
