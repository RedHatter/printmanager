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

export default function EditUser({ onClose, onChange, value }) {
  const [admin, setAdmin] = useState(value.admin || false)
  const [salesman, setSalesman] = useState(value.salesman || false)

  return (
    <Dialog open>
      <DialogContent>
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
              checked={salesman}
              onChange={e => setSalesman(e.target.checked)}
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
            onChange({ ...value, admin, salesmen })
          }}
        >
          Done
        </Button>
      </DialogActions>
    </Dialog>
  )
}
