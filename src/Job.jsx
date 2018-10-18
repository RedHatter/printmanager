import React, { Fragment } from 'react'
import classnames from 'classnames'
import PropTypes from 'prop-types'
import { Storage } from 'aws-amplify'

import { JobType } from './types.js'

import Collapse from './Collapse.jsx'
import JobActions from './JobActions.jsx'

import { colorize, formatNumber, formatPhone, formatDate } from '../utils.js'

Job.propTypes = {
  model: JobType.isRequired,
  onClick: PropTypes.func,
  files: PropTypes.object
}

function Job (props) {
  let listStatus = 'Count Pending'
  if (props.model.listFile)
    listStatus = 'List Uploaded'
  else if (props.model.listType = 'Saturation')
    listStatus = 'List Pending'

  let dropStatus = props.model.dropStatus || 'Incomplete'

  return (
    <Fragment>
      <tr onClick={ props.onClick } className={ classnames({
        complete: props.model.forceComplete || (props.files && [
          'Proof', 'Data List', 'Dealer invoice',
          'Printer invoice', 'Postal', 'Prize board'
        ].every(key => key in props.files))
      }) }>
        <td>{ props.model.name }</td>
        <td>{ props.model.fold } &mdash; { props.model.size }</td>
        <td>{ formatNumber(props.model.quantity) }</td>
        <td>
          <span className={ classnames('statusBlock', colorize(dropStatus)) }>{ dropStatus }</span>
          { formatDate(props.model.dropDate) }
        </td>
        <td>
          <span className={ classnames('statusBlock', colorize(props.model.artStatus)) }>{ props.model.artStatus }</span>
          { formatDate(props.model.printDate) }
        </td>
        <td>
          <span className={ classnames('statusBlock', colorize(listStatus)) }>{ listStatus }</span>
          { props.model.listType }
        </td>
        <td>{ formatDate(props.model.created) }</td>
        <td>{ props.model.salesman.name }</td>
      </tr>
      <tr>
        <td colSpan="10" className="job-details">
          <Collapse isOpen={ props.isOpen }>
            <table>
              <tbody>
                <tr>
                  <th>Client</th>
                  <td>
                    { props.model.client.name }
                    <br />
                    { props.model.client.address }
                  </td>
                  <th>Addons</th>
                  <td>{ props.model.addons.join(', ') }</td>
                </tr>
                <tr>
                  <th rowSpan="2">Contact</th>
                  <td rowSpan="2">
                    { props.model.client.contact.name }
                    <br />
                    { props.model.client.contact.email }
                    <br />
                    { formatPhone(props.model.client.contact.phone) }
                  </td>
                  <th>Envelope</th>
                  <td>{ props.model.envelope }</td>
                </tr>
                <tr>
                  <th>Vendor</th>
                  <td>{ props.model.vendor }</td>
                </tr>
                <tr>
                  <th>Tracking Number</th>
                  <td>{ formatPhone(props.model.trackingNumber) }</td>
                  <th>Expiration</th>
                  <td>{ formatDate(props.model.expire) }</td>
                </tr>
                <tr>
                  <th>Comments</th>
                  <td colSpan="3">{ props.model.comments }</td>
                </tr>
              </tbody>
            </table>
            { props.files &&
              <table className="files">
                <tbody>
                  <tr><th colSpan="4" className="section-header">Files</th></tr>
                  <tr>
                    <th>Proof</th>
                    <td>{ 'Proof' in props.files ?
                      props.files.Proof.map(file => (
                        <span key={ file.key } onClick={ handleFileClick(file.key) }>{ file.name }</span>
                      )) : 'None'
                    }</td>
                    <th>Data List</th>
                    <td>{ 'Data List' in props.files ?
                      props.files['Data List'].map(file => (
                        <span key={ file.key } onClick={ handleFileClick(file.key) }>{ file.name }</span>
                      )) : 'None'
                    }</td>
                  </tr>
                  <tr>
                    <th>Dealer invoice</th>
                    <td>{ 'Dealer invoice' in props.files ?
                      props.files['Dealer invoice'].map(file => (
                        <span key={ file.key } onClick={ handleFileClick(file.key) }>{ file.name }</span>
                      )) : 'None'
                    }</td>
                    <th>Printer invoice</th>
                    <td>{ 'Printer invoice' in props.files ?
                      props.files['Printer invoice'].map(file => (
                        <span key={ file.key } onClick={ handleFileClick(file.key) }>{ file.name }</span>
                      )) : 'None'
                    }</td>
                  </tr>
                  <tr>
                    <th>Postal</th>
                    <td>{ 'Postal' in props.files ?
                      props.files.Postal.map(file => (
                        <span key={ file.key } onClick={ handleFileClick(file.key) }>{ file.name }</span>
                      )) : 'None'
                    }</td>
                    <th>Prize board</th>
                    <td>{ 'Prize board' in props.files ?
                      props.files['Prize board'].map(file => (
                        <span key={ file.key } onClick={ handleFileClick(file.key) }>{ file.name }</span>
                      )) : 'None'
                    }</td>
                  </tr>
                  { 'Other' in props.files &&
                    <tr>
                      <th>Other</th>
                      <td>{ props.files.Other.map(file => (
                          <span key={ file.key } onClick={ handleFileClick(file.key) }>{ file.name }</span>
                      )) }</td>
                    </tr>
                  }
              </tbody>
            </table> }
            <JobActions model={ props.model } />
          </Collapse>
        </td>
      </tr>
    </Fragment>
  )
}

function handleFileClick (key) {
  return e => Storage.get(key)
    .then(url => window.open(url, '_blank'))
    .catch(console.error)
}

export default Job

<style>
  tr.complete {
    background-color: #E8F5E9;
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
