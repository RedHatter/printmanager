import React, { Component } from 'react'
import autobind from 'autobind-decorator'
import PropTypes from 'prop-types'

@autobind
class Collapse extends Component {
  static propTypes = {
    isOpen: PropTypes.bool.isRequired,
    children: PropTypes.node.isRequired
  }

  constructor (props) {
    super(props)

    this.state = { height: 0 }
  }

  render () {
    return (
      <div ref={ this.measure } className="collapse"
        style={ {
          height: this.props.isOpen ? this.state.height : 0,
          opacity: this.props.isOpen ? 1 : 0
        } }>
        { this.props.children }
      </div>
    )
  }

  measure (el) {
    if (el) this.setState({ height: el.scrollHeight })
  }
}

<style>
  .collapse {
    overflow: hidden;
    transition: height 300ms, opacity 300ms;
  }
</style>

export default Collapse
