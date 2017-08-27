import React, {Component} from 'react'
import './Loading.css'

class Loading extends Component {
  render() {
    return (
        <div className="d-flex align-items-center">
          <div className="sk-wave">
            <div className="sk-rect sk-rect1">&nbsp;</div>&nbsp;
            <div className="sk-rect sk-rect2">&nbsp;</div>&nbsp;
            <div className="sk-rect sk-rect3">&nbsp;</div>&nbsp;
            <div className="sk-rect sk-rect4">&nbsp;</div>&nbsp;
            <div className="sk-rect sk-rect5">&nbsp;</div>
          </div>
        </div>
    )
  }
}

export default Loading;