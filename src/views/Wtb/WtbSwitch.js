import React from 'react'
import {Route, Switch} from "react-router-dom";
import RequiredResources from "../../react-utils/components/RequiredResources";
import WtbBrandList from "./WtbBrandList";
import WtbBrandDetail from "./WtbBrandDetail";
import WtbBrandDetailUpdateLogs from "./WtbBrandDetailUpdateLogs";
import WtbEntityList from "./WtbEntityList";
import WtbEntityDetail from "./WtbEntityDetail";
import WtbEntityDetailAssociate from "./WtbEntityDetailAssociate";
import WtbEntityPending from "./WtbEntityPending";
import ResourceObjectPermission from "../../react-utils/components/ResourceObjectPermission";

export default ({match}) => {
  return (
      <Switch>
        <Route path={match.url + '/brands'} exact render={props => (
            <RequiredResources resources={['wtb_brands']}>
              <WtbBrandList />
            </RequiredResources>
        )} />
        <Route path={match.url + '/brands/:id'} exact render={props => (
            <RequiredResources resources={['stores', 'websites']}>
              <ResourceObjectPermission match={props.match} resource="wtb_brands" permission="view_wtb_brand" component={WtbBrandDetail} />
            </RequiredResources>
        )} />
        <Route path={match.url + '/brands/:id/update_logs'} exact render={props => (
            <RequiredResources resources={['stores']}>
              <ResourceObjectPermission match={props.match} resource="wtb_brands" permission="view_wtb_brand" component={WtbBrandDetailUpdateLogs} />
            </RequiredResources>
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
            <RequiredResources resources={['wtb_brands', 'categories', 'users_with_staff_actions', 'websites']}>
              <ResourceObjectPermission match={props.match} resource="wtb_entities" component={WtbEntityDetail} />
            </RequiredResources>
        )} />
        <Route path={match.url + '/entities/:id/associate'} exact render={props => (
            <RequiredResources resources={['wtb_brands', 'categories', 'websites']}>
              <ResourceObjectPermission match={props.match} resource="wtb_entities" component={WtbEntityDetailAssociate} />
            </RequiredResources>
        )} />

      </Switch>
  )
}