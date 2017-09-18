import React, { Component } from 'react';
import {connect} from "react-redux";
import { Switch, Route, Redirect } from 'react-router-dom'
import moment from 'moment';
import Header from '../../components/Header/';
import Sidebar from '../../components/Sidebar/';
import Breadcrumbs from '../../components/Breadcrumbs/';
import Aside from '../../components/Aside/';
import PubNub from 'pubnub';
import Dashboard from '../../views/Dashboard/';
import { routes } from '../../TopLevelRoutes';
import StoreDetail from "../../views/Store/StoreDetail";
import StoreDetailUpdatePricing from "../../views/Store/StoreDetailUpdatePricing";
import StoreDetailUpdateLogs from "../../views/Store/StoreDetailUpdateLogs";
import EntityDetail from "../../views/Entity/EntityDetail";
import EntityDetailEvents from "../../views/Entity/EntityDetailEvents";
import EntityDetailPricingHistory from "../../views/Entity/EntityDetailPricingHistory";
import {
  addApiResourceDispatchToPropsUtils,
  addApiResourceStateToPropsUtils
} from "../../ApiResource";
import {settings} from "../../settings";
import UserPermissionFilter from "../../auth/UserPermissionFilter";
import Page404 from "../../views/Pages/Page404/Page404";
import StoreSwitch from "../../views/Store/StoreSwitch";


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
          <Header />
          <div className="app-body">
            <Sidebar />
            <main className="main">
              <Breadcrumbs location={this.props.location} />
              <div className="container-fluid main-content d-flex flex-column">
                <Switch>
                  <Route path="/dashboard" name="Dashboard" component={Dashboard}/>

                  <Route path="/stores" render={props => (
                      <UserPermissionFilter requiredPermission="solotodo.backend_list_stores">
                        <StoreSwitch {...props} location={props.location}/>
                      </UserPermissionFilter>
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
