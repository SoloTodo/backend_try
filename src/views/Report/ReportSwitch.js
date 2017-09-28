import React from 'react'
import {Route, Switch} from "react-router-dom";
import RequiredResources from "../../RequiredResources";
import ReportCurrentPrices from "./ReportCurrentPrices";

export default ({match}) => {
  return (
      <Switch>
        <Route path={match.url + '/current_prices'} exact render={props => (
            <RequiredResources resources={['categories']}>
              <ReportCurrentPrices />
            </RequiredResources>
        )} />
      </Switch>
  )
}