import React, { useState, Fragment } from 'react'
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  LinearProgress,
  RadioGroup,
  FormControlLabel,
  Radio
} from '@material-ui/core'
import PropTypes from 'prop-types'

import { uploadFiles } from '../actions.js'

FileDialog.propTypes = {
  model: PropTypes.object.isRequired
}
export default function FileDialog({ model }) {
  const [files, setFiles] = useState([])
  const [type, setType] = useState('')
  const [uploading, setUploading] = useState(false)

  function onClose() {
    setFiles([])
    setType('')
  }

  if (files.length == 0)
    return (
      <Button component="label" className="upload-button">
        Upload
        <input
          onChange={e => {
            setFiles(Array.from(e.target.files))
            setType('')
          }}
          multiple
          type="file"
        />
      </Button>
    )
  else
    return (
      <Dialog open>
        <DialogContent>
          {files.map(o => (
            <Fragment key={o.name}>
              {o.name}
              <br />
            </Fragment>
          ))}
          <RadioGroup
            name="type"
            value={type}
            onChange={(e, type) => setType(type)}
          >
            <FormControlLabel value="Proof" control={<Radio />} label="Proof" />
            <FormControlLabel
              value="Data List"
              control={<Radio />}
              label="Data List"
            />
            <FormControlLabel
              value="Dealer invoice"
              control={<Radio />}
              label="Dealer invoice"
            />
            <FormControlLabel
              value="Printer invoice"
              control={<Radio />}
              label="Printer invoice"
            />
            <FormControlLabel
              value="Postal"
              control={<Radio />}
              label="Postal"
            />
            <FormControlLabel
              value="Prize board"
              control={<Radio />}
              label="Prize board"
            />
            <FormControlLabel value="Other" control={<Radio />} label="Other" />
          </RadioGroup>
          {uploading && <LinearProgress />}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
          <Button
            onClick={async e => {
              setUploading(true)
              ;(await uploadFiles(model._id, files, type)) && onClose()
              setUploading(false)
            }}
            disabled={type == ''}
          >
            Upload
          </Button>
        </DialogActions>
      </Dialog>
    )
}

<style>
.sidebar .upload-button {
  display: inline-block;
  margin-top: 10px;
}

.upload-button {
  cursor: pointer;
}

.upload-button input {
  display: none;
}
</style>
