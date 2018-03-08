import React, { Component, Fragment } from 'react'
import { Button } from 'material-ui'

import CreateDialog from './CreateDialog.jsx'

class JobActions extends Component {
  constructor (props) {
    super(props)

    this.state = {
      editIsOpen: false
    }

    this.openEdit = this.openEdit.bind(this)
    this.closeEdit = this.closeEdit.bind(this)
  }

  render () {
    return (
      <Fragment>
        <Button onClick={ this.openEdit }>Edit</Button>
        { this.state.editIsOpen && <CreateDialog open model={ this.props.model } clients={ this.props.clients } onClose={ this.closeEdit } /> }
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
