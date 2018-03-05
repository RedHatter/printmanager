import React, { Component, Fragment } from 'react'
import {
  Dialog, DialogContent, DialogActions, Grid, TextField, Snackbar,
  Button, Input, MenuItem, Checkbox, ListItemText, Typography
} from 'material-ui'
import { DatePicker } from 'material-ui-pickers'
import NumberFormat from 'react-number-format'

import FoldPicker from './FoldPicker.jsx'
import enums from '../enums.js'

class CreateModal extends Component {
  constructor (props) {
    super(props)

    this.state = {
      model: {
        dropDate: null,
        printDate: null,
        expire: null,
        trackingNumber: '',
        vendor: '',
        quantity: '',
        fold: 'No Fold',
        addons: [],
        envelope: 'None',
        size: '',
        listType: '',
        postage: '',
        comments: '',
        artStatus: 'In Progress'
      },
      errors: {},
      submitDisabled: false
    }

    this.handleChange = this.handleChange.bind(this)
    this.handleValueChange = this.handleValueChange.bind(this)
    this.handleInputChange = this.handleInputChange.bind(this)
    this.handleNumericChange = this.handleNumericChange.bind(this)
    this.handleCreate = this.handleCreate.bind(this)
    this.validate = this.validate.bind(this)
    this.clearError = this.clearError.bind(this)
  }

  render () {
    return (
      <Fragment>
        <Snackbar open={ this.state.errorMessage != undefined } onClose={ this.clearError } autoHideDuration={ 5000 }
          message={ this.state.errorMessage } anchorOrigin={ { vertical: 'bottom', horizontal: 'right' } } />
        <Dialog open={ this.props.isOpen } className="create-modal">
          <DialogContent>
            <Grid container spacing={ 16 }>
              <Grid item sm={ 12 }><Typography variant="headline" aline="left">Dates</Typography></Grid>
              <Grid item sm={ 4 }>
                <DatePicker autoOk clearable label="Drop date" value={ this.state.model.dropDate } onChange={ this.handleValueChange('dropDate') }
                error={ this.state.errors.dropDate != undefined } helperText={ this.state.errors.dropDate }/>
              </Grid>
              <Grid item sm={ 4 }>
                <DatePicker autoOk clearable label="Send to print" value={ this.state.model.printDate } onChange={ this.handleValueChange('printDate') }
                error={ this.state.errors.printDate != undefined } helperText={ this.state.errors.printDate }/>
              </Grid>
              <Grid item sm={ 4 }>
                <DatePicker autoOk clearable label="Expire" value={ this.state.model.expire } onChange={ this.handleValueChange('expire') }
                error={ this.state.errors.expire != undefined } helperText={ this.state.errors.expire }/>
              </Grid>

              <Grid item sm={ 12 }><Typography variant="headline" aline="left">Details</Typography></Grid>
              <Grid item sm={ 4 }>
                <NumberFormat customInput={ TextField } label="Tracking number" format="+1 (###) ### ####" isNumericString type="tel"
                  value={ this.state.model.trackingNumber } onValueChange={ this.handleNumericChange('trackingNumber') }
                error={ this.state.errors.trackingNumber != undefined } helperText={ this.state.errors.trackingNumber }/>
              </Grid>
              <Grid item sm={ 4 }>
                <TextField label="Vendor" value={ this.state.model.vendor } onChange={ this.handleInputChange('vendor') }
                  error={ this.state.errors.vendor != undefined } helperText={ this.state.errors.vendor } />
              </Grid>
              <Grid item sm={ 4 }>
                <NumberFormat value={ this.state.model.quantity } onValueChange={ this.handleNumericChange('quantity') } customInput={ TextField }
                  thousandSeparator label="Quantity" isNumericString
                error={ this.state.errors.quantity != undefined } helperText={ this.state.errors.quantity }/>
              </Grid>
              <Grid item sm={ 3 }>
                <FoldPicker value={ this.state.model.fold } onChange={ this.handleInputChange('fold') } />
              </Grid>
              <Grid item sm={ 9 }>
                <TextField value={ this.state.model.addons } onChange={ this.handleInputChange('addons') }
                  fullWidth label="Addons" select SelectProps={
                    { multiple: true, renderValue: selected => selected.join(', ') }
                  }>
                  { enums.addons.map(value => (
                    <MenuItem key={ value } value={ value }>
                      <Checkbox checked={ this.state.model.addons.indexOf(value) > -1 } />
                      <ListItemText primary={ value } />
                    </MenuItem>
                  )) }
                </TextField>
              </Grid>
              <Grid item sm={ 6 }>
                <TextField fullWidth label="Envelope" select value={ this.state.model.envelope } onChange={ this.handleInputChange('envelope') }
                  error={ this.state.errors.envelope != undefined } helperText={ this.state.errors.envelope }>
                  { enums.envelope.map(value => <MenuItem key={ value } value={ value }>{ value }</MenuItem>) }
                </TextField>
              </Grid>
              <Grid item sm={ 6 }>
                <TextField fullWidth label="Size" select value={ this.state.model.size } onChange={ this.handleInputChange('size') }
                  error={ this.state.errors.size != undefined } helperText={ this.state.errors.size }>
                  { enums.size.map(value => <MenuItem key={ value } value={ value }>{ value }</MenuItem>) }
                </TextField>
              </Grid>
              <Grid item sm={ 6 }>
                <TextField fullWidth label="List type" select value={ this.state.model.listType } onChange={ this.handleInputChange('listType') }
                  error={ this.state.errors.listType != undefined } helperText={ this.state.errors.listType }>
                  { enums.listType.map(value => <MenuItem key={ value } value={ value }>{ value }</MenuItem>) }
                </TextField>
              </Grid>
              <Grid item sm={ 6 }>
                <TextField fullWidth label="Postage" select value={ this.state.model.postage } onChange={ this.handleInputChange('postage') }
                  error={ this.state.errors.postage != undefined } helperText={ this.state.errors.postage }>
                  { enums.postage.map(value => <MenuItem key={ value } value={ value }>{ value }</MenuItem>) }
                </TextField>
              </Grid>
              <Grid item sm={ 12 }>
                <TextField fullWidth multiline rows={ 3 } label="Comments" value={ this.state.model.comments } onChange={ this.handleInputChange('comments') } />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={ this.props.onClose }>Cancel</Button>
            <Button onClick={ this.handleCreate } disabled={ this.state.submitDisabled }>Create</Button>
          </DialogActions>
        </Dialog>
      </Fragment>
    )
  }

