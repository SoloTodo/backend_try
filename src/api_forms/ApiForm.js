import React, {Component} from 'react'
import './ApiForm.css'
import {withRouter} from "react-router-dom";
import {listToObject} from "../utils";
import {addApiResourceStateToPropsUtils} from "../ApiResource";
import {connect} from "react-redux";

class ApiForm extends Component {
  constructor(props) {
    super(props);

    this.state = this.defaultState();
  }

  componentWillMount() {
    this.props.setValueChangeHandler(this.handleApiParamChange);
  }

  componentDidMount() {
    this.unlistenHistory = this.props.history.listen(this.onHistoryChange);
  }

  componentWillUnmount() {
    this.unlistenHistory();
  }

  componentWillReceiveProps(nextProps) {
    const currentObservedObjects = this.props.observedObjects || [];

    const currentObservedObjectsDict = listToObject(currentObservedObjects, 'id');
    const nextObservedObjectsDict = listToObject(nextProps.observedObjects || [], 'id');

    const commonObservedObjectIds = currentObservedObjects
        .filter(object => currentObservedObjectsDict[object.id] && nextObservedObjectsDict[object.id])
        .map(object => object.id);

    const changedObjects = [];

    for (const commonObservedObjectId of commonObservedObjectIds) {
      const currentObject = currentObservedObjectsDict[commonObservedObjectId];
      const nextObject = nextObservedObjectsDict[commonObservedObjectId];

      if (currentObject[this.props.observedObjectsField] !== nextObject[this.props.observedObjectsField]) {
        changedObjects.push({
          currentObject: currentObject,
          nextObject: nextObject
        });
      }
    }

    if (changedObjects.length) {
      this.props.onObservedObjectChange(changedObjects);
      this.updateSearchResults();
    }
  }

  defaultState = () => {
    let params = {};

    for (const field of this.props.fields) {
      params[field] = null
    }

    return params;
  };

  resetState = () => {
    this.setState(this.defaultState())
  };

  onHistoryChange = (location, action) => {
    if (action !== 'POP') {
      return
    }

    this.resetState();
  };


  isFormValid = (state=null) => {
    state = state ? state : this.state;

    return Object.values(state).every(
        param => {
          return Boolean(param)
        });
  };

  handleApiParamChange = (updatedFieldsData={}, updateOnFinish=false) => {
    let wasValid = undefined;
    let isValid = undefined;
    this.setState(state => {
      wasValid = this.isFormValid(state);

      const newState = {
        ...state,
        ...updatedFieldsData
      };

      isValid = this.isFormValid(newState);
      return newState
    }, () => {

      if (!wasValid && isValid) {
        this.updateSearchResults();
      } else if (isValid && updateOnFinish) {
        this.updateSearchResults(true)
      }
    });
  };

  updateSearchResults = (pushLocation=false, props=null) => {
    props = props ? props : this.props;

    props.onResultsChange(null);

    let pageAndOrderingParams = '';

    if (props.page) {
      pageAndOrderingParams += `page=${props.page}&`
    }

    if (props.pageSize) {
      pageAndOrderingParams += `page_size=${props.pageSize}&`;
    }

    if (props.ordering) {
      pageAndOrderingParams += `ordering=${props.ordering}&`;
    }

    let apiSearch = '?';
    if (props.endpoint.indexOf('?') !== -1) {
      apiSearch = '&'
    }

    let urlSearch = '?';

    for (const fieldName of Object.keys(this.state)) {
      for (const apiParamKey of Object.keys(this.state[fieldName].apiParams)) {
        for (const apiParamValue of this.state[fieldName].apiParams[apiParamKey]) {
          apiSearch += `${apiParamKey}=${apiParamValue}&`
        }
      }

      for (const urlParamKey of Object.keys(this.state[fieldName].urlParams)) {
        for (const urlParamValue of this.state[fieldName].urlParams[urlParamKey]) {
          urlSearch += `${urlParamKey}=${urlParamValue}&`
        }
      }
    }

    const endpoint = props.endpoint + apiSearch + pageAndOrderingParams;

    props.fetchAuth(endpoint).then(json => {
      const fieldValues = {};
      for (const fieldName of Object.keys(this.state)) {
        fieldValues[fieldName] = this.state[fieldName].fieldValues
      }

      props.onResultsChange({
        payload: json,
        fieldValues
      });
    });

    if (pushLocation) {
      const newRoute = props.history.location.pathname + urlSearch + pageAndOrderingParams;
      props.history.push(newRoute)
    }

  };

  render() {
    return <form>
      {this.props.children}
    </form>
  }
}

export default withRouter(connect(addApiResourceStateToPropsUtils())(ApiForm));