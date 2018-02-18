import React from 'react'
import {Route, Switch} from "react-router-dom";
import RequiredResources from "../../react-utils/components/RequiredResources";
import UserList from "./UserList";
import UserDetail from "./UserDetail";
import UserDetailStaffSummary from "./UserDetailStaffSummary";
import UserDetailStaffActions from "./UserDetailStaffActions";
import ResourceObjectPermission from "../../react-utils/components/ResourceObjectPermission";

export default ({match}) => {
  return (
      <Switch>
        <Route path={match.url} exact render={props => (
            <RequiredResources resources={['users_with_staff_actions']}>
              <UserList />
            </RequiredResources>
        )} />
        <Route path={match.url + '/:id'} exact render={props => (
            <ResourceObjectPermission match={props.match} resource="users" component={UserDetail} />
        )} />
        <Route path={match.url + '/:id/staff_summary'} exact render={props => (
            <RequiredResources resources={['currencies']}>
              <ResourceObjectPermission match={props.match} resource="users" component={UserDetailStaffSummary} />
            </RequiredResources>
        )} />
        <Route path={match.url + '/:id/staff_actions'} exact render={props => (
            <ResourceObjectPermission match={props.match} resource="users" component={UserDetailStaffActions} />
        )} />
      </Switch>
  )
}