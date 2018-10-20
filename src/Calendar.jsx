import React, { Component, Fragment } from 'react'
import autobind from 'autobind-decorator'
import { connect } from 'react-redux'
import { Paper, Dialog, DialogContent, DialogActions, Button } from '@material-ui/core'
import {
  format, startOfMonth, startOfDay, setDay,
  addDays, addMonths, isSameMonth, isEqual
} from 'date-fns'
import classnames from 'classnames'
import PropTypes from 'prop-types'

import { range } from '../utils.js'
import { JobType } from './types.js'
import Job from './Job.jsx'

@autobind
class Calendar extends Component {
  static propTypes = {
    model: PropTypes.arrayOf(JobType).isRequired
  }

  constructor (props) {
    super(props)

    this.state = {
      selectedDay: new Date()
    }
  }

  render () {
    if (this.state.selectedEvent)
      return <Fragment>
        <Job model={ this.state.selectedEvent } expanded={ true } />
        <Button onClick={ this.handleCloseEvent }>Back to Calendar</Button>
      </Fragment>

    let model = this.props.model.reduce((model, job) => {
      if (!model[job.dropDate])
        model[job.dropDate] = []

      model[job.dropDate].push(job)

      if (!model[job.printDate])
        model[job.printDate] = []

      model[job.printDate].push(job)

      return model
    }, {})

    let { selectedDay } = this.state
    let today = startOfDay(new Date())
    let day = setDay(startOfMonth(new Date(selectedDay)), 0)
    return <Paper className="calendar">
      <table>
        <thead>
          <tr>
            <th className="previous" onClick={ this.handlePrevious }></th>
            <th colSpan="5">{ format(selectedDay, 'MMMM YYYY') }</th>
            <th className="next" onClick={ this.handleNext }></th>
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
          { range(6).map(w =>
            <tr key={ w }>
              { range(7).map(d =>
                <td key={ d } className={ classnames({ today: isEqual(day, today) }) }>
                  <div className={ classnames({
                    inactive: !isSameMonth(day, selectedDay)
                  }) }>{ format(day, 'DD') }</div>
                  { day in model && model[day].map(job => (
                      <div key={ job._id }
                        onClick={ this.handleSelectEvent.bind(this, job) }
                        className={ classnames({
                          print: isEqual(day, job.printDate),
                          drop: isEqual(day, job.dropDate)
                        })
                      }>
                      { job.name }
                    </div>
                  ))}
                  { (day = addDays(day, 1), false) }
                </td>
              )}
            </tr>
          )}
        </tbody>
      </table>
    </Paper>
  }

  handleSelectEvent (job) {
    this.setState({ selectedEvent: job })
  }

  handleCloseEvent (e) {
    e.stopPropagation()
    this.setState({ selectedEvent: undefined })
  }

  handlePrevious (e) {
    this.setState(state => ({ selectedDay: addMonths(state.selectedDay, -1) }))
  }

  handleNext (e) {
    this.setState(state => ({ selectedDay: addMonths(state.selectedDay, 1) }))
  }
}

export default connect(state => ({ model: state.jobs }))(Calendar)

<style>
  .calendar {
    padding: 50px;
  }

  .calendar table {
    border-collapse: collapse;
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
    content: '';
    display: block;
    position: absolute;
    width: 20px;
    height: 20px;
    top: calc(50% - 10px);
    left: calc(50% - 10px);
    background-color: #E0E0E0;
    transform: rotate(45deg);
    transition: all 0.2s;
  }

  .calendar .previous:hover::after,
  .calendar .previous:hover::before {
    left: calc(48% - 10px);
  }

  .calendar .previous:hover::before {
    background-color: #2196F3;
  }

  .calendar .next:hover::after,
  .calendar .next:hover::before {
    left: calc(52% - 10px);
  }

  .calendar .next:hover::before {
    background-color: #2196F3;
  }

  .calendar .next::after {
    background-color: white;
    transform: translateX(-5px) rotate(45deg);
    z-index: 10;
  }

  .calendar .previous::after {
    background-color: white;
    transform: translateX(5px) rotate(45deg);
    z-index: 10;
  }

  .calendar tr:first-child th {
    border-bottom: 1px solid #EEEEEE;
    height: 200px;
    font-size: 2em;
    text-transform: none;
  }

  .calendar tr th {
    height: 50px;
    font-weight: normal;
    text-transform: uppercase;
  }

  .calendar td {
    width: 200px;
    height: 200px;
    border: 1px solid #EEEEEE;
    vertical-align: top;
  }


  .calendar td div:first-child {
    font-size: 1.1em;
    text-align: right;
    margin: 10px;
  }

  .calendar td.today div:first-child {
    font-weight: bold;
    color: #2196F3;
  }

  .calendar td div.inactive:first-child {
    color: #9E9E9E;
  }

  .calendar td .print, .calendar td .drop {
    margin: 2px;
    padding: 5px;
    border-radius: 2px;
    color: white;
    background-color: #9C27B0;
    cursor: pointer;
  }

  .calendar td .drop {
    background-color: #673AB7;
  }
</style>
