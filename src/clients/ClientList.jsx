import React, { Fragment, useState } from 'react'
import {
  Button,
  IconButton,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell
} from '@material-ui/core'

import { deleteClient } from '../actions.js'
import { useStore } from '../store.js'
import Column from '../components/Column.jsx'
import Confirm from '../components/Confirm.jsx'
import Client from './Client.jsx'
import ExpandMoreIcon from '../icons/ExpandMore.js'
import AddIcon from '../icons/Add.js'

export default function ClientList(props) {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const [confirm, setConfirm] = useState(null)
  const { clients } = useStore()

  return (
    <Fragment>
      {isCreateOpen && <Client onClose={() => setIsCreateOpen(false)} />}
      {selected && (
        <Client model={selected} onClose={() => setSelected(null)} />
      )}
      {confirm && (
        <Confirm
          onClose={e => setConfirm(null)}
          onConfirm={async e =>
            (await deleteClient(confirm.id)) && setConfirm(null)
          }
        >
          Are you sure you want to delete <i>{confirm.name}</i>? This action can
          not be reversed.
        </Confirm>
      )}
      <Paper component={Table}>
        <TableHead>
          <TableRow>
            <TableCell>
              <IconButton onClick={() => setIsCreateOpen(true)}>
                <AddIcon />
              </IconButton>
              &nbsp;Name
            </TableCell>
            <TableCell>Acronym</TableCell>
            <TableCell>Contact Name</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {clients.map(o => (
            <TableRow key={o.id}>
              <TableCell>{o.name}</TableCell>
              <TableCell>{o.acronym}</TableCell>
              <TableCell>{o?.contact?.name}</TableCell>
              <TableCell>
                <Button onClick={e => setConfirm(o)}>Delete</Button>
                <Button onClick={e => setSelected(o)}>Edit</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Paper>
    </Fragment>
  )
}
