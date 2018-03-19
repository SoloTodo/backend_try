import React, {Component} from 'react';
import {FormattedMessage} from "react-intl";

export default class RatingDeleteButton extends Component {
  render() {
    return <button className="btn btn-danger">
      <FormattedMessage id="delete" defaultMessage="Delete" />
    </button>
  }
}