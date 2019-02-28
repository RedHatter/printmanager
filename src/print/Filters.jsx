import React from 'react'
import { TextField, MenuItem } from '@material-ui/core'
import DatePicker from 'material-ui-pickers/DatePicker'

import { updateFilter, fetchJobs } from '../actions.js'
import { useStore } from '../store.js'
import { enums, colorize } from '../../utils.js'

export default function Filters(props) {
  const { filter, salesmen, clients } = useStore()
  const handleChange = o => updateFilter(o).then(fetchJobs)

  return (
    <div className="filters">
      <TextField
        fullWidth
        label="Text"
        value={filter.search || ''}
        onChange={e => handleChange({ search: e.target.value })}
      />
      <TextField
        fullWidth
        select
        label="Art Status"
        value={filter.artStatus || ''}
        onChange={e => handleChange({ artStatus: e.target.value })}
      >
        <MenuItem value="">Any</MenuItem>
        {enums.artStatus.map(value => (
          <MenuItem key={value} value={value} className={colorize(value)}>
            {value}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        fullWidth
        select
        label="Client"
        value={filter.client || ''}
        onChange={e => handleChange({ client: e.target.value })}
      >
        <MenuItem value="">Any</MenuItem>
        {clients.map(({ name, _id }) => (
          <MenuItem key={_id} value={_id}>
            {name}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        fullWidth
        select
        label="Salesman"
        value={filter.salesman || ''}
        onChange={e => handleChange({ salesman: e.target.value })}
      >
        <MenuItem value="">Any</MenuItem>
        {Object.entries(salesmen).map(([key, value]) => (
          <MenuItem key={key} value={key}>
            {value.name}
          </MenuItem>
        ))}
      </TextField>
      <DatePicker
        fullWidth
        label="Date"
        value={filter.created}
        onChange={created => handleChange({ created })}
        range
        formatSeperator=" - "
        disableFuture={true}
        clearable={true}
      />
    </div>
  )
}

<style>
.filters {
  box-sizing: border-box;
  padding: 0 20px;
  width: 228px;
}

.filters > div {
  margin: 10px 0;
}
</style>