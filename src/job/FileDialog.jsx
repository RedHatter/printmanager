import React, { Component } from 'react'
import bound from 'bound-decorator'
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

export default class FileDialog extends Component {
  static propTypes = {
    path: PropTypes.string.isRequired
  }

  constructor(props) {
    super(props)

    this.state = {
      files: [],
      type: '',
      uploading: false
    }
  }

  render() {
    let files = []
    for (let file of this.state.files) files.push(file.name)

    if (this.state.files.length < 1)
      return (
        <Button component="label" className="upload-button">
          Upload
          <input onChange={this.handleSelect} type="file" />
        </Button>
      )
    else
      return (
        <Dialog open>
          <DialogContent>
            {files.join('<br>')}
            <RadioGroup
              name="type"
              value={this.state.type}
              onChange={this.handleTypeChange}
            >
              <FormControlLabel
                value="Proof"
                control={<Radio />}
                label="Proof"
              />
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
              <FormControlLabel
                value="Other"
                control={<Radio />}
                label="Other"
              />
            </RadioGroup>
            {this.state.uploading && <LinearProgress />}
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleClose}>Close</Button>
            <Button
              onClick={this.handleUpload}
              disabled={this.state.type == ''}
            >
              Upload
            </Button>
          </DialogActions>
        </Dialog>
      )
  }

  @bound
  handleTypeChange(e, type) {
    this.setState({ type })
  }

  @bound
  handleSelect(e) {
    this.setState({ files: e.target.files, type: '' })
  }

  @bound
  handleClose() {
    this.setState({ files: [], type: '' })
  }

  @bound
  handleUpload() {
    let { path } = this.props
    let { type, files } = this.state

    this.setState({ uploading: true })
    uploadFiles(files, `${path}/${type || 'other'}`)
      .then(this.handleClose)
      .finally(() => this.setState({ uploading: false }))
  }
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