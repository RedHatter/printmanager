import React, { useState, Fragment } from 'react'
import {
  Dialog,
  DialogContent,
  DialogActions,
  Grid,
  FormControlLabel,
  Button,
  Switch,
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
import clsx from 'clsx'

import { enums, colorize } from '../../utils.js'
import { deleteFiles, updateJob } from '../actions.js'
import { useStore } from '../store.js'
import { ClientType, JobType } from '../types.js'
import EditFiles from './EditFiles.jsx'

export default function CreateDialog(props) {
  let initalModel = {
    type: 'Print',
    client: '',
    salesman: '',
    dueDate: null,
    dropDate: null,
    secondDropDate: null,
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
    priority: 1,
    assignee: ''
  }
  let editMode = false

  if (props.model) {
    initalModel = JSON.parse(JSON.stringify(props.model))
    initalModel.client = initalModel.client.id
    initalModel.salesman = initalModel.salesman.id
    initalModel.assignee = initalModel.assignee.id
    editMode = !!initalModel.id
  }

  const [model, _setModel] = useState(initalModel)
  const [submitDisabled, setSubmitDisabled] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState([])
  const { clients, users, files } = useStore()
  const salesmen = users.filter(o => o.salesman)

  const {
    id,
    type,
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
    secondDropDate,
    printDate,
    expire,
    vendor,
    trackingNumber,
    details,
    artStatus,
    dropStatus,
    forceComplete,
    versionComment,
    priority,
    assignee
  } = model

  function setModel(values) {
    if ((values.client || values.listType) && client && listType) {
      model.trackingNumber = clients.find(c => c.id == client).trackingNumbers[
        listType.toLowerCase()
      ]
    }

    _setModel(Object.assign({}, model, values))
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
            props.onClose
          ),
        onValid: () => setSubmitDisabled(false),
        onInvalid: () => setSubmitDisabled(true)
      }}
    >
      <DialogContent className="content">
        <Grid container spacing={16}>
          <Grid
            item
            sm={11}
            onClick={e =>
              setModel({ type: type == 'Print' ? 'Digital' : 'Print' })
            }
            className="type-select"
          >
            <Typography
              variant="headline"
              align="left"
              className={clsx({ selected: type == 'Print' })}
            >
              Print
            </Typography>
            <Typography
              variant="headline"
              align="left"
              className={clsx({ selected: type == 'Digital' })}
            >
              Digital
            </Typography>
          </Grid>
          <Grid item sm={1}>
            <div
              className={'priority-button priority-' + priority}
              onClick={() =>
                setModel({ priority: priority < 3 ? priority + 1 : 1 })
              }
            />
          </Grid>
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
                  label="Job Status"
                  value={artStatus}
                  onChange={e => setModel({ artStatus: e.target.value })}
                >
                  {enums.artStatus.map(value => (
                    <MenuItem key={value} value={value}>
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
                <MenuItem value={c.id} key={c.id}>
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
              {users.map(value => (
                <MenuItem value={value.id} key={value.id}>
                  {value.name}
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
              {salesmen.map(value => (
                <MenuItem value={value.id} key={value.id}>
                  {value.name}
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
              onChange={dueDate => setModel({ dueDate })}
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
              value={dropDate}
              onChange={dropDate => setModel({ dropDate })}
            />
          </Grid>
          {type == 'Print' && (
            <Fragment>
              <Grid item sm={4}>
                <TextField
                  fullWidth
                  autoOk
                  clearable
                  label="Second drop date"
                  component={DatePicker}
                  value={secondDropDate || null}
                  onChange={secondDropDate => setModel({ secondDropDate })}
                />
              </Grid>
              {editMode && (
                <Grid item sm={4}>
                  <TextField
                    fullWidth
                    autoOk
                    clearable
                    label="Droped On"
                    component={DatePicker}
                    value={dropStatus || null}
                    onChange={dropStatus => setModel({ dropStatus })}
                  />
                </Grid>
              )}
              <Grid item sm={editMode ? 4 : 6}>
                <TextField
                  required
                  fullWidth
                  autoOk
                  clearable
                  label="Send to print"
                  component={DatePicker}
                  value={printDate}
                  onChange={printDate => setModel({ printDate })}
                />
              </Grid>
            </Fragment>
          )}
          <Grid item sm={editMode || type == 'Digital' ? 4 : 6}>
            <TextField
              required
              fullWidth
              autoOk
              clearable
              label="Expire"
              component={DatePicker}
              value={expire}
              onChange={expire => setModel({ expire })}
            />
          </Grid>
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
          {type == 'Print' && (
            <Fragment>
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
            </Fragment>
          )}
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
              {id in files && (
                <Grid item sm={12}>
                  <EditFiles
                    files={files[id]}
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
        <Button onClick={props.onClose}>Cancel</Button>
        <Button type="submit" disabled={submitDisabled}>
          {editMode ? 'Save' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

CreateDialog.propTypes = {
  model: JobType,
  onClose: PropTypes.func.isRequired
}

<style>
.type-select {
  cursor: pointer;
}

.type-select h1 {
  display: inline-block;
  color: #e0e0e0;
  margin: 2px;
  transition: all 0.3s;
  transform: scale(0.8) translateY(2px);
}

.type-select h1.selected {
  color: black;
  transform: scale(1) translateY(0);
}

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

.priority-button {
  display: inline-block;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
  transition: background-color 0.3s;
}

.priority-button.priority-1 {
  background-color: #4caf50;
}

.priority-button.priority-2 {
  background-color: #ffb300;
}

.priority-button.priority-3 {
  background-color: #ef5350;
}
</style>