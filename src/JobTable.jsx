import React from 'react'

import Job from './Job.jsx'

function JobTable (props) {
  return (
    <table className='job-table'>
      <thead>
        <tr>
          <th>Job Name</th>
          <th>Mailer Type</th>
          <th>Quantity</th>
          <th>Drop Status</th>
          <th>Art Status</th>
          {/* <drop-status-filter v-model="query.dropStatus"></drop-status-filter>
          <art-status-filter v-model="query.artStatus"></art-status-filter> */}
          <th>List Status</th>
          <th>Order Date</th>
          <th>Salesman</th>
        </tr>
      </thead>
      <tbody>
        { props.model.map(o => <Job key={ o._id } model={ o } />) }
      </tbody>
    </table>
  )
}

export default JobTable

<style>
  table.job-table {
    position: relative;
    background-color: white;
    border-collapse: collapse;
    z-index: 2;
  }

  table.job-table > thead > tr > th {
    background-color: #3498db;
    color: white;
    font-weight: bold;
    padding: 10px;
  }

  table.job-table > tbody > tr > td {
    padding: 30px;
    color: #757575;
  }
</style>
