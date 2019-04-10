import React, { useContext, useState, useEffect } from 'react'
import PropTypes from 'prop-types'

const FormContext = React.createContext({
  validateListeners: {},
  validate: () => {}
})

let uniqueIdCounter = 0
export function useValidation(data, validateSelf) {
  const { updateValidator, removeValidator, validate } = useContext(FormContext)
  const [errorMessage, setErrorMessage] = useState(null)
  const [key] = useState(uniqueIdCounter++)

  useEffect(() => {
    const fn = () => {
      const msg = validateSelf()
      setErrorMessage(msg)
      return msg == null
    }
    updateValidator(key, fn)
    if (errorMessage && fn()) validate()
    return () => removeValidator(key)
  }, data)

  return errorMessage
}

Form.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onValid: PropTypes.func,
  onInvalid: PropTypes.func,
  children: PropTypes.node
}

function Form({ children, onSubmit, onValid, onInvalid, ...props }) {
  const [validators, setValidators] = useState({})

  function updateValidator(key, fn) {
    validators[key] = fn
    setValidators(validators)
  }

  function removeValidator(key) {
    delete validators[key]
    setValidators(validators)
  }

  function validate() {
    const valid = Object.values(validators).filter(fn => !fn()).length == 0
    if (valid && onValid) onValid()
    else if (onInvalid) onInvalid()

    return valid
  }

  return (
    <FormContext.Provider
      value={{ validate, updateValidator, removeValidator }}
    >
      <form
        onSubmit={e => {
          e.preventDefault()
          if (validate()) onSubmit(e)
        }}
        {...props}
      >
        {children}
      </form>
    </FormContext.Provider>
  )
}

export default Form
