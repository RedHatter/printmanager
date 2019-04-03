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
import { startOfMonth } from 'date-fns'

import { enums, colorize } from '../utils.js'
import { deleteFiles, updateJob } from './actions.js'
import { useStore } from './store.js'
import { ClientType, JobType } from './types.js'
import EditFiles from './EditFiles.jsx'

function SelectField({ size = 4, values, multiple, children, ...props }) {
  return (
    <Grid item sm={size}>
      <TextField
        fullWidth
        select
        SelectProps={
          multiple
            ? {
                multiple: true,
                renderValue: selected => selected.join(', ')
              }
            : {}
        }
        {...props}
      >
        {values.map(value => (
          <MenuItem key={value.id || value} value={value.id || value}>
            {multiple && (
              <Checkbox checked={props.value.includes(value.id || value)} />
            )}
            <ListItemText primary={value.name || value} />
          </MenuItem>
        ))}
        {children}
      </TextField>
    </Grid>
  )
}

function DateField({ size = 4, ...props }) {
  return (
    <Grid item sm={size}>
      <TextField fullWidth autoOk clearable component={DatePicker} {...props} />
    </Grid>
  )
}

export default function CreateDialog(props) {
  const [model, _setModel] = useState({
    created: new Date(),
    type: 'Print',
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
    size: [],
    listType: '',
    postage: '',
    details: '',
    artStatus: enums.artStatus[0],
    priority: 1,
    files: [],
    ...props.model,
    client: props.model?.client?.id || '',
    salesman: props.model?.salesman?.id || '',
    assignee: props.model?.assignee?.id || ''
  })
  const [submitDisabled, setSubmitDisabled] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState([])
  const [customSize, setCustomSize] = useState(false)
  const { clients, users } = useStore()
  const salesmen = users.filter(o => o.salesman)
  const editMode = !!model.id

  function setModel(values) {
    if ((values.client || values.listType) && model.client && model.listType) {
      model.trackingNumber = clients.find(
        c => c.id == model.client
      ).trackingNumbers[model.listType.toLowerCase()]
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
        onSubmit: async () =>
          (await updateJob(model)) &&
          (await deleteFiles(model.id, selectedFiles)) &&
          props.onClose(),
        onValid: () => setSubmitDisabled(false),
        onInvalid: () => setSubmitDisabled(true)
      }}
    >
      <DialogContent className="content">
        <Grid container spacing={16}>
          <Grid
            item
            sm={11}
            onClick={e => {
              setModel({ type: model.type == 'Print' ? 'Digital' : 'Print' })
              setSubmitDisabled(false)
            }}
            className="type-select"
          >
            <Typography
              variant="headline"
              align="left"
              className={clsx({ selected: model.type == 'Print' })}
            >
              Print
            </Typography>
            <Typography
              variant="headline"
              align="left"
              className={clsx({ selected: model.type == 'Digital' })}
            >
              Digital
            </Typography>
          </Grid>
          <Grid item sm={1}>
            <div
              className={'priority-button priority-' + model.priority}
              onClick={() =>
                setModel({
                  priority: model.priority < 3 ? model.priority + 1 : 1
                })
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
                  value={model.name}
                  onChange={e => setModel({ name: e.target.value })}
                />
              </Grid>
              <SelectField
                required
                size={6}
                label="Job Status"
                value={model.artStatus}
                onChange={e => setModel({ artStatus: e.target.value })}
                values={enums.artStatus}
              />
            </Fragment>
          )}
          <SelectField
            required
            label="Client"
            value={model.client}
            onChange={e => setModel({ client: e.target.value })}
            values={clients}
          />
          <SelectField
            label="Assignee"
            value={model.assignee || ''}
            onChange={e => setModel({ assignee: e.target.value })}
            values={users}
          />
          <SelectField
            required
            label="Salesman"
            value={model.salesman}
            onChange={e => setModel({ salesman: e.target.value })}
            values={salesmen}
          />
          {!editMode && (
            <DateField
              views={['month']}
              format="MMMM"
              label="Month"
              value={model.created}
              onChange={value => setModel({ created: startOfMonth(value) })}
            />
          )}
          <Grid item sm={12}>
            <Typography variant="headline" align="left">
              Dates
            </Typography>
          </Grid>
          <DateField
            required
            label="Due Date"
            value={model.dueDate}
            onChange={dueDate => setModel({ dueDate })}
          />
          <DateField
            required
            label="Drop date"
            value={model.dropDate}
            onChange={dropDate => setModel({ dropDate })}
          />
          {model.type == 'Print' && (
            <Fragment>
              <DateField
                label="Second drop date"
                value={model.secondDropDate || null}
                onChange={secondDropDate => setModel({ secondDropDate })}
              />
              {editMode && (
                <DateField
                  label="Droped On"
                  value={model.dropStatus || null}
                  onChange={dropStatus => setModel({ dropStatus })}
                />
              )}
              <DateField
                required
                size={editMode ? 4 : 6}
                label="Send to print"
                value={model.printDate}
                onChange={printDate => setModel({ printDate })}
              />
            </Fragment>
          )}
          <DateField
            required
            size={editMode || model.type == 'Digital' ? 4 : 6}
            label="Expire"
            value={model.expire}
            onChange={expire => setModel({ expire })}
          />
          <Grid item sm={12}>
            <Typography variant="headline" align="left">
              Details
            </Typography>
          </Grid>
          <SelectField
            size={6}
            required
            label="Type"
            value={model.jobType}
            onChange={e => setModel({ jobType: e.target.value })}
            values={
              model.type == 'Print'
                ? enums.jobType.print
                : enums.jobType.digital
            }
          />
          {customSize ? (
            <Grid item sm={6}>
              <TextField
                fullWidth
                label="Size"
                value={model.size.join(', ')}
                onChange={e => setModel({ size: e.target.value.split(', ') })}
                onBlur={e => {
                  if (e.target.value == '') setCustomSize(false)
                }}
                autoFocus
              />
            </Grid>
          ) : (
            <SelectField
              size={6}
              label="Size"
              value={model.size}
              onChange={e => {
                if (e.target.value.includes('custom')) setCustomSize(true)
                else setModel({ size: e.target.value })
              }}
              multiple={model.type == 'Digital'}
              values={
                model.type == 'Print' ? enums.size.print : enums.size.digital
              }
            >
              <MenuItem value="custom">Custom...</MenuItem>
            </SelectField>
          )}
          <Grid item sm={4}>
            <NumberFormat
              fullWidth
              pattern={/^\+1 \(\d{3}\) \d{3} \d{4}$/}
              label="Tracking number"
              type="tel"
              customInput={TextField}
              format="+1 (###) ### ####"
              isNumericString
              value={model.trackingNumber}
              onValueChange={format =>
                setModel({ trackingNumber: format.value })
              }
            />
          </Grid>
          {model.type == 'Print' && (
            <Fragment>
              <Grid item sm={4}>
                <TextField
                  fullWidth
                  required
                  label="Vendor"
                  value={model.vendor}
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
                  value={model.quantity}
                  onValueChange={format => setModel({ quantity: format.value })}
                />
              </Grid>
              <SelectField
                size={6}
                required
                label="List type"
                value={model.listType}
                onChange={e => setModel({ listType: e.target.value })}
                values={enums.listType}
              />
              <SelectField
                size={6}
                required
                label="Envelope"
                value={model.envelope}
                onChange={e => setModel({ envelope: e.target.value })}
                values={enums.envelope}
              />
              <SelectField
                size={6}
                label="Addons"
                value={model.addons}
                onChange={e => setModel({ addons: e.target.value })}
                values={enums.addons}
                multiple
              />
              <SelectField
                required
                size={6}
                label="Postage"
                value={model.postage}
                onChange={e => setModel({ postage: e.target.value })}
                values={enums.postage}
              />
            </Fragment>
          )}
          <Grid item sm={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Additional Details"
              value={model.details}
              onChange={e => setModel({ details: e.target.value })}
            />
          </Grid>
          {editMode && model.files.length > 0 && (
            <Grid item sm={12}>
              <EditFiles
                files={model.files}
                selected={selectedFiles}
                onChange={setSelectedFiles}
              />
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        {editMode && (
          <TextField
            className="version-comment"
            fullWidth
            label="Reason for edit"
            value={model.versionComment}
            onChange={e => setModel({ versionComment: e.target.value })}
          />
        )}
        <Button onClick={props.onClose}>Cancel</Button>
        <Button type="submit" disabled={submitDisabled}>
          Done
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
  margin: 2px;
  color: #e0e0e0;
  transition: all 0.3s;
  transform: scale(0.8) translateY(2px);
}

.type-select h1.selected {
  color: black;
  transform: scale(1) translateY(0);
}

.create-modal {
  overflow: hidden;
  text-align: left;
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
