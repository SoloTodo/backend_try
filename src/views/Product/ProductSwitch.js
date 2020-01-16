import React from 'react'
import {Route, Switch} from "react-router-dom";
import ProductList from "./ProductList";
import RequiredResources from "../../react-utils/components/RequiredResources";
import ProductDetail from "./ProductDetail";
import ProductDetailEntities from "./ProductDetailEntities";
import ProductDetailWtbEntities from "./ProductDetailWtbEntities";
import ProductDetailPricingHistory from "./ProductDetailPricingHistory";
import ResourceObjectPermission from "../../react-utils/components/ResourceObjectPermission";
import Page404 from "../Pages/Page404";

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
              <ResourceObjectPermission match={props.match} resource="products" component={ProductDetail} Http404={Page404} />
            </RequiredResources>
        )} />
        <Route path={match.url + '/:id/pricing_history'} exact render={props => (
            <RequiredResources resources={['categories', 'stores', 'countries', 'currencies']}>
              <ResourceObjectPermission match={props.match} resource="products" component={ProductDetailPricingHistory} Http404={Page404} />
            </RequiredResources>
        )} />
        <Route path={match.url + '/:id/entities'} exact render={props => (
            <RequiredResources resources={['categories', 'stores']}>
              <ResourceObjectPermission match={props.match} resource="products" permission={product => product.category.permissions.includes('is_category_staff')} component={ProductDetailEntities} Http404={Page404} />
            </RequiredResources>
        )} />
        <Route path={match.url + '/:id/wtb_entities'} exact render={props => (
            <RequiredResources resources={['categories', 'stores']}>
              <ResourceObjectPermission match={props.match} resource="products" permission={product => product.category.permissions.includes('is_category_staff')} component={ProductDetailWtbEntities} Http404={Page404} />
            </RequiredResources>
        )} />
      </Switch>
  )
}