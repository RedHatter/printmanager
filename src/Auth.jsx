import React, { Component } from 'react'
import Amplify from 'aws-amplify'
import {
  Authenticator,
  SignIn as AmplifySignIn,
  SignUp as AmplifySignUp,
  ConfirmSignUp as AmplifyConfirmSignUp
} from 'aws-amplify-react'

import App from './App.jsx'
import SignIn from './SignIn.jsx'

Amplify.configure({
  Auth: {
    region: 'us-west-2',
    userPoolId: 'us-west-2_dQ6iTiYI4',
    userPoolWebClientId: 'tvlsfbfcqdipq9j651vhuc387'
    // mandatorySignIn: false,
  }
})

class Auth extends Component {
  render() {
    return (
      <Authenticator hide={ [ AmplifySignIn, AmplifySignUp, AmplifyConfirmSignUp ] }>
        <SignIn />
        <App />
      </Authenticator>
    )
  }
}

export default Auth;
