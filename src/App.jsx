import React, { Component, Fragment } from 'react'
import bound from 'bound-decorator'
import {
  Paper,
  Button,
  AppBar,
  Toolbar,
  Tab,
  IconButton,
  Icon,
  Typography,
  Fade,
  Slide,
  Snackbar
} from '@material-ui/core'
import PropTypes from 'prop-types'
import { Auth } from 'aws-amplify'

import CloseIcon from './icons/Close.js'
import connect from './connect.js'
import { ClientType } from './types.js'
import { SlideRight } from './transitions.jsx'
import {
  fetchJobs,
  fetchFiles,
  fetchClients,
  fetchUsers,
  fetchEblasts,
  clearError,
  createEblast
} from './actions.js'
import UploadButton from './UploadButton.jsx'
import Tabs from './Tabs.jsx'
import Client from './Client.jsx'
import Eblast from './eblast/Eblast.jsx'
import JobHeader from './print/JobHeader.jsx'
import Job from './print/Job.jsx'
import JobTable from './print/JobTable.jsx'
import CreateDialog from './print/CreateDialog.jsx'
import Filters from './print/Filters.jsx'
import Calendar from './print/Calendar.jsx'
import Sprint from './Sprint.jsx'
import Users from './users/Users.jsx'

class App extends Component {
  static propTypes = {
    clients: PropTypes.arrayOf(ClientType).isRequired
  }

  constructor(props) {
    super(props)

    this.state = {
      isCreateDialogOpen: false,
      selectedTab: 0,
      selectedClient: undefined
    }

    fetchUsers().then(fetchJobs)
    fetchFiles()
    fetchClients()
    fetchEblasts()

    const query = document.location.search.substring(1)
    if (query.length == 24) this.viewJob(query)
  }

  @bound
  async viewJob(id) {
    const res = await fetch('/api/job/' + id, {
      headers: {
        Authorization: (await Auth.currentSession()).idToken.jwtToken
      }
    })
    const selectedJob = await res.json()
    if (selectedJob.id == id) this.setState({ selectedJob, selectedTab: -1 })
  }

  render() {
    const { authData, clients, error } = this.props
    const { selectedTab, selectedClient, selectedJob } = this.state
    const isAdmin =
      'cognito:groups' in authData.signInUserSession.idToken.payload &&
      authData.signInUserSession.idToken.payload['cognito:groups'].includes(
        'Admin'
      )

    return (
      <Fragment>
        <Snackbar
          open={error != undefined}
          message={error}
          key={error}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          action={
            <IconButton color="inherit" onClick={clearError}>
              <CloseIcon />
            </IconButton>
          }
        />
        <AppBar position="static" color="default">
          <Toolbar>
            <img src="/images/logo.png" />
            <div className="header-button-container">
              {authData?.email}
              <Button onClick={this.handleSignOut}>Sign Out</Button>
            </div>
          </Toolbar>
        </AppBar>
        <div className="app">
          <div className="sidebar">
            {isAdmin && (
              <Button onClick={this.openCreateDialog}>Create Job</Button>
            )}
            <br />
            <UploadButton
              onSelect={e => {
                createEblast(e.target.files[0])
                this.handleTabChange(null, 2)
              }}
              accept="image/*"
            >
              Create e-blast
            </UploadButton>
            {this.state.isCreateDialogOpen && (
              <CreateDialog onClose={this.closeCreateDialog} />
            )}
            <Typography variant="headline">Views</Typography>
            <Tabs value={selectedTab} onChange={this.handleTabChange}>
              <Tab label="All Jobs" />
              <Tab label="Calendar" />
              <Tab label="Sprint" />
              <Tab label="E-blasts" />
              {isAdmin && <Tab label="Users" />}
            </Tabs>
            {isAdmin && (
              <Fragment>
                <Typography variant="headline">Clients</Typography>
                <Tabs value={selectedClient} onChange={this.handleClientChange}>
                  {clients.map(client => (
                    <Tab key={client.id} label={client.name} />
                  ))}
                  <Tab icon={<Icon>add</Icon>} />
                </Tabs>
              </Fragment>
            )}
            <Typography variant="headline">Search</Typography>
          </div>
          <div className="content-container">
            <Filters />
            {selectedJob && (
              <Fragment>
                <JobHeader />
                <Job model={selectedJob} expanded />
              </Fragment>
            )}
            <SlideRight in={selectedTab == 0}>
              <JobTable user={authData.username} isAdmin={isAdmin} />
            </SlideRight>
            <SlideRight in={selectedTab == 1}>
              <Calendar user={authData.username} />
            </SlideRight>
            <SlideRight in={selectedTab == 2}>
              <Sprint user={authData.username} />
            </SlideRight>
            <SlideRight in={selectedTab == 3}>
              <Eblast />
            </SlideRight>
            <SlideRight in={selectedTab == 4}>
              <Users />
            </SlideRight>
            <SlideRight in={selectedClient != undefined}>
              <Client model={clients[selectedClient]} />
            </SlideRight>
          </div>
        </div>
      </Fragment>
    )
  }

  @bound
  handleTabChange(e, value) {
    this.setState({
      selectedTab: value,
      selectedClient: undefined,
      selectedJob: undefined
    })
  }

  @bound
  handleClientChange(e, value) {
    this.setState({ selectedTab: undefined, selectedClient: value })
  }

  @bound
  handleSignOut() {
    Auth.signOut()
      .then(() => this.props.onStateChange('signIn'))
      .catch(console.error)
  }

  @bound
  closeCreateDialog() {
    this.setState({ isCreateDialogOpen: false })
  }

  @bound
  openCreateDialog() {
    this.setState({ isCreateDialogOpen: true })
  }
}

export default connect(state => ({
  clients: state.clients,
  error: state.errors > 0 ? state.errors[0].message : undefined
}))(App)

<style>
body {
  font-family: "Roboto", sans-serif;
  background-color: #f2f3f4;
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

.app .sidebar {
  text-align: center;
}

.app .sidebar h1 {
  margin-top: 50px;
}
</style>