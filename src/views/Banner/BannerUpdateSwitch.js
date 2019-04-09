import React from 'react'
import {Route, Switch} from 'react-router-dom'
import BannerUpdateList from './BannerUpdateList'
import RequiredResources from "../../react-utils/components/RequiredResources";
import BannerUpdateLatest from "./BannerUpdateLatest";


export default ({match}) => {
  return(
    <Switch>
      <Route path={match.url} exact render={props => (
        <RequiredResources resources={['stores']}>
          <BannerUpdateList />
        </RequiredResources>
      )} />
      <Route path={`${match.url}/latest`} exact render={props => (
        <RequiredResources resources={['stores']}>
          <BannerUpdateLatest />
        </RequiredResources>
      )} />
    </Switch>
  )
}