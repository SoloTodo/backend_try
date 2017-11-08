import React, {Component} from 'react';
import { connect } from 'react-redux'
import { toast } from 'react-toastify';
import {
  addApiResourceDispatchToPropsUtils,
  addApiResourceStateToPropsUtils
} from "../ApiResource";
import {settings} from "../settings";
import Loading from "../components/Loading";
import {FormattedMessage} from "react-intl";

class ResourceObjectPermission extends Component {
  componentDidMount() {
    this.componentUpdate(this.props)
  }

  componentWillReceiveProps(nextProps) {
    this.componentUpdate(nextProps);
  }

  componentUpdate(props) {
    if (!props.apiResourceObject) {
      const id = props.match.params.id;
      props.fetchApiResourceObject(props.resource, id, props.dispatch).catch(err => {
        toast.error(<FormattedMessage
            id="permission_denied_toast"
            defaultMessage="This resource does not exist or you don't have permission to access it." />, {
          autoClose: false
        });
      })
    }
  }

  render = () => {
    const apiResourceObject = this.props.apiResourceObject;

    if (!apiResourceObject) {
      // Object is currently fetching or resource endpoints have not been loaded
      return <Loading />
    } else {
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