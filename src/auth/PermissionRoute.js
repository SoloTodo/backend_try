import React from 'react';
import { connect } from 'react-redux'
import { Route, Redirect } from 'react-router-dom'

const PermissionRoute = ({ component: Component, ...rest }) => {
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
  return {
    permissions: state.user.permissions
  }
};


export default connect(mapStateToProps)(PermissionRoute)