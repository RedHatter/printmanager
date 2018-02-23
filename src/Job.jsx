import React, { Fragment } from 'react'

function JobRow (props) {
  return (
    <Fragment>
      <tr className="job-row">
        <td></td>
        <td>{ props.model.name }</td>
        <td>{ props.model.size } &mdash; { props.model.fold }</td>
        <td>{ props.model.quantity }</td>
        <td data-drop-status={ props.model.dropStatus }>{ props.model.dropDate }</td>
        <td data-art-status={ props.model.artStatus }>{ props.model.printDate }</td>
        <td data-list-status={ props.model.listStatus }>{ props.model.listType }</td>
        <td>{ props.model.created }</td>
        <td>{ props.model.salesman }</td>
      </tr>
      <tr class="accordion">
        <td colspan="10">
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

export default JobRow
