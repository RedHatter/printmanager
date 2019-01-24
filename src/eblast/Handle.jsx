import React from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import Draggable from 'react-draggable'

function Handle ({
  orientation = 'horizontal',
  position = 0,
  start = 0,
  length = 100,
  onDrop, onDrag, fixed,
  getRelative
}) {
  return orientation == 'horizontal'
    ? <Draggable
        axis="y"
        bounds="parent"
        position={ fixed ? { x: 0, y: -20 } : undefined }
        onDrag={ onDrag }
        onStop={ (e, data) => onDrop(getRelative(0, data.y).y, orientation) }
      >
        <div
          className={ "handle horizontal" }
          style={{
            top: `calc(${position}% - 4px)`,
            left: start + '%',
            width: length + '%'
          }}
        />
      </Draggable>
    : <Draggable
        axis="x"
        bounds="parent"
        position={ fixed ? { x: -20, y: 0 } : undefined }
        onDrag={ onDrag }
        onStop={ (e, data) => onDrop(getRelative(data.x).x, orientation)}
      >
        <div
          className={ "handle vertical" }
          style={{
            left: `calc(${position}% - 4px)`,
            top: start + '%',
            height: length + '%'
          }}
        />
      </Draggable>
}

Handle.propTypes = {
  orientation: PropTypes.oneOf([ 'horizontal', 'vertical' ]),
  position: PropTypes.number,
  start: PropTypes.number,
  length: PropTypes.number,
  fixed: PropTypes.bool,
  onDrop: PropTypes.func.isRequired,
  onDrag: PropTypes.func
}

export default Handle

<style>
  .e-blast .handle {
    position: absolute;
    z-index: 10;
  }

  .e-blast .handle:last-child {
    display: none;
  }

  .e-blast .handle::after {
    content: '';
    display: block;
    background-color: blue;
  }

  .e-blast .handle.horizontal {
    height: 10px;
    cursor: row-resize;
  }

  .e-blast .handle.horizontal::after {
    margin-top: 4px;
    height: 2px;
    width: 100%;
  }

  .e-blast .handle.vertical {
    width: 10px;
    cursor: col-resize;
  }

  .e-blast .handle.vertical::after {
    margin-left: 4px;
    width: 2px;
    height: 100%;
  }
</style>
