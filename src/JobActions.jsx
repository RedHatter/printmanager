import React, { Component, Fragment } from 'react'
import autobind from 'autobind-decorator'
import { withStyles, Button } from '@material-ui/core'

import CreateDialog from './CreateDialog.jsx'

@autobind
class JobActions extends Component {
  constructor (props) {
    super(props)

    this.state = {
      editIsOpen: false
    }
  }

  render () {
    return (
      <Fragment>
        <Button onClick={ this.openEdit }>Edit</Button>
        { this.state.editIsOpen && <CreateDialog open model={ this.props.model } clients={ this.props.clients } onClose={ this.closeEdit } /> }
        { this.state.editIsOpen && <CreateDialog open model={ this.props.model } onClose={ this.closeEdit } /> }
      </Fragment>
    )
  }

  openEdit () {
    this.setState({ editIsOpen: true })
  }

  closeEdit () {
    this.setState({ editIsOpen: false })
  }
}

export default JobActions
