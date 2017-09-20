import React from 'react'
import {Route, Switch} from "react-router-dom";
import RequiredResources from "../../RequiredResources";
import EntityList from "./EntityList";
import EntityDetail from "./EntityDetail";
import ResourceObjectPermission from "../../auth/ResourceObjectPermission";
import EntityDetailPricingHistory from "./EntityDetailPricingHistory";

export default ({match}) => {
  return (
      <Switch>
        <Route path={match.url} exact render={props => (
            <RequiredResources resources={['categories', 'stores']}>
              <EntityList />
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
                <EntityDetailPricingHistory />
            </ResourceObjectPermission>
        )} />
      </Switch>
  )
}