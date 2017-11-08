import React, {Component} from 'react';
import {connect} from "react-redux";
import {
  addApiResourceDispatchToPropsUtils,
  addApiResourceStateToPropsUtils
} from "./ApiResource";
import Loading from "./components/Loading";

class RequiredResources extends Component {
  componentDidMount() {
    this.componentUpdate(this.props)
  }

  componentWillReceiveProps(nextProps) {
    const oldResources = this.props.resources;
    const newResources = nextProps.resources;

    if (oldResources.length !== newResources.length || !oldResources.every((v, i)=> v === newResources[i])) {
      this.componentUpdate(nextProps);
    }
  }

  componentUpdate(props) {
    const requiredResources = props.resources || [];
    for (let requiredResource of requiredResources) {
      if (!props.loadedResources.includes(requiredResource)) {
        props.fetchApiResource(requiredResource, props.dispatch)
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
