import React from 'react'
import {Route, Switch} from "react-router-dom";
import RequiredResources from "../../react-utils/components/RequiredResources";
import LeadStats from "./LeadStats";
import LeadList from "./LeadList";

export default ({match}) => {
  return (
      <Switch>
        <Route path={match.url} exact render={props => (
            <RequiredResources resources={['stores', 'categories', 'websites']}>
              <LeadList />
            </RequiredResources>
        )} />
        <Route path={match.url + '/stats'} exact render={props => (
            <RequiredResources resources={['stores', 'categories', 'websites']}>
              <LeadStats />
            </RequiredResources>
        )} />
      </Switch>
  )
}