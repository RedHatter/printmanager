import React from 'react'
import classnames from 'classnames'
import PropTypes from 'prop-types'
import { IconButton } from '@material-ui/core'
import { Delete as DeleteIcon } from '@material-ui/icons'

function Cell ({ x, width, active, onClick, onRemove }) {
  return <div
    onClick={ onClick }
    className={ classnames('cell', { active }) }
    style={ {
      left: x + '%',
      width: width + '%'
    } }>
    { active &&
      <IconButton onClick={ onRemove } className="remove">
        <DeleteIcon />
      </IconButton>
    }
  </div>
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
    box-sizing: border-box;
    top: 0;
    height: 100%;
    cursor: pointer;
  }

  .e-blast .cell.active {
    border: 1px solid blue;
  }

  .e-blast .cell .remove {
    position: absolute;
    width: 50px;
    height: 50px;
    top: calc(50% - 25px);
    left: calc(50% - 25px);
    color: blue;
  }
</style>
