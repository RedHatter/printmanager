import React, { Fragment, useState, useRef } from 'react'
import { Editor, EditorState, RichUtils, Modifier } from 'draft-js'
import { Button, Popover, Chip, IconButton } from '@material-ui/core'
import { stateToHTML } from 'draft-js-export-html'
import { Auth } from 'aws-amplify'
import clsx from 'clsx'

import DeleteIcon from '../icons/Delete.js'
import { addComment, deleteComment } from '../actions.js'
import { useStore } from '../store.js'
import { formatDateTime } from '../../utils.js'

function ChipSelection({ label, options, value, onChange }) {
  const [open, setOpen] = useState(false)
  const anchor = useRef(null)
  return (
    <Fragment>
      <Button onClick={e => setOpen(true)} buttonRef={anchor}>
        {label}
      </Button>
      {open && (
        <Popover
          open={open}
          onClose={() => setOpen(false)}
          anchorEl={anchor.current}
        >
          {options
            .filter(o => !value.find(v => v.id == o.id))
            .map(o => (
              <div
                className="chip-selection-option"
                key={o.id}
                onClick={e => {
                  e.stopPropagation()
                  setOpen(false)
                  onChange([...value, o])
                }}
              >
                {o.name}
              </div>
            ))}
        </Popover>
      )}
      {value.map(o => (
        <Chip
          key={o.id}
          label={o.name}
          className="chip-selection-chip"
          onDelete={() => onChange(value.filter(v => v.id !== o.id))}
        />
      ))}
    </Fragment>
  )
}

const colors = [
  { key: 'RED', value: '#f44336' },
  { key: 'PINK', value: '#E91E63' },
  { key: 'PURPLE', value: '#9C27B0' },

  { key: 'BLUE', value: '#2196F3' },
  { key: 'INDIGO', value: '#3F51B5' },
  { key: 'DEEP_PURPLE', value: '#673AB7' },

  { key: 'LIGHT_BLUE', value: '#03A9F4' },
  { key: 'CYAN', value: '#00BCD4' },
  { key: 'TEAL', value: '#009688' },

  { key: 'LIME', value: '#CDDC39' },
  { key: 'LIGHT_GREEN', value: '#8BC34A' },
  { key: 'GREEN', value: '#4CAF50' },

  { key: 'YELLOW', value: '#FFEB3B' },
  { key: 'AMBER', value: '#FFC107' },
  { key: 'ORANGE', value: '#FF9800' },

  { key: 'GREY', value: '#9E9E9E' },
  { key: 'BROWN', value: '#795548' },
  { key: 'DEEP_ORANGE', value: '#FF5722' },

  { key: 'BLUE_GREY', value: '#607D8B' },
  { key: 'TRANSPARENT', value: 'transparent' }
]

const colorStyleMap = colors.reduce(
  (o, { key, value }) => ((o[key] = { backgroundColor: value }), o),
  {}
)

const inlineStyles = colors.reduce(
  (o, { key, value }) => ((o[key] = { style: { backgroundColor: value } }), o),
  {}
)

function ColorSelection({ label, value, onChange }) {
  const [open, setOpen] = useState(false)
  const anchor = useRef(null)
  return (
    <Fragment>
      <Button onClick={e => setOpen(true)} buttonRef={anchor}>
        {label}
      </Button>
      {open && (
        <Popover
          open={open}
          onClose={() => setOpen(false)}
          anchorEl={anchor.current}
        >
          {colors.map(({ key, value }) => (
            <div
              style={{ backgroundColor: value }}
              className="color-selection-option"
              key={key}
              onClick={e => {
                setOpen(false)
                onChange(key)
              }}
            />
          ))}
        </Popover>
      )}
    </Fragment>
  )
}

