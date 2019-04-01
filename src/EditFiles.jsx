import React, { Component, Fragment } from 'react'
import { Typography } from '@material-ui/core'
import PropTypes from 'prop-types'

import { basename } from '../utils.js'

function EditFiles({ files, onChange, selected }) {
  if (files.length < 1) return null

  return (
    <Fragment>
      <Typography variant="headline" align="left">
        Files
      </Typography>
      {files.map(file => (
        <label className="file-checkbox" key={file._id}>
          <input
            type="checkbox"
            checked={selected.find(o => o._id == file._id) != null}
            value={file._id}
            onChange={e =>
              onChange(
                e.target.checked
                  ? selected.concat(file)
                  : selected.filter(o => o._id != file._id)
              )
            }
          />
          <span>{basename(file.path)}</span>
        </label>
      ))}
    </Fragment>
  )
}

EditFiles.propTypes = {
  files: PropTypes.arrayOf(PropTypes.object).isRequired,
  selected: PropTypes.arrayOf(PropTypes.object).isRequired
}

export default EditFiles

<style>
.file-checkbox {
  display: block;
  margin: 10px;
  cursor: pointer;
}

.file-checkbox input {
  display: none;
}

.file-checkbox span {
  border-bottom: 1px dotted black;
}

.file-checkbox span:hover {
  border-bottom-color: white;
}

.file-checkbox input:checked + span {
  border-bottom: none;
  color: red;
  text-decoration: line-through;
}
</style>
