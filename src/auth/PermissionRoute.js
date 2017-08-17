import React, {Component} from 'react';
import { connect } from 'react-redux'
import { Route, Redirect } from 'react-router-dom'
import {settings} from "../settings";
import Loading from "../components/Loading";
import RequiredResourcesContainer from "../RequiredResourcesContainer";

class PermissionRoute extends Component {
  componentDidUpdate() {
    if (typeof this.props.permissions === 'undefined') {
      return;
    }

    const requiredResources = this.props.requiredResources || [];
    for (let requiredResource of requiredResources) {
      if (!this.props.loadedResources.includes(requiredResource)) {

      }
    }
  }

  render() {
    const {component:MyComponent, ...rest} = this.props;

    if (typeof rest.permissions === 'undefined') {
      // Permissions haven't been set yet (waiting for fetch user), standby
      return <Loading />
    }

    if (rest.permissions.includes(rest.requiredPermission)) {
      return (
          <Route exact {...rest} render={props => {
            return <RequiredResourcesContainer {...rest} component={MyComponent}/>
          }}/>
      )
    } else {
      return <Redirect to={{
        pathname: '/',
        state: {from: this.props.location}
      }}/>
    }
  }
}

let mapStateToProps = (state) => {
  const user = state.apiResources[settings.ownUserUrl] || {};
  return {
    permissions: user.permissions,
    loadedResources: state.loadedResources
  }
};


export default connect(mapStateToProps)(PermissionRoute)