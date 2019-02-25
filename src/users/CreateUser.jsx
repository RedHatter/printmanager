import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Checkbox,
  TextField,
  Button
} from '@material-ui/core'

export default function({ onClose, onChange }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [admin, setAdmin] = useState(false)
  const [salesmen, setSalesmen] = useState(false)

  return (
    <Dialog open>
      <DialogContent>
        <TextField
          fullWidth
          label="Name"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <TextField
          fullWidth
          label="E-mail"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={admin}
              onChange={e => setAdmin(e.target.checked)}
              value="admin"
            />
          }
          label="Admin"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={salesmen}
              onChange={e => setSalesmen(e.target.checked)}
              value="salesman"
            />
          }
          label="Salesman"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={e => {
            onClose()
            onChange({ name, email, admin, salesmen })
          }}
        >
          Done
        </Button>
      </DialogActions>
    </Dialog>
  )
}
