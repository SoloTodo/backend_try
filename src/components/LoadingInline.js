import React, {Component} from 'react'
import Spinner from 'react-spinkit';
import './LoadingInline.css'

class LoadingInline extends Component {
  render() {
    return (
        <Spinner id="spinner" name="ball-scale-ripple" />
    )
  }
}

export default LoadingInline;