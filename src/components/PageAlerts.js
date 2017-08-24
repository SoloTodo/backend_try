import React, {Component} from 'react'
import {Alert} from "reactstrap";

class PageAlerts extends Component {
  constructor(props) {
    super(props);

    this.state = {
      dismissed: []
    }
  }

  onDismiss = (id) => {
    this.setState({
      dismissed: [...this.state.dismissed, id]
    })
  };

  render() {
    const alerts = this.props.alerts.filter(alert => !this.state.dismissed.includes(alert.id));

    return (
        <div>
          {alerts.map(alert => {
            return <Alert key={alert.id} color={alert.color} isOpen={alert.visible} toggle={() => this.onDismiss(alert.id)}>
              <strong>{alert.title}</strong> {alert.message}
            </Alert>
          })}
        </div>
    )
  }
}

export default PageAlerts;