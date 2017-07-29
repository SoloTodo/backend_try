import React from 'react';
import { connect } from 'react-redux'
import { Route, Redirect } from 'react-router-dom'
import {settings} from "../settings";

const PermissionRoute = ({ component: Component, ...rest }) => {
  if (typeof rest.permissions === 'undefined') {
    // Permissions haven't been set yet (waiting for fetch user), standby
    return <div/>
  }

  if (rest.permissions.includes(rest.requiredPermission)) {
    return (
        <Route {...rest} render={props => {
          return <Component {...props}/>
        }
        }/>
    )
  } else {
    return <Redirect to={{
      pathname: '/',
      state: {from: rest.location}
    }}/>
  }
};

let mapStateToProps = (state) => {
  const user = state.apiResources[settings.ownUserUrl] || {};
  return {
    permissions: user.permissions
  }
};


export default connect(mapStateToProps)(PermissionRoute)