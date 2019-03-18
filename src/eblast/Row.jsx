import React from 'react'
import PropTypes from 'prop-types'

function Row({ y, height, children }) {
  return (
    <div
      style={{
        top: y + '%',
        height: height + '%'
      }}
      className="row"
    >
      {children}
    </div>
  )
}

Row.propTypes = {
  y: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  children: PropTypes.node.isRequired
}

export default Row

<style>
.e-blast .row {
  position: absolute;
  left: 0;
  width: 100%;
  cursor: pointer;
}

.e-blast .row.active {
  background-color: rgba(255, 0, 0, 0.5);
}
</style>
