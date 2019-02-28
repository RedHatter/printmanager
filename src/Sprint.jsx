import React, { Fragment, useState } from 'react'
import { Paper, Button } from '@material-ui/core'
import classnames from 'classnames'

import { formatDate, enums } from '../utils.js'
import { updateJob } from './actions.js'
import { useStore } from './store.js'
import { SlideDown, Fade } from './transitions.jsx'
import Job from './print/Job.jsx'
import JobHeader from './print/JobHeader.jsx'

export default function Sprint(props) {
  const [isOpen, setIsOpen] = useState(false)
  const [selected, setSelected] = useState(undefined)
  const { jobs } = useStore()

  const columns = {}
  enums.artStatus.forEach(o => (columns[o] = []))
  jobs.forEach(o => columns[o.artStatus].push(o))
  return (
    <Fragment>
      <SlideDown in={isOpen}>
        <div>
          <JobHeader />
          {selected && <Job model={selected} expanded={true} />}
          <Button onClick={e => setIsOpen(false)} className="back-to-calendar">
            Back to Sprint
          </Button>
        </div>
      </SlideDown>
      <Fade in={!isOpen}>
        <Paper className="sprint">
          {Object.entries(columns).map(([name, jobs]) => (
            <div
              key={name}
              className="column"
              onDragOver={e => e.preventDefault()}
              onDragEnter={e => e.target.classList.add('hover')}
              onDragLeave={e => e.target.classList.remove('hover')}
              onDrop={e => {
                e.preventDefault()
                const id = e.dataTransfer.getData('jobId')
                const job = jobs.find(o => id == o._id)
                if (job.artStatus == name) return

                job.artStatus = name
                updateJob(job)
              }}
            >
              <div>{name}</div>
              {jobs.map(job => (
                <div
                  key={job._id}
                  className={'priority-' + job.priority}
                  draggable
                  onDragStart={e => {
                    e.dataTransfer.setData('jobId', job._id)
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