import React, { Component, Fragment } from 'react'
import autobind from 'autobind-decorator'
import { Dialog, DialogContent, TextField, Grid } from '@material-ui/core'
import classnames from 'classnames'
import PropTypes from 'prop-types'

@autobind
class FoldPicker extends Component {
  static propTypes = {
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func
  }

  constructor (props) {
    super(props)

    this.state = { isOpen: false }
  }

  render () {
    return (
      <Fragment>
        <TextField fullWidth={ true } label="Fold"
          value={ this.props.value } onFocus={ this.handleOpen } onClick={ this.handleOpen } />
        <Dialog open={ this.state.isOpen }>
          <DialogContent>
            <Grid container spacing={ 16 }>
              <Grid item sm={ 3 } className={ classnames("fold-picker-button", {
                'selected': this.props.value == 'No Fold'
              }) }
                onClick={ this.handleOnClick("No Fold") }>
                <img src="/images/fold-none.png" alt="No Fold" />
                No Fold
              </Grid>
              <Grid item sm={ 3 } className={ classnames("fold-picker-button", {
                'selected': this.props.value == 'Half Fold'
              }) }
                onClick={ this.handleOnClick("Half Fold") }>
                <img src="/images/fold-half.png" alt="Half Fold" />
                Half Fold
              </Grid>
              <Grid item sm={ 3 } className={ classnames("fold-picker-button", {
                'selected': this.props.value == 'Tri Fold'
              }) }
                onClick={ this.handleOnClick("Tri Fold") }>
                <img src="/images/fold-tri.png" alt="Tri Fold" />
                Tri Fold
              </Grid>
              <Grid item sm={ 3 } className={ classnames("fold-picker-button", {
                'selected': this.props.value == 'Custom Fold'
              }) }
                onClick={ this.handleOnClick("Custom Fold") }>
                <img src="/images/fold-custom.png" alt="Custom Fold" />
                Custom Fold
              </Grid>
            </Grid>
          </DialogContent>
        </Dialog>
      </Fragment>
    )
  }

  handleOpen () {
    if (this.ignoreFocus) {
      delete this.ignoreFocus
      return
    }

    this.setState({ isOpen: true })
  }

  handleOnClick (value) {
    return e => {
      this.props.onChange({ target: { value } })
      this.setState({ isOpen: false })
      this.ignoreFocus = true
    }
  }
}

export default FoldPicker

<style>
  .fold-picker-button {
    cursor: pointer;
    text-align: center;
  }

  .fold-picker-button img {
    margin-bottom: 15px;
    max-width: 100%;
    opacity: 0.4;
  }

  .fold-picker-button.selected img,
  .fold-picker-button img:hover {
    max-width: 100%;
    opacity: 1;
  }
</style>
