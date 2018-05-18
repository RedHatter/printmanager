import React from 'react'
import ReactDOM from 'react-dom'
import Amplify from 'aws-amplify'
import { Authenticator } from 'material-ui-utils'

import App from './App.jsx'

ReactDOM.render((
  <Authenticator configure={ {
    region: 'us-west-2',
    userPoolId: 'us-west-2_dQ6iTiYI4',
    userPoolWebClientId: 'tvlsfbfcqdipq9j651vhuc387'
  } } logo={ <img src="/images/logo.png" /> }>
    <App />
  </Authenticator>
), document.getElementById('root'))
