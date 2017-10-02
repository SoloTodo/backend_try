import React from 'react'
import {Route, Switch} from "react-router-dom";
import RequiredResources from "../../RequiredResources";
import LeadStats from "./LeadStats";
import LeadList from "./LeadList";

export default ({match}) => {
  return (
      <Switch>
        <Route path={match.url} exact render={props => (
            <RequiredResources resources={['stores', 'categories', 'api_clients']}>
              <LeadList />
            </RequiredResources>
        )} />
        <Route path={match.url + '/stats'} exact render={props => (
            <RequiredResources resources={['stores', 'categories', 'api_clients']}>
              <LeadStats />
            </RequiredResources>
        )} />
      </Switch>
  )
}