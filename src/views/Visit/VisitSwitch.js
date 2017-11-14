import React from 'react'
import {Route, Switch} from "react-router-dom";
import RequiredResources from "../../RequiredResources";
import VisitList from "./VisitList";
import VisitStats from "./VisitStats";

export default ({match}) => {
  return (
      <Switch>
        <Route path={match.url} exact render={props => (
            <RequiredResources resources={['categories', 'websites']}>
              <VisitList />
            </RequiredResources>
        )} />
        <Route path={match.url + '/stats'} exact render={props => (
            <RequiredResources resources={['categories', 'websites']}>
              <VisitStats />
            </RequiredResources>
        )} />
      </Switch>
  )
}