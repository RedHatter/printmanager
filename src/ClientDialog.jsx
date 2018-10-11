import React, { Component } from 'react'
import autobind from 'autobind-decorator'
import { connect } from 'react-redux'
import {
  Dialog, DialogContent, DialogActions, Icon,
  Tabs, Tab, Button, TextField, Grid, Typography
} from '@material-ui/core'
import PropTypes from 'prop-types'

import { ClientType } from './types.js'
import Client from './Client.jsx'

@autobind
class ClientDialog extends Component {
  static propTypes = {
    model: PropTypes.arrayOf(ClientType).isRequired,
    onClose: PropTypes.func.isRequired
  }

  constructor (props) {
    super(props)

    this.state = {
      selectedTab: 0
    }
  }

  render () {
    return (
      <Dialog open className="client-dialog">
        <Tabs value={ this.state.selectedTab } onChange={ this.handleTabChange } className="client-dialog-tabs">
          <Tab icon={ <Icon>add</Icon> } />
          { this.props.model.map(client => <Tab key={ client._id } label={ client.name } />) }
        </Tabs>
        <DialogContent>
          <Client model={ this.state.selectedTab > 0 ? this.props.model[this.state.selectedTab - 1] : null } />
        </DialogContent>
        <DialogActions>
          <Button onClick={ this.props.onClose }>Close</Button>
        </DialogActions>
      </Dialog>
    )
  }

  handleTabChange (e, selectedTab) {
    this.setState({ selectedTab })
  }
}

export default connect(state => ({ model: state.clients }))(ClientDialog)

<style>
  .client-dialog {
    text-align: left;
  }

  .client-dialog-tabs {
    margin-bottom: 30px;
  }
</style>
