import React from 'react'
import {Route, Switch} from "react-router-dom";
import RequiredResources from "../../RequiredResources";
import UserList from "./UserList";
import ResourceObjectPermission from "../../auth/ResourceObjectPermission";
import UserDetail from "./UserDetail";
import UserDetailStaffSummary from "./UserDetailStaffSummary";
import UserDetailStaffActions from "./UserDetailStaffActions";

export default ({match}) => {
  return (
      <Switch>
        <Route path={match.url} exact render={props => (
            <RequiredResources resources={['users_with_staff_actions']}>
              <UserList />
            </RequiredResources>
        )} />
        <Route path={match.url + '/:id'} exact render={props => (
            <ResourceObjectPermission match={props.match} resource="users">
              <UserDetail />
            </ResourceObjectPermission>
        )} />
        <Route path={match.url + '/:id/staff_summary'} exact render={props => (
            <RequiredResources resources={['currencies']}>
              <ResourceObjectPermission match={props.match} resource="users">
                <UserDetailStaffSummary />
              </ResourceObjectPermission>
            </RequiredResources>
        )} />
        <Route path={match.url + '/:id/staff_actions'} exact render={props => (
            <ResourceObjectPermission match={props.match} resource="users">
              <UserDetailStaffActions />
            </ResourceObjectPermission>
        )} />
      </Switch>
  )
}