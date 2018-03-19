import React, {Component} from 'react';
import {FormattedMessage} from "react-intl";
import {
  apiResourceStateToPropsUtils,
} from "../../react-utils/ApiResource";
import {connect} from "react-redux";

class RatingApproveButton extends Component {
  handleButtonClick = evt => {
    evt.preventDefault();

    this.props.fetchAuth(`${this.props.rating.url}approve/`, {
      method: 'POST'
    }).then(rating => {
      this.props.updateRating(rating);
      this.props.onApproval && this.props.onApproval(rating);
    })
  };

  render() {
    return <button className="btn btn-success" onClick={this.handleButtonClick}>
      <FormattedMessage id="approve" defaultMessage="Approve" />
    </button>
  }
}

function mapStateToProps(state) {
  const {fetchAuth} = apiResourceStateToPropsUtils(state);

  return {
    fetchAuth,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    updateRating: rating => {
      dispatch({
        type: 'updateApiResourceObject',
        apiResourceObject: rating
      })
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(RatingApproveButton);