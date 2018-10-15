import 'babel-polyfill'
import React from 'react'
import ReactDOM from 'react-dom'
import Amplify from 'aws-amplify'
import { Authenticator } from 'material-ui-utils'
import { Provider as ReduxProvider } from 'react-redux'
import MomentUtils from 'material-ui-pickers/utils/moment-utils'
import MuiPickersUtilsProvider from 'material-ui-pickers/utils/MuiPickersUtilsProvider'

import store from './store.js'

import App from './App.jsx'

Amplify.configure({
  Storage: {
    region: 'us-west-1',
    bucket: 'dealerdigitalgroup.printmanager'
  },
  Auth: {
    region: 'us-west-2',
    identityPoolId: 'us-west-2:44b4cdbf-dac2-40a5-b0ef-a8adc1f30785',
    userPoolId: 'us-west-2_dQ6iTiYI4',
    userPoolWebClientId: 'tvlsfbfcqdipq9j651vhuc387'
  }
})

ReactDOM.render((
  <Authenticator logo={ <img src="/images/logo.png" /> }>
    <ReduxProvider store={ store }>
      <MuiPickersUtilsProvider utils={ MomentUtils }>
        <App />
      </MuiPickersUtilsProvider>
    </ReduxProvider>
  </Authenticator>
), document.getElementById('root'))
