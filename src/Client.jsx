import React, { Component } from 'react'
import { Button, Grid, Typography, Snackbar } from 'material-ui'
import { Form, TextField } from 'material-ui-utils'
import NumberFormat from 'react-number-format'


class Client extends Component {
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

    this.state = this.initalState

    if (props.model)
      this.state.model = JSON.parse(JSON.stringify(props.model))

    this.handleSave = this.handleSave.bind(this)
    this.clearMessage = this.clearMessage.bind(this)
    this.handleValid = this.handleValid.bind(this)
    this.handleInvalid = this.handleInvalid.bind(this)
    this.handleAcronymChange = this.handleAcronymChange.bind(this)
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
          <Typography variant="headline" aline="left">General</Typography>
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
          <Typography variant="headline" aline="left">Contact Information</Typography>
        </Grid>
        <Grid item sm={ 6 }>
          <TextField fullWidth label="Name" value={ this.state.model.contact.name } onChange={ this.handleInputChange.bind(this, [ 'contact', 'name' ]) } required />
        </Grid>
        <Grid item sm={ 6 }>
          <NumberFormat fullWidth customInput={ TextField } label="Phone" format="+1 (###) ### ####" isNumericString type="tel" pattern={ /^\d{10}$/ }
            value={ this.state.model.contact.phone } onValueChange={ this.handleNumericChange.bind(this, [ 'contact', 'phone' ]) } required />
        </Grid>
        <Grid item sm={ 12 }>
          <TextField fullWidth label="Email" value={ this.state.model.contact.email } onChange={ this.handleInputChange.bind(this, [ 'contact', 'email' ]) } required />
        </Grid>
        <Grid item sm={ 12 }>
          <Typography variant="headline" aline="left">Call Tracking Numbers</Typography>
        </Grid>
        <Grid item sm={ 4 }>
          <NumberFormat customInput={ TextField } label="Database" format="+1 (###) ### ####" isNumericString type="tel" pattern={ /^\d{10}$/ }
            value={ this.state.model.trackingNumbers.database } onValueChange={ this.handleNumericChange.bind(this, [ 'trackingNumbers', 'database' ]) } required />
        </Grid>
        <Grid item sm={ 4 }>
          <NumberFormat customInput={ TextField } label="Saturation" format="+1 (###) ### ####" isNumericString type="tel" pattern={ /^\d{10}$/ }
            value={ this.state.model.trackingNumbers.saturation } onValueChange={ this.handleNumericChange.bind(this, [ 'trackingNumbers', 'saturation' ]) } required />
        </Grid>
        <Grid item sm={ 4 }>
          <NumberFormat customInput={ TextField } label="Bankruptcy" format="+1 (###) ### ####" isNumericString type="tel" pattern={ /^\d{10}$/ }
            value={ this.state.model.trackingNumbers.bankruptcy } onValueChange={ this.handleNumericChange.bind(this, [ 'trackingNumbers', 'bankruptcy' ]) } required />
        </Grid>
        <Grid item sm={ 4 }>
          <NumberFormat customInput={ TextField } label="Credit" format="+1 (###) ### ####" isNumericString type="tel" pattern={ /^\d{10}$/ }
            value={ this.state.model.trackingNumbers.credit } onValueChange={ this.handleNumericChange.bind(this, [ 'trackingNumbers', 'credit' ]) } required />
        </Grid>
        <Grid item sm={ 4 }>
          <NumberFormat customInput={ TextField } label="Conquest" format="+1 (###) ### ####" isNumericString type="tel" pattern={ /^\d{10}$/ }
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
    if (this.validate())
      fetch(this.state.model._id ? '/api/client/' + this.state.model._id : '/api/client', {
        method: 'POST',
        body: JSON.stringify(this.state.model),
        headers: {
          'Content-Type': 'application/json'
        }
      })
      .then(res => this.setState({ message: res.ok
        ? this.state.model.name + ' saved.'
        : `Unable to submit client. Error code ${res.status}.` }))
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
