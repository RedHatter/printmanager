import React, { useState, useRef, Fragment } from 'react'
import { Button, Popover, Chip } from '@material-ui/core'

export default function ChipSelect({ label, options, value, onChange }) {
  const [open, setOpen] = useState(false)
  const anchor = useRef(null)
  return (
    <Fragment>
      <Button onClick={e => setOpen(true)} buttonRef={anchor}>
        {label}
      </Button>
      {open && (
        <Popover
          open={open}
          onClose={() => setOpen(false)}
          anchorEl={anchor.current}
        >
          {options
            .filter(o => !value.find(v => v.id == o.id))
            .map(o => (
              <div
                className="chip-selection-option"
                key={o.id}
                onClick={e => {
                  e.stopPropagation()
                  setOpen(false)
                  onChange([...value, o])
                }}
              >
                {o.name}
              </div>
            ))}
        </Popover>
      )}
      {value.map(o => (
        <Chip
          key={o.id}
          label={o.name}
          className="chip-selection-chip"
          onDelete={() => onChange(value.filter(v => v.id !== o.id))}
        />
      ))}
    </Fragment>
  )
}

<style>
.chip-selection-option {
  padding: 8px;
  cursor: pointer;
}

.chip-selection-option:hover {
  background-color: #eeeeee;
}

.chip-selection-chip {
  margin: 0 2px;
}
</style>
