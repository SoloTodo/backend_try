import React from 'react'
import {Route, Switch} from "react-router-dom";
import ProductList from "./ProductList";
import RequiredResources from "../../RequiredResources";
import ResourceObjectPermission from "../../auth/ResourceObjectPermission";
import ProductDetail from "./ProductDetail";
import ProductDetailEntities from "./ProductDetailEntities";

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
              <RequiredResources resources={['categories', 'stores', 'users_with_staff_actions']}>
                <ProductDetail />
              </RequiredResources>
            </ResourceObjectPermission>
        )} />
        <Route path={match.url + '/:id/entities'} exact render={props => (
            <RequiredResources resources={['categories', 'stores']}>
              <ResourceObjectPermission match={props.match} resource="products" permission={product => product.category.permissions.includes('is_category_staff')}>
                <ProductDetailEntities />
              </ResourceObjectPermission>
            </RequiredResources>
        )} />
      </Switch>
  )
}