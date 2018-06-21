import React, { Component, Fragment } from 'react'
import autobind from 'autobind-decorator'
import { withStyles, Button } from '@material-ui/core'

import { JobType } from './types.js'
import { clone } from '../utils.js'
import CreateDialog from './CreateDialog.jsx'

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

JobActions.propTypes = {
  model: JobType.isRequired,
}

function JobActions (props) {
  return <Fragment>
    <EditButton model={ props.model } />
    <DuplicateButton model={ props.model } />
  </Fragment>
}

export default JobActions
