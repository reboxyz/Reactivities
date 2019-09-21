import React from 'react'
import { Dimmer, Loader } from 'semantic-ui-react'


// Note! Another way to define props instead of using the usual Interface props. Props defined are optional
// as indicated by the question mark
const LoadingComponent: React.FC<{inverted?: boolean, content?: string}> = ({inverted = true, content}) => {
    return (
        <Dimmer active inverted={inverted}>
            <Loader content={content} />
        </Dimmer>
    )
}

export default LoadingComponent;
