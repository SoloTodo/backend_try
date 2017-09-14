import React, { Component } from 'react';
import {connect} from "react-redux";
import { Switch, Route, Redirect } from 'react-router-dom'
import { ToastContainer } from 'react-toastify';
import moment from 'moment';
import Header from '../../components/Header/';
import Sidebar from '../../components/Sidebar/';
import Breadcrumbs from '../../components/Breadcrumbs/';
import Aside from '../../components/Aside/';
import PubNub from 'pubnub';
import Dashboard from '../../views/Dashboard/';
import PermissionRoute from '../../auth/PermissionRoute';
import { routes } from '../../TopLevelRoutes';
import StoreDetail from "../../views/Store/StoreDetail";
import StoreDetailUpdatePricing from "../../views/Store/StoreDetailUpdatePricing";
import DetailPermissionRoute from "../../auth/DetailPermissionRoute";
import StoreDetailUpdateLogs from "../../views/Store/StoreDetailUpdateLogs";
import EntityDetail from "../../views/Entity/EntityDetail";
import EntityDetailEvents from "../../views/Entity/EntityDetailEvents";
import EntityDetailPriceHistory from "../../views/Entity/EntityDetailPriceHistory";
import {
  addApiResourceDispatchToPropsUtils,
  addApiResourceStateToPropsUtils
} from "../../ApiResource";
import {settings} from "../../settings";


class Full extends Component {
  componentDidMount() {
    const pubnub = new PubNub({
      subscribeKey: 'sub-c-6794a024-8f21-11e7-80ad-ba6da068eefb',
      ssl: true
    });

    pubnub.subscribe({
      channels: ['backend'],
    });

    pubnub.addListener({
      message: (m) => {
        const message = m.message;

        if (message.type === 'updateApiResourceObject') {
          const newApiResourceObject = message.apiResourceObject;
          const existingResourceObject = this.props.apiResourceObjects[newApiResourceObject.url];

          if (existingResourceObject) {
            const existingObjectLastUpdate = moment(existingResourceObject.last_updated);
            const newObjectLastUpdate = moment(newApiResourceObject.last_updated);

            if (existingObjectLastUpdate.isBefore(newObjectLastUpdate)) {
              this.props.fetchApiResourceObject(message.resource, message.id, this.props.dispatch)
            }
          }
        }
      }})
  };


  render() {
    return (
        <div className="app">
          <ToastContainer
              position="top-right"
              type="default"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              pauseOnHover
          />
          <Header />
          <div className="app-body">
            <Sidebar {...this.props}/>
            <main className="main">
              <Breadcrumbs location={this.props.location} />
              <div className="container-fluid main-content d-flex flex-column">
                <Switch>
                  <Route exact path="/dashboard" name="Dashboard" component={Dashboard}/>
                  {routes.map(route =>
                      <PermissionRoute exact key={route.path} path={route.path} name={route.name} requiredPermission={route.requiredPermission} component={route.component} requiredResources={route.requiredResources} title={route.title} />
                  )}
                  <DetailPermissionRoute key="1" exact path="/stores/:id/update_logs" resource="stores" permission="view_store_update_logs" requiredResources={['categories']} name="StoreDetailUpdateLogs" component={StoreDetailUpdateLogs} />
                  <DetailPermissionRoute key="2" exact path="/stores/:id/update_pricing" resource="stores" permission="update_store_pricing" requiredResources={['categories']} name="StoreDetailUpdatePricing" component={StoreDetailUpdatePricing} />
                  <DetailPermissionRoute key="3" exact path="/stores/:id" resource="stores" permission="view_store" name="StoresDetail" component={StoreDetail}/>
                  <DetailPermissionRoute key="4" exact path="/entities/:id" resource="entities" name="EntityDetail" requiredResources={['stores', 'categories', 'users_with_staff_actions']} component={EntityDetail} redirectPath="/entities/" />
                  <DetailPermissionRoute key="5" exact path="/entities/:id/events" resource="entities" name="EntityDetailEvents" component={EntityDetailEvents} />
                  <DetailPermissionRoute key="6" exact path="/entities/:id/price_history" resource="entities" name="EntityDetailPriceHistory" requiredResources={['stores']} component={EntityDetailPriceHistory} />
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

function mapStateToProps(state) {
  return {
    user: state.apiResourceObjects[settings.ownUserUrl],
    apiResourceObjects: state.apiResourceObjects
  }
}


export default connect(
    addApiResourceStateToPropsUtils(mapStateToProps),
    addApiResourceDispatchToPropsUtils())(Full);
