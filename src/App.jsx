import React, { Component, Fragment } from 'react'
import autobind from 'autobind-decorator'
import { connect } from 'react-redux'
import {
  Paper, Button, AppBar, Toolbar, Tab, IconButton,
  Icon, Typography, Fade, Slide, Snackbar
} from '@material-ui/core'
import CloseIcon from '@material-ui/icons/Close'
import PropTypes from 'prop-types'
import { Auth } from 'aws-amplify'


import { ClientType } from './types.js'
import { SlideRight } from './transitions.jsx'
import {
  fetchJobs, fetchFiles, fetchClients, fetchSalesmen, clearError
} from './actions.js'
import Tabs from './Tabs.jsx'
import Client from './Client.jsx'
import JobTable from './JobTable.jsx'
import CreateDialog from './CreateDialog.jsx'
import Filters from './Filters.jsx'
import Calendar from './Calendar.jsx'

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

    this.props.fetchSalesmen()
      .then(this.props.fetchJobs)
    this.props.fetchFiles()
    this.props.fetchClients()
  }

  render () {
    let { authData, clients, error, clearError } = this.props
    let { selectedTab, selectedClient } = this.state

    return (
      <Fragment>
        <Snackbar open={ error != undefined } message={ error } key={ error }
          anchorOrigin={ { vertical: 'bottom', horizontal: 'right' } }
          action={ <IconButton color="inherit" onClick={ clearError }><CloseIcon /></IconButton> } />
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
              <Tab label="Calendar" />
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
            <SlideRight in={ selectedTab == 0 }><JobTable /></SlideRight>
            <SlideRight in={ selectedTab == 1 }><Calendar /></SlideRight>
            <SlideRight in={ selectedClient != undefined }><Client model={ clients[selectedClient] } /></SlideRight>
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

export default connect(
  state => ({ clients: state.clients, error: state.errors[0] }),
  { fetchJobs, fetchFiles, fetchClients, fetchSalesmen, clearError }
)(App)

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
    position: relative;
    margin: 24px 16px;
  }

  .app .sidebar h1 {
    margin-top: 50px;
  }
</style>
