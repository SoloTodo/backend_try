import React, {Component} from 'react'
import {Alert} from "reactstrap";

class PageAlerts extends Component {
  render() {
    return (
        <div>
          {this.props.alerts.map((alert, idx) => {
            return <Alert key={idx} color={alert.color} isOpen={alert.visible} toggle={() => this.props.onAlertDismiss(idx)}>
              <strong>{alert.title}</strong> {alert.message}
            </Alert>
          })}
        </div>
    )
  }
}

export default PageAlerts;