import React, {Component} from 'react';
import { connect } from 'react-redux'
import { Route, Redirect } from 'react-router-dom'
import {settings} from "../settings";
import Loading from "../components/Loading";
import RequiredResourcesContainer from "../RequiredResourcesContainer";
import {injectIntl} from 'react-intl';

class PermissionRoute extends Component {
  render() {
    document.body.classList.add('sidebar-hidden');
    const {component:MyComponent, ...rest} = this.props;

    document.title = `${rest.intl.formatMessage({id: rest.title})} - SoloTodo`;

    if (typeof rest.permissions === 'undefined') {
      // Permissions haven't been set yet (waiting for fetch user), standby
      return <Loading />
    }

    if (rest.permissions.includes(rest.requiredPermission)) {
      return (
          <Route exact {...rest} render={props => {
            return <RequiredResourcesContainer {...rest} component={MyComponent}/>
          }}/>
      )
    } else {
      return <Redirect to={{
        pathname: '/',
        state: {from: this.props.location}
      }}/>
    }
  }
}

let mapStateToProps = (state) => {
  const user = state.apiResources[settings.ownUserUrl] || {};
  return {
    permissions: user.permissions,
    loadedResources: state.loadedResources
  }
};


export default injectIntl(connect(mapStateToProps)(PermissionRoute))