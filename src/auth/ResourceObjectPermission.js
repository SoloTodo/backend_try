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
import {FormattedMessage} from "react-intl";

class ResourceObjectPermission extends Component {
  constructor(props) {
    super(props);

    this.state = {
      resolved: false
    }
  }

  componentDidMount() {
    if (this.props.apiResourceObject) {
      this.setState({resolved: true})
    } else {
      const id = this.props.match.params.id;
      this.props.fetchApiResourceObject(this.props.resource, id, this.props.dispatch)
          .then(json => {
            this.setState({resolved: true})
          })
    }
  }

  render = () => {
    const apiResourceObject = this.props.apiResourceObject;
    const resolved = this.state.resolved;

    if (!apiResourceObject && !resolved) {
      // Object is currently fetching or resource endpoints have not been loaded
      return <Loading />
    } else if (!apiResourceObject && resolved) {
      // Object does not exist or the user has no permission over the objet at API level
      const redirectPath = this.props.redirectPath;

      toast.error(<FormattedMessage
          id="permission_denied_toast"
          defaultMessage="This resource does not exist or you don't have permission to access it." />, {
        autoClose: false
      });

      return <Redirect to={{
        pathname: redirectPath || '/404'
      }}/>

    } else {
      // document.title = `${apiResourceObject.name} - SoloTodo`;

      const propsForChild = {
        apiResourceObject
      };

      return React.cloneElement(React.Children.only(this.props.children), propsForChild);
    }
  }
}

function mapStateToProps(state, ownProps) {
  const id = ownProps.match.params.id;
  const apiResourceObjectUrl = `${settings.apiResourceEndpoints[ownProps.resource]}${id}/`;

  return {
    apiResourceObject: state.apiResourceObjects[apiResourceObjectUrl],
  }
}


export default connect(
    addApiResourceStateToPropsUtils(mapStateToProps),
    addApiResourceDispatchToPropsUtils())(ResourceObjectPermission)