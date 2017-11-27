import React from 'react'
import {Route, Switch} from "react-router-dom";
import RequiredResources from "../../RequiredResources";
import ReportCurrentPrices from "./ReportCurrentPrices";
import ReportList from "./ReportList";

export default ({match}) => {
  return (
      <Switch>
        <Route path={match.url} exact render={props => (
            <RequiredResources resources={['reports']}>
              <ReportList />
            </RequiredResources>
        )} />
        <Route path={match.url + '/current_prices'} exact render={props => (
            <RequiredResources resources={['categories', 'stores', 'currencies', 'store_types', 'countries']}>
              <ReportCurrentPrices />
            </RequiredResources>
        )} />
      </Switch>
  )
}