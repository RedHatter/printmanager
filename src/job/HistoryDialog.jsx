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

import { formatDateTime, parseJSON } from '../../utils.js'
import JobList from '../views/JobList.jsx'

export default function HistoryDialog({ model, onClose }) {
  const [patches, setPatches] = useState([])
  const [selected, setSelected] = useState(undefined)
  useEffect(() => {
    fetch(`/api/job/${model.id}/patch`).then(res =>
      setPatches(parseJSON(res.text()))
    )
  }, [])

  async function select(patch) {
    let res = await fetch(`/api/job/${model.id}/patch/${patch._id}`)
    setSelected(parseJSON(await res.text()))
  }

  return (
    <Dialog open maxWidth={!selected && 'sm'}>
      <DialogContent>
        {selected ? (
          <JobList show={selected} elevation={0} />
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
