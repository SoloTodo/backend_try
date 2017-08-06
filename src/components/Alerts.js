import React, {Component} from "react";
import {connect} from "react-redux";
import messages from "../messages";

class Alerts extends Component {
  render() {
    if (!this.props.location.state || !this.props.location.state.alert) {
      return <div />
    }

    const alert = this.props.location.state.alert;
    const message = messages[alert.messageId];
    const label = messages[alert.labelId];


    return (
        <div className="container-fluid animated fadeIn">
          <div className="row">
            <div className="col-12">
              <div className={`alert alert-${alert.type} mt-3`} role="alert">
                <strong>{label}</strong> {message}
              </div>
            </div>
          </div>
        </div>
    )
  }
}

export default connect()(Alerts);