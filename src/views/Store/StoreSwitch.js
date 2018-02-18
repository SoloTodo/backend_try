import React from 'react'
import {Route, Switch} from "react-router-dom";
import StoreList from "./StoreList";
import RequiredResources from "../../react-utils/components/RequiredResources";
import StoreDetail from "./StoreDetail";
import StoreDetailUpdateLogs from "./StoreDetailUpdateLogs";
import StoreDetailUpdatePricing from "./StoreDetailUpdatePricing";
import StoreUpdate from "./StoreUpdate";
import ResourceObjectPermission from "../../react-utils/components/ResourceObjectPermission";

export default ({match}) => {
  return (
      <Switch>
        <Route path={match.url} exact render={props => (
            <StoreList />
        )} />
        <Route path={match.url + '/update_pricing'} exact render={props => (
            <RequiredResources resources={['stores', 'categories']}>
              <StoreUpdate />
            </RequiredResources>
        )} />
        <Route path={match.url + '/update_logs'} exact render={props => (
            <RequiredResources resources={['stores', 'categories']}>
              <StoreUpdate />
            </RequiredResources>
        )} />
        <Route path={match.url + '/:id'} exact render={props => (
            <ResourceObjectPermission match={props.match} resource="stores" component={StoreDetail} />
        )} />
        <Route path={match.url + '/:id/update_logs'} exact render={props => (
            <RequiredResources resources={['categories']}>
              <ResourceObjectPermission match={props.match} resource="stores" permission="view_store_update_logs" component={StoreDetailUpdateLogs} />
            </RequiredResources>
        )} />
        <Route path={match.url + '/:id/update_pricing'} exact render={props => (
            <RequiredResources resources={['categories']}>
              <ResourceObjectPermission match={props.match} resource="stores" permission="update_store_pricing" component={StoreDetailUpdatePricing} />
            </RequiredResources>
        )} />
      </Switch>
  )
}