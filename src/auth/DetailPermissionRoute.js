import React, {Component} from 'react';
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom'
import { toast } from 'react-toastify';
import {
  addApiResourceDispatchToPropsUtils,
  addApiResourceStateToPropsUtils
} from "../ApiResource";
import {settings} from "../settings";
import Loading from "../components/Loading";
import RequiredResourcesContainer from "../RequiredResourcesContainer";
import Page404 from "../views/Pages/Page404/Page404";
import {FormattedMessage} from "react-intl";

class DetailPermissionRoute extends Component {
  constructor(props) {
    super(props);

    this.state = {
      resolved: false
    }
  }

  componentDidMount() {
    document.body.classList.add('sidebar-hidden');
    const id = this.props.computedMatch.params.id;
    const resourceObjectUrl = `${settings.apiResourceEndpoints[this.props.resource]}${id}/`;
    const resourceObject = this.props.apiResourceObjects[resourceObjectUrl];

    if (resourceObject) {
      this.setState({resolved: true})
    } else {
      this.props.fetchApiResourceObject(this.props.resource, id, this.props.dispatch)
          .then(json => {
            this.setState({resolved: true})
          })
    }
  }

  render = () => {
    let rest = {...this.props};
    delete rest['component'];
    const MyComponent = this.props['component'];

    const id = this.props.computedMatch.params.id;
    const resourceObjectUrl = `${settings.apiResourceEndpoints[this.props.resource]}${id}/`;
    const resourceObject = this.props.apiResourceObjects[resourceObjectUrl];
    const resolved = this.state.resolved;

    if (!resourceObject && !resolved) {
      // Object is currently fetching or resource endpoints have not been loaded
      return <Loading />
    } else if (!resourceObject && resolved) {
      // Object does not exist or the user has no permission over the objet at API level
      const redirectPath = this.props.redirectPath;

      toast.error(<FormattedMessage
          id="permission_denied_toast"
          defaultMessage="This resource does not exist or you don't have permission to access it." />, {
        autoClose: false
      });

      if (redirectPath) {
        return <Redirect to={{
          pathname: redirectPath,
          state: {from: this.props.location}
        }}/>
      } else {
        return <Page404 />
      }
    } else if (resourceObject.permissions && !resourceObject.permissions.includes(this.props.permission)) {
      // User has no permissions over the object at UI level (different from API level)
      return <Redirect to={{
        pathname: '/',
        state: {from: this.props.location}
      }}/>
    } else {
      document.title = `${resourceObject.name} - SoloTodo`;

      return (
          <RequiredResourcesContainer resourceObject={resourceObject} {...rest} component={MyComponent}/>
      )
    }
  }
}

let mapStateToProps = (state) => {
  return {
    apiResourceObjects: state.apiResourceObjects,
  }
};


export default connect(
    addApiResourceStateToPropsUtils(mapStateToProps),
    addApiResourceDispatchToPropsUtils())(DetailPermissionRoute)