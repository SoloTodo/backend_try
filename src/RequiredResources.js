import React, {Component} from 'react';
import {connect} from "react-redux";
import {
  addApiResourceDispatchToPropsUtils,
  addApiResourceStateToPropsUtils
} from "./ApiResource";
import Loading from "./components/Loading";

class RequiredResources extends Component {
  componentDidMount() {
    const requiredResources = this.props.resources || [];
    for (let requiredResource of requiredResources) {
      if (!this.props.loadedResources.includes(requiredResource)) {
        this.props.fetchApiResource(requiredResource, this.props.dispatch)
      }
    }
  }

  render() {
    const additionalChildProps = {};

    const requiredResources = this.props.resources || [];
    for (let requiredResource of requiredResources) {
      if (!this.props.loadedResources.includes(requiredResource)) {
        return <Loading />
      }

      additionalChildProps[requiredResource] = this.props.filterApiResourceObjectsByType(requiredResource);
    }

    // May or may not be, in the worst case it wil be "undefined"
    additionalChildProps.apiResourceObject = this.props.apiResourceObject;

    return React.cloneElement(React.Children.only(this.props.children), {...additionalChildProps});
  }
}

let mapStateToProps = (state) => {
  return {
    loadedResources: state.loadedResources,
  }
};


export default connect(
    addApiResourceStateToPropsUtils(mapStateToProps),
    addApiResourceDispatchToPropsUtils())(RequiredResources);
