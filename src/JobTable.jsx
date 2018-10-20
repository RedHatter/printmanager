import React, { Component } from 'react'
import autobind from 'autobind-decorator'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Paper, Grid  } from '@material-ui/core'

import { JobType } from './types.js'
import Job from './Job.jsx'

@autobind
class JobTable extends Component {
  static propTypes = {
    model: PropTypes.arrayOf(JobType).isRequired,
    files: PropTypes.object.isRequired
  }

  constructor (props) {
    super(props)
  }

  render () {
    let { model, files } = this.props

    return (
      <div>
        <Grid container component={ Paper } className="header">
          <Grid item xs>Job Name</Grid>
          <Grid item xs>Mailer Type</Grid>
          <Grid item xs>Quanity</Grid>
          <Grid item xs>Drop Status</Grid>
          <Grid item xs>Drop Date</Grid>
          <Grid item xs>Art Status</Grid>
          <Grid item xs>Print Date</Grid>
          <Grid item xs>List Status</Grid>
          <Grid item xs>List Type</Grid>
          <Grid item xs>Order Date</Grid>
          <Grid item xs>Salesman</Grid>
        </Grid>
        { model.map(o => (<Job key={ o._id } model={ o } files={ files[o._id] } />)) }
      </div>
    )
  }
}

export default connect(state => ({ model: state.jobs, files: state.files }))(JobTable)

<style>
  .header {
    margin: 16px 0;
    padding: 20px 72px 20 24px;
    color: rgba(0, 0, 0, 0.54);
  }
</style>
