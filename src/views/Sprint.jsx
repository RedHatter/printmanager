import React, { Fragment, useState } from 'react'
import { Paper, Button } from '@material-ui/core'
import { differenceInCalendarDays } from 'date-fns'
import clsx from 'clsx'

import { formatDate, enums } from '../../utils.js'
import { updateJob } from '../actions.js'
import { useStore } from '../store.js'
import { SlideDown, Fade } from '../components/transitions.jsx'
import JobTable from './JobTable.jsx'

export default function Sprint({ user }) {
  const [isOpen, setIsOpen] = useState(false)
  const [selected, setSelected] = useState(undefined)
  const { jobs } = useStore()

  const today = new Date()
  const columns = {}
  enums.artStatus.forEach(o => (columns[o] = []))
  jobs.forEach(o => {
    if (o.completed && differenceInCalendarDays(today, o.completed) > 2) return

    columns[o.artStatus].push(o)
  })
  return (
    <Fragment>
      <SlideDown in={isOpen}>
        <div>
          {selected && <JobTable show={selected} />}
          <Button onClick={e => setIsOpen(false)} className="back-to-calendar">
            Back to Sprint
          </Button>
        </div>
      </SlideDown>
      <Fade in={!isOpen}>
        <Paper className="sprint">
          {Object.entries(columns).map(([name, value]) => (
            <div
              key={name}
              className="column"
              onDragOver={e => e.preventDefault()}
              onDragEnter={e => e.target.classList.add('hover')}
              onDragLeave={e => e.target.classList.remove('hover')}
              onDrop={e => {
                e.preventDefault()
                const id = e.dataTransfer.getData('jobId')
                const job = jobs.find(o => id == o.id)
                if (job.artStatus == name) return

                job.artStatus = name
                updateJob(job)
              }}
            >
              <div>{name}</div>
              {value.map(job => (
                <div
                  key={job.id}
                  className={clsx('priority-' + job.priority, {
                    highlighted: job?.assignee.id == user
                  })}
                  draggable
                  onDragStart={e => {
                    e.dataTransfer.setData('jobId', job.id)
                    e.target.style.visibility = 'hidden'
                  }}
                  onDragEnd={e =>
                    document
                      .querySelectorAll('.column.hover')
                      .forEach(o => o.classList.remove('hover'))
                  }
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
          ))}
        </Paper>
      </Fade>
    </Fragment>
  )
}

<style>
.sprint {
  display: flex;
  flex-wrap: wrap;
}

.sprint .column {
  margin: 5px;
  min-width: 240px;
  min-height: 300px;
}

.sprint .column.hover * {
  pointer-events: none;
}

.sprint .column.hover::after {
  content: "";
  display: block;
  box-sizing: border-box;
  height: 60px;
  border: 2px dashed lightgray;
  border-radius: 3px;
}

.sprint .column div:first-child {
  white-space: nowrap;
  background-color: inherit;
  font-weight: 500;
  text-align: left;
  opacity: 0.7;
}

.sprint .column div {
  background-color: #f2f3f4;
  border-radius-top-right: 3px;
  border-radius-bottom-right: 3px;
  margin: 5px 0;
  text-align: left;
  padding: 10px;
  white-space: nowrap;
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