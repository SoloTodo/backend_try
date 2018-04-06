import React from 'react'
import {Route, Switch} from "react-router-dom";
import RequiredResources from "../../react-utils/components/RequiredResources";
import EntityList from "./EntityList";
import EntityDetail from "./EntityDetail";
import EntityDetailPricingHistory from "./EntityDetailPricingHistory";
import EntityDetailEvents from "./EntityDetailEvents";
import EntityConflicts from "./EntityConflicts";
import EntityEstimatedSales from "./EntityEstimatedSales";
import EntityDetailAssociate from "./EntityDetailAssociate";
import EntityPending from "./EntityPending";
import ResourceObjectPermission from "../../react-utils/components/ResourceObjectPermission";
import Page404 from "../Pages/Page404";

export default ({match}) => {
  return (
      <Switch>
        <Route path={match.url} exact render={props => (
            <RequiredResources resources={['categories', 'stores']}>
              <EntityList />
            </RequiredResources>
        )} />
        <Route path={match.url + '/pending'} exact render={props => (
            <RequiredResources resources={['categories', 'stores']}>
              <EntityPending />
            </RequiredResources>
        )} />
        <Route path={match.url + '/conflicts'} exact render={props => (
            <RequiredResources resources={['categories', 'stores']}>
              <EntityConflicts />
            </RequiredResources>
        )} />
        <Route path={match.url + '/estimated_sales'} exact render={props => (
            <RequiredResources resources={['categories', 'stores']}>
              <EntityEstimatedSales />
            </RequiredResources>
        )} />
        <Route path={match.url + '/:id'} exact render={props => (
            <RequiredResources resources={['stores', 'categories', 'users_with_staff_actions']}>
              <ResourceObjectPermission match={props.match} resource="entities" component={EntityDetail} Http404={Page404} />
            </RequiredResources>
        )} />
        <Route path={match.url + '/:id/pricing_history'} exact render={props => (
              <RequiredResources resources={['stores']}>
                <ResourceObjectPermission match={props.match} resource="entities" component={EntityDetailPricingHistory} Http404={Page404} />
              </RequiredResources>
        )} />
        <Route path={match.url + '/:id/events'} exact render={props => (
            <ResourceObjectPermission match={props.match} resource="entities" component={EntityDetailEvents} Http404={Page404} />
        )} />
        <Route path={match.url + '/:id/associate'} exact render={props => (
            <RequiredResources resources={['stores', 'categories']}>
              <ResourceObjectPermission match={props.match} resource="entities" permission={entity => entity.category.permissions.includes('is_category_staff')} component={EntityDetailAssociate} Http404={Page404} />
            </RequiredResources>
        )} />
      </Switch>
  )
}