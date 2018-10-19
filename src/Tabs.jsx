import React from 'react'

function Tabs ({ value, onChange, children, ...props }) {
  return <div className="vertical-tabs" { ...props } >
    { React.Children.map(children, (child, i) => React.cloneElement(child, { key: i, onChange, value: i, selected: i == value })) }
    { value >= 0 && <span className="vertical-tabs-highlight" style={ { top: (48 * value) + 'px' } }></span> }
  </div>
}

export default Tabs

<style>
  .vertical-tabs {
    display: flex;
    flex-direction: column;
    position: relative;
    width: 228px;
  }

  .vertical-tabs-highlight {
    width: 4px;
    height: 48px;
    position: absolute;
    left: 0;
    background-color: #4285f4;
    transition: top 0.3s;
  }
</style>
