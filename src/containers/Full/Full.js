import React, { Component } from 'react';
import {connect} from "react-redux";
import { Switch, Route, Redirect } from 'react-router-dom'

import Header from '../../components/Header/';
import Sidebar from '../../components/Sidebar/';
import Breadcrumbs from '../../components/Breadcrumbs/';
import Aside from '../../components/Aside/';
import Alerts from '../../components/Alerts';
import Dashboard from '../../views/Dashboard/';
import PermissionRoute from '../../auth/PermissionRoute';
import { routes } from '../../TopLevelRoutes';
import StoreDetail from "../../views/Store/StoreDetail";
import StoreDetailUpdate from "../../views/Store/StoreDetailUpdate";
import DetailPermissionRoute from "../../auth/DetailPermissionRoute";
import StoreDetailUpdateLogs from "../../views/Store/StoreDetailUpdateLogs";
import EntityDetail from "../../views/Entity/EntityDetail";


class Full extends Component {
  render() {
    return (
        <div className="app">
          <Header />
          <div className="app-body">
            <Sidebar {...this.props}/>
            <main className="main">
              <Alerts location={this.props.location} />
              <Breadcrumbs location={this.props.location} />
              <div className="container-fluid main-content">
                <Switch>
                  <Route exact path="/dashboard" name="Dashboard" component={Dashboard}/>
                  {routes.map(route =>
                      <PermissionRoute exact key={route.path} path={route.path} name={route.name} requiredPermission={route.requiredPermission} component={route.component} requiredResources={route.requiredResources} title={route.title} />
                  )}
                  <DetailPermissionRoute key="1" exact path="/stores/:id/update_logs" resource="stores" permission="view_store_update_logs" name="StoreDetailUpdateLogs" component={StoreDetailUpdateLogs}/>
                  <DetailPermissionRoute key="2" exact path="/stores/:id/update" resource="stores" permission="update_store_prices" name="StoreDetailUpdate" component={StoreDetailUpdate}/>
                  <DetailPermissionRoute key="3" exact path="/stores/:id" resource="stores" permission="backend_view_store" name="StoresDetail" component={StoreDetail}/>
                  <DetailPermissionRoute key="4" exact path="/entities/:id" resource="entities" name="EntityDetail" requiredResources={['stores', 'product_types']} component={EntityDetail}/>
                  <Redirect from="/" to="/dashboard"/>
                </Switch>
              </div>
            </main>
            <Aside />
          </div>
        </div>
    );
  }
}


export default connect()(Full);
