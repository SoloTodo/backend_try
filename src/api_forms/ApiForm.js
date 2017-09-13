import React, {Component} from 'react'
import {FormattedMessage} from "react-intl";
import './ApiForm.css'
import {withRouter} from "react-router-dom";

class ApiForm extends Component {
  constructor(props) {
    super(props);

    const params = this.defaultParams();

    this.state = {
      apiParams: params,
      urlParams: params,
      fieldValues: params
    }
  }

  componentDidMount() {
    this.unlistenHistory = this.props.history.listen(this.onHistoryChange);
  }

  componentWillUnmount() {
    this.unlistenHistory();
  }

  componentWillReceiveProps(nextProps) {
    const fields = ['page', 'pageSize', 'ordering'];

    for (const field of fields) {
      if (this.props[field] !== nextProps[field]) {
        this.updateSearchResults(true, nextProps);
        break;
      }
    }
  }

  defaultParams = () => {
    let params = {};

    React.Children.map(this.props.children, child => {
      params[child.props.name] = undefined
    });

    return params;
  };

  resetState = () => {
    const params = this.defaultParams();

    this.setState({
      apiParams: params,
      urlParams: params,
      fieldValues: params
    })
  };

  onHistoryChange = (location, action) => {
    if (action !== 'POP') {
      return
    }

    this.resetState();
  };


  isFormValid = (state=null) => {
    state = state ? state : this.state;

    return Object.values(state.apiParams).every(
        param => {
          return typeof(param) !== 'undefined'
        });
  };

  handleApiParamChange = (fieldName, params) => {
    let wasValid = undefined;
    let isValid = undefined;
    this.setState(state => {
      wasValid = this.isFormValid(state);
      const newState = {
        apiParams: {
          ...state.apiParams,
          [fieldName]: params.apiParams
        },
        urlParams: {
          ...state.urlParams,
          [fieldName]: params.urlParams
        },
        fieldValues: {
          ...state.fieldValues,
          [fieldName]: params.fieldValues
        },
      };

      isValid = this.isFormValid(newState);
      return newState
    }, () => {
      if (!wasValid && isValid) {
        this.updateSearchResults();
      }
    });
  };

  handleFormSubmit = (event) => {
    event && event.preventDefault();

    if (this.props.page === 1) {
      this.updateSearchResults(true)
    } else {
      // Changing the page on our container will call componentWillReceiveProps
      // updating the results either way.
      this.props.onPageChange(1);
    }
  };

  updateSearchResults = (pushLocation=false, props=null) => {
    props = props ? props : this.props;

    this.props.onResultsChange(null);

    let apiSearch = '?';
    if (this.props.endpoint.indexOf('?') !== -1) {
      apiSearch = '&'
    }

    for (const apiParamsDict of Object.values(this.state.apiParams)) {
      for (const apiParamKey of Object.keys(apiParamsDict)) {
        for (const apiParamValue of apiParamsDict[apiParamKey]) {
          apiSearch += `${apiParamKey}=${apiParamValue}&`
        }
      }
    }

    const endpoint = props.endpoint + apiSearch + `ordering=${props.ordering}&page=${props.page}&page_size=${props.pageSize}`;

    props.fetchAuth(endpoint).then(json => {
      if (json.results) {
        props.onResultsChange({
          payload: json,
          fieldValues: this.state.fieldValues
        });
      } else {
        // an error happened
      }
    });

    if (pushLocation) {
      let urlSearch = '?';

      for (const urlParamsDict of Object.values(this.state.urlParams)) {
        for (const urlParamKey of Object.keys(urlParamsDict)) {
          for (const urlParamValue of urlParamsDict[urlParamKey]) {
            urlSearch += `${urlParamKey}=${urlParamValue}&`
          }
        }
      }

      const newRoute = props.history.location.pathname + urlSearch + `ordering=${props.ordering}&page=${props.page}&page_size=${props.pageSize}`;
      props.history.push(newRoute)
    }

  };

  render() {
    const childrenElems = React.Children.map(this.props.children, child => {
      const paramName = child ? child.props.name : '';
      return React.cloneElement(child, {
        onApiParamChange: params => this.handleApiParamChange(paramName, params),
        urlParams: window.location.search
      })
    });

    return <form>
      <div className="row" id="form-row">
        {childrenElems}
        <div className="col-12 col-sm-7 col-md-6 col-lg-12 col-xl-12">
          <label htmlFor="submit">&nbsp;</label>
          <button name="submit" id="submit" type="submit" className="btn btn-primary" onClick={this.handleFormSubmit}>
            <FormattedMessage id="search" defaultMessage={`Search`} />
          </button>
        </div>
      </div>
    </form>
  }
}

export default withRouter(ApiForm);