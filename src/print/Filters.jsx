import React from 'react'
import { TextField, MenuItem } from '@material-ui/core'
import { DatePicker } from 'material-ui-pickers'

import { updateFilter, fetchJobs } from '../actions.js'
import { useStore } from '../store.js'
import { enums, colorize } from '../../utils.js'
import DateRangePicker from '../DateRangePicker.jsx'

export default function Filters(props) {
  const { filter, users, clients } = useStore()
  const salesmen = users.filter(o => o.salesman)
  const handleChange = o => {
    updateFilter(o)
    fetchJobs()
  }

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
        {salesmen.map(value => (
          <MenuItem key={value.id} value={value.id}>
            {value.name}
          </MenuItem>
        ))}
      </TextField>
      <DateRangePicker
        fullWidth
        label="Date"
        value={filter.created}
        onChange={created => handleChange({ created })}
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