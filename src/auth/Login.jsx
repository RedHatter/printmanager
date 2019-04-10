import React, { useState, Fragment } from 'react'
import ReactDOM from 'react-dom'
import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider'
import createMuiTheme from '@material-ui/core/styles/createMuiTheme'
import blue from '@material-ui/core/colors/blue'
import { Paper, Button, Typography } from '@material-ui/core'
import Cookies from 'js-cookie'
import { addSeconds } from 'date-fns'

import Form from '../components/Form.jsx'
import TextField from '../components/TextField.jsx'
import {
  signInUser,
  changePassword,
  forgotPassword,
  confirmForgotPassword
} from './aws.js'

const params = new URLSearchParams(location.search)

function Login(props) {
  const [authState, setAuthState] = useState(
    params.has('code') ? 'FORGOT_PASSWORD_RESET' : 'LOGIN'
  )
  const [authData, setAuthData] = useState({})

  const [errorMessage, setErrorMessage] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')

  if (
    authData.AuthenticationResult &&
    authData.AuthenticationResult.AccessToken
  )
    Cookies.set('AccessToken', authData.AuthenticationResult.AccessToken, {
      expires: addSeconds(new Date(), authData.AuthenticationResult.ExpiresIn)
    })

  if (Cookies.get('AccessToken')) location.href = '/'

  let content = null
  let onSubmit = null

  switch (authState) {
    case 'LOGIN':
      onSubmit = e =>
        signInUser(email, password)
          .then(data => {
            setErrorMessage('')
            setPassword('')
            setAuthData(data)
            if (data.ChallengeName == 'NEW_PASSWORD_REQUIRED')
              setAuthState('NEW_PASSWORD')
          })
          .catch(e => setErrorMessage(e.message))
      content = (
        <Fragment>
          <TextField
            required
            label="E-Mail"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <TextField
            required
            label="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <Button variant="contained" color="primary" type="submit">
            Login
          </Button>
          <Button onClick={e => setAuthState('FORGOT_PASSWORD')}>
            Forgot Password
          </Button>
        </Fragment>
      )
      break
    case 'NEW_PASSWORD':
      onSubmit = e =>
        changePassword(email, password, authData.Session)
          .then(data => {
            setErrorMessage('')
            setAuthData(data)
          })
          .catch(e => setErrorMessage(e.message))
      content = (
        <Fragment>
          <Typography>Please enter a new password.</Typography>
          <TextField
            required
            label="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <Button variant="contained" color="primary" type="submit">
            Done
          </Button>
        </Fragment>
      )
      break
    case 'FORGOT_PASSWORD':
      onSubmit = e =>
        forgotPassword(email)
          .then(data => {
            setErrorMessage('')
            setAuthData(data)
            setAuthState('FORGOT_PASSWORD_MESSAGE')
            console.log(data)
          })
          .catch(e => setErrorMessage(e.message))
      content = (
        <Fragment>
          <Typography>
            Enter your email address and we will send you a link to reset your
            password.
          </Typography>
          <TextField
            required
            label="E-Mail"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <Button variant="contained" color="primary" type="submit">
            Send
          </Button>
          <Button onClick={e => setAuthState('LOGIN')}>Back to Login</Button>
        </Fragment>
      )
      break
    case 'FORGOT_PASSWORD_MESSAGE':
      content = (
        <Fragment>
          <Typography>
            A link to reset your password has been sent to <b>{email}</b>.
          </Typography>
          <Button onClick={e => setAuthState('LOGIN')}>Back to Login</Button>
        </Fragment>
      )
      break
    case 'FORGOT_PASSWORD_RESET':
      onSubmit = e =>
        confirmForgotPassword(params.get('user'), params.get('code'), password)
          .then(data => {
            setErrorMessage('')
            setAuthData(data)
            setAuthState('LOGIN')
          })
          .catch(e => setErrorMessage(e.message))
      content = (
        <Fragment>
          <Typography>Please enter a new password.</Typography>
          <TextField
            required
            label="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <Button variant="contained" color="primary" type="submit">
            Done
          </Button>
        </Fragment>
      )
      break
  }

  return (
    <Paper component={Form} onSubmit={onSubmit}>
      <img className="logo" src="/images/logo.png" />
      <span style={{ color: '#f44336' }}>{errorMessage}</span>
      {content}
    </Paper>
  )
}

const theme = createMuiTheme({
  palette: {
    primary: { main: blue[500] }
  }
})

ReactDOM.render(
  <MuiThemeProvider theme={theme}>
    <Login />
  </MuiThemeProvider>,
  document.getElementById('root')
)
