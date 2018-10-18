import React, { Component } from 'react'
import autobind from 'autobind-decorator'
import { Button, Grid, Typography, Snackbar } from '@material-ui/core'
import { Form, TextField } from 'material-ui-utils'
import NumberFormat from 'react-number-format'

import { ClientType } from './types.js'

@autobind
class Client extends Component {
  static propTypes = {
    model: ClientType
  }

  constructor (props) {
    super(props)

    this.initalState = {
      model: {
        name: '',
        acronym: '',
        address: '',
        contact: {
          name: '',
          phone: '',
          email: ''
        },
        trackingNumbers: {
          database: '',
          saturation: '',
          bankruptcy: '',
          credit: '',
          conquest: ''
        }
      }
    }

    this.state = JSON.parse(JSON.stringify(this.initalState))

    if (props.model)
      this.state.model = JSON.parse(JSON.stringify(props.model))
  }

  componentWillReceiveProps (nextProps) {
    if ((this.props.model && nextProps.model && this.props.model._id == nextProps.model._id)
      || (!this.props.model && !nextProps.model))
     return

    let state = JSON.parse(JSON.stringify(this.initalState))
    if (nextProps.model)
      state.model = nextProps.model

    this.setState(state)
  }

  render () {
    return (<Form onSubmit={ this.handleSave } onValid={ this.handleValid } onInvalid={ this.handleInvalid } >
      <Snackbar open={ this.state.message != undefined } onClose={ this.clearMessage } autoHideDuration={ 5000 }
        message={ this.state.message } anchorOrigin={ { vertical: 'bottom', horizontal: 'right' } } />
      <Grid container spacing={ 16 } className="client">
        <Grid item sm={ 12 }>
          <Typography variant="headline" align="left">General</Typography>
        </Grid>
        <Grid item sm={ 9 }>
          <TextField fullWidth label="Name" value={ this.state.model.name } onChange={ this.handleInputChange.bind(this, [ 'name' ]) } required />
        </Grid>
        <Grid item sm={ 3 }>
          <TextField fullWidth label="Acronym" value={ this.state.model.acronym } onChange={ this.handleAcronymChange } required />
        </Grid>
        <Grid item sm={ 12 }>
          <TextField fullWidth label="Address" value={ this.state.model.address } onChange={ this.handleInputChange.bind(this, [ 'address' ]) } required />
        </Grid>
        <Grid item sm={ 12 }>
          <Typography variant="headline" align="left">Contact Information</Typography>
        </Grid>
        <Grid item sm={ 6 }>
          <TextField fullWidth label="Name" value={ this.state.model.contact.name } onChange={ this.handleInputChange.bind(this, [ 'contact', 'name' ]) } required />
        </Grid>
        <Grid item sm={ 6 }>
          <NumberFormat fullWidth customInput={ TextField } label="Phone" format="+1 (###) ### ####" isNumericString type="tel" pattern={ /^\+1 \(\d{3}\) \d{3} \d{4}$/ }
            value={ this.state.model.contact.phone } onValueChange={ this.handleNumericChange.bind(this, [ 'contact', 'phone' ]) } required />
        </Grid>
        <Grid item sm={ 12 }>
          <TextField fullWidth label="Email" value={ this.state.model.contact.email } onChange={ this.handleInputChange.bind(this, [ 'contact', 'email' ]) } required />
        </Grid>
        <Grid item sm={ 12 }>
          <Typography variant="headline" align="left">Call Tracking Numbers</Typography>
        </Grid>
        <Grid item sm={ 4 }>
          <NumberFormat fullWidth customInput={ TextField } label="Database" format="+1 (###) ### ####" isNumericString type="tel" pattern={ /^\+1 \(\d{3}\) \d{3} \d{4}$/ }
            value={ this.state.model.trackingNumbers.database } onValueChange={ this.handleNumericChange.bind(this, [ 'trackingNumbers', 'database' ]) } required />
        </Grid>
        <Grid item sm={ 4 }>
          <NumberFormat fullWidth customInput={ TextField } label="Saturation" format="+1 (###) ### ####" isNumericString type="tel" pattern={ /^\+1 \(\d{3}\) \d{3} \d{4}$/ }
            value={ this.state.model.trackingNumbers.saturation } onValueChange={ this.handleNumericChange.bind(this, [ 'trackingNumbers', 'saturation' ]) } required />
        </Grid>
        <Grid item sm={ 4 }>
          <NumberFormat fullWidth customInput={ TextField } label="Bankruptcy" format="+1 (###) ### ####" isNumericString type="tel" pattern={ /^\+1 \(\d{3}\) \d{3} \d{4}$/ }
            value={ this.state.model.trackingNumbers.bankruptcy } onValueChange={ this.handleNumericChange.bind(this, [ 'trackingNumbers', 'bankruptcy' ]) } required />
        </Grid>
        <Grid item sm={ 4 }>
          <NumberFormat fullWidth customInput={ TextField } label="Credit" format="+1 (###) ### ####" isNumericString type="tel" pattern={ /^\+1 \(\d{3}\) \d{3} \d{4}$/ }
            value={ this.state.model.trackingNumbers.credit } onValueChange={ this.handleNumericChange.bind(this, [ 'trackingNumbers', 'credit' ]) } required />
        </Grid>
        <Grid item sm={ 4 }>
          <NumberFormat fullWidth customInput={ TextField } label="Conquest" format="+1 (###) ### ####" isNumericString type="tel" pattern={ /^\+1 \(\d{3}\) \d{3} \d{4}$/ }
            value={ this.state.model.trackingNumbers.conquest } onValueChange={ this.handleNumericChange.bind(this, [ 'trackingNumbers', 'conquest' ]) } required />
        </Grid>
        <Grid item sm={ 12 }>
          <Button type="submit" className="client-save-button" disabled={ this.state.submitDisabled }>Save</Button>
        </Grid>
      </Grid>
    </Form>)
  }

  handleValid () {
    this.setState({ submitDisabled: false })
  }

  handleInvalid () {
    this.setState({ submitDisabled: true })
  }

  handleAcronymChange (e) {
    this.setValue([ 'acronym' ], e.target.value.toUpperCase())
  }

  handleNumericChange (path, format) {
    this.setValue(path, format.value)
  }

  handleInputChange (path, e) {
    this.setValue(path, e.target.value)
  }

  setValue (path, value) {
    this.setState(state => {
      let model = JSON.parse(JSON.stringify(this.state.model))
      let obj = model
      while (path.length > 1)
        obj = model[path.shift()]

      obj[path[0]] = value

      return { model }
    })
  }

  handleSave () {
    fetch(this.state.model._id ? '/api/client/' + this.state.model._id : '/api/client', {
      method: 'POST',
      body: JSON.stringify(this.state.model),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(res => this.setState(res.ok
      ? {
        message: this.state.model.name + ' saved.',
        model: JSON.parse(JSON.stringify(this.initalState.model))
      }
      : {
        message: `Unable to submit client. Error code ${res.status}.`
      }
    ))
    .catch(err => this.setState({ message: 'Unable to submit client. ' + err.message }))
  }

  clearMessage () {
    this.setState({ message: undefined })
  }
}

export default Client

<style>
  .client-save-button {
    float: right;
  }
</style>
