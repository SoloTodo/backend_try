import React, { Component } from 'react';
import {connect} from "react-redux";
import { Switch, Route, Redirect } from 'react-router-dom'

import Header from '../../components/Header/';
import Sidebar from '../../components/Sidebar/';
import Breadcrumb from '../../components/Breadcrumb/';
import Aside from '../../components/Aside/';
import Footer from '../../components/Footer/';
import Dashboard from '../../views/Dashboard/';
import Stores from '../../views/Stores';
import PermissionRoute from '../../auth/PermissionRoute';
import { addFetchAuth } from '../../utils';
import { routes } from '../../TopLevelRoutes';


class Full extends Component {
  render() {
    return (
        <div className="app">
          <Header />
          <div className="app-body">
            <Sidebar {...this.props}/>
            <main className="main">
              <Breadcrumb />
              <div className="container-fluid">
                <Switch>
                  <Route path="/dashboard" name="Dashboard" component={Dashboard}/>
                  {routes.map(route =>
                      <PermissionRoute key={route.path} path={route.path} name={route.name} requiredPermission={route.requiredPermission} component={Stores}/>
                  )}
                  <Redirect from="/" to="/dashboard"/>
                </Switch>
              </div>
            </main>
            <Aside />
          </div>
          <Footer />
        </div>
    );
  }
}


export default connect(addFetchAuth())(Full);
