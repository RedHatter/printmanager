import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Paper } from '@material-ui/core'

import { useStore } from '../store.js'
import { JobType } from '../types.js'
import Job from '../job/Job.jsx'
import Column from '../components/Column.jsx'

JobList.propTypes = {
  user: PropTypes.string,
  isAdmin: PropTypes.bool,
  show: JobType
}

export default function JobList({ user, show, isAdmin, elevation }) {
  const [expanded, setExpanded] = useState(false)
  const { jobs, files } = useStore()

  return (
    <div className="job-list">
      <Paper className="header" elevation={elevation}>
        <Column group="name">Job Name</Column>
        <Column group="quantity">Quanity</Column>
        <Column group="dropStatus">Drop Status</Column>
        <Column group="dropDate">Drop Date</Column>
        <Column group="artStatus">Job Status</Column>
        <Column group="printDate">Print Date</Column>
        <Column group="dueDate">Due Date</Column>
        <Column group="assignee">Assignee</Column>
      </Paper>
      {show ? (
        <Job
          elevation={elevation}
          model={show}
          files={files[show.id]}
          isAdmin={isAdmin}
          expanded={true}
        />
      ) : jobs.length > 0 ? (
        jobs.map(o => (
          <Job
            elevation={elevation}
            key={o.id}
            model={o}
            files={files[o.id]}
            isAdmin={isAdmin}
            expanded={expanded == o.id}
            highlighted={o?.assignee?.id == user}
            onChange={e => setExpanded(o.id)}
          />
        ))
      ) : (
        <Paper className="empty">No results.</Paper>
      )}
    </div>
  )
}

<style>
.job-list {
  display: flex;
  flex-direction: column;
}

.empty {
  color: gray;
  font-style: italic;
  text-align: left;
  padding: 10px 30px;
}

.header {
  margin: 16px 0;
  padding: 20px 72px 20 24px;
  color: rgba(0, 0, 0, 0.54);
  white-space: nowrap;
}

.header > div {
  white-space: nowrap;
  min-width: 100px;
  margin: auto 15px;
}
</style>