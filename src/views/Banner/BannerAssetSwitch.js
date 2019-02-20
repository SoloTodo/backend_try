import React from 'react'
import {Route, Switch} from 'react-router-dom'
import RequiredResources from "../../react-utils/components/RequiredResources";
import BannerAssetList from './BannerAssetList'
import BannerAssetDetail from './BannerAssetDetail'

export default ({match}) => {
  return(
    <Switch>
      <Route path={match.url} exact render={props => (
        <BannerAssetList />
      )} />
      <Route path={match.url + '/:id'} exact render={props => (
        <RequiredResources resources={['categories']}>
          <BannerAssetDetail />
        </RequiredResources>
      )}/>
    </Switch>
  )
}