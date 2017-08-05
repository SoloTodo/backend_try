import React from 'react';
import { connect } from 'react-redux'
import { Route, Redirect } from 'react-router-dom'
import {settings} from "../settings";

const PrivateRoute = ({ component: Component, ...rest }) => {
  if (rest.user) {
    return (
        <Route {...rest} render={props => {
          return <Component {...props}/>
        }
        }/>
    )
  }
  else if (rest.authToken) {
    // Waiting for user and required resources to load
    return <div />
  } else {
    return <Redirect to={{
      pathname: '/login',
      state: {from: rest.location}
    }}/>
  }
};

let mapStateToProps = (state) => {
  return {
    authToken: state.authToken,
    user: state.apiResources[settings.ownUserUrl]
  }
};


export default connect(mapStateToProps)(PrivateRoute)