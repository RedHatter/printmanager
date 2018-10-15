import React, { Fragment } from 'react'
import classnames from 'classnames'
import PropTypes from 'prop-types'

import { JobType } from './types.js'

import Collapse from './Collapse.jsx'
import JobActions from './JobActions.jsx'

import { colorize, formatNumber, formatPhone, formatDate } from '../utils.js'

Job.propTypes = {
  model: JobType.isRequired,
  onClick: PropTypes.func,
  salesmen: PropTypes.object,
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
      <tr onClick={ props.onClick }>
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
        <td>{ props.salesmen[props.model.salesman] ? props.salesmen[props.model.salesman].name : '' }</td>
      </tr>
      <tr>
        <td colSpan="10">
          <Collapse isOpen={ props.isOpen }>
            <table className="job-details">
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
                { props.files && Object.entries(props.files).map(([key, value]) => (
                  <tr key={ key }>
                    <th>{ key }</th>
                    <td colspan="3">{ value.map(file => (<a target="_blank" href={ file.url }>{ file.name }</a>)) }</td>
                  </tr>
                )) }
              </tbody>
            </table>
            <JobActions model={ props.model } />
          </Collapse>
        </td>
      </tr>
    </Fragment>
  )
}

export default Job

<style>
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

  .job-details {
    margin: 0 auto;
    border-collapse: collapse;
  }

  .job-details th {
    background-color: #E0E0E0;
    color: #7f8c8d;
    font-weight: normal;
    text-align: right;
  }

  .job-details td, .job-details th {
    border: 1px solid #E0E0E0;
    max-width: 500px;
    padding: 10px;
  }
</style>
