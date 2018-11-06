import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import autobind from 'autobind-decorator'
import {
  Dialog, DialogContent, DialogActions, Grid, FormControlLabel,
  Button, Input, MenuItem, Checkbox, ListItemText, Typography
} from '@material-ui/core'
import { DatePicker } from 'material-ui-pickers'
import { Form, TextField } from 'material-ui-utils'
import NumberFormat from 'react-number-format'
import PropTypes from 'prop-types'

import { ClientType, JobType } from './types.js'
import EditFiles from './EditFiles.jsx'
import { enums, colorize } from '../utils.js'
import { deleteFiles, updateJob } from './actions.js'

@autobind
class CreateModal extends Component {
  static propTypes = {
    model: JobType,
    clients: PropTypes.arrayOf(ClientType).isRequired,
    salesmen: PropTypes.object.isRequired,
    files: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired
  }

  constructor (props) {
    super(props)

    this.state = {
      model: {
        client: '',
        salesman: '',
        dropDate: null,
        printDate: null,
        expire: null,
        trackingNumber: '',
        vendor: '',
        quantity: '',
        addons: [],
        jobType: '',
        envelope: 'None',
        size: '',
        listType: '',
        postage: '',
        comments: '',
        artStatus: enums.artStatus[0]
      },
      submitDisabled: false,
      selectedFiles: []
    }

    if (props.model) {
      let model = JSON.parse(JSON.stringify(props.model))
      model.client = model.client._id,
      model.salesman = model.salesman._id
      this.state.model = model
      this.state.editMode = true
    }

    if (!this.state.model._id) {
      delete this.state.model.name
      this.state.editMode = false
    }
  }

