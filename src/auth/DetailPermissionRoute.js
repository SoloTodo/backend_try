import React, {Component} from 'react';
import { connect } from 'react-redux'
import { Route, Redirect } from 'react-router-dom'
import {
  addApiResourceDispatchToPropsUtils,
  addApiResourceStateToPropsUtils
} from "../ApiResource";
import {settings} from "../settings";
import Loading from "../components/Loading";
import RequiredResourcesContainer from "../RequiredResourcesContainer";

class DetailPermissionRoute extends Component {
  constructor() {
    super();
    this.state = {
      resourceObject: undefined
    };
  }

  componentDidMount() {
    const resource = this.props.resource;
    const resourceObject = this.state.resourceObject;

    if (typeof resourceObject === 'undefined') {
      const id = this.props.computedMatch.params.id;
      const objUrl = `${settings.resourceEndpoints[resource]}${id}/`;
      let localResourceObject = this.props.apiResources[objUrl];
      if (localResourceObject) {
        this.setState({
          resourceObject: localResourceObject
        })
      } else {
        this.setState({
          resourceObject: null
        });

        this.props.fetchApiResourceObject(resource, id, this.props.dispatch)
            .then(json => {
              this.setState({
                resourceObject: json
              })
            });
      }
    }

  }

  render = () => {
    let rest = {...this.props};
    delete rest['component'];
    const MyComponent = this.props['component'];

    const resourceObject = this.state.resourceObject;

    if (resourceObject === null || typeof resourceObject === 'undefined') {
      // Object is currently fetching or resource endpoints have not been loaded
      return <Loading />
    } else if (!resourceObject.url) {
      // Object does not exist or the user has no permission over the objet at API level
      return <Redirect to={{
        pathname: '/404',
        state: {from: this.props.location}
      }}/>
    } else if (resourceObject.permissions && !resourceObject.permissions.includes(this.props.permission)) {
      // User has no permissions over the object at UI level (different from API level)
      return <Redirect to={{
        pathname: '/',
        state: {from: this.props.location}
      }}/>
    } else {
      document.title = `${resourceObject.name} - SoloTodo`;

      return (
          <Route exact {...rest} render={() => {
            return <RequiredResourcesContainer resourceObject={resourceObject} {...rest} component={MyComponent}/>
          }
          }/>)
    }
  }
}

let mapStateToProps = (state) => {
  return {
    apiResources: state.apiResources,
  }
};


export default connect(
    addApiResourceStateToPropsUtils(mapStateToProps),
    addApiResourceDispatchToPropsUtils())(DetailPermissionRoute)