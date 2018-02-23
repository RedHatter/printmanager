import React, { Component } from 'react'
import {
  AuthenticationDetails,
  CognitoUserPool,
  CognitoUser
} from 'amazon-cognito-identity-js'

import App from './App.jsx'

/**
 *  Handle authenticated flow with AWS Cognito. Children are hidden
 *  until user is authenticated.
 */

class LoginForm extends Component {
  constructor (props) {
    super(props)
    this.state = {
      user: '',
      password: '',
      state: 'unauthenticated'
    }

    this.userPool = new CognitoUserPool({
      UserPoolId : 'us-west-2_EFMtIXlnr',
      ClientId : '7irmvcapun4vembvh8kf52l961'
    })

    this.handleUsernameChange = this.handleUsernameChange.bind(this)
    this.handlePasswordChange = this.handlePasswordChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleNewPassword = this.handleNewPassword.bind(this)
    this.authenticated = this.authenticated.bind(this)
    this.handleSignOut = this.handleSignOut.bind(this)
  }

  componentDidMount () {
    this.cognitoUser = this.userPool.getCurrentUser()
    if (this.cognitoUser == null)
      return

    this.cognitoUser.getSession((err, session) => {
      if (err) console.error('Error retrieving session', err)
      else if (session.isValid()) this.authenticated(session)
    })
  }

  render () {
    switch(this.state.state) {
      case 'newPasswordRequired':
        return (
          <form onSubmit={ this.handleNewPassword }>
            <label>Password <input type='password' value={ this.state.password } onChange={ this.handlePasswordChange } /></label>
            <input type="submit" value="Change Password" />
          </form>
        )
      case 'unauthenticated':
        return (
          <form onSubmit={ this.handleSubmit }>
            <label>Username <input value={ this.state.user } onChange={ this.handleUsernameChange } /></label>
            <label>Password <input type='password' value={ this.state.password } onChange={ this.handlePasswordChange } /></label>
            <input type="submit" value="Login" />
          </form>
        )
      case 'authenticated':
        return <App />
    }
  }

  handleUsernameChange (e) {
    this.setState({ user: e.target.value })
  }

  handlePasswordChange (e) {
    this.setState({ password: e.target.value })
  }

  handleSubmit (e) {
    e.preventDefault()

    let authenticationDetails = new AuthenticationDetails({
      Username: this.state.user.trim(),
      Password: this.state.password.trim()
    })

    this.cognitoUser = new CognitoUser({
      Username: this.state.user.trim(),
      Pool: this.userPool
    })

    this.cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: this.authenticated,
        onFailure: err => console.error('Failed to authenticate', err),
        newPasswordRequired: (userAttributes, requiredAttributes) =>
          this.setState({ password: '', state: 'newPasswordRequired' })
    });
  }

  authenticated (session) {
    this.session = session
    this.setState({ state: 'authenticated', authorization: session.getIdToken().getJwtToken() })

    let exp = Math.min(session.getAccessToken().getExpiration(), session.getIdToken().getExpiration()) * 1000
    window.setTimeout(
      () => {
        this.cognitoUser.refreshSession(session.getRefreshToken(), (err, session) => {
          if (err) console.error('Error refreshing session', err)
          else this.authenticated(session)
        })
        console.log('refesh')
      }
    , exp - Date.now())
  }

  handleNewPassword (e) {
    e.preventDefault()

    this.cognitoUser.completeNewPasswordChallenge(this.state.password, null, {
      onSuccess: this.authenticated,
      onFailure: err => console.error('Failed to reset password', err)
    })
  }

  handleSignOut (e) {
    e.preventDefault()

    this.cognitoUser.signOut()
    this.setState({ password: '', state: 'unauthenticated' })
  }

}

export default LoginForm

<style>
  @import url("https://fonts.googleapis.com/icon?family=Material+Icons");
  @import url("https://fonts.googleapis.com/css?family=Roboto:300,400,500");

  .contentArea {
    display: inline-block;
    height: 100%;
    width: calc(100% - 260px);
    vertical-align: top;
    overflow: auto;
  }

  .depth-1 {
    box-shadow: 0 2px 2px 1px #E0E0E0;
    z-index: 1;
  }

  .depth-2 {
    box-shadow: 0 4px 4px 2px #E0E0E0;
    z-index: 2;
  }

  .depth-3 {
    box-shadow: 5px 15px 20px #9E9E9E;
    z-index: 3;
  }
</style>
