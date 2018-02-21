import React from 'react'

function JobRow (props) {
  return (
    <tr className="job-row">
      <td></td>
      <td>{ props.job.name }</td>
      <td>{ props.job.size } &mdash; { props.job.fold }</td>
      <td>{ props.job.quantity }</td>
      <td data-drop-status={ props.job.dropStatus }>{ props.job.dropDate }</td>
      <td data-art-status={ props.job.artStatus }>{ props.job.printDate }</td>
      <td data-list-status={ props.job.listStatus }>{ props.job.listType }</td>
      <td>{ props.job.created }</td>
      <td>{ props.job.salesman }</td>
    </tr>
  )
}

export default JobRow
