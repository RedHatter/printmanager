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
  const [isAdmin, setAdmin] = useState(false)
  const [isSalesmen, setSalesmen] = useState(false)

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
              checked={isAdmin}
              onChange={e => setAdmin(e.target.checked)}
              value="isAdmin"
            />
          }
          label="Admin"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={isSalesmen}
              onChange={e => setSalesmen(e.target.checked)}
              value="isSalesman"
            />
          }
          label="Salesman"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={e => onChange({ name, email, isAdmin, isSalesmen })}>
          Done
        </Button>
      </DialogActions>
    </Dialog>
  )
}
