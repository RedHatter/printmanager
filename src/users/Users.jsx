import React, { useState } from 'react'
import {
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  IconButton
} from '@material-ui/core'

import {
  createUser,
  deleteUser,
  editUser,
  resetUserPassword
} from '../actions.js'
import { useStore } from '../store.js'
import CreateUser from './CreateUser.jsx'
import EditUser from './EditUser.jsx'
import AddIcon from '../icons/Add.js'
import Confirm from '../components/Confirm.jsx'

export default function Users(props) {
  const [confirm, setConfirm] = useState(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const { users } = useStore()

  return (
    <Paper>
      {isCreateOpen && (
        <CreateUser
          onClose={e => setIsCreateOpen(false)}
          onChange={info => createUser(info)}
        />
      )}
      {editing != null && (
        <EditUser
          onClose={e => setEditing(null)}
          onChange={info => editUser(info)}
          value={editing}
        />
      )}
      {confirm && (
        <Confirm
          onClose={e => setConfirm(null)}
          onConfirm={e => deleteUser(confirm.id)}
        >
          Are you sure you want to delete <i>{confirm.name}</i>? This action can
          not be reversed.
        </Confirm>
      )}
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>
              <IconButton onClick={e => setIsCreateOpen(true)}>
                <AddIcon />
              </IconButton>
              &nbsp;User
            </TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Admin</TableCell>
            <TableCell>Salesman</TableCell>
            <TableCell>Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map(user => (
            <TableRow key={user.id}>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.admin ? 'Yes' : 'No'}</TableCell>
              <TableCell>{user.salesmen ? 'Yes' : 'No'}</TableCell>
              <TableCell>
                <Button onClick={e => setConfirm(user)}>Delete</Button>
                <Button onClick={e => setEditing(user)}>Edit</Button>
                <Button onClick={e => resetUserPassword(user)}>Reset</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  )
}
