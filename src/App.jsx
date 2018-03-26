import io from 'socket.io-client'
import React, { Component } from 'react'
import { Paper, Button } from 'material-ui'
import AWS from 'aws-sdk'

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
      salesmen: [],
      isCreateDialogOpen: false,
      isClientDialogOpen: false
    }

    this.fetchJobs = this.fetchJobs.bind(this)
    this.fetchClients = this.fetchClients.bind(this)

    this.fetchJobs()
    this.fetchClients()
    socket.on('invalidateJobs', this.fetchJobs)
    socket.on('invalidateClients', () => {
      this.fetchClients()
      this.fetchJobs()
    })

    // Retrieve salesmen from cognito
    let cognito = new AWS.CognitoIdentityServiceProvider({
      region: 'us-west-2',
      accessKeyId: 'AKIAIRGJBHTLFGNYSQVA',
      secretAccessKey: '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'
    })
    cognito.listUsersInGroup({
      GroupName: 'Salesmen',
      UserPoolId: 'us-west-2_dQ6iTiYI4'
    }, (err, data) => {
      if (err) {
        console.log(err, err.stack)
        return
      }

      let salesmen = {}
      for (let user of data.Users) {
        let salesman = {}

        for (let attr of user.Attributes) {
          switch (attr.Name) {
            case 'email':
              salesman.email = attr.Value
              break
            case 'given_name':
              salesman.name = attr.Value
              break
            case 'phone_number':
              salesman.phoneNumber = attr.Value
          }
        }

        salesmen[user.Username] = salesman
      }

      this.setState({ salesmen })
    });

    this.closeCreateDialog = this.closeCreateDialog.bind(this)
    this.openCreateDialog = this.openCreateDialog.bind(this)
    this.closeClientDialog = this.closeClientDialog.bind(this)
    this.openClientDialog = this.openClientDialog.bind(this)
  }

  render () {
    if (this.props.authState != 'signedIn')
      return null

    return (
      <Paper className="app">
        <Button variant="raised" color="primary" onClick={ this.openCreateDialog }>Create Job</Button>
        { this.state.isCreateDialogOpen && <CreateDialog onClose={ this.closeCreateDialog } clients={ this.state.clients } salesmen={ this.state.salesmen } /> }

        <Button variant="raised" color="primary" onClick={ this.openClientDialog }>Clients</Button>
        { this.state.isClientDialogOpen && <ClientDialog onClose={ this.closeClientDialog } model={ this.state.clients } salesmen={ this.state.salesmen } /> }
        <JobTable model={ this.state.jobs } clients={ this.state.clients } salesmen={ this.state.salesmen }></JobTable>
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

  fetchJobs () {
    fetch('/api/job')
      .then(res => res.json())
      .then(jobs => this.setState({ jobs }))
  }

  fetchClients () {
    fetch('/api/client')
      .then(res => res.json())
      .then(clients => this.setState({ clients }))
  }
}

<style>
  @import url("https://fonts.googleapis.com/icon?family=Material+Icons");
  @import url("https://fonts.googleapis.com/css?family=Roboto:300,400,500");

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
