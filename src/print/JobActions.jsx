import React, { useState, Fragment } from 'react'
import bound from 'bound-decorator'
import {
  withStyles,
  Button,
  Dialog,
  DialogContent,
  DialogActions,
  ExpansionPanelActions
} from '@material-ui/core'
import PropTypes from 'prop-types'

import { JobType } from '../types.js'
import { deleteJob } from '../actions.js'
import { clone } from '../../utils.js'
import HistoryDialog from './HistoryDialog.jsx'
import CreateDialog from './CreateDialog.jsx'
import FileDialog from './FileDialog.jsx'
import SendDialog from './SendDialog.jsx'

function DuplicateButton(props) {
  const [isOpen, setIsOpen] = useState(false)
  const [model, setModel] = useState(undefined)

  return (
    <Fragment>
      <Button
        onClick={() => {
          const model = clone(props.model)
          delete model._id
          delete model.__v
          delete model.created
          delete model.name
          setIsOpen(true)
          setModel(model)
        }}
      >
        Duplicate
      </Button>
      {isOpen && (
        <CreateDialog
          open
          model={model}
          onClose={() => {
            setIsOpen(false)
            setModel(undefined)
          }}
        />
      )}
    </Fragment>
  )
}

DuplicateButton.propTypes = {
  model: JobType.isRequired
}

function EditButton({ model }) {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <Fragment>
      <Button onClick={() => setIsOpen(true)}>Edit</Button>
      {isOpen && (
        <CreateDialog open model={model} onClose={() => setIsOpen(false)} />
      )}
    </Fragment>
  )
}

EditButton.propTypes = {
  model: JobType.isRequired
}

function DeleteButton({ model }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Fragment>
      <Button onClick={() => setIsOpen(true)}>Delete</Button>
      {isOpen && (
        <Dialog open>
          <DialogContent>
            Are you sure you want to delete <i>{model.name}</i>? This operation
            cannot be undone.
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button onClick={() => deleteJob(model._id)}>Delete</Button>
          </DialogActions>
        </Dialog>
      )}
    </Fragment>
  )
}

DeleteButton.propTypes = {
  model: JobType.isRequired
}

function SendButton({ model, files }) {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <Fragment>
      <Button onClick={() => setIsOpen(true)}>Send</Button>
      {isOpen && (
        <SendDialog
          open
          model={model}
          files={files}
          onClose={() => setIsOpen(false)}
        />
      )}
    </Fragment>
  )
}

SendButton.propTypes = {
  model: JobType.isRequired,
  files: PropTypes.object
}

function HistoryButton({ model }) {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <Fragment>
      <Button onClick={() => setIsOpen(true)}>History</Button>
      {isOpen && (
        <HistoryDialog model={model} onClose={() => setIsOpen(false)} />
      )}
    </Fragment>
  )
}

HistoryButton.propTypes = {
  model: JobType.isRequired,
  files: PropTypes.object
}

function JobActions({ model, files }) {
  return (
    <ExpansionPanelActions>
      <HistoryButton model={model} />
      <EditButton model={model} />
      <DuplicateButton model={model} />
      <DeleteButton model={model} />
      <FileDialog path={model._id} />
      {files && <SendButton model={model} files={files} />}
    </ExpansionPanelActions>
  )
}

JobActions.propTypes = {
  model: JobType.isRequired,
  files: PropTypes.object
}

export default JobActions