  render () {
    return (
      <Dialog open className="create-modal">
        <Form onSubmit={ this.handleSubmit } onValid={ this.handleValid } onInvalid={ this.handleInvalid }>
          <DialogContent>
            <Grid container spacing={ 16 }>
              <Grid item sm={ 12 }><Typography variant="headline" align="left">General</Typography></Grid>

              { this.state.editMode && <Fragment>
                <Grid item sm={ 6 }>
                  <TextField required fullWidth label="Name" pattern={ /^[A-Z]{3,5} \d{4}-\d+/ }
                    value={ this.state.model.name } onChange={ this.handleInputChange('name') } />
                </Grid>
                <Grid item sm={ 6 }>
                  <TextField fullWidth select label="Art Status" value={ this.state.model.artStatus } onChange={ this.handleInputChange('artStatus') }>
                    { enums.artStatus.map(value => <MenuItem key={ value } value={ value } className={ colorize(value) }>{ value }</MenuItem>) }
                  </TextField>
                </Grid>
              </Fragment>}

              <Grid item sm={ 6 }>
                <TextField required value={ this.state.model.client } onChange={ this.handleInputChange('client') } label="Client" select fullWidth>
                  { this.props.clients.map(client => <MenuItem value={ client._id } key={ client._id }>{ client.name }</MenuItem>) }
                </TextField>
              </Grid>
              <Grid item sm={ 6 }>
                <TextField required value={ this.state.model.salesman } onChange={ this.handleInputChange('salesman') } label="Salesman" select fullWidth>
                  { Object.entries(this.props.salesmen).map(([id, attributes]) => <MenuItem value={ id } key={ id }>{ attributes.name }</MenuItem>) }
                </TextField>
              </Grid>
              <Grid item sm={ 12 }><Typography variant="headline" align="left">Dates</Typography></Grid>
              { this.state.editMode
               ? <Fragment>
                <Grid item sm={ 6 }>
                  <TextField fullWidth autoOk clearable label="Droped On" component={ DatePicker }
                    value={ this.state.model.dropStatus || null } onChange={ this.handleValueChange('dropStatus') } />
                </Grid>
                <Grid item sm={ 6 }>
                  <TextField required fullWidth autoOk clearable label="Drop date" component={ DatePicker }
                    value={ this.state.model.dropDate } onChange={ this.handleValueChange('dropDate') } />
                </Grid>
                <Grid item sm={ 6 }>
                  <TextField required fullWidth autoOk clearable label="Send to print" component={ DatePicker }
                    value={ this.state.model.printDate } onChange={ this.handleValueChange('printDate') } />
                </Grid>
                <Grid item sm={ 6 }>
                  <TextField required fullWidth autoOk clearable label="Expire" component={ DatePicker }
                    value={ this.state.model.expire } onChange={ this.handleValueChange('expire') } />
                </Grid>
              </Fragment> : <Fragment>
                <Grid item sm={ 4 }>
                  <TextField required fullWidth autoOk clearable label="Drop date" component={ DatePicker }
                    value={ this.state.model.dropDate } onChange={ this.handleValueChange('dropDate') } />
                </Grid>
                <Grid item sm={ 4 }>
                  <TextField required fullWidth autoOk clearable label="Send to print" component={ DatePicker }
                    value={ this.state.model.printDate } onChange={ this.handleValueChange('printDate') } />
                </Grid>
                <Grid item sm={ 4 }>
                  <TextField required fullWidth autoOk clearable label="Expire" component={ DatePicker }
                    value={ this.state.model.expire } onChange={ this.handleValueChange('expire') } />
                </Grid>
              </Fragment> }
              <Grid item sm={ 12 }><Typography variant="headline" align="left">Details</Typography></Grid>
              <Grid item sm={ 4 }>
                <NumberFormat fullWidth pattern={ /^\+1 \(\d{3}\) \d{3} \d{4}$/ } label="Tracking number" type="tel"
                  customInput={ TextField } format="+1 (###) ### ####" isNumericString
                  value={ this.state.model.trackingNumber } onValueChange={ this.handleNumericChange('trackingNumber') } />
              </Grid>
              <Grid item sm={ 4 }>
                <TextField fullWidth required label="Vendor" value={ this.state.model.vendor } onChange={ this.handleInputChange('vendor') } />
              </Grid>
              <Grid item sm={ 4 }>
                <NumberFormat fullWidth required isNumericString thousandSeparator label="Quantity" customInput={ TextField }
                  value={ this.state.model.quantity } onValueChange={ this.handleNumericChange('quantity') }/>
              </Grid>
              <Grid item sm={ 6 }>
                <TextField required fullWidth label="Type" select value={ this.state.model.jobType } onChange={ this.handleInputChange('jobType') }>
                  { enums.jobType.map(value => <MenuItem key={ value } value={ value }>{ value }</MenuItem>) }
                </TextField>
              </Grid>
              <Grid item sm={ 6 }>
                <TextField required fullWidth label="Size" select value={ this.state.model.size } onChange={ this.handleInputChange('size') }>
                  { enums.size.map(value => <MenuItem key={ value } value={ value }>{ value }</MenuItem>) }
                </TextField>
              </Grid>
              <Grid item sm={ 6 }>
                <TextField required fullWidth label="Envelope" select value={ this.state.model.envelope } onChange={ this.handleInputChange('envelope') }>
                  { enums.envelope.map(value => <MenuItem key={ value } value={ value }>{ value }</MenuItem>) }
                </TextField>
              </Grid>
              <Grid item sm={ 6 }>
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
                <TextField required fullWidth label="List type" select value={ this.state.model.listType } onChange={ this.handleInputChange('listType') }>
                  { enums.listType.map(value => <MenuItem key={ value } value={ value }>{ value }</MenuItem>) }
                </TextField>
              </Grid>
              <Grid item sm={ 6 }>
                <TextField required fullWidth label="Postage" select value={ this.state.model.postage } onChange={ this.handleInputChange('postage') }>
                  { enums.postage.map(value => <MenuItem key={ value } value={ value }>{ value }</MenuItem>) }
                </TextField>
              </Grid>
              <Grid item sm={ 12 }>
                <TextField fullWidth multiline rows={ 3 } label="Comments" value={ this.state.model.comments } onChange={ this.handleInputChange('comments') } />
              </Grid>
              { this.state.editMode && <Fragment>
                { this.props.files[this.state.model._id] &&
                  <Grid item sm={ 12 }>
                    <EditFiles files={ this.props.files[this.state.model._id] } selected={ this.state.selectedFiles }
                      onChange={ selectedFiles => this.setState({ selectedFiles }) } />
                  </Grid>
                }
                <Grid item sm={12}>
                  <FormControlLabel label="Force completed" control={
                    <Checkbox checked={ this.state.model.forceComplete }
                      onChange={ this.handleForceCompleteChange } />
                  } />
                </Grid>
              </Fragment> }
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={ this.props.onClose }>Cancel</Button>
            <Button type="submit" disabled={ this.state.submitDisabled }>{ this.state.editMode ? 'Save' : 'Create' }</Button>
          </DialogActions>
        </Form>
      </Dialog>
    )
  }

  handleForceCompleteChange (e) {
    this.handleChange('forceComplete', e.target.checked)
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
    })
  }

  handleSubmit () {
    let { deleteFiles, updateJob, onClose } = this.props
    let { selectedFiles, model } = this.state
    Promise.all([deleteFiles(selectedFiles), updateJob(model)])
      .then(onClose)

  }

  clearError () {
    this.setState({ errorMessage: undefined })
  }

  handleValid () {
    this.setState({ submitDisabled: false })
  }

  handleInvalid () {
    this.setState({ submitDisabled: true })
  }
}

export default connect(
  state => ({
    salesmen: state.salesmen,
    clients: state.clients,
    files: state.files
  }), { deleteFiles, updateJob }
)(CreateModal)

<style>
  .create-modal {
    text-align: left;
  }

  li.red {
    color: #ef5350;
  }

  li.yellow {
    color: #FFB300;
  }

  li.green {
    color: #4CAF50;
  }
</style>
