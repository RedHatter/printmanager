import '@babel/polyfill'
import React from 'react'
import ReactDOM from 'react-dom'
import Amplify from 'aws-amplify'
import { Authenticator } from 'material-ui-utils'
import { MuiPickersUtilsProvider } from 'material-ui-pickers'
import DateFnsUtils from '@date-io/date-fns'
import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider'
import createMuiTheme from '@material-ui/core/styles/createMuiTheme'
import blue from '@material-ui/core/colors/blue'

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
  overrides: {
    MuiTable: {
      root: {
        width: 'auto'
      }
    }
  }
})

ReactDOM.render(
  <MuiThemeProvider theme={theme}>
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <Authenticator logo={<img className="logo" src="/images/logo.png" />}>
        <App />
      </Authenticator>
    </MuiPickersUtilsProvider>
  </MuiThemeProvider>,
  document.getElementById('root')
)
