import io from 'socket.io-client'
import React, { Component } from 'react'

import JobTable from './JobTable.jsx'

const socket = io()

class App extends Component {
  constructor (props) {
    super(props)

    this.state = { jobs: [] }
  }

  render () {
    return (
      <div className="app">
        <JobTable jobs={ this.state.jobs }></JobTable>
      </div>
    )
  }
}

<style>
  body {
    text-align: center;
  }

  .app {
    text-align: left;
    padding: 20px;
    background-color: white;
    border-radius: 5px;
    display: inline-block;
    margin: 100px 0;
  }
</style>

export default App
