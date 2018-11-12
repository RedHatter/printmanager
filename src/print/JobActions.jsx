import React, { Component, Fragment } from 'react'
import bound from 'bound-decorator'
import { connect } from 'react-redux'
import {
  withStyles, Button, Dialog, DialogContent,
  DialogActions, ExpansionPanelActions
} from '@material-ui/core'
import PropTypes from 'prop-types'

import { JobType } from '../types.js'
import { deleteJob } from '../actions.js'
import { clone } from '../../utils.js'
import CreateDialog from './CreateDialog.jsx'
import FileDialog from './FileDialog.jsx'
import SendDialog from './SendDialog.jsx'

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

  @bound
  handleOpen () {
    let model = clone(this.props.model)
    delete model._id
    delete model.__v
    delete model.created
    this.setState({ isOpen: true, model })
  }

  @bound
  handleClose () {
    this.setState({ isOpen: false, model: undefined })
  }
}

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

  @bound
  handleOpen () {
    this.setState({ isOpen: true })
  }

  @bound
  handleClose () {
    this.setState({ isOpen: false })
  }
}

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

  @bound
  handleOpen () {
    this.setState({ isOpen: true })
  }

  @bound
  handleClose () {
    this.setState({ isOpen: false })
  }

  @bound
  handleDelete () {
    let { deleteJob, model } = this.props
    deleteJob(model._id)
  }
}

DeleteButton = connect(null, { deleteJob })(DeleteButton)

class SendButton extends Component {
  static propTypes = {
    model: JobType.isRequired,
    files: PropTypes.object
  }

  constructor (props) {
    super(props)

    this.state = { isOpen: false }
  }

  render () {
    let { model, files } = this.props

    return <Fragment>
      <Button onClick={ this.handleOpen }>Send</Button>
      { this.state.isOpen && <SendDialog open model={ model } files={ files } onClose={ this.handleClose } /> }
    </Fragment>
  }

  @bound
  handleOpen () {
    this.setState({ isOpen: true })
  }

  @bound
  handleClose () {
    this.setState({ isOpen: false })
  }
}

JobActions.propTypes = {
  model: JobType.isRequired,
  files: PropTypes.object
}

function JobActions ({ model, files }) {
  return <ExpansionPanelActions>
    <EditButton model={ model } />
    <DuplicateButton model={ model } />
    <DeleteButton model={ model } />
    <FileDialog path={ model._id } />
    { files && <SendButton model={ model } files={ files } /> }
  </ExpansionPanelActions>
}

export default JobActions
