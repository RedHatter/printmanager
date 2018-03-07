import React, { Component, Fragment } from 'react'
import { Button, TextField, Grid, Typography, Snackbar } from 'material-ui'
import NumberFormat from 'react-number-format'


class Client extends Component {
  constructor (props) {
    super(props)

    this.initalState = {
      errors: '',
      model: {
        name: '',
        acronym: '',
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
    return (<Fragment>
      <Snackbar open={ this.state.message != undefined } onClose={ this.clearMessage } autoHideDuration={ 5000 }
        message={ this.state.message } anchorOrigin={ { vertical: 'bottom', horizontal: 'right' } } />
      <Grid container spacing={ 16 } className="client">
        <Grid item sm={ 12 }>
          <Typography variant="headline" aline="left">General</Typography>
        </Grid>
        <Grid item sm={ 9 }>
          <TextField fullWidth label="Name" value={ this.state.model.name } onChange={ this.handleInputChange.bind(this, [ 'name' ]) }
            error={ this.state.errors.name != undefined } helperText={ this.state.errors.name } />
        </Grid>
        <Grid item sm={ 3 }>
          <TextField fullWidth label="Acronym" value={ this.state.model.acronym } onChange={ this.handleAcronymChange }
            error={ this.state.errors.acronym != undefined } helperText={ this.state.errors.acronym } />
        </Grid>
        <Grid item sm={ 12 }>
          <Typography variant="headline" aline="left">Contact Information</Typography>
        </Grid>
        <Grid item sm={ 6 }>
          <TextField fullWidth label="Name" value={ this.state.model.contact.name } onChange={ this.handleInputChange.bind(this, [ 'contact', 'name' ]) }
            error={ this.state.errors.contactName != undefined } helperText={ this.state.errors.contactName } />
        </Grid>
        <Grid item sm={ 6 }>
          <NumberFormat fullWidth customInput={ TextField } label="Phone" format="+1 (###) ### ####" isNumericString type="tel"
            value={ this.state.model.contact.phone } onValueChange={ this.handleNumericChange.bind(this, [ 'contact', 'phone' ]) }
            error={ this.state.errors.contactPhone != undefined } helperText={ this.state.errors.contactPhone } />
        </Grid>
        <Grid item sm={ 12 }>
          <TextField fullWidth label="Email" value={ this.state.model.contact.email } onChange={ this.handleInputChange.bind(this, [ 'contact', 'email' ]) }
            error={ this.state.errors.contactEmail != undefined } helperText={ this.state.errors.contactEmail } />
        </Grid>
        <Grid item sm={ 12 }>
          <Typography variant="headline" aline="left">Call Tracking Numbers</Typography>
        </Grid>
        <Grid item sm={ 4 }>
          <NumberFormat customInput={ TextField } label="Database" format="+1 (###) ### ####" isNumericString type="tel"
            value={ this.state.model.trackingNumbers.database } onValueChange={ this.handleNumericChange.bind(this, [ 'trackingNumbers', 'database' ]) }
            error={ this.state.errors.trackingNumbersDatabase != undefined } helperText={ this.state.errors.trackingNumbersDatabase } />
        </Grid>
        <Grid item sm={ 4 }>
          <NumberFormat customInput={ TextField } label="Saturation" format="+1 (###) ### ####" isNumericString type="tel"
            value={ this.state.model.trackingNumbers.saturation } onValueChange={ this.handleNumericChange.bind(this, [ 'trackingNumbers', 'saturation' ]) }
            error={ this.state.errors.trackingNumbersSaturation != undefined } helperText={ this.state.errors.trackingNumbersSaturation } />
        </Grid>
        <Grid item sm={ 4 }>
          <NumberFormat customInput={ TextField } label="Bankruptcy" format="+1 (###) ### ####" isNumericString type="tel"
            value={ this.state.model.trackingNumbers.bankruptcy } onValueChange={ this.handleNumericChange.bind(this, [ 'trackingNumbers', 'bankruptcy' ]) }
            error={ this.state.errors.trackingNumbersBankruptcy != undefined } helperText={ this.state.errors.trackingNumbersBankruptcy } />
        </Grid>
        <Grid item sm={ 4 }>
          <NumberFormat customInput={ TextField } label="Credit" format="+1 (###) ### ####" isNumericString type="tel"
            value={ this.state.model.trackingNumbers.credit } onValueChange={ this.handleNumericChange.bind(this, [ 'trackingNumbers', 'credit' ]) }
            error={ this.state.errors.trackingNumbersCredit != undefined } helperText={ this.state.errors.trackingNumbersCredit } />
        </Grid>
        <Grid item sm={ 4 }>
          <NumberFormat customInput={ TextField } label="Conquest" format="+1 (###) ### ####" isNumericString type="tel"
            value={ this.state.model.trackingNumbers.conquest } onValueChange={ this.handleNumericChange.bind(this, [ 'trackingNumbers', 'conquest' ]) }
            error={ this.state.errors.trackingNumbersConquest != undefined } helperText={ this.state.errors.trackingNumbersConquest } />
        </Grid>
        <Grid item sm={ 12 }>
          <Button onClick={ this.handleSave } className="client-save-button" disabled={ this.state.submitDisabled }>Save</Button>
        </Grid>
      </Grid>
    </Fragment>)
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
    }, () => this.state.submitDisabled && this.validate())
  }

