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
    bucket: 'dealerdigitalgroup.printmanager'
  },
  Auth: {
    region: 'us-west-2',
    identityPoolId: 'us-west-2:ebaf2604-1d7e-4e64-8d72-bb1b9d4f7f01',
    userPoolId: 'us-west-2_***REMOVED***',
    userPoolWebClientId: '6101dpcsvmnjukllkelsr6ke0q'
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
