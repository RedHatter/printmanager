import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Paper } from '@material-ui/core'

import { useStore } from '../store.js'
import { JobType } from '../types.js'
import Job from '../job/Job.jsx'
import Column from '../components/Column.jsx'

JobList.propTypes = {
  show: JobType,
  elevation: PropTypes.number
}

export default function JobList({ show, elevation }) {
  const [expanded, setExpanded] = useState(false)
  const { jobs, user } = useStore()

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
          isAdmin={user.isAdmin}
          expanded={true}
        />
      ) : jobs.length > 0 ? (
        jobs.map(o => (
          <Job
            elevation={elevation}
            key={o.id}
            model={o}
            isAdmin={user.isAdmin}
            expanded={expanded == o.id}
            highlighted={o?.assignee?.id == user.id}
            onChange={e => setExpanded(expanded == o.id ? false : o.id)}
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
  padding: 10px 30px;
  color: gray;
  text-align: left;
  font-style: italic;
}

.header {
  margin: 16px 0;
  padding: 20px 72px 20 24px;
  color: rgba(0, 0, 0, 0.54);
  white-space: nowrap;
}

.header > div {
  margin: auto 15px;
  min-width: 100px;
  white-space: nowrap;
}
</style>
