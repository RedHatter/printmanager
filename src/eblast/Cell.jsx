import React from 'react'
import clsx from 'clsx'
import PropTypes from 'prop-types'
import { IconButton } from '@material-ui/core'

import DeleteIcon from '../icons/Delete.js'

function Cell({ x, width, active, onClick, onRemove }) {
  return (
    <div
      onClick={onClick}
      className={clsx('cell', { active })}
      style={{
        left: x + '%',
        width: width + '%'
      }}
    >
      {active && (
        <IconButton onClick={onRemove} className="remove">
          <DeleteIcon />
        </IconButton>
      )}
    </div>
  )
}

Cell.propTypes = {
  x: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
  active: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired
}

export default Cell

<style>
.e-blast .cell {
  position: absolute;
  top: 0;
  box-sizing: border-box;
  height: 100%;
  cursor: pointer;
}

.e-blast .cell.active {
  border: 1px solid blue;
}

.e-blast .cell .remove {
  position: absolute;
  top: calc(50% - 25px);
  left: calc(50% - 25px);
  width: 50px;
  height: 50px;
  color: blue;
}
</style>
