import React, { Component, Fragment } from 'react'
import bound from 'bound-decorator'
import {
  Paper,
  Button,
  AppBar,
  Toolbar,
  Tab,
  IconButton,
  Typography,
  Fade,
  Slide,
  Snackbar
} from '@material-ui/core'
import PropTypes from 'prop-types'
import Cookies from 'js-cookie'

import { parseJSON } from '../utils.js'
import CloseIcon from './icons/Close.js'
import connect from './connect.js'
import { ClientType } from './types.js'
import { SlideRight } from './components/transitions.jsx'
import { fetchJobs, fetchClients, fetchUsers, clearError } from './actions.js'
import Tabs from './components/Tabs.jsx'
import JobList from './views/JobList.jsx'
import CreateDialog from './CreateDialog.jsx'
import Filters from './Filters.jsx'
import Calendar from './views/Calendar.jsx'
import Sprint from './views/Sprint.jsx'
import UserList from './users/UserList.jsx'
import ClientList from './clients/ClientList.jsx'

class App extends Component {
  static propTypes = {
    clients: PropTypes.arrayOf(ClientType).isRequired
  }

  constructor(props) {
    super(props)

    this.state = {
      isCreateDialogOpen: false,
      selectedTab: 0
    }

    fetchUsers().then(fetchJobs)
    fetchClients()

    const query = document.location.search.substring(1)
    if (query.length == 24) this.viewJob(query)
  }

  @bound
  async viewJob(id) {
    const res = await fetch('/api/job/' + id)
    const selectedJob = parseJSON(await res.text())
    if (selectedJob.id == id) this.setState({ selectedJob, selectedTab: -1 })
  }

  render() {
    const { clients, user, error } = this.props

    const { selectedTab, selectedClient, selectedJob } = this.state

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
          <img src="/images/logo.png" />
          {user.name}
          <Button onClick={this.handleSignOut}>Sign Out</Button>
        </AppBar>
        <div className="app">
          <div className="sidebar">
            {user.isAdmin && (
              <Button onClick={this.openCreateDialog}>Create Job</Button>
            )}
            <br />
            {this.state.isCreateDialogOpen && (
              <CreateDialog onClose={this.closeCreateDialog} />
            )}
            <Typography variant="headline">Views</Typography>
            <Tabs value={selectedTab} onChange={this.handleTabChange}>
              <Tab label="All Jobs" />
              <Tab label="Calendar" />
              <Tab label="Sprint" />
              {user.isAdmin && <Tab label="Users" />}
              {user.isAdmin && <Tab label="Clients" />}
            </Tabs>
          </div>
          <div className="content-container">
            {selectedTab <= 2 && <Filters />}
            <div className="content-wrapper">
              <SlideRight in={selectedTab == 0 || selectedJob}>
                <JobList show={selectedJob} />
              </SlideRight>
              <SlideRight in={selectedTab == 1}>
                <Calendar />
              </SlideRight>
              <SlideRight in={selectedTab == 2}>
                <Sprint />
              </SlideRight>
              <SlideRight in={selectedTab == 3}>
                <UserList />
              </SlideRight>
              <SlideRight in={selectedTab == 4}>
                <ClientList />
              </SlideRight>
            </div>
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
    Cookies.remove('AccessToken')
    location.reload()
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
  user: state.user,
  error: state.errors.length > 0 ? state.errors[0].message : undefined
}))(App)

<style>
body {
  background-color: #f2f3f4;
  font-family: 'Roboto', sans-serif;
}

header {
  align-items: center;
  flex-direction: row !important;
}

header img {
  margin-right: 30px;
}

header button {
  margin-left: 10px !important;
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
  width: 100%;
}

.content-wrapper {
  position: relative;
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  width: 100%;
}

.app .sidebar {
  text-align: center;
}

.app .sidebar h1 {
  margin-top: 50px;
}
</style>
