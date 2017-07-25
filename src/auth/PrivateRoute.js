import React from 'react';
import { connect } from 'react-redux'
import { Route, Redirect } from 'react-router-dom'

const PrivateRoute = ({ component: Component, ...rest }) => {
  if (rest.isLoggedIn) {
    return (
        <Route {...rest} render={props => {
          return <Component {...props}/>
        }
        }/>
    )
  } else {
    return <Redirect to={{
      pathname: '/login',
      state: {from: rest.location}
    }}/>
  }
};

let mapStateToProps = (state) => {
  return {
    isLoggedIn: Boolean(state.authToken)
  }
};


export default connect(mapStateToProps)(PrivateRoute)