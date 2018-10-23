import React, { Component } from 'react'
import autobind from 'autobind-decorator'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Paper, Grid } from '@material-ui/core'

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

    this.state = {
      expanded: false
    }
  }

  render () {
    let { expanded } = this.state
    let { model, files } = this.props

    return (
      <div>
        <Grid container component={ Paper } className="header">
          <Grid item xs>Job Name</Grid>
          <Grid item xs>Mailer Type</Grid>
          <Grid item xs>Quanity</Grid>
          <Grid item xs>Drop Status</Grid>
          <Grid item xs>Drop Date</Grid>
          <Grid item xs>Job Status</Grid>
          <Grid item xs>Print Date</Grid>
          <Grid item xs>List Status</Grid>
          <Grid item xs>List Type</Grid>
          <Grid item xs>Order Date</Grid>
          <Grid item xs>Salesman</Grid>
        </Grid>
        { model.map(o => (<Job key={ o._id } model={ o } files={ files[o._id] }
          expanded={expanded == o._id } onChange={ this.handleChange.bind(this, o._id) } />)) }
        { model.length == 0 && <Paper className="empty">No results.</Paper> }
      </div>
    )
  }

  handleChange (id, e, expanded) {
    this.setState({ expanded: expanded ? id : false })
  }
}

export default connect(state => ({ model: state.jobs, files: state.files }))(JobTable)

<style>
  .header {
    margin: 16px 0;
    padding: 20px 72px 20 24px;
    color: rgba(0, 0, 0, 0.54);
  }

  .header > div {
    white-space: nowrap;
    min-width: 100px;
  }

  .empty {
    color: gray;
    font-style: italic;
    text-align: left;
    padding: 10px 30px;
  }
</style>
