import React, { Component } from 'react'
import autobind from 'autobind-decorator'
import { connect } from 'react-redux'
import {
  Dialog, DialogContent, DialogActions, Button, LinearProgress,
  RadioGroup, FormControlLabel, Radio, withStyles
} from '@material-ui/core'
import { styles as buttonStyles } from '@material-ui/core/Button/Button'
import { Auth, Storage } from 'aws-amplify'
import PropTypes from 'prop-types'

import { uploadFiles } from './actions.js'

const FileButton = withStyles(buttonStyles, { name: 'FileButton' })(
  function ({ classes, children, onSelect }) {
    return <label className={ classes.root } style={{ cursor: 'pointer' }}>
      { children }<input onChange={ onSelect } type="file" style={{ display: 'none' }} /></label>
  }
)

@autobind
class FileDialog extends Component {
  static propTypes = {
    path: PropTypes.string.isRequired
  }

  constructor (props) {
    super(props)

    this.state = {
      files: [],
      type: '',
      uploading: false
    }
  }

  render () {
    let files = []
    for (let file of this.state.files)
      files.push(file.name)

    if (this.state.files.length < 1)
      return <FileButton onSelect={ this.handleSelect }>Upload</FileButton>
    else
      return <Dialog open>
        <DialogContent>
          { files.join('<br>') }
          <RadioGroup name="type" value={ this.state.type } onChange={ this.handleTypeChange }>
            <FormControlLabel value="Proof" control={ <Radio /> } label="Proof" />
            <FormControlLabel value="Data List" control={ <Radio /> } label="Data List" />
            <FormControlLabel value="Dealer invoice" control={ <Radio /> } label="Dealer invoice" />
            <FormControlLabel value="Printer invoice" control={ <Radio /> } label="Printer invoice" />
            <FormControlLabel value="Postal" control={ <Radio /> } label="Postal" />
            <FormControlLabel value="Prize board" control={ <Radio /> } label="Prize board" />
            <FormControlLabel value="Other" control={ <Radio /> } label="Other" />
          </RadioGroup>
          { this.state.uploading && <LinearProgress /> }
        </DialogContent>
        <DialogActions>
          <Button onClick={ this.handleClose }>Close</Button>
          <Button onClick={ this.handleUpload } disabled={ this.state.type == '' }>Upload</Button>
        </DialogActions>
      </Dialog>
  }

  clearMessage () {
    this.setState({ message: undefined })
  }

  handleTypeChange (e, type) {
    this.setState({ type })
  }

  handleSelect (e) {
    this.setState({ files: e.target.files, type: '' })
  }

  handleClose () {
    this.setState({ files: [], type: '' })
  }

  handleUpload () {
    let { path, uploadFiles } = this.props
    let { type, files } = this.state

    this.setState({ uploading: true })
    uploadFiles(files, `${path}/${type || 'other'}`)
      .then(this.handleClose)
      .finally(() => this.setState({ uploading: false }))
  }
}

export default connect(null, { uploadFiles })(FileDialog)
