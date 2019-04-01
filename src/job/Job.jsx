import React, { useState, Fragment } from 'react'
import clsx from 'clsx'
import PropTypes from 'prop-types'
import { Auth } from 'aws-amplify'
import {
  Button,
  ExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails
} from '@material-ui/core'
import { startOfDay, format } from 'date-fns'

import ExpandMoreIcon from '../icons/ExpandMore.js'
import { JobType } from '../types.js'
import JobActions from './JobActions.jsx'
import Column from '../components/Column.jsx'
import Comments from './Comments.jsx'
import Eblast from '../eblast/Eblast.jsx'
import { createEblast, updateEblast } from '../actions.js'
import { colorize, formatNumber, formatPhone, formatDate } from '../../utils.js'

Job.propTypes = {
  model: JobType.isRequired,
  highlighted: PropTypes.bool,
  isAdmin: PropTypes.bool
}

function Job({ highlighted, model, isAdmin, ...rest }) {
  const [isEblastOpen, setIsEblastOpen] = useState(false)
  const {
    name,
    jobType,
    size,
    type,
    quantity,
    dueDate,
    dropDate,
    secondDropDate,
    printDate,
    artStatus,
    dropStatus,
    listType,
    created,
    salesman,
    assignee,
    client,
    addons,
    envelope,
    vendor,
    trackingNumber,
    expire,
    details,
    forceComplete,
    pixels,
    eblast,
    files
  } = model

  let dropStatusFromatted = dropStatus ? formatDate(dropStatus) : 'Incomplete'

  let listStatus = 'Count Pending'
  if (files && files.find(o => o.type == 'Data List'))
    listStatus = 'List Uploaded'
  else if (listType == 'Saturation') listStatus = 'List Pending'

  let today = startOfDay(new Date())

  return (
    <ExpansionPanel {...rest}>
      <ExpansionPanelSummary
        expandIcon={<ExpandMoreIcon />}
        className={clsx(
          {
            // complete:
            //   forceComplete ||
            //   (files &&
            //     [
            //       'Proof',
            //       'Data List',
            //       'Dealer invoice',
            //       'Printer invoice',
            //       'Postal',
            //       'Prize board'
            //     ].every(key => key in files)),
            late: dropDate < today && !dropStatus,
            highlighted
          },
          'job-row'
        )}
      >
        <Column group="name">{name}</Column>
        <Column group="quantity">{quantity && formatNumber(quantity)}</Column>
        <Column group="dropStatus">
          {dropStatusFromatted && (
            <span
              className={clsx('statusBlock', colorize(dropStatusFromatted))}
            >
              {dropStatusFromatted}
            </span>
          )}
        </Column>
        <Column group="dropDate">
          {dropDate && formatDate(dropDate)}
          <br />
          {secondDropDate && formatDate(secondDropDate)}
        </Column>
        <Column group="artStatus">{artStatus}</Column>
        <Column group="printDate">{printDate && formatDate(printDate)}</Column>
        <Column group="dueDate">{dueDate && formatDate(dueDate)}</Column>
        <Column group="assignee">{assignee?.name}</Column>
      </ExpansionPanelSummary>
      <ExpansionPanelDetails className="job-details">
        {jobType == 'Email Blast' && (
          <div className="eblast">
            <Button component="label" className="upload-button">
              <input
                onChange={e => createEblast(model.id, e.target.files[0])}
                type="file"
                accept="image/*"
              />
              {eblast && eblast.image ? 'Re-upload E-blast' : 'Upload E-blast'}
            </Button>
            {eblast && eblast.image && (
              <Fragment>
                <Button onClick={e => setIsEblastOpen(true)}>Edit</Button>
                {isEblastOpen && (
                  <Eblast
                    model={eblast}
                    onClose={() => setIsEblastOpen(false)}
                    updateEblast={async data =>
                      (await updateEblast(model.id, data)) &&
                      setIsEblastOpen(false)
                    }
                  />
                )}
                <Button
                  onClick={e =>
                    Auth.currentSession().then(async auth => {
                      const res = await fetch(`/api/job/${model.id}/eblast`, {
                        headers: { Authorization: auth.idToken.jwtToken }
                      })
                      const a = document.createElement('a')
                      a.href = window.URL.createObjectURL(await res.blob())
                      a.download = 'download.html'
                      document.body.appendChild(a)
                      a.click()
                      a.remove()
                    })
                  }
                >
                  Download
                </Button>
              </Fragment>
            )}
          </div>
        )}
        <table>
          <tbody>
            <tr>
              <th rowSpan="2">Client</th>
              <td rowSpan="2">
                {client?.name}
                <br />
                {client?.address}
              </td>
              <th>Salesman</th>
              <td>{salesman?.name}</td>
            </tr>
            <tr>
              <th>Mailer Type</th>
              <td>
                {jobType} &mdash; {size}
              </td>
            </tr>
            <tr>
              <th rowSpan="2">Contact</th>
              <td rowSpan="2">
                {client?.contact?.name}
                <br />
                {client?.contact?.email}
                <br />
                {client && formatPhone(client?.contact?.phone)}
              </td>
              <th>Envelope</th>
              <td>{envelope}</td>
            </tr>
            <tr>
              <th>Addons</th>
              <td>{addons?.join(', ')}</td>
            </tr>
            <tr>
              {trackingNumber && (
                <Fragment>
                  <th>Tracking Number</th>
                  <td>{formatPhone(trackingNumber)}</td>
                </Fragment>
              )}
              <th>Expiration</th>
              <td>{expire && formatDate(expire)}</td>
            </tr>
            <tr>
              <th>Vendor</th>
              <td>{vendor}</td>
              <th>Order Date</th>
              <td>{created && formatDate(created)}</td>
            </tr>
            <tr>
              <th>List Type</th>
              <td>{listType}</td>
              <th>List Status</th>
              <td>{listStatus}</td>
            </tr>
            {details && (
              <tr>
                <th>Additional Details</th>
                <td colSpan="3">
                  <pre>{details}</pre>
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {files.length > 0 && (
          <table className="files">
            <tbody>
              <tr>
                <th colSpan="2" className="section-header">
                  Files
                </th>
              </tr>
              <tr>
                <th>Type</th>
                <th>Path</th>
              </tr>
              {files.map(file => (
                <tr
                  key={file.path}
                  onClick={() =>
                    Auth.currentSession().then(async auth => {
                      const res = await fetch(
                        `/api/job/${model.id}/file/${file._id}`,
                        { headers: { Authorization: auth.idToken.jwtToken } }
                      )
                      const url = await res.text()
                      window.open(url, '_blank')
                    })
                  }
                >
                  <td>{file.type}</td>
                  <td>
                    {decodeURIComponent(
                      file.path.substring(file.path.lastIndexOf('/') + 1)
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {isAdmin && pixels.length > 0 && (
          <table className="emails">
            <tr>
              <th colSpan="2" className="section-header">
                E-mails
              </th>
            </tr>
            <tr>
              <th>Sent</th>
              <th>Viewed</th>
            </tr>
            {pixels.map(o => (
              <tr>
                <td>{format(o.created, 'h:mm a MM/dd/yyyy')}</td>
                <td>
                  {o.viewed ? format(o.viewed, 'h:mm a MM/dd/yyyy') : 'No'}
                </td>
              </tr>
            ))}
          </table>
        )}
        <Comments model={model} />
      </ExpansionPanelDetails>
      {isAdmin && <JobActions model={model} files={files} />}
    </ExpansionPanel>
  )
}

export default Job

<style>
.highlighted {
  font-weight: 500;
  font-style: italic;
}

.complete {
  padding-left: 19px !important;
  border-left: 5px solid #4caf50 !important;
}

.late {
  padding-left: 19px !important;
  border-left: 5px solid #f44336 !important;
}

span.statusBlock {
  display: block;
  padding: 5px;
  width: 120px;
  text-align: center;
}

span.red {
  background-color: #ef5350;
  color: white;
}

span.yellow {
  background-color: #ffb300;
  color: white;
}

span.green {
  background-color: #4caf50;
  color: white;
}

.job-row div > div {
  margin: auto 15px;
  white-space: nowrap;
}

.job-details .eblast {
  text-align: center;
}

.job-details pre {
  max-width: 1000px;
  white-space: pre-wrap;
}

.job-details {
  flex-direction: column;
}

.job-details table {
  margin: 50px auto;
}

.job-details th {
  padding: 5px 15px;
  vertical-align: top;
  text-align: right;
  font-weight: normal;
}

.job-details td {
  padding: 5px 0;
  min-width: 160px;
  color: #757575;
}

.job-details .section-header {
  text-align: center;
  font-size: 1.3em;
}

.job-details .files tr {
  cursor: pointer;
}

.job-details .files tr th {
  text-align: center;
}

.job-details .files tr td {
  border-bottom: 1px dotted transparent;
}

.job-details .files tr:hover td:nth-child(2) {
  border-color: #757575;
}

.job-details .emails th {
  text-align: center;
}

.job-details .emails td {
  padding: 5px 10px;
}
</style>
