import React, { Fragment, useState } from 'react'
import {
  Paper,
  Dialog,
  DialogContent,
  DialogActions,
  Typography,
  Button
} from '@material-ui/core'
import {
  format,
  startOfMonth,
  startOfWeek,
  startOfDay,
  addMonths,
  addWeeks,
  addDays,
  subMonths,
  subWeeks,
  setDay,
  isSameMonth,
  isSameDay
} from 'date-fns'
import clsx from 'clsx'
import PropTypes from 'prop-types'

import { useStore } from '../store.js'
import { range } from '../../utils.js'
import { SlideDown, Fade } from '../components/transitions.jsx'
import JobList from './JobList.jsx'

export default function Calendar(props) {
  const [selectedDay, setSelectedDay] = useState(startOfDay(new Date()))
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [isDetailsOpen, setDetailsOpen] = useState(false)
  const [isWeekView, setWeekView] = useState(false)
  const { jobs, user } = useStore()

  function DayList({ model, className }) {
    return model
      ? model.map(job => (
          <div
            key={job.id + className}
            onClick={e => {
              setSelectedEvent(job)
              setDetailsOpen(true)
            }}
            className={clsx(className, {
              highlighted: job?.assignee?.id == user.id
            })}
          >
            {job.name}
          </div>
        ))
      : null
  }

  const dropDate = Object.create(null)
  const printDate = Object.create(null)
  const dueDate = Object.create(null)

  for (const job of jobs) {
    if (job.dropDate) (dropDate[startOfDay(job.dropDate)] ||= []).push(job)
    if (job.secondDropDate)
      (dropDate[startOfDay(job.secondDropDate)] ||= []).push(job)
    if (job.printDate) (printDate[startOfDay(job.printDate)] ||= []).push(job)
    if (job.dueDate) (dueDate[startOfDay(job.dueDate)] ||= []).push(job)
  }

  const today = startOfDay(new Date())
  let day = setDay(
    isWeekView ? startOfWeek(selectedDay) : startOfMonth(selectedDay),
    0
  )
  return (
    <Fragment>
      <SlideDown in={isDetailsOpen}>
        <div>
          {selectedEvent && <JobList show={selectedEvent} />}
          <Button
            onClick={e => {
              e.stopPropagation()
              setDetailsOpen(false)
            }}
            className="back-to-calendar"
          >
            Back to Calendar
          </Button>
        </div>
      </SlideDown>
      <Fade in={!isDetailsOpen}>
        <Paper className="calendar">
          <table>
            <thead>
              <tr>
                <td colSpan="6" className="legend">
                  Send to print <span className="print" />
                  Drop date <span className="drop" />
                  Due date <span className="due" />
                </td>
                <td
                  onClick={e => setWeekView(!isWeekView)}
                  className="type-select"
                >
                  <span className={clsx({ selected: !isWeekView })}>Month</span>
                  <span className={clsx({ selected: isWeekView })}>Week</span>
                </td>
              </tr>
              <tr className="heading">
                <th
                  className="previous"
                  onClick={e =>
                    setSelectedDay(
                      isWeekView
                        ? subWeeks(selectedDay, 1)
                        : subMonths(selectedDay, 1)
                    )
                  }
                />
                <th colSpan="5">{format(selectedDay, 'MMMM yyyy')}</th>
                <th
                  className="next"
                  onClick={e =>
                    setSelectedDay(
                      isWeekView
                        ? addWeeks(selectedDay, 1)
                        : addMonths(selectedDay, 1)
                    )
                  }
                />
              </tr>
              <tr>
                <th>Sunday</th>
                <th>Monday</th>
                <th>Tuesday</th>
                <th>Wednsday</th>
                <th>Thursday</th>
                <th>Friday</th>
                <th>Saturday</th>
              </tr>
            </thead>
            <tbody>
              {range(isWeekView ? 1 : 6).map(w => (
                <tr key={w}>
                  {range(7).map(d => (
                    <td
                      key={d}
                      className={clsx({ today: isSameDay(day, today) })}
                    >
                      <div
                        className={clsx({
                          inactive: !isSameMonth(day, selectedDay)
                        })}
                      >
                        {format(day, 'dd')}
                      </div>
                      <DayList model={dropDate[day]} className="drop" />
                      <DayList model={printDate[day]} className="print" />
                      <DayList model={dueDate[day]} className="due" />
                      {((day = addDays(day, 1)), false)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Paper>
      </Fade>
    </Fragment>
  )
}

<style>
.calendar {
  padding: 50px;
}

.calendar table {
  width: 1421px;
  border-collapse: collapse;
}

.calendar td.legend span {
  display: inline-block;
  margin-right: 20px;
  width: 36px;
  height: 8px;
  vertical-align: middle;
}

.calendar .previous,
.calendar .next {
  position: relative;
  cursor: pointer;
}

.calendar .previous::before,
.calendar .previous::after,
.calendar .next::before,
.calendar .next::after {
  position: absolute;
  top: calc(50% - 10px);
  left: calc(50% - 10px);
  display: block;
  width: 20px;
  height: 20px;
  background-color: #e0e0e0;
  content: '';
  transition: all 0.2s;
  transform: rotate(45deg);
}

.calendar .previous:hover::after,
.calendar .previous:hover::before {
  left: calc(48% - 10px);
}

.calendar .previous:hover::before {
  background-color: #2196f3;
}

.calendar .next:hover::after,
.calendar .next:hover::before {
  left: calc(52% - 10px);
}

.calendar .next:hover::before {
  background-color: #2196f3;
}

.calendar .next::after {
  z-index: 10;
  background-color: white;
  transform: translateX(-5px) rotate(45deg);
}

.calendar .previous::after {
  z-index: 10;
  background-color: white;
  transform: translateX(5px) rotate(45deg);
}

.calendar tr.heading th {
  height: 200px;
  border-bottom: 1px solid #eeeeee;
  text-transform: none;
  font-size: 2rem;
}

.calendar tr th {
  height: 50px;
  text-transform: uppercase;
  font-weight: normal;
}

.calendar tbody td {
  width: 200px;
  height: 200px;
  border: 1px solid #eeeeee;
  vertical-align: top;
}

.calendar tbody td div:first-child {
  margin: 10px;
  text-align: right;
  font-size: 1.1rem;
}

.calendar tbody td.today div:first-child {
  color: #2196f3;
  font-weight: bold;
}

.calendar tbody td div.inactive:first-child {
  color: #9e9e9e;
}

.calendar td .print,
.calendar td .due,
.calendar td .drop {
  margin: 2px;
  padding: 5px;
  border-radius: 2px;
  background-color: #4caf50;
  color: white;
  cursor: pointer;
}

.calendar td .drop {
  background-color: #f44336;
}

.calendar td .due {
  background-color: #3f51b5;
}

.back-to-calendar {
  float: left;
}
</style>
