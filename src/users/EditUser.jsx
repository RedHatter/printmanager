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
  const [isAdmin, setAdmin] = useState(value.isAdmin || false)
  const [isSalesman, setSalesman] = useState(value.isSalesman || false)

  return (
    <Dialog open>
      <DialogContent>
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
              checked={isSalesman}
              onChange={e => setSalesman(e.target.checked)}
              value="isSalesman"
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
            onChange({ ...value, isAdmin, salesmen })
          }}
        >
          Done
        </Button>
      </DialogActions>
    </Dialog>
  )
}
