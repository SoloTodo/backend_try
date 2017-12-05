import React from 'react'
import {Route, Switch} from "react-router-dom";
import RequiredResources from "../../RequiredResources";
import EntityList from "./EntityList";
import EntityDetail from "./EntityDetail";
import ResourceObjectPermission from "../../auth/ResourceObjectPermission";
import EntityDetailPricingHistory from "./EntityDetailPricingHistory";
import EntityDetailEvents from "./EntityDetailEvents";
import EntityConflicts from "./EntityConflicts";
import EntityEstimatedSales from "./EntityEstimatedSales";
import EntityDetailAssociate from "./EntityDetailAssociate";
import EntityPending from "./EntityPending";

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
            <ResourceObjectPermission match={props.match} resource="entities">
              <RequiredResources resources={['stores', 'categories', 'users_with_staff_actions']}>
                <EntityDetail />
              </RequiredResources>
            </ResourceObjectPermission>
        )} />
        <Route path={match.url + '/:id/pricing_history'} exact render={props => (
            <ResourceObjectPermission match={props.match} resource="entities">
              <RequiredResources resources={['stores']}>
                <EntityDetailPricingHistory />
              </RequiredResources>
            </ResourceObjectPermission>
        )} />
        <Route path={match.url + '/:id/events'} exact render={props => (
            <ResourceObjectPermission match={props.match} resource="entities">
              <EntityDetailEvents />
            </ResourceObjectPermission>
        )} />
        <Route path={match.url + '/:id/associate'} exact render={props => (
            <RequiredResources resources={['stores', 'categories']}>
              <ResourceObjectPermission match={props.match} resource="entities" permission={entity => entity.category.permissions.includes('is_category_staff') && entity.store.permissions.includes('is_store_staff')}>
                <EntityDetailAssociate />
              </ResourceObjectPermission>
            </RequiredResources>
        )} />
      </Switch>
  )
}