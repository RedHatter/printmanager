import React, { Component } from 'react'
import autobind from 'autobind-decorator'
import PropTypes from 'prop-types'

@autobind
class Column extends Component {
  static propTypes = {
    group: PropTypes.string.isRequired
  }

  static funcs = {}

  constructor (props) {
    super(props)

    this.ref = React.createRef()

    let next = Column.funcs[props.group]
    Column.funcs[props.group] = width => {
      if (width > this.width)
        this.ref.current.style.width = width + 'px'

      if (next) next(width)
    }

    this.componentDidMount = this.componentDidUpdate
  }

  render () {
    let { children } = this.props

    return <div ref={ this.ref } className="column" >
      { children }
    </div>
  }

  componentDidUpdate () {
    let { group } = this.props
    this.width = this.ref.current.clientWidth
    Column.funcs[group](this.width)
  }
}

export default Column

<style>
  .column {
    display: inline-block;
  }
</style>
