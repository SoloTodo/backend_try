import React, {Component} from 'react';
import { connect } from 'react-redux'
import { Route, Redirect } from 'react-router-dom'
import {
  addApiResourceDispatchToPropsUtils,
  addApiResourceStateToPropsUtils
} from "../ApiResource";

class DetailPermissionRoute extends Component {
  constructor() {
    super();
    this.resourceObject = undefined;
  }

  render = () => {
    let rest = {...this.props};
    delete rest['component'];
    const MyComponent = this.props['component'];

    const resource = this.props.resource;
    const resourceEndpoints = this.props.resourceEndpoints;

    if (this.resourceObject === null || !resourceEndpoints[resource]) {
      // Object is currently fetching or resource endpoints have not been loaded
      return <div/>
    }

    const id = this.props.computedMatch.params.id;
    const objUrl = `${resourceEndpoints[resource]}${id}/`;
    this.resourceObject = this.props.apiResources[objUrl];

    if (this.resourceObject) {
      if (this.resourceObject.permissions.includes(this.props.permission)) {
        return (
            <Route {...rest} render={props => {
              return <MyComponent resourceObject={this.resourceObject} {...rest}/>
            }
            }/>)
      } else {
        return <Redirect to={{
          pathname: '/',
          state: {from: this.props.location}
        }}/>
      }
    } else {
      if (typeof this.resourceObject === 'undefined') {
        this.props.fetchApiResourceObject(resource, id, this.props.dispatch);
        this.resourceObject = null;
      }
      return <div/>
    }
  }
}

let mapStateToProps = (state) => {
  return {
    apiResources: state.apiResources,
    resourceEndpoints: state.resourceEndpoints
  }
};


export default connect(
    addApiResourceStateToPropsUtils(mapStateToProps),
    addApiResourceDispatchToPropsUtils())(DetailPermissionRoute)