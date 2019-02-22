import React from 'react'
import {Route, Switch} from 'react-router-dom'
import BannerUpdateList from './BannerUpdateList'
import RequiredResources from "../../react-utils/components/RequiredResources";


export default ({match}) => {
  return(
    <Switch>
      <Route path={match.url} exact render={props => (
        <RequiredResources resources={['stores']}>
          <BannerUpdateList />
        </RequiredResources>
      )} />
    </Switch>
  )
}