  validate () {
    let state = { errors: {} }

    if (!this.state.model.name) state.errors.name = 'Client name is required'

    if (!this.state.model.acronym) state.errors.acronym = 'Acronym is required'
    else if (!/^[A-Z]{3,4}$/.test(this.state.model.acronym)) state.errors.acronym = 'Invalid acronym'

    if (!this.state.model.contact.name) state.errors.contactName = 'Contact name is required'

    if (!this.state.model.contact.email) state.errors.contactEmail = 'Contact email is required'
    else if (!/^.+@.+\..+$/.test(this.state.model.contact.email)) state.errors.contactEmail = 'Invalid email'

    if (!this.state.model.contact.phone) state.errors.contactPhone = 'Contact phone is required'
    else if (!/^\d{10}$/.test(this.state.model.contact.phone)) state.errors.contactPhone = 'Invalid phone number'

    if (!this.state.model.trackingNumbers.database) state.errors.trackingNumbersDatabase = 'Database is required'
    else if (!/^\d{10}$/.test(this.state.model.trackingNumbers.database)) state.errors.trackingNumbersDatabase = 'Invalid phone number'

    if (!this.state.model.trackingNumbers.saturation) state.errors.trackingNumbersSaturation = 'Saturation is required'
    else if (!/^\d{10}$/.test(this.state.model.trackingNumbers.saturation)) state.errors.trackingNumbersSaturation = 'Invalid phone number'

    if (!this.state.model.trackingNumbers.bankruptcy) state.errors.trackingNumbersBankruptcy = 'Bankruptcy is required'
    else if (!/^\d{10}$/.test(this.state.model.trackingNumbers.bankruptcy)) state.errors.trackingNumbersBankruptcy = 'Invalid phone number'

    if (!this.state.model.trackingNumbers.credit) state.errors.trackingNumbersCredit = 'Credit is required'
    else if (!/^\d{10}$/.test(this.state.model.trackingNumbers.credit)) state.errors.trackingNumbersCredit = 'Invalid phone number'

    if (!this.state.model.trackingNumbers.conquest) state.errors.trackingNumbersConquest = 'Conquest is required'
    else if (!/^\d{10}$/.test(this.state.model.trackingNumbers.conquest)) state.errors.trackingNumbersConquest = 'Invalid phone number'

    state.submitDisabled = Object.keys(state.errors).length > 0
    this.setState(state)

    return !state.submitDisabled
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
