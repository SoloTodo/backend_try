import React from 'react'
import {Route, Switch} from "react-router-dom";
import ProductList from "./ProductList";
import RequiredResources from "../../RequiredResources";
import ResourceObjectPermission from "../../auth/ResourceObjectPermission";
import ProductDetail from "./ProductDetail";

export default ({match}) => {
  return (
      <Switch>
        <Route path={match.url} exact render={props => (
            <RequiredResources resources={['categories', 'stores']}>
              <ProductList />
            </RequiredResources>
        )} />
        <Route path={match.url + '/:id'} exact render={props => (
            <ResourceObjectPermission match={props.match} resource="products">
              <RequiredResources resources={['categories', 'users_with_staff_actions']}>
                <ProductDetail />
              </RequiredResources>
            </ResourceObjectPermission>
        )} />
      </Switch>
  )
}