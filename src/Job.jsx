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
              {/* <checklist class="checklist" :job="job"></checklist>
              <job-details :job="job"></job-details>
              <job-actions :job="job" class="actions"></job-actions> */}
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
