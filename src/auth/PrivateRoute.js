import React from 'react';
import { Component } from 'react'
import { Route, Redirect } from 'react-router-dom'
import { TokenAuth } from './TokenAuth'

export const PrivateRoute = ({ component: Component, ...rest }) => (
  <Route {...rest} render={props => (
    TokenAuth.isAuthenticated() ? (
      <Component {...props}/>
    ) : (
      <Redirect to={{
        pathname: '/login',
        state: { from: props.location }
      }}/>
    )
  )}/>
);
