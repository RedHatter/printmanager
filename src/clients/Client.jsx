import React, { useState } from 'react'
import {
  Button,
  Grid,
  Typography,
  Paper,
  Dialog,
  DialogContent,
  DialogActions
} from '@material-ui/core'
import { Form, TextField } from 'material-ui-utils'
import NumberFormat from 'react-number-format'
import PropTypes from 'prop-types'

import { deepmerge } from '../../utils.js'
import { ClientType } from '../types.js'
import { updateOrCreateClient } from '../actions.js'

Client.propTypes = {
  model: ClientType,
  onClose: PropTypes.func
}

export default function Client(props) {
  const [submitDisabled, setSubmitDisabled] = useState(false)
  const [model, _setModel] = useState(
    props.model || {
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
        prequalified: ''
      }
    }
  )

  function setModel(values) {
    _setModel(deepmerge({}, model, values))
  }

  const { name, acronym, address, contact, trackingNumbers } = model

  return (
    <Dialog
      open
      PaperComponent={Paper}
      PaperProps={{
        component: Form,
        onSubmit: () => {
          updateOrCreateClient(model)
          onClose()
        },
        onValid: () => setSubmitDisabled(false),
        onInvalid: () => setSubmitDisabled(true)
      }}
    >
      <DialogContent>
        <Grid container spacing={16}>
          <Grid item sm={12}>
            <Typography variant="headline" align="left">
              General
            </Typography>
          </Grid>
          <Grid item sm={9}>
            <TextField
              fullWidth
              label="Name"
              value={name}
              onChange={e => setModel({ name: e.target.value })}
              required
            />
          </Grid>
          <Grid item sm={3}>
            <TextField
              fullWidth
              label="Acronym"
              value={acronym}
              onChange={e =>
                setModel({ acronym: e.target.value.toUpperCase() })
              }
              required
            />
          </Grid>
          <Grid item sm={12}>
            <TextField
              fullWidth
              label="Address"
              value={address}
              onChange={e => setModel({ address: e.target.value })}
              required
            />
          </Grid>
          <Grid item sm={12}>
            <Typography variant="headline" align="left">
              Contact Information
            </Typography>
          </Grid>
          <Grid item sm={6}>
            <TextField
              fullWidth
              label="Name"
              value={contact?.name}
              onChange={e => setModel({ contact: { name: e.target.value } })}
              required
            />
          </Grid>
          <Grid item sm={6}>
            <NumberFormat
              fullWidth
              customInput={TextField}
              label="Phone"
              format="+1 (###) ### ####"
              isNumericString
              type="tel"
              pattern={/^\+1 \(\d{3}\) \d{3} \d{4}$/}
              value={contact?.phone}
              onValueChange={format =>
                setModel({ contact: { phone: format.value } })
              }
              required
            />
          </Grid>
          <Grid item sm={12}>
            <TextField
              fullWidth
              label="Email"
              value={contact?.email}
              onChange={e => setModel({ contact: { email: e.target.value } })}
              required
            />
          </Grid>
          <Grid item sm={12}>
            <Typography variant="headline" align="left">
              Call Tracking Numbers
            </Typography>
          </Grid>
          <Grid item sm={4}>
            <NumberFormat
              fullWidth
              customInput={TextField}
              label="Database"
              format="+1 (###) ### ####"
              isNumericString
              type="tel"
              pattern={/^\+1 \(\d{3}\) \d{3} \d{4}$/}
              value={trackingNumbers?.database}
              onValueChange={format =>
                setModel({ trackingNumbers: { database: format.value } })
              }
              required
            />
          </Grid>
          <Grid item sm={4}>
            <NumberFormat
              fullWidth
              customInput={TextField}
              label="Saturation"
              format="+1 (###) ### ####"
              isNumericString
              type="tel"
              pattern={/^\+1 \(\d{3}\) \d{3} \d{4}$/}
              value={trackingNumbers?.saturation}
              onValueChange={format =>
                setModel({ trackingNumbers: { saturation: format.value } })
              }
              required
            />
          </Grid>
          <Grid item sm={4}>
            <NumberFormat
              fullWidth
              customInput={TextField}
              label="Bankruptcy"
              format="+1 (###) ### ####"
              isNumericString
              type="tel"
              pattern={/^\+1 \(\d{3}\) \d{3} \d{4}$/}
              value={trackingNumbers?.bankruptcy}
              onValueChange={format =>
                setModel({ trackingNumbers: { bankruptcy: format.value } })
              }
              required
            />
          </Grid>
          <Grid item sm={4}>
            <NumberFormat
              fullWidth
              customInput={TextField}
              label="Prequalified"
              format="+1 (###) ### ####"
              isNumericString
              type="tel"
              pattern={/^\+1 \(\d{3}\) \d{3} \d{4}$/}
              value={trackingNumbers?.prequalified}
              onValueChange={format =>
                setModel({ trackingNumbers: { prequalified: format.value } })
              }
              required
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={props.onClose}>Cancel</Button>
        <Button type="submit" disabled={submitDisabled}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  )
}
