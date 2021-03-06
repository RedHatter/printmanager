import React, { Fragment, useState, useReducer, useRef } from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import {
  Paper,
  TextField,
  Grid,
  Card,
  CardHeader,
  CardContent,
  Button,
  Dialog,
  DialogContent,
  DialogActions
} from '@material-ui/core'
import produce from 'immer'

import SaveIcon from '../icons/Save.js'
import Row from './Row.jsx'
import Cell from './Cell.jsx'
import Handle from './Handle.jsx'

const reducer = produce((draft, action) => {
  switch (action.type) {
    case 'INITIALIZE': {
      if (draft.rows.length > 0) return

      draft.rows = [
        {
          y: 0,
          height: 100,
          cells: [
            {
              x: 0,
              width: 100,
              url: '',
              alt: ''
            }
          ]
        }
      ]

      break
    }

    case 'UPDATE': {
      Object.assign(draft, action.payload)

      break
    }

    case 'SPLIT': {
      const { index, at, orientation } = action.payload

      if (orientation == 'horizontal') {
        let i = draft.rows.findIndex(o => o.y < at && o.y + o.height > at)
        let row = draft.rows[i]
        if (!row) return

        let fullHeight = row.height
        row.height = at - row.y
        draft.rows.splice(i + 1, 0, {
          y: at,
          height: fullHeight - row.height,
          cells: [
            {
              x: 0,
              width: 100,
              url: '',
              utmContent: '',
              alt: ''
            }
          ]
        })
      } else {
        let i = draft.rows[index].cells.findIndex(
          o => o.x < at && o.x + o.width > at
        )
        let cell = draft.rows[index].cells[i]
        if (!cell) return

        let fullWidth = cell.width
        cell.width = at - cell.x
        draft.rows[index].cells.splice(i + 1, 0, {
          x: at,
          width: fullWidth - cell.width,
          url: '',
          utmContent: '',
          alt: ''
        })
      }

      break
    }

    case 'GROW': {
      const { index, secondIndex, delta, orientation } = action.payload

      if (orientation == 'horizontal') {
        draft.rows[index].height += delta
        let next = draft.rows[index + 1]
        if (!next) return

        next.y += delta
        next.height -= delta
      } else {
        draft.rows[index].cells[secondIndex].width += delta
        let next = draft.rows[index].cells[secondIndex + 1]
        if (!next) return

        next.x += delta
        next.width -= delta
      }

      break
    }

    case 'REMOVE': {
      const { index, secondIndex } = action.payload
      let row = draft.rows[index]
      if (draft.rows.length == 1 && row.cells.length == 1) return

      let removed = row.cells.splice(secondIndex, 1)[0]

      let cell = row.cells[secondIndex - 1]

      if (cell) {
        cell.width += removed.width
      } else if ((cell = row.cells[secondIndex])) {
        cell.x -= removed.width
        cell.width += removed.width
      } else {
        removed = draft.rows.splice(index, 1)[0]

        if ((row = draft.rows[index - 1])) {
          row.height += removed.height
        } else if ((row = draft.rows[index])) {
          row.y -= removed.height
          row.height += removed.height
        }
      }

      break
    }

    case 'UPDATE_CELL': {
      let { index, secondIndex, data } = action.payload
      Object.assign(draft.rows[index].cells[secondIndex], data)

      break
    }
  }
})

