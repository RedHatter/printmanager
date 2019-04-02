import React, { Fragment, useState, useEffect, useRef } from 'react'
import { Paper, Button, RootRef } from '@material-ui/core'
import { differenceInCalendarDays } from 'date-fns'
import clsx from 'clsx'

import { formatDate, enums, throttle } from '../../utils.js'
import { updateJob } from '../actions.js'
import { useStore } from '../store.js'
import { SlideDown, Fade } from '../components/transitions.jsx'
import JobList from './JobList.jsx'

export default function Sprint({ user, isAdmin }) {
  const [isOpen, setIsOpen] = useState(false)
  const [selected, setSelected] = useState(undefined)
  const columnWrapper = useRef(undefined)
  const { jobs } = useStore()

  function resize() {
    const dom = columnWrapper.current
    if (!dom) return
    dom.style.width = Math.floor(dom.clientWidth / 300) * 300 + 'px'
  }

  useEffect(resize)
  useEffect(() => {
    const removeStyle = throttle(() => {
      columnWrapper.current.removeAttribute('style')
      resize()
    }, 100)

    window.addEventListener('resize', removeStyle)
    return () => window.removeEventListener('resize', removeStyle)
  }, [])

  function Column({ name, value }) {
    return (
      <div
        className="sprint-column"
        onDragOver={e => e.preventDefault()}
        onDragEnter={e => e.target.classList.add('hover')}
        onDragLeave={e => e.target.classList.remove('hover')}
        onDrop={e => {
          e.preventDefault()
          const id = e.dataTransfer.getData('jobId')
          const job = jobs.find(o => id == o.id)
          if (job.artStatus == name) return

          if (job.artStatus == 'Unassigned') job.assignee = user
          else if (name == 'Unassigned') job.assignee = ''

          job.artStatus = name
          updateJob(job)
        }}
      >
        <div>{name}</div>
        {value.map(job => (
          <div
            key={job.id}
            className={clsx('priority-' + job.priority, {
              highlighted: job?.assignee?.id == user
            })}
            draggable
            onDragStart={e => {
              e.dataTransfer.setData('jobId', job.id)
              e.target.style.opacity = '0'
            }}
            onDragEnd={e => {
              document
                .querySelectorAll('.column.hover')
                .forEach(o => o.classList.remove('hover'))
              if (job.artStatus == name) e.target.removeAttribute('style')
            }}
            onClick={e => {
              setIsOpen(true)
              setSelected(job)
            }}
          >
            {job.name}
            <br />
            {formatDate(job.dueDate)}
          </div>
        ))}
      </div>
    )
  }

  const today = new Date()
  const columns = {}
  enums.artStatus.forEach(o => (columns[o] = []))
  jobs.forEach(o => {
    if (o.completed && differenceInCalendarDays(today, o.completed) > 2) return

    columns[o.artStatus].push(o)
  })
  const unassigned = columns['Unassigned']
  delete columns['Unassigned']
  return (
    <Fragment>
      <SlideDown in={isOpen}>
        <div>
          {selected && <JobList show={selected} isAdmin={isAdmin} />}
          <Button onClick={e => setIsOpen(false)} className="back-to-calendar">
            Back to Sprint
          </Button>
        </div>
      </SlideDown>
      <Fade in={!isOpen}>
        <div className="sprint">
          <Column name="Unassigned" value={unassigned} />
          <RootRef rootRef={columnWrapper}>
            <Paper className="column-wrapper">
              {Object.entries(columns).map(([name, value]) => (
                <Column key={name} name={name} value={value} />
              ))}
            </Paper>
          </RootRef>
        </div>
      </Fade>
    </Fragment>
  )
}

<style>
.sprint {
  display: flex;
}

.sprint .sprint-column:first-child {
  overflow: auto;
  flex-shrink: 0;
  max-height: 600px;
}

.sprint .column-wrapper {
  display: flex;
  flex-wrap: wrap;
}

.sprint .sprint-column {
  box-sizing: border-box;
  margin-bottom: 10px;
  padding: 5px;
  min-height: 300px;
  width: 300px;
  border-right: 1px solid #e0e0e0;
}

.sprint .column-wrapper .column.hover * {
  pointer-events: none;
}

.sprint .column-wrapper .column.hover::after {
  display: block;
  box-sizing: border-box;
  height: 60px;
  border: 2px dashed lightgray;
  border-radius: 3px;
  content: '';
}

.sprint .sprint-column div:first-child {
  background-color: inherit;
  text-align: left;
  white-space: nowrap;
  font-weight: 500;
  opacity: 0.7;
}

.sprint .sprint-column div {
  margin: 5px 0;
  padding: 10px;
  background-color: #f2f3f4;
  text-align: left;
  white-space: nowrap;

  border-radius-top-right: 3px;
  border-radius-bottom-right: 3px;
}

.priority-1 {
  border-left: 3px solid #4caf50;
}

.priority-2 {
  border-left: 3px solid #ffb300;
}

.priority-3 {
  border-left: 3px solid #ef5350;
}
</style>
