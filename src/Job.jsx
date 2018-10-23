import React, { Fragment } from 'react'
import classnames from 'classnames'
import PropTypes from 'prop-types'
import { Storage } from 'aws-amplify'
import { Grid, ExpansionPanel, ExpansionPanelSummary, ExpansionPanelDetails } from '@material-ui/core'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import { startOfDay } from 'date-fns'

import { JobType } from './types.js'
import Collapse from './Collapse.jsx'
import JobActions from './JobActions.jsx'

import { colorize, formatNumber, formatPhone, formatDate } from '../utils.js'

Job.propTypes = {
  model: JobType.isRequired,
  files: PropTypes.object
}

function Job (props) {
  let { model, files, ...rest } = props
  let {
    name, fold, size, type, quantity, dropDate, printDate, artStatus, dropStatus,
    listType, created, salesman, client, addons, envelope, vendor, trackingNumber,
    expire, comments, forceComplete
  } = model

  let listStatus = 'Count Pending'
  if (files && 'Data List' in files)
    listStatus = 'List Uploaded'
  else if (listType = 'Saturation')
    listStatus = 'List Pending'

  let today = startOfDay(new Date())

  return (
    <ExpansionPanel { ...rest }>
      <ExpansionPanelSummary expandIcon={ <ExpandMoreIcon /> } className={ classnames({
        complete: forceComplete || (files && [
          'Proof', 'Data List', 'Dealer invoice',
          'Printer invoice', 'Postal', 'Prize board'
        ].every(key => key in files)),
        late: dropDate < today && !dropStatus
      }, 'job-row') }>
        <Grid item xs>{ name }</Grid>
        <Grid item xs>{ fold } &mdash; { size }</Grid>
        <Grid item xs>{ formatNumber(quantity) }</Grid>
        <Grid item xs>
          <span className={ classnames('statusBlock', colorize(dropStatus)) }>
            { dropStatus ? formatDate(dropStatus) : 'Incomplete' }
          </span>
        </Grid>
        <Grid item xs>{ formatDate(dropDate) }</Grid>
        <Grid item xs>
          <span className={ classnames('statusBlock', colorize(artStatus)) }>{ artStatus }</span>
        </Grid>
        <Grid item xs>{ formatDate(printDate) }</Grid>
        <Grid item xs>
          <span className={ classnames('statusBlock', colorize(listStatus)) }>{ listStatus }</span>
        </Grid>
        <Grid item xs>{ listType }</Grid>
        <Grid item xs>{ formatDate(created) }</Grid>
        <Grid item xs>{ salesman.name }</Grid>
      </ExpansionPanelSummary>
      <ExpansionPanelDetails className="job-details">
        <table>
          <tbody>
            <tr>
              <th>Client</th>
              <td>
                { client.name }
                <br />
                { client.address }
              </td>
              <th>Addons</th>
              <td>{ addons.join(', ') }</td>
            </tr>
            <tr>
              <th rowSpan="2">Contact</th>
              <td rowSpan="2">
                { client.contact.name }
                <br />
                { client.contact.email }
                <br />
                { formatPhone(client.contact.phone) }
              </td>
              <th>Envelope</th>
              <td>{ envelope }</td>
            </tr>
            <tr>
              <th>Vendor</th>
              <td>{ vendor }</td>
            </tr>
            <tr>
              <th>Tracking Number</th>
              <td>{ formatPhone(trackingNumber) }</td>
              <th>Expiration</th>
              <td>{ formatDate(expire) }</td>
            </tr>
            <tr>
              <th>Comments</th>
              <td colSpan="3">{ comments }</td>
            </tr>
          </tbody>
        </table>
        { files &&
          <table className="files">
            <tbody>
              <tr><th colSpan="4" className="section-header">Files</th></tr>
              <tr>
                <th>Proof</th>
                <td>{ 'Proof' in files ?
                  files.Proof.map(file => (
                    <span key={ file.key } onClick={ handleFileClick(file.key) }>{ file.name }</span>
                  )) : 'None'
                }</td>
                <th>Data List</th>
                <td>{ 'Data List' in files ?
                  files['Data List'].map(file => (
                    <span key={ file.key } onClick={ handleFileClick(file.key) }>{ file.name }</span>
                  )) : 'None'
                }</td>
              </tr>
              <tr>
                <th>Dealer invoice</th>
                <td>{ 'Dealer invoice' in files ?
                  files['Dealer invoice'].map(file => (
                    <span key={ file.key } onClick={ handleFileClick(file.key) }>{ file.name }</span>
                  )) : 'None'
                }</td>
                <th>Printer invoice</th>
                <td>{ 'Printer invoice' in files ?
                  files['Printer invoice'].map(file => (
                    <span key={ file.key } onClick={ handleFileClick(file.key) }>{ file.name }</span>
                  )) : 'None'
                }</td>
              </tr>
              <tr>
                <th>Postal</th>
                <td>{ 'Postal' in files ?
                  files.Postal.map(file => (
                    <span key={ file.key } onClick={ handleFileClick(file.key) }>{ file.name }</span>
                  )) : 'None'
                }</td>
                <th>Prize board</th>
                <td>{ 'Prize board' in files ?
                  files['Prize board'].map(file => (
                    <span key={ file.key } onClick={ handleFileClick(file.key) }>{ file.name }</span>
                  )) : 'None'
                }</td>
              </tr>
              { 'Other' in files &&
                <tr>
                  <th>Other</th>
                  <td>{ files.Other.map(file => (
                      <span key={ file.key } onClick={ handleFileClick(file.key) }>{ file.name }</span>
                  )) }</td>
                </tr>
              }
          </tbody>
        </table> }
      </ExpansionPanelDetails>
      <JobActions model={ model } files={ files } />
  </ExpansionPanel>
  )
}

function handleFileClick (key) {
  return e => Storage.get(key)
    .then(url => window.open(url, '_blank'))
    .catch(console.error)
}

export default Job

<style>
  .complete {
    border-left: 5px solid #4CAF50 !important;
    padding-left: 19px !important;
  }

  .late {
    border-left: 5px solid #F44336 !important;
    padding-left: 19px !important;
  }

  span.statusBlock {
    display: block;
    width: 110px;
    text-align: center;
    padding: 5px;
  }

  span.red {
    background-color: #ef5350;
    color: white;
  }

  span.yellow {
    background-color: #FFB300;
    color: white;
  }

  span.green {
    background-color: #4CAF50;
    color: white;
  }

  .job-row div > div {
    margin: auto 15px;
    white-space: nowrap;
  }

  .job-details {
    flex-direction: column;
  }

  .job-details table {
    margin: 50px auto;
  }

  .job-details th {
    font-weight: normal;
    text-align: right;
    padding: 5px 15px;
  }

  .job-details td {
    min-width: 160px;
    padding: 5px 0;
    color: #757575;
  }

  .job-details .section-header {
    text-align: center;
    font-size: 1.3em;
  }

  .job-details .files span {
    cursor: pointer;
  }

  .job-details .files span:hover {
    border-bottom: 1px dotted #757575;
  }
</style>
