import React, { Component, Fragment } from 'react'
import autobind from 'autobind-decorator'
import { connect } from 'react-redux'
import { Paper, Button, AppBar, Toolbar, Tab, Icon, Typography } from '@material-ui/core'
import PropTypes from 'prop-types'
import { Auth } from 'aws-amplify'

import { ClientType } from './types.js'
import Tabs from './Tabs.jsx'
import Client from './Client.jsx'
import JobTable from './JobTable.jsx'
import CreateDialog from './CreateDialog.jsx'
import Filters from './Filters.jsx'

@autobind
class App extends Component {
  static propTypes = {
    clients: PropTypes.arrayOf(ClientType).isRequired,
  }

  constructor (props) {
    super(props)

    this.state = {
      isCreateDialogOpen: false,
      selectedTab: 0,
      selectedClient: undefined
    }
  }

  render () {
    let { authData, clients } = this.props
    let { selectedTab, selectedClient } = this.state

    return (
      <Fragment>
        <AppBar position="static" color="default">
          <Toolbar>
            <img src="/images/logo.png" />
            <div className="header-button-container">
              { authData && authData.email }
              <Button onClick={ this.handleSignOut }>Sign Out</Button>
            </div>
          </Toolbar>
        </AppBar>
        <div className="app">
          <div className="sidebar">
            <Button color="primary" onClick={ this.openCreateDialog }>Create Job</Button>
            { this.state.isCreateDialogOpen && <CreateDialog onClose={ this.closeCreateDialog } /> }
            <Typography variant="headline">Views</Typography>
            <Tabs value={ selectedTab } onChange={ this.handleTabChange }>
              <Tab label="All Jobs" />
            </Tabs>
            <Typography variant="headline">Clients</Typography>
            <Tabs value={ selectedClient } onChange={ this.handleClientChange }>
              { clients.map(client => <Tab key={ client._id } label={ client.name } />) }
              <Tab icon={ <Icon>add</Icon> } />
            </Tabs>
            <Typography variant="headline">Search</Typography>
            <Filters />
          </div>
          <div className="content-container">
            { selectedTab >= 0
              ? [ <JobTable />, <CreateDialog /> ][selectedTab]
              : <Client model={ clients[selectedClient] } />
            }
          </div>
        </div>
      </Fragment>
    )
  }

  handleTabChange (e, value) {
    this.setState({ selectedTab: value, selectedClient: undefined })
  }

  handleClientChange (e, value) {
    this.setState({ selectedTab: undefined, selectedClient: value })
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
}

export default connect(state => ({ clients: state.clients }))(App)

<style>
  body {
    font-family: 'Roboto', sans-serif;
    background-color: #F2F3F4;
    text-align: center;
  }

  .app {
    display: flex;
    margin: 24px 0;
  }

  h2 {
    margin-bottom: 20px !important;
  }

  .content-container {
     margin: 24px 16px;
  }

  .app .sidebar h1 {
    margin-top: 50px;
  }
</style>
