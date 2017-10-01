import React from 'react'
import {Route, Switch} from "react-router-dom";
import RequiredResources from "../../RequiredResources";
import LeadStats from "./LeadStats";

export default ({match}) => {
  return (
      <Switch>
        <Route path={match.url + '/stats'} exact render={props => (
            <RequiredResources resources={['stores', 'categories']}>
              <LeadStats />
            </RequiredResources>
        )} />
      </Switch>
  )
}