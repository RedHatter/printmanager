import React, { Component, Fragment } from 'react'
import autobind from 'autobind-decorator'
import { withStyles, Button, Snackbar, Dialog, DialogContent, DialogActions } from '@material-ui/core'

import { JobType } from './types.js'
import { clone } from '../utils.js'
import CreateDialog from './CreateDialog.jsx'
import FileDialog from './FileDialog.jsx'
import SendDialog from './SendDialog.jsx'

@autobind
class DuplicateButton extends Component {
  static propTypes = {
    model: JobType.isRequired
  }

  constructor (props) {
    super(props)

    this.state = { isOpen: false }
  }

  render () {
    return <Fragment>
      <Button onClick={ this.handleOpen }>Duplicate</Button>
      { this.state.isOpen && <CreateDialog open model={ this.state.model } onClose={ this.handleClose } /> }
    </Fragment>
  }

  handleOpen () {
    let model = clone(this.props.model)
    delete model._id
    delete model.__v
    delete model.created
    this.setState({ isOpen: true, model })
  }

  handleClose () {
    this.setState({ isOpen: false, model: undefined })
  }
}

@autobind
class EditButton extends Component {
  static propTypes = {
    model: JobType.isRequired
  }

  constructor (props) {
    super(props)

    this.state = { isOpen: false }
  }

  render () {
    return <Fragment>
      <Button onClick={ this.handleOpen }>Edit</Button>
      { this.state.isOpen && <CreateDialog open model={ this.props.model } onClose={ this.handleClose } /> }
    </Fragment>
  }

  handleOpen () {
    this.setState({ isOpen: true })
  }

  handleClose () {
    this.setState({ isOpen: false })
  }
}

@autobind
class DeleteButton extends Component {
  static propTypes = {
    model: JobType.isRequired
  }

  constructor (props) {
    super(props)

    this.state = { isOpen: false }
  }

  render () {
    return <Fragment>
      <Snackbar open={ this.state.errorMessage != undefined } onClose={ this.clearError } autoHideDuration={ 5000 }
        message={ this.state.errorMessage } anchorOrigin={ { vertical: 'bottom', horizontal: 'right' } } />
      <Button onClick={ this.handleOpen }>Delete</Button>
      { this.state.isOpen &&
        <Dialog open>
          <DialogContent>Are you sure you want to delete <i>{ this.props.model.name }</i>? This operation cannot be undone.</DialogContent>
          <DialogActions>
            <Button onClick={ this.handleClose }>Cancel</Button>
            <Button onClick={ this.handleDelete }>Delete</Button>
          </DialogActions>
        </Dialog>
      }
    </Fragment>
  }

  handleOpen () {
    this.setState({ isOpen: true })
  }

  handleClose () {
    this.setState({ isOpen: false })
  }

  handleDelete () {
    fetch('/api/job/' + this.props.model._id, { method: 'DELETE' })
      .then(res => {
        if (res.ok)
          this.handleClose()
        else
          this.setState({ errorMessage: `Unable to delete job. Error code ${res.status}.` })
      })
      .catch(err => this.setState({ errorMessage: 'Unable to delete job. ' + err.message }))
  }

  clearError() {
    this.setState({ errorMessage: undefined })
  }
}

@autobind
class SendButton extends Component {
  static propTypes = {
    model: JobType.isRequired
  }

  constructor (props) {
    super(props)

    this.state = { isOpen: false }
  }

  render () {
    return <Fragment>
      <Button onClick={ this.handleOpen }>Send</Button>
      { this.state.isOpen && <SendDialog open model={ this.props.model } onClose={ this.handleClose } /> }
    </Fragment>
  }

  handleOpen () {
    this.setState({ isOpen: true })
  }

  handleClose () {
    this.setState({ isOpen: false })
  }
}

JobActions.propTypes = {
  model: JobType.isRequired,
}

function JobActions (props) {
  return <Fragment>
    <EditButton model={ props.model } />
    <DuplicateButton model={ props.model } />
    <DeleteButton model={ props.model } />
    <FileDialog path={ props.model._id } />
    <SendButton model={ props.model } />
  </Fragment>
}

export default JobActions
