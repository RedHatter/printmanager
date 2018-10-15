import React, { Component } from 'react'
import autobind from 'autobind-decorator'
import PropTypes from 'prop-types'

let ref = React.createRef()
function Collapse (props) {
  return (
    <div ref={ ref } className="collapse"
      style={ props.isOpen && ref.current ? {
        height: ref.current.scrollHeight,
        opacity: 1
      } : {
        height: 0,
        opacity: 0
      } }>
      { props.children }
    </div>
  )
}

Collapse.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  children: PropTypes.node.isRequired
}

<style>
  .collapse {
    overflow: hidden;
    transition: height 300ms, opacity 300ms;
  }
</style>

export default Collapse
