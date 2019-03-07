import React from 'react'

export default function Confirm({ onClose, onConfirm, children }) {
  return (
    <Dialog open className="create-modal">
      <DialogContent>{children}</DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={e => {
            onClose()
            onConfirm()
          }}
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  )
}
