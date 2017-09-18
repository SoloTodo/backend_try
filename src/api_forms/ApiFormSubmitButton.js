import React, {Component} from 'react';

class ApiFormSubmitButton extends Component {
  handleValueChange = (evt) => {
    evt.preventDefault();

    this.props.onApiParamChange({}, true)
  };

  render() {
    return <button
        name="submit"
        id="submit"
        type="submit"
        className="btn btn-primary"
        onClick={this.handleValueChange}>
      {this.props.label}
    </button>
  }
}

export default ApiFormSubmitButton