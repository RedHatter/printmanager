import React, { Component } from 'react'
import PropTypes from 'prop-types'

class RunningMaxValue {
  #items = {}

  createValue(callback) {
    let key = Math.random()
      .toString(36)
      .substr(2, 9)
    this.#items[key] = { callback }
    return key
  }

  updateValue(key, value) {
    this.#items[key].value = value
    this._propagate()
  }

  removeValue(key) {
    delete this.#items[key]
    this._propagate()
  }

  _propagate() {
    let values = Object.values(this.#items)
    let max = values.reduce((res, o) => Math.max(res, o.value), 0)
    values.forEach(item => item.callback(max))
  }
}

class Column extends Component {
  static propTypes = {
    group: PropTypes.string.isRequired
  }

  static cache = {}

  constructor(props) {
    super(props)

    let value = (Column.cache[props.group] ||= new RunningMaxValue())
    this.valueKey = value.createValue(width => {
      if (width > this.width && this.ref.current)
        this.ref.current.style.width = width + 'px'
    })

    this.ref = React.createRef()
    this.componentDidMount = this.componentDidUpdate
  }

  render() {
    let { children } = this.props

    return (
      <div ref={this.ref} className="column">
        {children}
      </div>
    )
  }

  componentDidUpdate() {
    this.width = this.ref.current.clientWidth
    Column.cache[this.props.group]?.updateValue(this.valueKey, this.width)
  }

  componentWillUnmount() {
    Column.cache[this.props.group]?.removeValue(this.valueKey)
  }
}

export default Column

<style>
.column {
  display: inline-block;
  padding: 0 !important;
}
</style>
