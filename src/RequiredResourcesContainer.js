import React, {Component} from 'react';
import {connect} from "react-redux";
import {
  addApiResourceDispatchToPropsUtils,
  addApiResourceStateToPropsUtils
} from "./ApiResource";
import Loading from "./components/Loading";

class RequiredResourcesContainer extends Component {
  componentDidMount() {
    const requiredResources = this.props.requiredResources || [];
    for (let requiredResource of requiredResources) {
      if (!this.props.loadedResources.includes(requiredResource)) {
        this.props.fetchApiResource(requiredResource, this.props.dispatch)
      }
    }
  }

  render() {
    let {component:MyComponent, ...rest} = this.props;

    const requiredResources = this.props.requiredResources || [];
    for (let requiredResource of requiredResources) {
      if (!this.props.loadedResources.includes(requiredResource)) {
        return <Loading />
      }

      rest[requiredResource] = this.props.filterApiResourceObjectsByType(requiredResource)
    }

    return <MyComponent {...rest} />
  }
}

let mapStateToProps = (state) => {
  return {
    loadedResources: state.loadedResources,
  }
};


export default connect(
    addApiResourceStateToPropsUtils(mapStateToProps),
    addApiResourceDispatchToPropsUtils())(RequiredResourcesContainer);
