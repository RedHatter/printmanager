import React, { Component } from 'react'
import {
  Dialog, DialogContent, DialogActions, Grid, TextField,
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
      comments: ''
    }

    this.handleChange = this.handleChange.bind(this)
    this.handleNumericChange = this.handleNumericChange.bind(this)
    this.handleDateChange = this.handleDateChange.bind(this)
    this.handleQuantityChange = this.handleQuantityChange.bind(this)
    this.handleCreate = this.handleCreate.bind(this)
    this.validate = this.validate.bind(this)
  }

  render () {
    return (
      <Dialog open={ this.props.isOpen } className="create-modal">
        <DialogContent>
          <Grid container spacing={ 16 }>
            <Grid item sm={ 12 }><Typography variant="headline" aline="left">Dates</Typography></Grid>
            <Grid item sm={ 4 }>
              <DatePicker autoOk clearable label="Drop Date" value={ this.state.dropDate } onChange={ this.handleDateChange('dropDate') } />
            </Grid>
            <Grid item sm={ 4 }>
              <DatePicker autoOk clearable label="Send to Print" value={ this.state.printDate } onChange={ this.handleDateChange('printDate') } />
            </Grid>
            <Grid item sm={ 4 }>
              <DatePicker autoOk clearable label="Expire" value={ this.state.expire } onChange={ this.handleDateChange('expire') } />
            </Grid>

            <Grid item sm={ 12 }><Typography variant="headline" aline="left">Details</Typography></Grid>
            <Grid item sm={ 4 }>
              <NumberFormat customInput={ TextField } label="Tracking Number" format="+1 (###) ### ####" isNumericString type="tel"
                value={ this.state.trackingNumber } onValueChange={ this.handleNumericChange('trackingNumber') } />
            </Grid>
            <Grid item sm={ 4 }>
              <TextField label="Vendor" value={ this.state.vendor } onChange={ this.handleChange('vendor') } />
            </Grid>
            <Grid item sm={ 4 }>
              <NumberFormat value={ this.state.quantity } onValueChange={ this.handleNumericChange('quantity') } customInput={ TextField }
                thousandSeparator label="Quantity" isNumericString />
            </Grid>
            <Grid item sm={ 3 }>
              <FoldPicker value={ this.state.fold } onChange={ this.handleChange('fold') } />
            </Grid>
            <Grid item sm={ 9 }>
              <TextField value={ this.state.addons } onChange={ this.handleChange('addons') }
                fullWidth label="Addons" select SelectProps={
                  { multiple: true, renderValue: selected => selected.join(', ') }
                }>
                { enums.addons.map(value => (
                  <MenuItem key={ value } value={ value }>
                    <Checkbox checked={ this.state.addons.indexOf(value) > -1 } />
                    <ListItemText primary={ value } />
                  </MenuItem>
                )) }
              </TextField>
            </Grid>
            <Grid item sm={ 6 }>
              <TextField fullWidth label="Envelope" select value={ this.state.envelope } onChange={ this.handleChange('envelope') }>
                { enums.envelope.map(value => <MenuItem key={ value } value={ value }>{ value }</MenuItem>) }
              </TextField>
            </Grid>
            <Grid item sm={ 6 }>
              <TextField fullWidth label="Size" select value={ this.state.size } onChange={ this.handleChange('size') }>
                { enums.size.map(value => <MenuItem key={ value } value={ value }>{ value }</MenuItem>) }
              </TextField>
            </Grid>
            <Grid item sm={ 6 }>
              <TextField fullWidth label="List Type" select value={ this.state.listType } onChange={ this.handleChange('listType') }>
                { enums.listType.map(value => <MenuItem key={ value } value={ value }>{ value }</MenuItem>) }
              </TextField>
            </Grid>
            <Grid item sm={ 6 }>
              <TextField fullWidth label="Postage" select value={ this.state.postage } onChange={ this.handleChange('postage') }>
                { enums.postage.map(value => <MenuItem key={ value } value={ value }>{ value }</MenuItem>) }
              </TextField>
            </Grid>
            <Grid item sm={ 12 }>
              <TextField fullWidth multiline rows={ 3 } label="Comments" value={ this.state.comments } onChange={ this.handleChange('comments') } />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={ this.props.onClose }>Cancel</Button>
          <Button onClick={ this.handleCreate } disabled={ !this.validate() }>Create</Button>
        </DialogActions>
      </Dialog>
    )
  }

  handleChange (prop) {
    return e => this.setState({ [prop]: e.target.value })
  }

  handleNumericChange (prop) {
    return format => this.setState({ [prop]: format.value })
  }

  handleDateChange (prop) {
    return value => this.setState({ [prop]: value })
  }

  handleQuantityChange (e) {
    this.setState({ quantity: e.target.value.replace(/[^0-9]/g, '') })
  }

  handleCreate () {
    fetch('/api/job', {
      method: 'POST',
      body: JSON.stringify(this.state),
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(this.props.onClose)
  }

  validate () {
    return this.state.dropDate && this.state.printDate && this.state.expire
      && this.state.vendor && this.state.quantity && this.state.fold
      && this.state.envelope && this.state.size && this.state.listType
      && this.state.postage && (!this.state.trackingNumber || /1[0-9]{10}/.test(this.state.trackingNumber))
  }
}

export default CreateModal
