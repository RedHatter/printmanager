import React from 'react'
import { Dialog, DialogContent, DialogActions, Button } from '@material-ui/core'

export default function Confirm({ onClose, onConfirm, children }) {
  return (
    <Dialog open className="create-modal">
      <DialogContent>{children}</DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={e => onConfirm()}>Delete</Button>
      </DialogActions>
    </Dialog>
  )
}
