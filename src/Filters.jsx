import React from 'react'
import { connect } from 'react-redux'
import { TextField, MenuItem, Grid } from '@material-ui/core'
import { DatePicker } from 'material-ui-pickers'
import { enums, colorize } from '../utils.js'

function Filters ({ filter, updateFilter, salesmen, clients }) {
  return <div className="filters">
    <Grid container spacing={ 24 }>
      <Grid item sm={ 2 }>
        <TextField fullWidth select label="Art Status" value={ filter.artStatus || '' } onChange={ e => updateFilter({ artStatus: e.target.value }) }>
          <MenuItem value="">Any</MenuItem>
          { enums.artStatus.map(value => <MenuItem key={ value } value={ value } className={ colorize(value) }>{ value }</MenuItem>) }
        </TextField>
      </Grid>
      <Grid item sm={ 2 }>
        <TextField fullWidth select label="Client" value={ filter.client || '' } onChange={ e => updateFilter({ client: e.target.value }) }>
          <MenuItem value="">Any</MenuItem>
          { clients.map(({ name, _id }) => <MenuItem key={ _id } value={ _id }>{ name }</MenuItem>) }
        </TextField>
      </Grid>
      <Grid item sm={ 2 }>
        <TextField fullWidth select label="Salesman" value={ filter.salesman || '' } onChange={ e => updateFilter({ salesman: e.target.value }) }>
          <MenuItem value="">Any</MenuItem>
          { Object.entries(salesmen).map(([ key, value ]) => <MenuItem key={ key } value={ key }>{ value.name }</MenuItem>) }
        </TextField>
      </Grid>
      <Grid item sm={ 2 }>
        <DatePicker fullWidth label="Date" value={ filter.created } onChange={ created => updateFilter({ created }) }
          range initialFocusedDate={ false } formatSeperator=" - " disableFuture={ true } clearable={ true } />
      </Grid>
      <Grid item sm={ 2 }>
        <TextField fullWidth label="Search" value={ filter.search || '' } onChange={ e => updateFilter({ search: e.target.value }) } />
      </Grid>
    </Grid>
  </div>
}

export default connect(
  state => ({ filter: state.filter, salesmen: state.salesmen, clients: state.clients }),
  { updateFilter: data => ({ type: 'UPDATE_FILTER', data }) }
)(Filters)

<style>
  .filters {
    margin: 20px;
  }
</style>
