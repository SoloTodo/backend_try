import React from 'react'
import {Route, Switch} from "react-router-dom";
import ProductList from "./ProductList";
import RequiredResources from "../../react-utils/components/RequiredResources";
import ProductDetail from "./ProductDetail";
import ProductDetailEntities from "./ProductDetailEntities";
import ProductDetailPricingHistory from "./ProductDetailPricingHistory";
import ResourceObjectPermission from "../../react-utils/components/ResourceObjectPermission";

export default ({match}) => {
  return (
      <Switch>
        <Route path={match.url} exact render={props => (
            <RequiredResources resources={['categories', 'stores']}>
              <ProductList />
            </RequiredResources>
        )} />
        <Route path={match.url + '/:id'} exact render={props => (
            <RequiredResources resources={['categories', 'stores', 'users_with_staff_actions', 'websites']}>
              <ResourceObjectPermission match={props.match} resource="products" component={ProductDetail} />
            </RequiredResources>
        )} />
        <Route path={match.url + '/:id/pricing_history'} exact render={props => (
            <RequiredResources resources={['categories', 'stores', 'countries', 'currencies']}>
              <ResourceObjectPermission match={props.match} resource="products" component={ProductDetailPricingHistory} />
            </RequiredResources>
        )} />
        <Route path={match.url + '/:id/entities'} exact render={props => (
            <RequiredResources resources={['categories', 'stores']}>
              <ResourceObjectPermission match={props.match} resource="products" permission={product => product.category.permissions.includes('is_category_staff')} component={ProductDetailEntities} />
            </RequiredResources>
        )} />
      </Switch>
  )
}