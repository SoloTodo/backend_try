import React from 'react'
import {Route, Switch} from "react-router-dom";
import RequiredResources from "../../react-utils/components/RequiredResources";
import CategoryDetailProducts from "./CategoryDetailProducts";
import CategoryDetail from "./CategoryDetail";
import CategoryList from "./CategoryList";
import CategoryDetailBrowse from "./CategoryDetailBrowse";
import ResourceObjectPermission from "../../react-utils/components/ResourceObjectPermission";
import Page404 from "../Pages/Page404";

export default ({match}) => {
  return (
      <Switch>
        <Route path={match.url} exact render={props => (
            <RequiredResources resources={['categories']}>
              <CategoryList />
            </RequiredResources>
        )} />
        <Route path={match.url + '/:id'} exact render={props => (
            <ResourceObjectPermission match={props.match} resource="categories" component={CategoryDetail} Http404={Page404} />
        )} />
        <Route path={match.url + '/:id/products'} exact render={props => (
            <RequiredResources resources={['stores']}>
              <ResourceObjectPermission match={props.match} resource="categories" component={CategoryDetailProducts} Http404={Page404} />
            </RequiredResources>
        )} />
        <Route path={match.url + '/:id/browse'} exact render={props => (
            <RequiredResources resources={['stores', 'countries']}>
              <ResourceObjectPermission match={props.match} resource="categories" component={CategoryDetailBrowse} Http404={Page404} />
            </RequiredResources>
        )} />
      </Switch>
  )
}