import React from 'react'

function JobTable (props) {
  return (
    <table className='job-table'>
      <thead>
        <tr>
          <th>Order #</th>
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
        { props.jobs.map(o => <Job model={ o } />) }
      </tbody>
    </table>
  )
}

export default JobTable

<style>
  .job-table {
    position: relative;
    background-color: white;
    border-collapse: collapse;
    z-index: 2;
  }

  .job-table th {
    background-color: #3498db;
    color: white;
    font-weight: bold;
    padding: 10px;
  }

  .job-table td {
    text-align: center;
    padding: 30px;
    color: #757575;
  }
</style>
