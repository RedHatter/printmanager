import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import bound from 'bound-decorator'
import PropTypes from 'prop-types'
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Typography
} from '@material-ui/core'
import { Form, TextField } from 'material-ui-utils'

class Prompt extends Component {
  static propTypes = {
    onCancel: PropTypes.func.isRequired,
    onAccept: PropTypes.func.isRequired,
    description: PropTypes.string,
    label: PropTypes.string
  }

  constructor(props) {
    super(props)

    this.state = {
      value: '',
      submitDisabled: false
    }
  }

  render() {
    let { onCancel, label, description } = this.props
    let { value, submitDisabled } = this.state

    return (
      <Dialog open className="create-modal">
        <Form
          onSubmit={this.handleSubmit}
          onValid={this.handleValid}
          onInvalid={this.handleInvalid}
        >
          <DialogContent>
            {description}
            <TextField
              required
              fullWidth
              label={label}
              value={value}
              onChange={this.handleValueChange}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={onCancel}>Cancel</Button>
            <Button type="submit" disabled={submitDisabled}>
              Done
            </Button>
          </DialogActions>
        </Form>
      </Dialog>
    )
  }

  @bound
  handleValueChange(e) {
    this.setState({ value: e.target.value })
  }

  @bound
  handleSubmit() {
    this.props.onAccept(this.state.value)
    this.setState({ value: '' })
  }

  @bound
  handleValid() {
    this.setState({ submitDisabled: false })
  }

  @bound
  handleInvalid() {
    this.setState({ submitDisabled: true })
  }
}

export default Prompt
