import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Paper } from '@material-ui/core'

import connect from '../connect.js'
import { JobType } from '../types.js'
import JobHeader from './JobHeader.jsx'
import Job from './Job.jsx'

class JobTable extends Component {
  static propTypes = {
    model: PropTypes.arrayOf(JobType).isRequired,
    files: PropTypes.object.isRequired
  }

  constructor(props) {
    super(props)

    this.state = {
      expanded: false
    }
  }

  render() {
    let { expanded } = this.state
    let { model, files, isAdmin } = this.props

    return (
      <div>
        <JobHeader />
        {model.map(o => (
          <Job
            key={o.id}
            model={o}
            files={files[o.id]}
            isAdmin={isAdmin}
            expanded={expanded == o.id}
            onChange={this.handleChange.bind(this, o.id)}
          />
        ))}
        {model.length == 0 && <Paper className="empty">No results.</Paper>}
      </div>
    )
  }

  handleChange(id, e, expanded) {
    this.setState({ expanded: expanded ? id : false })
  }
}

export default connect(state => ({ model: state.jobs, files: state.files }))(
  JobTable
)

<style>
.empty {
  color: gray;
  font-style: italic;
  text-align: left;
  padding: 10px 30px;
}
</style>