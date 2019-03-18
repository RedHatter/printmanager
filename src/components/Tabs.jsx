import React from 'react'

function Tabs({ value, onChange, children, ...props }) {
  return (
    <div className="vertical-tabs" {...props}>
      {React.Children.map(children, (child, i) =>
        child
          ? React.cloneElement(child, {
              key: i,
              onChange,
              value: i,
              selected: i == value
            })
          : null
      )}
      {value >= 0 && (
        <span
          className="vertical-tabs-highlight"
          style={{ top: 48 * value + 'px' }}
        />
      )}
    </div>
  )
}

export default Tabs

<style>
.vertical-tabs {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 228px;
}

.vertical-tabs-highlight {
  position: absolute;
  left: 0;
  width: 4px;
  height: 48px;
  background-color: #4285f4;
  transition: top 0.3s;
}
</style>
