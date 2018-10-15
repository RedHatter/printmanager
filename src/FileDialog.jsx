import React, { Component } from 'react'
import autobind from 'autobind-decorator'
import { connect } from 'react-redux'
import {
  Dialog, DialogContent, DialogActions, Button, LinearProgress,
  Snackbar, RadioGroup, FormControlLabel, Radio, withStyles
} from '@material-ui/core'
import { styles as buttonStyles } from '@material-ui/core/Button/Button'
import { Auth, Storage } from 'aws-amplify'
import PropTypes from 'prop-types'

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
        <Snackbar open={ this.state.message != undefined } onClose={ this.clearMessage } autoHideDuration={ 5000 }
          message={ this.state.message } anchorOrigin={ { vertical: 'bottom', horizontal: 'right' } } />
        <DialogContent>
          { files.join('<br>') }
          <RadioGroup name="type" value={ this.state.type } onChange={ this.handleTypeChange } style={ { flexDirection: 'row' } }>
            <FormControlLabel value="Proof" control={ <Radio /> } label="Proof" />
            <FormControlLabel value="Data" control={ <Radio /> } label="Data List" />
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
    this.props.fetchFiles()
  }

  handleUpload () {
    let promises = []

    this.setState({ uploading: true })

    for (let file of this.state.files)
      promises.push(Storage.put(`${this.props.path}/${this.state.type || 'other'}/${encodeURIComponent(file.name)}`, file, {
        contentType: file.type
      }))

    Promise.all(promises)
      .then(this.handleClose)
      .catch(err => this.setState({ message: 'Unable to upload file. ' + err.message }))
      .finally(() => this.setState({ uploading: false }))
  }
}

export default connect(null, { fetchFiles: () => ({ type: 'FETCH_FILES' }) })(FileDialog)
