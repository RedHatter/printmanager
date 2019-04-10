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
    },
    MuiTypography: {
      h1: {
        color: 'rgba(0, 0, 0, 0.87)',
        fontSize: '1.6rem',
        fontWeight: '400',
        lineHeight: '1.35'
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
