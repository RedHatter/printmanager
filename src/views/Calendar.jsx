import React, { Component, Fragment } from 'react'
import bound from 'bound-decorator'
import {
  Paper,
  Dialog,
  DialogContent,
  DialogActions,
  Button
} from '@material-ui/core'
import {
  format,
  startOfMonth,
  startOfDay,
  setDay,
  addDays,
  addMonths,
  isSameMonth,
  isSameDay
} from 'date-fns'
import clsx from 'clsx'
import PropTypes from 'prop-types'

import connect from '../connect.js'
import { range } from '../../utils.js'
import { JobType } from '../types.js'
import { SlideDown, Fade } from '../components/transitions.jsx'
import JobList from './JobList.jsx'

class Calendar extends Component {
  static propTypes = {
    model: PropTypes.arrayOf(JobType).isRequired
  }

  constructor(props) {
    super(props)

    this.state = {
      selectedDay: new Date(),
      selectedEvent: undefined,
      isDetailsOpen: false
    }
  }

  render() {
    let model = this.props.model.reduce((model, job) => {
      ;[job.dropDate, job.printDate, job.dueDate, job.secondDropDate].forEach(
        date => (model[startOfDay(date)] ||= []).push(job)
      )

      return model
    }, {})

    let { selectedDay, selectedEvent, isDetailsOpen } = this.state
    let today = startOfDay(new Date())
    let day = setDay(startOfMonth(new Date(selectedDay)), 0)
    return (
      <Fragment>
        <SlideDown in={isDetailsOpen}>
          <div>
            {selectedEvent && <JobList show={selectedEvent} />}
            <Button
              onClick={this.handleCloseEvent}
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
                  <td colSpan="7" className="legend">
                    Send to print <span className="print" />
                    Drop date <span className="drop" />
                    Due date <span className="due" />
                  </td>
                </tr>
                <tr className="headline">
                  <th className="previous" onClick={this.handlePrevious} />
                  <th colSpan="5">{format(selectedDay, 'MMMM yyyy')}</th>
                  <th className="next" onClick={this.handleNext} />
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
                {range(6).map(w => (
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
                        {model[day]?.map((job, i) => (
                          <div
                            key={job.id}
                            onClick={this.handleSelectEvent.bind(this, job)}
                            className={clsx({
                              print: isSameDay(day, job.printDate),
                              due: isSameDay(day, job.dueDate),
                              drop:
                                isSameDay(day, job.dropDate) ||
                                isSameDay(day, job.secondDropDate),
                              highlighted: job?.assignee?.id == this.props.user
                            })}
                          >
                            {job.name}
                          </div>
                        ))}
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

  handleSelectEvent(job) {
    this.setState({ selectedEvent: job, isDetailsOpen: true })
  }

  @bound
  handleCloseEvent(e) {
    e.stopPropagation()
    this.setState({ isDetailsOpen: false })
  }

  @bound
  handlePrevious(e) {
    this.setState(state => ({ selectedDay: addMonths(state.selectedDay, -1) }))
  }

  @bound
  handleNext(e) {
    this.setState(state => ({ selectedDay: addMonths(state.selectedDay, 1) }))
  }
}

export default connect(state => ({ model: state.jobs }))(Calendar)

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

.calendar tr.headline th {
  height: 200px;
  border-bottom: 1px solid #eeeeee;
  text-transform: none;
  font-size: 2em;
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
  font-size: 1.1em;
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
  background-color: #9c27b0;
  color: white;
  cursor: pointer;
}

.calendar td .drop {
  background-color: #673ab7;
}

.calendar td .due {
  background-color: #3f51b5;
}

.back-to-calendar {
  float: left;
}
</style>
