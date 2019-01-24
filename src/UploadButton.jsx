import React from 'react'
import { withStyles } from '@material-ui/core'
import { styles as buttonStyles } from '@material-ui/core/Button/Button'

const UploadButton = withStyles(buttonStyles, { name: 'UploadButton' })(
  function ({ classes, children, onSelect, accept }) {
    return (
      <label className={ classes.root + ' upload-button' }>
        { children }
        <input onChange={ onSelect } type="file" accept={ accept } />
      </label>
    )
  }
)

export default UploadButton

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
