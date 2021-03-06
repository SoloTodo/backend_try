import React from 'react'
import {Route, Switch} from "react-router-dom";
import RequiredResources from "../../react-utils/components/RequiredResources";
import ReportCurrentPrices from "./ReportCurrentPrices";
import ReportList from "./ReportList";
import ReportStoreAnalysis from "./ReportStoreAnalysis";
import ReportWeeklyPrices from "./ReportWeeklyPrices";
import ReportPricesHistory from "./ReportPricesHistory";
import ReportWebsitesTraffic from "./ReportWebsitesTraffic";
import ReportSecPrices from "./ReportSecPrices";
import ReportDailyPrices from "./ReportDailyPrices";

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
        <Route path={match.url + '/store_analysis'} exact render={props => (
            <RequiredResources resources={['categories', 'stores']}>
              <ReportStoreAnalysis />
            </RequiredResources>
        )} />
        <Route path={match.url + '/weekly_prices'} exact render={props => (
            <RequiredResources resources={['categories', 'stores']}>
              <ReportWeeklyPrices />
            </RequiredResources>
        )} />
        <Route path={match.url + '/prices_history'} exact render={props => (
            <RequiredResources resources={['categories', 'stores']}>
              <ReportPricesHistory />
            </RequiredResources>
        )} />
        <Route path={match.url + '/websites_traffic'} exact render={props => (
            <RequiredResources resources={['categories', 'stores', 'websites']}>
              <ReportWebsitesTraffic />
            </RequiredResources>
        )} />
        <Route path={match.url + '/sec_prices'} exact render={props => (
            <RequiredResources resources={['categories', 'stores']}>
              <ReportSecPrices />
            </RequiredResources>
        )} />
        <Route path={match.url + '/daily_prices'} exact render={props => (
            <RequiredResources resources={['categories', 'stores']}>
              <ReportDailyPrices />
            </RequiredResources>
        )} />
      </Switch>
  )
}