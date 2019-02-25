import React, { useState } from 'react'
import { connect } from 'react-redux'
import {
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button
} from '@material-ui/core'
import CreateUser from './CreateUser.jsx'
import EditUser from './EditUser.jsx'
import {
  createUser,
  deleteUser,
  editUser,
  resetUserPassword
} from '../actions.js'

function Users({ users, createUser, deleteUser, editUser, resetUserPassword }) {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editing, setEditing] = useState(null)

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
      <Button onClick={e => setIsCreateOpen(true)}>Create User</Button>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>User</TableCell>
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
                <Button onClick={e => deleteUser(user)}>Delete</Button>
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

export default connect(
  state => ({ users: Object.values(state.users) }),
  { createUser, deleteUser, editUser, resetUserPassword }
)(Users)
