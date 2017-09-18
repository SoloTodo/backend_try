import React, {Component} from 'react';
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom'
import { toast } from 'react-toastify';
import {settings} from "../settings";
import Loading from "../components/Loading";
import {FormattedMessage} from "react-intl";

class UserPermissionFilter extends Component {
  render() {
    if (!this.props.authToken) {
      toast.info(<FormattedMessage id="login_required" defaultMessage="Please login to access this page" />);

      return <Redirect to={{
        pathname: '/login'
      }}/>
    }

    if (!this.props.user) {
      // Permissions haven't been set yet (waiting for fetch user), standby
      return <Loading />
    }

    if (this.props.requiredPermission && !this.props.user.permissions.includes(this.props.requiredPermission)) {
      toast.error(<FormattedMessage id="page_access_denied" defaultMessage="You don't have permission to access this page" />);

      return <Redirect to={{
        pathname: '/'
      }}/>
    }

    return React.Children.only(this.props.children)
  }
}

let mapStateToProps = (state) => {
  return {
    authToken: state.authToken,
    user: state.apiResourceObjects[settings.ownUserUrl]
  }
};


export default connect(mapStateToProps)(UserPermissionFilter)