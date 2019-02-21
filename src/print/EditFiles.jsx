import React, { Component, Fragment } from 'react'
import { Typography } from '@material-ui/core'
import PropTypes from 'prop-types'

function EditFiles (props) {
  if (props.files.length < 1) return null

  return <Fragment>
    <Typography variant="headline" align="left">Files</Typography>
    { Object.values(props.files).reduce((list, type) => list.concat(type.map(file => (
      <label className="file-checkbox" key={ file.key }>
        <input type="checkbox" checked={ props.selected.includes(file.key) } value={ file.key } onChange={ e => props.onChange(
          e.target.checked ? props.selected.concat(e.target.value) : props.selected.filter(key => key != e.target.value)
        ) } />
        <span>{ file.name }</span>
      </label>
    ))), []) }
  </Fragment>
}

EditFiles.propTypes = {
  files: PropTypes.object.isRequired,
  selected: PropTypes.array.isRequired
}

export default EditFiles

<style>
  .file-checkbox {
    display: block;
    cursor: pointer;
    margin: 10px;
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
    color: red;
    text-decoration: line-through;
    border-bottom: none;
  }
</style>
