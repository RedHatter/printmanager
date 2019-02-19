import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import bound from 'bound-decorator'
import {
  Dialog, DialogContent, DialogActions, Grid, FormControlLabel,
  Button, Input, MenuItem, Checkbox, ListItemText, Typography
} from '@material-ui/core'
import { DatePicker } from 'material-ui-pickers'
import { Form, TextField } from 'material-ui-utils'
import NumberFormat from 'react-number-format'
import PropTypes from 'prop-types'

import { ClientType, JobType } from '../types.js'
import EditFiles from './EditFiles.jsx'
import { enums, colorize } from '../../utils.js'
import { deleteFiles, updateJob } from '../actions.js'

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
        dropDate: [ null, null ],
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
    let { clients, salesmen, files, onClose } = this.props
    let { selectedFiles, submitDisabled, editMode } = this.state
    let {
      _id, created, name, client, jobType, envelope, size, addons, listType,
      salesman, postage, quantity, dropDate, printDate, expire, vendor,
      trackingNumber, comments, artStatus, dropStatus, forceComplete, versionComment
    } = this.state.model

    return (
      <Dialog open className="create-modal">
        <Form onSubmit={ this.handleSubmit } onValid={ this.handleValid } onInvalid={ this.handleInvalid }>
          <DialogContent>
            <Grid container spacing={ 16 }>
              <Grid item sm={ 12 }><Typography variant="headline" align="left">General</Typography></Grid>

              { editMode && <Fragment>
                <Grid item sm={ 6 }>
                  <TextField required fullWidth label="Name" pattern={ /^[A-Z]{3,5} \d{4}-\d+/ }
                    value={ name } onChange={ this.handleInputChange('name') } />
                </Grid>
                <Grid item sm={ 6 }>
                  <TextField fullWidth select label="Art Status" value={ artStatus } onChange={ this.handleInputChange('artStatus') }>
                    { enums.artStatus.map(value => <MenuItem key={ value } value={ value } className={ colorize(value) }>{ value }</MenuItem>) }
                  </TextField>
                </Grid>
              </Fragment>}

              <Grid item sm={ 6 }>
                <TextField required value={ client } onChange={ this.handleInputChange('client') } label="Client" select fullWidth>
                  { clients.map(c => <MenuItem value={ c._id } key={ c._id }>{ c.name }</MenuItem>) }
                </TextField>
              </Grid>
              <Grid item sm={ 6 }>
                <TextField required value={ salesman } onChange={ this.handleInputChange('salesman') } label="Salesman" select fullWidth>
                  { Object.entries(salesmen).map(([id, attributes]) => <MenuItem value={ id } key={ id }>{ attributes.name }</MenuItem>) }
                </TextField>
              </Grid>
              <Grid item sm={ 12 }><Typography variant="headline" align="left">Dates</Typography></Grid>
              { editMode
               ? <Fragment>
                <Grid item sm={ 4 }>
                  <TextField fullWidth autoOk clearable label="Droped On" component={ DatePicker }
                    value={ dropStatus || null } onChange={ this.handleValueChange('dropStatus') } />
                </Grid>
                <Grid item sm={ 4 }>
                  <TextField required fullWidth autoOk clearable label="Drop date" component={ DatePicker }
                    value={ dropDate[0] } onChange={ this.handleIndexChange('dropDate', 0) } />
                </Grid>
                <Grid item sm={ 4 }>
                  <TextField fullWidth autoOk clearable label="Second drop date" component={ DatePicker }
                    value={ dropDate[1] } onChange={ this.handleIndexChange('dropDate', 1) } />
                </Grid>
                <Grid item sm={ 4 }>
                  <TextField required fullWidth autoOk clearable label="Send to print" component={ DatePicker }
                    value={ printDate } onChange={ this.handleValueChange('printDate') } />
                </Grid>
                <Grid item sm={ 4 }>
                  <TextField required fullWidth autoOk clearable label="Expire" component={ DatePicker }
                    value={ expire } onChange={ this.handleValueChange('expire') } />
                </Grid>
              </Fragment> : <Fragment>
                <Grid item sm={ 6 }>
                  <TextField required fullWidth autoOk clearable label="Drop date" component={ DatePicker }
                    value={ dropDate[0] } onChange={ this.handleIndexChange('dropDate', 0) } />
                </Grid>
                <Grid item sm={ 6 }>
                  <TextField fullWidth autoOk clearable label="Second drop date" component={ DatePicker }
                    value={ dropDate[1] } onChange={ this.handleIndexChange('dropDate', 1) } />
                </Grid>
                <Grid item sm={ 6 }>
                  <TextField required fullWidth autoOk clearable label="Send to print" component={ DatePicker }
                    value={ printDate } onChange={ this.handleValueChange('printDate') } />
                </Grid>
                <Grid item sm={ 6 }>
                  <TextField required fullWidth autoOk clearable label="Expire" component={ DatePicker }
                    value={ expire } onChange={ this.handleValueChange('expire') } />
                </Grid>
              </Fragment> }
              <Grid item sm={ 12 }><Typography variant="headline" align="left">Details</Typography></Grid>
              <Grid item sm={ 6 }>
                <TextField required fullWidth label="Type" select value={ jobType } onChange={ this.handleInputChange('jobType') }>
                  { enums.jobType.map(value => <MenuItem key={ value } value={ value }>{ value }</MenuItem>) }
                </TextField>
              </Grid>
              <Grid item sm={ 6 }>
                <TextField required fullWidth label="List type" select value={ listType } onChange={ this.handleInputChange('listType') }>
                  { enums.listType.map(value => <MenuItem key={ value } value={ value }>{ value }</MenuItem>) }
                </TextField>
              </Grid>
              <Grid item sm={ 4 }>
                <NumberFormat fullWidth pattern={ /^\+1 \(\d{3}\) \d{3} \d{4}$/ } label="Tracking number" type="tel"
                  customInput={ TextField } format="+1 (###) ### ####" isNumericString
                  value={ trackingNumber } onValueChange={ this.handleNumericChange('trackingNumber') } />
              </Grid>
              <Grid item sm={ 4 }>
                <TextField fullWidth required label="Vendor" value={ vendor } onChange={ this.handleInputChange('vendor') } />
              </Grid>
              <Grid item sm={ 4 }>
                <NumberFormat fullWidth required isNumericString thousandSeparator label="Quantity" customInput={ TextField }
                  value={ quantity } onValueChange={ this.handleNumericChange('quantity') }/>
              </Grid>
              <Grid item sm={ 6 }>
                <TextField required fullWidth label="Size" select value={ size } onChange={ this.handleInputChange('size') }>
                  { enums.size.map(value => <MenuItem key={ value } value={ value }>{ value }</MenuItem>) }
                </TextField>
              </Grid>
              <Grid item sm={ 6 }>
                <TextField required fullWidth label="Envelope" select value={ envelope } onChange={ this.handleInputChange('envelope') }>
                  { enums.envelope.map(value => <MenuItem key={ value } value={ value }>{ value }</MenuItem>) }
                </TextField>
              </Grid>
              <Grid item sm={ 6 }>
                <TextField value={ addons } onChange={ this.handleInputChange('addons') }
                  fullWidth label="Addons" select SelectProps={
                    { multiple: true, renderValue: selected => selected.join(', ') }
                  }>
                  { enums.addons.map(value => (
                    <MenuItem key={ value } value={ value }>
                      <Checkbox checked={ addons.indexOf(value) > -1 } />
                      <ListItemText primary={ value } />
                    </MenuItem>
                  )) }
                </TextField>
              </Grid>
              <Grid item sm={ 6 }>
                <TextField required fullWidth label="Postage" select value={ postage } onChange={ this.handleInputChange('postage') }>
                  { enums.postage.map(value => <MenuItem key={ value } value={ value }>{ value }</MenuItem>) }
                </TextField>
              </Grid>
              <Grid item sm={ 12 }>
                <TextField fullWidth multiline rows={ 3 } label="Comments" value={ comments } onChange={ this.handleInputChange('comments') } />
              </Grid>
              { editMode && <Fragment>
                { _id in files &&
                  <Grid item sm={ 12 }>
                    <EditFiles files={ files[_id] } selected={ selectedFiles }
                      onChange={ selectedFiles => this.setState({ selectedFiles }) } />
                  </Grid>
                }
                <Grid item sm={12}>
                  <FormControlLabel label="Force completed" control={
                    <Checkbox checked={ forceComplete }
                      onChange={ this.handleForceCompleteChange } />
                  } />
                </Grid>
              </Fragment> }
            </Grid>
          </DialogContent>
          <DialogActions>
            { editMode &&
              <TextField className="version-comment" fullWidth label="Reason for edit" value={ versionComment }
              onChange={ this.handleInputChange('versionComment') } />
            }
            <Button onClick={ onClose }>Cancel</Button>
            <Button type="submit" disabled={ submitDisabled }>{ editMode ? 'Save' : 'Create' }</Button>
          </DialogActions>
        </Form>
      </Dialog>
    )
  }

  @bound
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

  handleIndexChange (prop, i) {
    return value =>
      this.setState(state => {
        let model = JSON.parse(JSON.stringify(state.model))
        console.log(prop, i, value, model)
        model[prop][i] = value
        return { model }
      })
  }

  handleChange (prop, value) {
    this.setState(state => {
      let model = JSON.parse(JSON.stringify(state.model))
      model[prop] = value

      if ((prop == 'client' || prop == 'listType')
        && model.client && model.listType) {
        model.trackingNumber = this.props.clients.find(c => c._id == model.client)
          .trackingNumbers[model.listType.toLowerCase()]
      }

      return { model }
    })
  }

  @bound
  handleSubmit () {
    let { deleteFiles, updateJob, onClose } = this.props
    let { selectedFiles, model } = this.state
    Promise.all([deleteFiles(selectedFiles), updateJob(model)])
      .then(onClose)

  }

  @bound
  handleValid () {
    this.setState({ submitDisabled: false })
  }

  @bound
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
