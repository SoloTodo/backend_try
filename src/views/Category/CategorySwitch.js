import React from 'react'
import {Route, Switch} from "react-router-dom";
import RequiredResources from "../../react-utils/components/RequiredResources";
import CategoryDetailProducts from "./CategoryDetailProducts";
import CategoryDetail from "./CategoryDetail";
import CategoryList from "./CategoryList";
import CategoryDetailBrowse from "./CategoryDetailBrowse";
import ResourceObjectPermission from "../../react-utils/components/ResourceObjectPermission";

export default ({match}) => {
  return (
      <Switch>
        <Route path={match.url} exact render={props => (
            <RequiredResources resources={['categories']}>
              <CategoryList />
            </RequiredResources>
        )} />
        <Route path={match.url + '/:id'} exact render={props => (
            <ResourceObjectPermission match={props.match} resource="categories" component={CategoryDetail} />
        )} />
        <Route path={match.url + '/:id/products'} exact render={props => (
            <RequiredResources resources={['stores']}>
              <ResourceObjectPermission match={props.match} resource="categories" component={CategoryDetailProducts} />
            </RequiredResources>
        )} />
        <Route path={match.url + '/:id/browse'} exact render={props => (
            <RequiredResources resources={['stores', 'countries']}>
              <ResourceObjectPermission match={props.match} resource="categories" component={CategoryDetailBrowse} />
            </RequiredResources>
        )} />
      </Switch>
  )
}