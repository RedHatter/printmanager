import React, { useState, Fragment } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import {
  Paper, Button, Table, TableHead, TableRow, TableCell, TableBody
} from '@material-ui/core'
import { Auth } from 'aws-amplify'

import { EblastType } from '../types.js'
import { formatDate } from '../../utils.js'
import { createEblast, updateEblast, deleteEblase } from '../actions.js'
import { SlideDown, Fade } from '../transitions.jsx'
import Edit from './Edit.jsx'
import Confirm from '../Confirm.jsx'

function Eblast ({ model, updateEblast, deleteEblase }) {
  const [ isEditOpen, setIsEditOpen ] = useState(false)
  const [ selected, setSelected ] = useState(0)
  const [ isConfirmOpen, setIsConfirmOpen ] = useState(false)

  return <Fragment>
    { isConfirmOpen &&
        <Confirm
          onClose={ e => setIsEditOpen(false) }
          onConfirm={ deleteEblase(model._id) }
        >
          Are you sure you want to delete <i>{model.name}</i>? This action can not be reversed.
        </Confirm>
    }
    {/* <SlideDown in={ isEditOpen }> */}
      { isEditOpen && <Edit
        model={ model[selected] }
        updateEblast={ data => {
          updateEblast(data)
          setIsEditOpen(false)
        } }
      />}
    {/* </SlideDown> */}
    <Fade in={ !isEditOpen }>
      <Fragment>
        <Paper component={ Table }>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            { model.map((row, i) => (
                <TableRow key={ row._id }>
                  <TableCell>{ row.name }</TableCell>
                  <TableCell>{ formatDate(row.created) }</TableCell>
                  <TableCell>
                    <Button onClick={ e => {
                      setSelected(i)
                      setIsEditOpen(true)
                    } }>Edit</Button>
                    <Button onClick={ e =>
                      Auth.currentSession().then(async auth => {
                        console.log('test')
                        const res = await fetch(`/api/eblast/${row._id}/download`, { headers: {
                          Authorization: auth.idToken.jwtToken
                        } })
                        console.log('test')
                        const a = document.createElement('a')
                        a.href = window.URL.createObjectURL(await res.blob())
                        a.download = 'download.html'
                        console.log(a)
                        document.body.appendChild(a)
                        a.click()
                        a.remove()
                      })
                    }>Download</Button>
                    <Button onClick={ e => setIsConfirmOpen(true) }>Delete</Button>
                  </TableCell>
                </TableRow>
            ))}
          </TableBody>
        </Paper>
      </Fragment>
    </Fade>
  </Fragment>
}

Eblast.propTypes = {
  mobel: PropTypes.arrayOf(EblastType).isRequired,
  updateEblast: PropTypes.func.isRequired
}

export default connect(
  state => ({ model: state.eblasts }),
  { updateEblast, deleteEblase }
)(Eblast)
