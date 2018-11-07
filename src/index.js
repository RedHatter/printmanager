import '@babel/polyfill'
import React from 'react'
import ReactDOM from 'react-dom'
import Amplify from 'aws-amplify'
import { Authenticator } from 'material-ui-utils'
import { Provider as ReduxProvider } from 'react-redux'
import DateFnsUtils from 'material-ui-pickers/utils/date-fns-utils'
import MuiPickersUtilsProvider from 'material-ui-pickers/utils/MuiPickersUtilsProvider'
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import { blue } from '@material-ui/core/colors';

import store from './store.js'

import App from './App.jsx'

Amplify.configure({
  Storage: {
    region: 'us-west-1',
    bucket: 'dealerdigitalgroup.printmanager',
    identityPoolId: '44b4cdbf-dac2-40a5-b0ef-a8adc1f30785'
  },
  Auth: {
    region: 'us-west-2',
    identityPoolId: 'us-west-2:44b4cdbf-dac2-40a5-b0ef-a8adc1f30785',
    userPoolId: 'us-west-2_dQ6iTiYI4',
    userPoolWebClientId: 'tvlsfbfcqdipq9j651vhuc387'
  }
})

const theme = createMuiTheme({
  palette: {
    primary: { main: blue[500] }
  },
})

ReactDOM.render((
  <MuiThemeProvider theme={theme}>
    <ReduxProvider store={ store }>
      <MuiPickersUtilsProvider utils={ DateFnsUtils }>
        <Authenticator logo={ <img src="/images/logo.png" /> }>
          <App />
        </Authenticator>
      </MuiPickersUtilsProvider>
    </ReduxProvider>
  </MuiThemeProvider>
), document.getElementById('root'))
