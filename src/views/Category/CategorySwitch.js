import React from 'react'
import {Route, Switch} from "react-router-dom";
import RequiredResources from "../../RequiredResources";
import CategoryDetailProducts from "./CategoryDetailProducts";
import ResourceObjectPermission from "../../auth/ResourceObjectPermission";
import CategoryDetail from "./CategoryDetail";
import CategoryList from "./CategoryList";

export default ({match}) => {
  return (
      <Switch>
        <Route path={match.url} exact render={props => (
            <RequiredResources resources={['categories']}>
              <CategoryList />
            </RequiredResources>
        )} />
        <Route path={match.url + '/:id'} exact render={props => (
            <ResourceObjectPermission match={props.match} resource="categories">
              <CategoryDetail />
            </ResourceObjectPermission>
        )} />
        <Route path={match.url + '/:id/products'} exact render={props => (
            <ResourceObjectPermission match={props.match} resource="categories">
              <RequiredResources resources={['stores']}>
                <CategoryDetailProducts />
              </RequiredResources>
            </ResourceObjectPermission>
        )} />
      </Switch>
  )
}