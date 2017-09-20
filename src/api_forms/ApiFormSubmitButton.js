import React, {Component} from 'react';
import LaddaButton from "react-ladda";

class ApiFormSubmitButton extends Component {
  handleValueChange = (evt) => {
    evt.preventDefault();

    this.props.onChange({}, true)
  };

  render() {
    return <LaddaButton
        loading={this.props.loading}
        onClick={this.handleValueChange}
        className="btn btn-primary">
      {this.props.loading ?
          this.props.loadingLabel :
          this.props.label
      }
    </LaddaButton>
  }
}

export default ApiFormSubmitButton