import React, { Component } from 'react';
import {connect} from "react-redux";
import { Switch, Route, Redirect } from 'react-router-dom'
import Header from '../../components/Header/';
import Sidebar from '../../components/Sidebar/';
import Breadcrumbs from '../../components/Breadcrumbs/';
import Aside from '../../components/Aside/';
import Dashboard from '../../views/Dashboard/';
import {
  addApiResourceDispatchToPropsUtils,
  addApiResourceStateToPropsUtils
} from "../../ApiResource";
import {settings} from "../../settings";
import UserPermissionFilter from "../../auth/UserPermissionFilter";
import Page404 from "../../views/Pages/Page404/Page404";
import StoreSwitch from "../../views/Store/StoreSwitch";
import EntitySwitch from "../../views/Entity/EntitySwitch";
import ProductSwitch from "../../views/Product/ProductSwitch";
import RequiredResources from "../../RequiredResources";
import ReportSwitch from "../../views/Report/ReportSwitch";
import LeadSwitch from "../../views/Lead/LeadSwitch";
import CategorySwitch from "../../views/Category/CategorySwitch";
import VisitSwitch from "../../views/Visit/VisitSwitch";
import WtbSwitch from "../../views/Wtb/WtbSwitch";


class Full extends Component {
  render() {
    return (
        <div className="app">
          <Header />
          <div className="app-body">
            <Sidebar />
            <main className="main">
              <Breadcrumbs location={this.props.location} />
              <div className="container-fluid main-content d-flex flex-column">
                <Switch>
                  <Route path="/dashboard" name="Dashboard" render={props => (
                      <RequiredResources resources={['stores']}>
                        <Dashboard />
                      </RequiredResources>
                  )}/>

                  <Route path="/stores" render={props => (
                      <UserPermissionFilter requiredPermission="solotodo.backend_list_stores">
                        <StoreSwitch {...props} location={props.location}/>
                      </UserPermissionFilter>
                  )} />

                  <Route path="/categories" render={props => (
                      <CategorySwitch {...props} location={props.location}/>
                  )} />

                  <Route path="/entities" render={props => (
                      <UserPermissionFilter requiredPermission="solotodo.backend_list_entities">
                        <EntitySwitch {...props} location={props.location}/>
                      </UserPermissionFilter>
                  )} />

                  <Route path="/products" render={props => (
                      <UserPermissionFilter requiredPermission="solotodo.backend_list_products">
                        <ProductSwitch {...props} location={props.location}/>
                      </UserPermissionFilter>
                  )} />

                  <Route path="/leads" render={props => (
                      <UserPermissionFilter requiredPermission="solotodo.backend_list_leads">
                        <LeadSwitch {...props} location={props.location}/>
                      </UserPermissionFilter>
                  )} />

                  <Route path="/visits" render={props => (
                      <UserPermissionFilter requiredPermission="solotodo.backend_list_visits">
                        <VisitSwitch {...props} location={props.location}/>
                      </UserPermissionFilter>
                  )} />

                  <Route path="/wtb" render={props => (
                      <UserPermissionFilter requiredPermission="wtb.backend_view_wtb">
                        <WtbSwitch {...props} location={props.location}/>
                      </UserPermissionFilter>
                  )} />

                  <Route path="/reports" render={props => (
                      <ReportSwitch {...props} location={props.location}/>
                  )} />

                  <Route path="/" exact render={props => <Redirect to="/dashboard"/>} />
                  <Route component={Page404} />
                </Switch>
              </div>
            </main>
            <Aside />
          </div>
        </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    user: state.apiResourceObjects[settings.ownUserUrl],
    apiResourceObjects: state.apiResourceObjects
  }
}


export default connect(
    addApiResourceStateToPropsUtils(mapStateToProps),
    addApiResourceDispatchToPropsUtils())(Full);
