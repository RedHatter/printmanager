import io from 'socket.io-client'
import React, { Component } from 'react'
import { Paper, Button } from 'material-ui'

import JobTable from './JobTable.jsx'
import CreateDialog from './CreateDialog.jsx'
import ClientDialog from './ClientDialog.jsx'

const socket = io()

class App extends Component {
  constructor (props) {
    super(props)

    this.state = {
      jobs: [],
      clients: [],
      isCreateDialogOpen: false,
      isClientDialogOpen: false
    }

    fetch('/api/job')
      .then(res => res.json())
      .then(jobs => this.setState({ jobs }))
    fetch('/api/client')
      .then(res => res.json())
      .then(clients => this.setState({ clients }))

    this.closeCreateDialog = this.closeCreateDialog.bind(this)
    this.openCreateDialog = this.openCreateDialog.bind(this)
    this.closeClientDialog = this.closeClientDialog.bind(this)
    this.openClientDialog = this.openClientDialog.bind(this)
  }

  render () {
    return (
      <Paper className="app">
        <Button variant="raised" color="primary" onClick={ this.openCreateDialog }>Create Job</Button>
        { this.state.isCreateDialogOpen && <CreateDialog onClose={ this.closeCreateDialog } /> }

        <Button variant="raised" color="primary" onClick={ this.openClientDialog }>Clients</Button>
        { this.state.isClientDialogOpen && <ClientDialog onClose={ this.closeClientDialog } model={ this.state.clients } /> }
        <JobTable model={ this.state.jobs }></JobTable>
      </Paper>
    )
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
