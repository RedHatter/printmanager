import React, { Component, Fragment } from 'react'
import autobind from 'autobind-decorator'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import {
  Dialog, DialogContent, DialogActions, Button,
  TextField, Typography, FormControlLabel, Checkbox
} from '@material-ui/core'
import ChipInput from 'material-ui-chip-input'

import { JobType } from './types.js'
import { send } from './actions.js'

@autobind
class SendDialog extends Component {
  static propTypes = {
    model: JobType.isRequired,
    files: PropTypes.object.isRequired,
  }

  constructor (props) {
    super(props)

    this.state = {
      message: 'Please review the attachment for your approval or send me any changes you may have.\n\nThank you',
      subject: props.model.name,
      recipients: [ props.model.client.contact.email ],
      attachments: [],
      chipError: undefined
    }
  }

  render () {
    let { recipients, chipError, attachments, subject, message } = this.state
    let { onClose, files } = this.props

    return <Dialog open>
      <DialogContent className="send-dialog-content">
        <ChipInput onAdd={ this.handleAddChip.bind(this) } onDelete={ this.handleDeleteChip.bind(this) }
          newChipKeyCodes={ [ 9, 13, 32 ] } value={ recipients } label="Recipients"
          fullWidth helperText={ chipError } error={ chipError != undefined } />
        <TextField fullWidth label="Subject" value={ subject } onChange={ this.handleSubjectChange } />
        <TextField fullWidth multiline label="Message" rows={ 4 } value={ message } onChange={ this.handleMessageChange } />
        { Object.entries(files).map(([ key, value ]) => (
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

  handlesSubjectChange (e) {
    this.setState({ subject: e.target.value })
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
    let { onClose, model } = this.props
    let { recipients, subject, message, attachments } = this.state
    send({
      recipients, subject, message, attachments,
      jobId: model._id
    }).then(onClose)
  }
}

export default connect(null, { send })(SendDialog)

<style>
  .send-dialog-content > div {
    margin: 20px 0;
  }
</style>
