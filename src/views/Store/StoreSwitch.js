import React from 'react'
import {Route, Switch} from "react-router-dom";
import StoreList from "./StoreList";
import RequiredResources from "../../RequiredResources";
import ResourceObjectPermission from "../../auth/ResourceObjectPermission";
import StoreDetail from "./StoreDetail";

export default ({match}) => {
  return (
      <Switch>
        <Route path={match.url} exact render={props => (
            <RequiredResources resources={['stores']}>
              <StoreList />
            </RequiredResources>
        )} />
        <Route path={match.url + '/:id'} render={props => (
            <ResourceObjectPermission match={props.match} resource="stores" permission="view_store">
              <RequiredResources resources={['stores']}>
                <StoreDetail />
              </RequiredResources>
            </ResourceObjectPermission>
        )} />
      </Switch>
  )
}