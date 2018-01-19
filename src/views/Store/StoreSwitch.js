import React from 'react'
import {Route, Switch} from "react-router-dom";
import StoreList from "./StoreList";
import RequiredResources from "../../react-utils/components/RequiredResources";
import ResourceObjectPermission from "../../auth/ResourceObjectPermission";
import StoreDetail from "./StoreDetail";
import StoreDetailUpdateLogs from "./StoreDetailUpdateLogs";
import StoreDetailUpdatePricing from "./StoreDetailUpdatePricing";
import StoreUpdate from "./StoreUpdate";

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
            <ResourceObjectPermission match={props.match} resource="stores">
              <StoreDetail />
            </ResourceObjectPermission>
        )} />
        <Route path={match.url + '/:id/update_logs'} exact render={props => (
            <ResourceObjectPermission match={props.match} resource="stores" permission="view_store_update_logs">
              <RequiredResources resources={['categories']}>
                <StoreDetailUpdateLogs />
              </RequiredResources>
            </ResourceObjectPermission>
        )} />
        <Route path={match.url + '/:id/update_pricing'} exact render={props => (
            <ResourceObjectPermission match={props.match} resource="stores" permission="update_store_pricing">
              <RequiredResources resources={['categories']}>
                <StoreDetailUpdatePricing />
              </RequiredResources>
            </ResourceObjectPermission>
        )} />
      </Switch>
  )
}