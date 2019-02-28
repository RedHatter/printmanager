import React, { useState, Fragment } from 'react'
import {
  Paper,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody
} from '@material-ui/core'
import { Auth } from 'aws-amplify'

import { EblastType } from '../types.js'
import { formatDate } from '../../utils.js'
import { createEblast, updateEblast, deleteEblast } from '../actions.js'
import { useStore } from '../store.js'
import { SlideDown, Fade } from '../transitions.jsx'
import Edit from './Edit.jsx'
import Confirm from '../Confirm.jsx'

export default function Eblast(props) {
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [selected, setSelected] = useState(0)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const { eblasts } = useStore()

  return (
    <Fragment>
      {isConfirmOpen && (
        <Confirm
          onClose={e => setIsEditOpen(false)}
          onConfirm={deleteEblast(eblasts._id)}
        >
          Are you sure you want to delete <i>{eblasts.name}</i>? This action can
          not be reversed.
        </Confirm>
      )}
      {/* <SlideDown in={ isEditOpen }> */}
      {isEditOpen && (
        <Edit
          model={eblasts[selected]}
          updateEblast={data => {
            updateEblast(data)
            setIsEditOpen(false)
          }}
        />
      )}
      {/* </SlideDown> */}
      <Fade in={!isEditOpen}>
        <Fragment>
          <Paper component={Table}>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {eblasts.map((row, i) => (
                <TableRow key={row._id}>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{formatDate(row.created)}</TableCell>
                  <TableCell>
                    <Button
                      onClick={e => {
                        setSelected(i)
                        setIsEditOpen(true)
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={e =>
                        Auth.currentSession().then(async auth => {
                          console.log('test')
                          const res = await fetch(
                            `/api/eblast/${row._id}/download`,
                            {
                              headers: {
                                Authorization: auth.idToken.jwtToken
                              }
                            }
                          )
                          console.log('test')
                          const a = document.createElement('a')
                          a.href = window.URL.createObjectURL(await res.blob())
                          a.download = 'download.html'
                          console.log(a)
                          document.body.appendChild(a)
                          a.click()
                          a.remove()
                        })
                      }
                    >
                      Download
                    </Button>
                    <Button onClick={e => setIsConfirmOpen(true)}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Paper>
        </Fragment>
      </Fade>
    </Fragment>
  )
}
