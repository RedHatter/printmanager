import React, { Component } from 'react'

import { ClickAwayListener  } from 'material-ui'

import Job from './Job.jsx'

class JobTable extends Component {
  constructor (props) {
    super(props)

    this.state = { openId: false }

    this.handleClose = this.handleClose.bind(this)
  }

  render () {
    return (
      <table className='job-table'>
        <thead>
          <tr>
            <th>Job Name</th>
            <th>Mailer Type</th>
            <th>Quantity</th>
            <th>Drop Status</th>
            <th>Art Status</th>
            {/* <drop-status-filter v-model="query.dropStatus"></drop-status-filter>
            <art-status-filter v-model="query.artStatus"></art-status-filter> */}
            <th>List Status</th>
            <th>Order Date</th>
            <th>Salesman</th>
          </tr>
        </thead>
        <ClickAwayListener onClickAway={ this.handleClose }>
          <tbody>
            { this.props.model.map(o => (
              <Job key={ o._id } model={ o }
                isOpen={ this.state.openId == o._id }
                onClick={ this.toggle.bind(this, o._id) } />
            )) }
          </tbody>
        </ClickAwayListener>
      </table>
    )
  }

  toggle (id) {
    this.setState(state => ({ openId: state.openId == id ? false : id }))
  }

  handleClose () {
    this.setState({ openId: false })
  }
}

export default JobTable

<style>
  table.job-table {
    position: relative;
    background-color: white;
    border-collapse: collapse;
    z-index: 2;
  }

  table.job-table > thead > tr > th {
    background-color: #3498db;
    color: white;
    font-weight: bold;
    padding: 10px;
  }

  table.job-table > tbody > tr:nth-child(2n) > td {
    padding: 0;
  }

  table.job-table > tbody > tr:nth-child(2n+1) {
    cursor: pointer;
  }

  table.job-table > tbody > tr > td {
    padding: 30px;
    color: #757575;
  }
</style>
