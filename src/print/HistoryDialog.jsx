import React, { useState, useEffect, Fragment } from 'react'
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody
} from '@material-ui/core'
import PropTypes from 'prop-types'
import { Auth } from 'aws-amplify'

import JobHeader from './JobHeader.jsx'
import Job from './Job.jsx'
import { formatDateTime, parseJSON } from '../../utils.js'

export default function HistoryDialog({ model, onClose }) {
  const [patches, setPatches] = useState([])
  const [selected, setSelected] = useState(undefined)
  useEffect(() => {
    ;(async () => {
      let res = await fetch(`/api/job/${model.id}/patches`, {
        headers: {
          Authorization: (await Auth.currentSession()).idToken.jwtToken
        }
      })
      setPatches(parseJSON(await res.text()))
    })()
  }, [])

  async function select(patch) {
    let res = await fetch(`/api/job/${model.id}/patches/${patch._id}`, {
      headers: { Authorization: (await Auth.currentSession()).idToken.jwtToken }
    })
    setSelected(parseJSON(await res.text()))
  }

  return (
    <Dialog open maxWidth={!selected && 'sm'}>
      <DialogContent>
        {selected ? (
          <Fragment>
            <JobHeader elevation={0} />
            <Job model={selected} expanded={true} elevation={0} />
          </Fragment>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Timestamp</TableCell>
                <TableCell>Changes</TableCell>
                <TableCell>Comment</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {patches.map((o, i) => (
                <TableRow
                  key={o._id}
                  hover={i != 0}
                  onClick={i != 0 ? () => select(o) : undefined}
                >
                  <TableCell>{formatDateTime(o.date)}</TableCell>
                  <TableCell>{o.ops.length}</TableCell>
                  <TableCell>{o.versionComment}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DialogContent>
      <DialogActions>
        {selected && (
          <Button onClick={() => setSelected(undefined)}>Back</Button>
        )}
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  )
}
