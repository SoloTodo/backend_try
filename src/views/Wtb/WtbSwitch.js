import React from 'react'
import {Route, Switch} from "react-router-dom";
import RequiredResources from "../../RequiredResources";
import WtbBrandList from "./WtbBrandList";
import ResourceObjectPermission from "../../auth/ResourceObjectPermission";
import WtbBrandDetail from "./WtbBrandDetail";
import WtbBrandDetailUpdateLogs from "./WtbBrandDetailUpdateLogs";
import WtbEntityList from "./WtbEntityList";
import WtbEntityDetail from "./WtbEntityDetail";
import WtbEntityDetailAssociate from "./WtbEntityDetailAssociate";
import WtbEntityPending from "./WtbEntityPending";

export default ({match}) => {
  return (
      <Switch>
        <Route path={match.url + '/brands'} exact render={props => (
            <RequiredResources resources={['wtb_brands']}>
              <WtbBrandList />
            </RequiredResources>
        )} />
        <Route path={match.url + '/brands/:id'} exact render={props => (
            <ResourceObjectPermission match={props.match} resource="wtb_brands" permission="view_wtb_brand">
              <RequiredResources resources={['stores', 'websites']}>
                <WtbBrandDetail />
              </RequiredResources>
            </ResourceObjectPermission>
        )} />
        <Route path={match.url + '/brands/:id/update_logs'} exact render={props => (
            <ResourceObjectPermission match={props.match} resource="wtb_brands" permission="view_wtb_brand">
              <RequiredResources resources={['stores']}>
                <WtbBrandDetailUpdateLogs />
              </RequiredResources>
            </ResourceObjectPermission>
        )} />
        <Route path={match.url + '/entities'} exact render={props => (
            <RequiredResources resources={['wtb_brands', 'categories']}>
              <WtbEntityList />
            </RequiredResources>
        )} />
        <Route path={match.url + '/entities/pending'} exact render={props => (
            <RequiredResources resources={['wtb_brands', 'categories']}>
              <WtbEntityPending />
            </RequiredResources>
        )} />
        <Route path={match.url + '/entities/:id'} exact render={props => (
            <ResourceObjectPermission match={props.match} resource="wtb_entities">
              <RequiredResources resources={['wtb_brands', 'categories', 'users_with_staff_actions', 'websites']}>
                <WtbEntityDetail />
              </RequiredResources>
            </ResourceObjectPermission>
        )} />
        <Route path={match.url + '/entities/:id/associate'} exact render={props => (
            <ResourceObjectPermission match={props.match} resource="wtb_entities">
              <RequiredResources resources={['wtb_brands', 'categories', 'websites']}>
                <WtbEntityDetailAssociate />
              </RequiredResources>
            </ResourceObjectPermission>
        )} />

      </Switch>
  )
}