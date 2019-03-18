import React from 'react'
import {
  TextField,
  MenuItem,
  Grid,
  InputAdornment,
  IconButton,
  Typography
} from '@material-ui/core'
import { DatePicker } from 'material-ui-pickers'
import clsx from 'clsx'

import { updateFilter, fetchJobs } from './actions.js'
import { useStore } from './store.js'
import { colorize } from '../utils.js'
import CloseIcon from './icons/Close.js'
import DateRangePicker from './components/DateRangePicker.jsx'

export default function Filters(props) {
  const { filter, users, clients } = useStore()
  const handleChange = o => {
    updateFilter(o)
    fetchJobs()
  }

  return (
    <Grid container spacing={16} className="filters">
      <Grid
        item
        sm={2}
        onClick={e =>
          handleChange({
            type: !filter.type
              ? 'Print'
              : filter.type == 'Print'
              ? 'Digital'
              : undefined
          })
        }
        className="type-select"
      >
        <Typography
          variant="headline"
          align="left"
          className={clsx({ selected: !filter.type })}
        >
          All
        </Typography>
        <Typography
          variant="headline"
          align="left"
          className={clsx({ selected: filter.type == 'Print' })}
        >
          Print
        </Typography>
        <Typography
          variant="headline"
          align="left"
          className={clsx({ selected: filter.type == 'Digital' })}
        >
          Digital
        </Typography>
      </Grid>
      <Grid item sm={2}>
        <TextField
          fullWidth
          label="Text"
          value={filter.search || ''}
          InputProps={
            filter.search && {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => handleChange({ search: '' })}>
                    <CloseIcon />
                  </IconButton>
                </InputAdornment>
              )
            }
          }
          onChange={e => handleChange({ search: e.target.value })}
        />
      </Grid>
      <Grid item sm={2}>
        <TextField
          select
          fullWidth
          label="Client"
          value={filter.client || ''}
          onChange={e => handleChange({ client: e.target.value })}
        >
          <MenuItem value="">Any</MenuItem>
          {clients.map(({ name, id }) => (
            <MenuItem key={id} value={id}>
              {name}
            </MenuItem>
          ))}
        </TextField>
      </Grid>
      <Grid item sm={2}>
        <TextField
          select
          fullWidth
          label="Assignee"
          value={filter.assignee || ''}
          onChange={e => handleChange({ assignee: e.target.value })}
        >
          <MenuItem value="">Any</MenuItem>
          {users.map(value => (
            <MenuItem key={value.id} value={value.id}>
              {value.name}
            </MenuItem>
          ))}
        </TextField>
      </Grid>
      <Grid item sm={2}>
        <DateRangePicker
          fullWidth
          autoOk
          label="Created"
          value={filter.created}
          onChange={created => handleChange({ created })}
          disableFuture={true}
          clearable={true}
        />
      </Grid>
      <Grid item sm={2}>
        <DateRangePicker
          fullWidth
          autoOk
          label="Due Date"
          value={filter.dueDate}
          onChange={dueDate => handleChange({ dueDate })}
          clearable={true}
        />
      </Grid>
    </Grid>
  )
}

<style>
.filters {
  margin-bottom: 5px !important;
  width: 1300px !important;
}

.filters .type-select {
  display: block;
  margin-top: 15px;
  text-align: center;
}
</style>
