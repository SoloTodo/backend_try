import React from 'react'
import {Route, Switch} from 'react-router-dom'
import RequiredResources from "../../react-utils/components/RequiredResources";
import BannerList from './BannerList'

export default ({match}) => {
  return(
    <Switch>
      <Route path={match.url} exact render={props => (
        <RequiredResources resources={['stores', 'brands', 'categories', 'banner_subsection_types']}>
          <BannerList />
        </RequiredResources>
      )} />
    </Switch>
  )
}