export default function Comments({ model }) {
  const editor = useRef()
  const [editorState, setEditorState] = useState(EditorState.createEmpty())
  const [notify, setNotify] = useState([])
  const [limit, setLimit] = useState(5)
  const { users } = useStore()

  const styles = editorState.getCurrentInlineStyle()
  function toggleInlineStyle(type, e) {
    e.preventDefault()
    setEditorState(RichUtils.toggleInlineStyle(editorState, type))
  }

  const comments = model.comments.slice(
    Math.max(0, model.comments.length - limit)
  )

  return (
    <Fragment>
      {model.comments.length > limit && (
        <div className="load-comments-button">
          <Button onClick={e => setLimit(model.comments.length)}>
            Load {model.comments.length - limit} more
          </Button>
        </div>
      )}

      {comments.map(o => (
        <div key={o.id} className="comment">
          <span className="user">{o.user.name}</span>
          <span className="created">{formatDateTime(o.created)}</span>
          <DeleteIcon
            fontSize="small"
            className="delete"
            onClick={e => deleteComment(model.id, o.id)}
          />
          <div
            className="content"
            dangerouslySetInnerHTML={{ __html: o.html }}
          />
        </div>
      ))}
      <div className="comment-box">
        <Button
          className={clsx({ 'active-toggle': styles.has('BOLD') })}
          onMouseDown={toggleInlineStyle.bind(this, 'BOLD')}
        >
          Bold
        </Button>
        <Button
          className={clsx({ 'active-toggle': styles.has('ITALIC') })}
          onMouseDown={toggleInlineStyle.bind(this, 'ITALIC')}
        >
          Italic
        </Button>
        <ColorSelection
          label="Highlight"
          onChange={color => {
            const selection = editorState.getSelection()
            let contentState = editorState.getCurrentContent()
            contentState = colors.reduce(
              (state, { key }) =>
                Modifier.removeInlineStyle(state, selection, key),
              contentState
            )
            contentState = Modifier.applyInlineStyle(
              contentState,
              selection,
              color
            )
            setEditorState(
              EditorState.push(editorState, contentState, 'change-inline-style')
            )
          }}
        />
        <ChipSelection
          options={users}
          value={notify}
          onChange={setNotify}
          label="Notify"
        />
        <Editor
          ref={editor}
          customStyleMap={colorStyleMap}
          editorState={editorState}
          onChange={setEditorState}
        />
        <Button
          onClick={async e =>
            (await addComment(
              {
                notify: notify.map(o => o.email),
                user: (await Auth.currentAuthenticatedUser()).username,
                html: stateToHTML(editorState.getCurrentContent(), {
                  inlineStyles
                })
              },
              model.id
            )) && setEditorState(EditorState.createEmpty())
          }
        >
          Comment
        </Button>
      </div>
    </Fragment>
  )
}

<style>
.load-comments-button {
  text-align: center;
}

.chip-selection-option {
  padding: 8px;
  cursor: pointer;
}

.chip-selection-option:hover {
  background-color: #eeeeee;
}

.chip-selection-chip {
  margin: 0 2px;
}

.comment .user {
  color: #2196f3;
  font-weight: 500;
}

.comment .created {
  margin-left: 12px;
  color: #9e9e9e;
  font-size: 0.8em;
}

.comment .delete {
  margin: 0 10px;
  color: #eeeeee;
  vertical-align: middle;
  opacity: 0;
  cursor: pointer;
  transition: all 300ms;
}

.comment:hover .delete {
  opacity: 1;
}

.comment:hover .delete:hover {
  color: #616161;
}

.comment .content {
  margin-bottom: 20px;
  padding: 18px 20px 22px 20px;
  border-bottom: 1px solid #eeeeee;
}

.comment .content p {
  margin: 0;
}

.comment .content strong {
  font-weight: 500;
}

.color-selection-option {
  float: left;
  width: 30px;
  height: 30px;
  cursor: pointer;
}

.color-selection-option:hover::after {
  display: block;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.1);
  content: '';
}

.color-selection-option:nth-child(3n + 1) {
  clear: left;
}

.public-DraftEditor-content:focus {
  padding: 20px;
  border: 2px solid #2196f3;
}

.public-DraftEditor-content:hover {
  padding: 20px;
  border-width: 2px;
}

.public-DraftEditor-content {
  padding: 21px;
  min-height: 70px;
  border: 1px solid #9e9e9e;
  border-radius: 3px;
}

.comment-box button {
  margin: 5px 2px;
}

.comment-box .active-toggle {
  color: #2196f3;
}
</style>
