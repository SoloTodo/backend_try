import React from 'react'
import {Route, Switch} from "react-router-dom";
import RequiredResources from "../../react-utils/components/RequiredResources";
import RatingList from "./RatingList";
import Page404 from "../Pages/Page404";
import ResourceObjectPermission from "../../react-utils/components/ResourceObjectPermission";
import RatingDetail from "./RatingDetail";
import RatingPendingList from "./RatingPendingList";

export default ({match}) => {
  return (
      <Switch>
        <Route path={match.url} exact render={props => (
            <RequiredResources resources={['categories', 'stores']}>
              <RatingList />
            </RequiredResources>
        )} />
        <Route path={match.url + '/pending'} exact render={props => (
            <RequiredResources resources={['categories', 'stores']}>
              <RatingPendingList />
            </RequiredResources>
        )} />
        <Route path={match.url + '/:id'} exact render={props => (
            <RequiredResources resources={['categories', 'stores']}>
              <ResourceObjectPermission match={props.match} resource="ratings" component={RatingDetail} Http404={Page404} />
            </RequiredResources>
        )} />

      </Switch>
  )
}