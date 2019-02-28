import React from 'react'

import { useStore } from './store.js'

const connect = mapStateToProps => Component => props => {
  const stateProps = mapStateToProps(useStore())
  return <Component {...stateProps} {...props} />
}

export default connect
