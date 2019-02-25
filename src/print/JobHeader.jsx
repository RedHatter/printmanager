import React from 'react'
import { Paper } from '@material-ui/core'

import Column from '../Column.jsx'

function JobHeader(props) {
  return (
    <Paper className="header" {...props}>
      <Column group="name">Job Name</Column>
      <Column group="quantity">Quanity</Column>
      <Column group="dropStatus">Drop Status</Column>
      <Column group="dropDate">Drop Date</Column>
      <Column group="artStatus">Job Status</Column>
      <Column group="printDate">Print Date</Column>
      <Column group="assignee">Assignee</Column>
    </Paper>
  )
}

export default JobHeader

<style>
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