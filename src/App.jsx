import io from 'socket.io-client'
import React, { Component } from 'react'
import { Paper, Button } from 'material-ui'

import JobTable from './JobTable.jsx'

const socket = io()

class App extends Component {
  constructor (props) {
    super(props)

    this.state = { jobs: [] }
  }

  render () {
    return (
      <Paper className="app">
        <JobTable jobs={ this.state.jobs }></JobTable>
      </Paper>
    )
  }
}

<style>
  body {
    text-align: center;
    font-family: 'Roboto', sans-serif;
    background-color: #F2F3F4;
  }

  .app {
    display: inline-block;
    padding: 20px;
    margin: 100px 50%;
    transform: translateX(-50%)
  }
</style>

export default App
