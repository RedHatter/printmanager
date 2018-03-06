import React, { Fragment } from 'react'
import moment from 'moment'
import classnames from 'classnames'

function colorize (status) {
  switch(status) {
    case 'Approved':
    case 'List Uploaded':
    case 'List Pending':
    default:
      return 'green'
    case 'Sent to Client':
    case 'Count Pending':
      return 'yellow'
    case 'Needs Revisions':
    case 'Incomplete':
      return 'red'
    case 'In Progress':
      return undefined
  }
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
      <tr className="job-row">
        <td>{ props.model.name }</td>
        <td>{ props.model.fold } &mdash; { props.model.size }</td>
        <td>{ props.model.quantity.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') }</td>
        <td>
          <span className={ classnames('statusBlock', colorize(dropStatus)) }>{ dropStatus }</span>
          { moment(props.model.dropDate ).format('MM/DD/YYY') }
        </td>
        <td>
          <span className={ classnames('statusBlock', colorize(props.model.artStatus)) }>{ props.model.artStatus }</span>
          { moment(props.model.printDate).format('MM/DD/YYY') }
        </td>
        <td>
          <span className={ classnames('statusBlock', colorize(listStatus)) }>{ listStatus }</span>
          { props.model.listType }
        </td>
        <td>{ moment(props.model.created).format('MM/DD/YYYY') }</td>
        <td>{ props.model.salesman }</td>
      </tr>
      <tr className="accordion">
        <td colSpan="10">
          <div>
            <div>
              <table>
                <tr>
                  <th>Client</th>
                  <td></td>
                  <th>Contact</th>
                  <td></td>
                </tr>
                <tr>
                  <th>Address</th>
                  <td></td>
                  <th>Phone</th>
                  <td></td>
                </tr>
                <tr>
                  <th>Addons</th>
                  <td>{ props.model.addons.join(', ') }</td>
                  <th>Vendor</th>
                  <td>{ props.model.vendor }</td>
                </tr>
                <tr>
                  <th rowSpan="2">Comments</th>
                  <td>{ props.model.comments }</td>
                  <th>Envelope</th>
                  <td>{ props.model.envelope }</td>
                </tr>
                <tr>
                  <th>Expiration</th>
                  <td>{ props.model.expire }</td>
                </tr>
              </table>
            </div>
          </div>
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
</style>
