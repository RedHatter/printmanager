import React from 'react'
import { Paper } from '@material-ui/core'

import Column from './Column.jsx'

function JobHeader (props) {
  return <Paper className="header">
    <Column group="name">Job Name</Column>
    <Column group="quantity">Quanity</Column>
    <Column group="dropStatus">Drop Status</Column>
    <Column group="dropDate">Drop Date</Column>
    <Column group="artStatus">Job Status</Column>
    <Column group="printDate">Print Date</Column>
    <Column group="listStatus">List Status</Column>
    <Column group="listType">List Type</Column>
    <Column group="created">Order Date</Column>
    <Column group="salesman">Salesman</Column>
  </Paper>
}

export default JobHeader
