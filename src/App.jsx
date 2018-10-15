import React, { Component, Fragment } from 'react'
import autobind from 'autobind-decorator'
import { Paper, Button, AppBar, Toolbar } from '@material-ui/core'
import { Auth } from 'aws-amplify'

import Filters from './Filters.jsx'
import JobTable from './JobTable.jsx'
import CreateDialog from './CreateDialog.jsx'

@autobind
class App extends Component {
  constructor (props) {
    super(props)

    this.state = {
      isCreateDialogOpen: false,
      isClientDialogOpen: false
    }
  }

  render () {
    return (
      <Fragment>
        <AppBar position="static" color="default">
          <Toolbar>
            <img src="/images/logo.png" />
            <div className="header-button-container">
              { this.props.authData && this.props.authData.email }
              <Button onClick={ this.handleSignOut }>Sign Out</Button>
            </div>
          </Toolbar>
        </AppBar>
        <Paper className="app">
          <Filters />
          <Button variant="raised" color="primary" onClick={ this.openCreateDialog }>Create Job</Button>
          { this.state.isCreateDialogOpen && <CreateDialog onClose={ this.closeCreateDialog } /> }

          <Button variant="raised" color="primary" onClick={ this.openClientDialog }>Clients</Button>
          { this.state.isClientDialogOpen && <ClientDialog onClose={ this.closeClientDialog } /> }
          <JobTable />
        </Paper>
      </Fragment>
    )
  }

  handleSignOut () {
    Auth.signOut()
      .then(() => this.props.onStateChange('signIn'))
      .catch(console.error)
  }

  closeCreateDialog () {
    this.setState({ isCreateDialogOpen: false })
  }

  openCreateDialog () {
    this.setState({ isCreateDialogOpen: true })
  }

  closeClientDialog () {
    this.setState({ isClientDialogOpen: false })
  }

  openClientDialog () {
    this.setState({ isClientDialogOpen: true })
  }
}

<style>
  body {
    font-family: 'Roboto', sans-serif;
    background-color: #F2F3F4;
    text-align: center;
  }

  .app {
    display: inline-block;
    padding: 20px;
    margin: 100px;
    text-align: left;
  }
</style>

export default App
