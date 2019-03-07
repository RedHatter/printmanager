import React, { useState, Fragment } from 'react'
import {
  Paper,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton
} from '@material-ui/core'
import { Auth } from 'aws-amplify'

import { EblastType } from '../types.js'
import { formatDate } from '../../utils.js'
import { createEblast, updateEblast, deleteEblast } from '../actions.js'
import { useStore } from '../store.js'
import { SlideDown, Fade } from '../components/transitions.jsx'
import Edit from './Edit.jsx'
import Confirm from '../components/Confirm.jsx'
import AddIcon from '../icons/Add.js'

export default function EblastList(props) {
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [selected, setSelected] = useState(0)
  const [confirm, setConfirm] = useState(false)
  const { eblasts } = useStore()

  return (
    <Fragment>
      {confirm && (
        <Confirm
          onClose={e => setConfirm(false)}
          onConfirm={deleteEblast(confirm.id)}
        >
          Are you sure you want to delete <i>{confirm.name}</i>? This action can
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
                <TableCell>
                  <IconButton component="label" className="upload-button">
                    <AddIcon style={{ verticalAlign: 'bottom' }} />
                    <input
                      onSelect={e => createEblast(e.target.files[0])}
                      type="file"
                      accept="image/*"
                    />
                  </IconButton>
                  &nbsp;Name
                </TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {eblasts.map((row, i) => (
                <TableRow key={row.id}>
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
                            `/api/eblast/${row.id}/download`,
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
                    <Button onClick={e => setConfirm(row)}>Delete</Button>
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
