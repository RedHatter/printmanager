import React from 'react'
import PropTypes from 'prop-types'
import { TextField as MaterialTextField } from '@material-ui/core'

import { useValidation } from './Form.jsx'

TextField.propTypes = {
  value: PropTypes.any,
  pattern: PropTypes.instanceOf(RegExp),
  required: PropTypes.bool,
  error: PropTypes.bool,
  helperText: PropTypes.string,
  errorMessage: PropTypes.string,
  component: PropTypes.elementType
}

export default function TextField({
  error,
  helperText,
  errorMessage,
  component,
  pattern,
  required,
  value,
  ...props
}) {
  const validationError = useValidation([value, required, pattern], () => {
    if (required && !value) {
      return errorMessage || 'This field is required'
    } else if (
      pattern &&
      value &&
      typeof value == 'string' &&
      !pattern.test(value)
    ) {
      return errorMessage || 'Invalid value'
    }

    return null
  })

  const View = component || MaterialTextField
  return (
    <View
      {...props}
      value={value}
      error={error || !!validationError}
      helperText={validationError || helperText}
    />
  )
}
