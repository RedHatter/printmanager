import React, { Component, Fragment } from 'react'
import autobind from 'autobind-decorator'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import {
  Dialog, DialogContent, DialogActions, Button, Snackbar,
  TextField, Typography, FormControlLabel, Checkbox
} from '@material-ui/core'
import ChipInput from 'material-ui-chip-input'

import { JobType } from './types.js'

@autobind
class SendDialog extends Component {
  static propTypes = {
    model: JobType.isRequired,
    files: PropTypes.object.isRequired,
  }

  constructor (props) {
    super(props)

    this.state = {
      message: 'Please review the attachment for your approval or send me any changes you may have.\n\nThank you ',
      recipients: [ props.model.client.contact.email ],
      attachments: [],
      chipError: undefined,
      errorMessage: undefined
    }
  }

  render () {
    let { errorMessage, recipients, chipError, attachments, message } = this.state
    let { onClose, files, model } = this.props

    return <Dialog open>
      <DialogContent className="send-dialog-content">
        <Snackbar open={ errorMessage != undefined } onClose={ this.clearError } autoHideDuration={ 5000 }
          message={ errorMessage } anchorOrigin={ { vertical: 'bottom', horizontal: 'right' } } />
        <ChipInput onAdd={ this.handleAddChip.bind(this) } onDelete={ this.handleDeleteChip.bind(this) }
          newChipKeyCodes={ [ 13, 32 ] } value={ recipients } label="Recipients"
          fullWidth helperText={ chipError } error={ chipError != undefined } />
        <TextField fullWidth multiline label="Message" rows={ 4 } value={ message } onChange={ this.handleMessageChange } />
        { Object.entries(files[model._id]).map(([ key, value ]) => (
          <Fragment key={ key }>
            <Typography variant="headline" align="left">{ key }</Typography>
            { value.map(file => (
              <FormControlLabel key={ file.name } label={ file.name } control={
                <Checkbox
                  checked={ attachments.includes(file.key) }
                  onChange={ this.handleSelectFile(file.key) }
                  value={ file.key }
                />
              } />
            )) }
          </Fragment>
        )) }
      </DialogContent>
      <DialogActions>
        <Button onClick={ onClose }>Close</Button>
        <Button onClick={ this.handleSend }>Send</Button>
      </DialogActions>
    </Dialog>
  }

  handleMessageChange (e) {
    this.setState({ message: e.target.value })
  }

  clearError () {
    this.setState({ errorMessage: undefined })
  }

  handleAddChip (chip) {
    if (/^.+@.+\..+$/.test(chip))
      this.setState(state => ({ recipients: state.recipients.concat([ chip ]), chipError: undefined }))
    else
      this.setState({ chipError: 'Recipient must be a valid e-mail address.' })
  }

  handleDeleteChip (chip, index) {
    this.setState(state => ({ recipients: state.recipients.filter(o => o != chip) }))
  }

  handleSelectFile (name) {
    return e => {
      let { checked, value } = e.target
      this.setState(state => ({
        attachments: checked
          ? state.attachments.concat(value)
          : state.attachments.filter(key => key != value)
      }))
    }
  }

  handleSend () {
    let { recipients, message, attachments } = this.state
    let { model } = this.props
    fetch('/api/send', {
      method: 'POST',
      body: JSON.stringify({
        recipients, message, attachments,
        replyTo: model.salesman.email,
        subject: model.name
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(res => {
      if (!res.ok)
        this.setState({ errorMessage: `Unable to submit job. Error code ${res.status}.` })
      else
        onClose()
    }).catch(err => this.setState({ errorMessage: 'Unable to submit job. ' + err.errorMessage }))
  }
}

export default connect(state => ({ files: state.files }))(SendDialog)

<style>
  .send-dialog-content > div {
    margin: 20px 0;
  }
</style>
