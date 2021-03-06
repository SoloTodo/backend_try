import React, { Component } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom'
import Header from '../../components/Header/Header';
import Sidebar from '../../components/Sidebar/Sidebar';
import Breadcrumbs from '../../components/Breadcrumbs/Breadcrumbs';
import Aside from '../../components/Aside/Aside';
import Dashboard from '../../views/Dashboard/Dashboard';
import UserPermissionFilter from "../../auth/UserPermissionFilter";
import StoreSwitch from "../../views/Store/StoreSwitch";
import EntitySwitch from "../../views/Entity/EntitySwitch";
import ProductSwitch from "../../views/Product/ProductSwitch";
import RequiredResources from "../../react-utils/components/RequiredResources";
import ReportSwitch from "../../views/Report/ReportSwitch";
import LeadSwitch from "../../views/Lead/LeadSwitch";
import CategorySwitch from "../../views/Category/CategorySwitch";
import VisitSwitch from "../../views/Visit/VisitSwitch";
import WtbSwitch from "../../views/Wtb/WtbSwitch";
import UserSwitch from "../../views/User/UserSwitch";
import Page404 from "../../views/Pages/Page404";
import RatingSwitch from "../../views/Rating/RatingSwitch";


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

                  <Route path="/ratings" render={props => (
                      <UserPermissionFilter requiredPermission="solotodo.backend_list_ratings">
                        <RatingSwitch {...props} location={props.location}/>
                      </UserPermissionFilter>
                  )} />

                  <Route path="/wtb" render={props => (
                    <UserPermissionFilter
                        requiredPermission="wtb.backend_view_wtb">
                      <WtbSwitch {...props} location={props.location}/>
                    </UserPermissionFilter>
                    )} />

                  <Route path="/reports" render={props => (
                      <ReportSwitch {...props} location={props.location}/>
                  )} />

                  <Route path="/users" render={props => (
                      <UserSwitch {...props} location={props.location}/>
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

export default Full;
