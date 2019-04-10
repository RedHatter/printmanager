import '@babel/polyfill'
import React from 'react'
import ReactDOM from 'react-dom'
import { MuiPickersUtilsProvider } from 'material-ui-pickers'
import DateFnsUtils from '@date-io/date-fns'
import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider'
import createMuiTheme from '@material-ui/core/styles/createMuiTheme'
import blue from '@material-ui/core/colors/blue'

import App from './App.jsx'

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
      <App />
    </MuiPickersUtilsProvider>
  </MuiThemeProvider>,
  document.getElementById('root')
)