function Eblast(props) {
  const [active, setActive] = useState({ row: 0, cell: 0 })
  const [model, dispatch] = useReducer(
    reducer,
    reducer(props.model, { type: 'INITIALIZE' })
  )
  const boundingRef = useRef(null)
  const scrollRef = useRef(null)

  function getOffset() {
    const dom = ReactDOM.findDOMNode(scrollRef.current)
    return dom ? dom.scrollTop - 24 : -24
  }

  function split(at, orientation) {
    const offset = getRelative(24, getOffset())

    dispatch({
      type: 'SPLIT',
      payload: {
        index: active.row,
        at: orientation == 'vertical' ? at - offset.x : at + offset.y,
        orientation
      }
    })
  }

  function grow(index, secondIndex, delta, orientation) {
    dispatch({
      type: 'GROW',
      payload: { index, secondIndex, delta, orientation }
    })
  }

  function remove(index, secondIndex, e) {
    dispatch({
      type: 'REMOVE',
      payload: { index, secondIndex }
    })
  }

  function updateActive(data) {
    dispatch({
      type: 'UPDATE_CELL',
      payload: {
        index: active.row,
        secondIndex: active.cell,
        data
      }
    })
  }

  function update(payload) {
    dispatch({
      type: 'UPDATE',
      payload
    })
  }

  function setActiveFromEvent(e) {
    let rect = boundingRef.current.getBoundingClientRect()

    let y = ((e.y - (rect.y || rect.top)) / rect.height) * 100
    let row = model.rows.findIndex(o => o.y < y && o.y + o.height > y)
    if (row == -1) return

    let x = ((e.x - (rect.x || rect.left)) / rect.width) * 100
    let cell = model.rows[row].cells.findIndex(
      o => o.x < x && o.x + o.width > x
    )
    if (cell == -1) return

    setActive({ row, cell })
  }

  function getRelative(x = 0, y = 0) {
    return {
      x: x != 0 ? (x / boundingRef.current.clientWidth) * 100 : 0,
      y: y != 0 ? (y / boundingRef.current.clientHeight) * 100 : 0
    }
  }

  if (!model) return null

  const { utmSource = '', image, rows } = model
  const activeCell = rows[active.row]?.cells[active.cell]

  if (!activeCell) {
    setActive({ row: 0, cell: 0 })
    return null
  }

  const { url = '', alt = '' } = activeCell

  return (
    <Dialog open maxWidth={false} PaperProps={{ className: 'e-blast' }}>
      <DialogContent ref={scrollRef}>
        <Handle getRelative={getRelative} onDrop={split} fixed />
        <Handle
          getRelative={getRelative}
          // start={ rows[active.row]?.y }
          // length={ rows[active.row]?.height }
          orientation="vertical"
          onDrag={setActiveFromEvent}
          onDrop={split}
          fixed
        />
        <div className="canvas">
          <img src={image} ref={boundingRef} />
          {rows.map((row, i) => (
            <Fragment key={i}>
              <Row y={row.y} height={row.height}>
                {row.cells.map((cell, j) => (
                  <Fragment key={`${i}-${j}`}>
                    <Cell
                      x={cell.x}
                      width={cell.width}
                      active={i == active.row && j == active.cell}
                      onClick={() => setActive({ row: i, cell: j })}
                      onRemove={remove.bind(this, i, j)}
                    />
                    <Handle
                      getRelative={getRelative}
                      orientation="vertical"
                      position={cell.x + cell.width}
                      onDrop={grow.bind(this, i, j)}
                      key={cell.x + cell.width}
                    />
                  </Fragment>
                ))}
              </Row>
              <Handle
                getRelative={getRelative}
                position={row.y + row.height}
                onDrop={grow.bind(this, i, -1)}
                key={row.y + row.height}
              />
            </Fragment>
          ))}
        </div>
        <div className="details">
          <Card>
            <CardHeader title="Campaign" />
            <CardContent>
              <TextField
                onChange={e => update({ utmSource: e.target.value })}
                value={utmSource}
                fullWidth
                label="Source"
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader title="Link" />
            <CardContent>
              <TextField
                onChange={e => updateActive({ url: e.target.value })}
                value={url}
                fullWidth
                label="URL"
              />
              <TextField
                onChange={e => updateActive({ alt: e.target.value })}
                value={alt}
                fullWidth
                label="Alt Text"
              />
            </CardContent>
          </Card>
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={e => props.onClose()}>Cancel</Button>
        <Button onClick={e => props.updateEblast(model)}>
          Save &nbsp; <SaveIcon />
        </Button>
      </DialogActions>
    </Dialog>
  )
}

Eblast.propTypes = {
  model: PropTypes.object.isRequired,
  updateEblast: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired
}

export default Eblast

<style>
.e-blast {
  overflow-y: visible !important;
}

.e-blast .canvas {
  position: relative;
}

.e-blast .canvas img {
  width: 100%;
}

.details {
  position: absolute;
  top: 0;
  right: -442px;
}

.details > div {
  margin: 0 0 20px 20px;
}
</style>
