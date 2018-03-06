import io from 'socket.io-client'
import React, { Component } from 'react'
import { Paper, Button } from 'material-ui'

import JobTable from './JobTable.jsx'
import CreateDialog from './CreateDialog.jsx'

const socket = io()

class App extends Component {
  constructor (props) {
    super(props)

    this.state = {
      model: [],
      isCreateDialogOpen: false
    }

    fetch('/api/job')
      .then(res => res.json())
      .then(model => this.setState({ model }))

    this.handleCreateDialogClose = this.handleCreateDialogClose.bind(this)
  }

  render () {
    return (
      <Paper className="app">
        <Button variant="raised" color="primary" onClick={ () => this.setState({ isCreateDialogOpen: true }) }>Create Job</Button>
        { this.state.isCreateDialogOpen && <CreateDialog onClose={ this.handleCreateDialogClose } /> }
        <JobTable model={ this.state.model }></JobTable>
      </Paper>
    )
  }

  handleCreateDialogClose () {
    this.setState({ isCreateDialogOpen: false })
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