  handleInputChange (prop) {
    return e => this.handleChange(prop, e.target.value)
  }

  handleNumericChange (prop) {
    return format => this.handleChange(prop, format.value)
  }

  handleValueChange (prop) {
    return value => this.handleChange(prop, value)
  }

  handleChange (prop, value) {
    this.setState(state => {
      let model = JSON.parse(JSON.stringify(state.model))
      model[prop] = value
      return { model }
    }, () => this.state.submitDisabled && this.validate())
  }

  handleCreate () {
    if (this.validate())
      fetch('/api/job', {
        method: 'POST',
        body: JSON.stringify(this.state.model),
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(res => {
        if (!res.ok)
          this.setState({ errorMessage: `Unable to create job. Error code ${res.status}.` })
        else
          this.props.onClose()
      }).catch(err => this.setState({ errorMessage: 'Unable to create job. ' + err.message }))
  }

  getRequiredValidator (prop, name) {
    return {
      error: () => !this.state.model[prop],
      helperText: name + ' is required'
    }
  }

  validate () {
    let state = { errors: {} }
    if (!this.state.model.dropDate) state.errors.dropDate = 'Drop date is required'
    if (!this.state.model.printDate) state.errors.printDate = 'Print date is required'
    if (!this.state.model.expire) state.errors.expire = 'Expire is required'
    if (!this.state.model.envelope) state.errors.envelope = 'Envelope is required'
    if (!this.state.model.vendor) state.errors.vendor = 'Vendor is required'
    if (!this.state.model.quantity) state.errors.quantity = 'Quantity is required'
    if (!this.state.model.size) state.errors.size = 'Size is required'
    if (!this.state.model.listType) state.errors.listType = 'List type is required'
    if (!this.state.model.postage) state.errors.postage = 'Postage is required'
    if (this.state.model.trackingNumber && !/1[0-9]{10}/.test(this.state.model.trackingNumber))
      state.errors.trackingNumber = 'Tracking number must be 10 digits'

    state.submitDisabled = Object.keys(state.errors).length > 0
    this.setState(state)

    return !state.submitDisabled
  }

  clearError () {
    this.setState({ errorMessage: undefined })
  }
}

export default CreateModal

<style>
  .create-modal {
    text-align: left;
  }
</style>
