import React from 'react'
import {Route, Switch} from 'react-router-dom'
import RequiredResources from "../../react-utils/components/RequiredResources";
import BannerAssetList from './BannerAssetList'
import BannerAssetDetail from './BannerAssetDetail'
import ResourceObjectPermission from "../../react-utils/components/ResourceObjectPermission";
import Page404 from "../Pages/Page404";
import BannerAssetListPending from "./BannerAssetListPending";


export default ({match}) => {
  return(
    <Switch>
      <Route path={match.url} exact render={props => (
        <BannerAssetList />
      )} />
      <Route path={match.url + '/pending'} exact render={props => (
        <BannerAssetListPending />
      )} />
      <Route path={match.url + '/:id'} exact render={props => (
        <RequiredResources resources={['categories', 'brands']}>
          <ResourceObjectPermission match={props.match} resource="banner_assets" component={BannerAssetDetail} Http404={Page404} />
        </RequiredResources>
      )}/>
    </Switch>
  )
}