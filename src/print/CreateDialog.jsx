import React, { useState, Fragment } from 'react'
import { connect } from 'react-redux'
import {
  Dialog,
  DialogContent,
  DialogActions,
  Grid,
  FormControlLabel,
  Button,
  Input,
  MenuItem,
  Checkbox,
  ListItemText,
  Typography,
  Paper
} from '@material-ui/core'
import { DatePicker } from 'material-ui-pickers'
import { Form, TextField } from 'material-ui-utils'
import NumberFormat from 'react-number-format'
import PropTypes from 'prop-types'

import { ClientType, JobType } from '../types.js'
import EditFiles from './EditFiles.jsx'
import { enums, colorize } from '../../utils.js'
import { deleteFiles, updateJob } from '../actions.js'

function CreateModal({
  clients,
  salesmen,
  users,
  files,
  onClose,
  deleteFiles,
  updateJob,
  ...props
}) {
  let initalModel = {
    client: '',
    salesman: '',
    dueDate: null,
    dropDate: [null, null],
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
    details: '',
    artStatus: enums.artStatus[0],
    assignee: ''
  }
  let editMode = false

  if (props.model) {
    initalModel = JSON.parse(JSON.stringify(props.model))
    initalModel.client = initalModel.client._id
    initalModel.salesman = initalModel.salesman._id
    initalModel.assignee = initalModel.assignee._id
    editMode = !!initalModel._id
  }

  const [model, _setModel] = useState(initalModel)
  const [submitDisabled, setSubmitDisabled] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState([])

  const {
    _id,
    created,
    name,
    client,
    jobType,
    envelope,
    size,
    addons,
    listType,
    salesman,
    postage,
    quantity,
    dueDate,
    dropDate,
    printDate,
    expire,
    vendor,
    trackingNumber,
    details,
    artStatus,
    dropStatus,
    forceComplete,
    versionComment,
    assignee
  } = model

  function setModel(values) {
    if ((values.client || values.listType) && client && listType) {
      model.trackingNumber = clients.find(c => c._id == client).trackingNumbers[
        listType.toLowerCase()
      ]
    }

    _setModel(Object.assign(model, values))
  }

  return (
    <Dialog
      open
      className="create-modal"
      PaperComponent={Paper}
      PaperProps={{
        component: Form,
        onSubmit: () =>
          Promise.all([deleteFiles(selectedFiles), updateJob(model)]).then(
            onClose
          ),
        onValid: () => setSubmitDisabled(false),
        onInvalid: () => setSubmitDisabled(true)
      }}
    >
      <DialogContent className="content">
        <Grid container spacing={16}>
          <Grid item sm={12}>
            <Typography variant="headline" align="left">
              General
            </Typography>
          </Grid>

          {editMode && (
            <Fragment>
              <Grid item sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Name"
                  pattern={/^[A-Z]{3,5} \d{4}-\d+/}
                  value={name}
                  onChange={e => setModel({ name: e.target.value })}
                />
              </Grid>
              <Grid item sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Art Status"
                  value={artStatus}
                  onChange={e => setModel({ artStatus: e.target.value })}
                >
                  {enums.artStatus.map(value => (
                    <MenuItem
                      key={value}
                      value={value}
                      className={colorize(value)}
                    >
                      {value}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Fragment>
          )}

          <Grid item sm={4}>
            <TextField
              required
              value={client}
              onChange={e => setModel({ client: e.target.value })}
              label="Client"
              select
              fullWidth
            >
              {clients.map(c => (
                <MenuItem value={c._id} key={c._id}>
                  {c.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item sm={4}>
            <TextField
              required
              value={assignee}
              onChange={e => setModel({ assignee: e.target.value })}
              label="Assignee"
              select
              fullWidth
            >
              {Object.entries(users).map(([id, attributes]) => (
                <MenuItem value={id} key={id}>
                  {attributes.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item sm={4}>
            <TextField
              required
              value={salesman}
              onChange={e => setModel({ salesman: e.target.value })}
              label="Salesman"
              select
              fullWidth
            >
              {Object.entries(salesmen).map(([id, attributes]) => (
                <MenuItem value={id} key={id}>
                  {attributes.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item sm={12}>
            <Typography variant="headline" align="left">
              Dates
            </Typography>
          </Grid>
          <Grid item sm={4}>
            <TextField
              fullWidth
              autoOk
              clearable
              label="Due Date"
              component={DatePicker}
              value={dueDate}
              onChange={value => setModel({ dueDate: value[0] })}
            />
          </Grid>
          <Grid item sm={4}>
            <TextField
              required
              fullWidth
              autoOk
              clearable
              label="Drop date"
              component={DatePicker}
              value={dropDate[0]}
              onChange={value => {
                model.dropDate[0] = value[0]
                _setModel(model)
              }}
            />
          </Grid>
          <Grid item sm={4}>
            <TextField
              fullWidth
              autoOk
              clearable
              label="Second drop date"
              component={DatePicker}
              value={dropDate[1]}
              onChange={value => {
                model.dropDate[1] = value[0]
                _setModel(model)
              }}
            />
          </Grid>
          {editMode ? (
            <Fragment>
              <Grid item sm={4}>
                <TextField
                  fullWidth
                  autoOk
                  clearable
                  label="Droped On"
                  component={DatePicker}
                  value={dropStatus || null}
                  onChange={value => setModel({ dropStatus: value[0] })}
                />
              </Grid>
              <Grid item sm={4}>
                <TextField
                  required
                  fullWidth
                  autoOk
                  clearable
                  label="Send to print"
                  component={DatePicker}
                  value={printDate}
                  onChange={value => setModel({ printDate: value[0] })}
                />
              </Grid>
              <Grid item sm={4}>
                <TextField
                  required
                  fullWidth
                  autoOk
                  clearable
                  label="Expire"
                  component={DatePicker}
                  value={expire}
                  onChange={value => setModel({ expire: value[0] })}
                />
              </Grid>
            </Fragment>
          ) : (
            <Fragment>
              <Grid item sm={6}>
                <TextField
                  required
                  fullWidth
                  autoOk
                  clearable
                  label="Send to print"
                  component={DatePicker}
                  value={printDate}
                  onChange={value => setModel({ printDate: value[0] })}
                />
              </Grid>
              <Grid item sm={6}>
                <TextField
                  required
                  fullWidth
                  autoOk
                  clearable
                  label="Expire"
                  component={DatePicker}
                  value={expire}
                  onChange={value => setModel({ expire: value[0] })}
                />
              </Grid>
            </Fragment>
          )}
          <Grid item sm={12}>
            <Typography variant="headline" align="left">
              Details
            </Typography>
          </Grid>
          <Grid item sm={6}>
            <TextField
              required
              fullWidth
              label="Type"
              select
              value={jobType}
              onChange={e => setModel({ jobType: e.target.value })}
            >
              {enums.jobType.map(value => (
                <MenuItem key={value} value={value}>
                  {value}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item sm={6}>
            <TextField
              required
              fullWidth
              label="List type"
              select
              value={listType}
              onChange={e => setModel({ listType: e.target.value })}
            >
              {enums.listType.map(value => (
                <MenuItem key={value} value={value}>
                  {value}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item sm={4}>
            <NumberFormat
              fullWidth
              pattern={/^\+1 \(\d{3}\) \d{3} \d{4}$/}
              label="Tracking number"
              type="tel"
              customInput={TextField}
              format="+1 (###) ### ####"
              isNumericString
              value={trackingNumber}
              onValueChange={format =>
                setModel({ trackingNumber: format.value })
              }
            />
          </Grid>
          <Grid item sm={4}>
            <TextField
              fullWidth
              required
              label="Vendor"
              value={vendor}
              onChange={e => setModel({ vendor: e.target.value })}
            />
          </Grid>
          <Grid item sm={4}>
            <NumberFormat
              fullWidth
              required
              isNumericString
              thousandSeparator
              label="Quantity"
              customInput={TextField}
              value={quantity}
              onValueChange={format => setModel({ quantity: format.value })}
            />
          </Grid>
          <Grid item sm={6}>
            <TextField
              required
              fullWidth
              label="Size"
              select
              value={size}
              onChange={e => setModel({ size: e.target.value })}
            >
              {enums.size.map(value => (
                <MenuItem key={value} value={value}>
                  {value}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item sm={6}>
            <TextField
              required
              fullWidth
              label="Envelope"
              select
              value={envelope}
              onChange={e => setModel({ envelope: e.target.value })}
            >
              {enums.envelope.map(value => (
                <MenuItem key={value} value={value}>
                  {value}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item sm={6}>
            <TextField
              value={addons}
              onChange={e => setModel({ addons: e.target.value })}
              fullWidth
              label="Addons"
              select
              SelectProps={{
                multiple: true,
                renderValue: selected => selected.join(', ')
              }}
            >
              {enums.addons.map(value => (
                <MenuItem key={value} value={value}>
                  <Checkbox checked={addons.indexOf(value) > -1} />
                  <ListItemText primary={value} />
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item sm={6}>
            <TextField
              required
              fullWidth
              label="Postage"
              select
              value={postage}
              onChange={e => setModel({ postage: e.target.value })}
            >
              {enums.postage.map(value => (
                <MenuItem key={value} value={value}>
                  {value}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item sm={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Additional Details"
              value={details}
              onChange={e => setModel({ details: e.target.value })}
            />
          </Grid>
          {editMode && (
            <Fragment>
              {_id in files && (
                <Grid item sm={12}>
                  <EditFiles
                    files={files[_id]}
                    selected={selectedFiles}
                    onChange={setSelectedFiles}
                  />
                </Grid>
              )}
              <Grid item sm={12}>
                <FormControlLabel
                  label="Force completed"
                  control={
                    <Checkbox
                      checked={forceComplete}
                      onChange={e =>
                        setModel({ forceComplete: e.target.checked })
                      }
                    />
                  }
                />
              </Grid>
            </Fragment>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        {editMode && (
          <TextField
            className="version-comment"
            fullWidth
            label="Reason for edit"
            value={versionComment}
            onChange={e => setModel({ versionComment: e.target.value })}
          />
        )}
        <Button onClick={onClose}>Cancel</Button>
        <Button type="submit" disabled={submitDisabled}>
          {editMode ? 'Save' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

CreateModal.propTypes = {
  model: JobType,
  clients: PropTypes.arrayOf(ClientType).isRequired,
  salesmen: PropTypes.object.isRequired,
  files: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired
}

export default connect(
  state => ({
    salesmen: state.salesmen,
    users: state.users,
    clients: state.clients,
    files: state.files
  }),
  { deleteFiles, updateJob }
)(CreateModal)

<style>
.create-modal {
  text-align: left;
  overflow: hidden;
}

.create-modal .version-comment {
  margin: 8px !important;
}

li.red {
  color: #ef5350;
}

li.yellow {
  color: #ffb300;
}

li.green {
  color: #4caf50;
}

</style>