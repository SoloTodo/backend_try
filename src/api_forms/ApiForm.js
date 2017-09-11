import React, {Component} from 'react'
import queryString from 'query-string';
import {FormattedMessage} from "react-intl";
import './ApiForm.css'

class ApiForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      formData: this.parseUrlArgs(window.location),
    }
  }

  parseUrlArgs = (location) => {
    const parameters = queryString.parse(location.search);

    return Object.keys(parameters).reduce((acum, fieldName) => ({
      ...acum,
      [fieldName]: {
        value: parameters[fieldName],
        apiParams: null,
      }
    }), {});
  };

  handleValueChange = (fieldName, fieldValue, apiParams) => {
    this.setState({
      formData: {
        ...this.state.formData,
        [fieldName]: {
          value: fieldValue,
          apiParams: apiParams
        }
      }
    }, () => {
      const shouldUpdateResults = Object.values(this.state.formData).every(
          entryFormData => {
            return Boolean(entryFormData.apiParams)
          });
      if (shouldUpdateResults) {
        this.updateSearchResults();
      }
    });
  };

  handleFormSubmit = (event) => {
    event && event.preventDefault();
    this.updateSearchResults(true)
  };

  updateSearchResults = (pushLocation=false) => {
    let search = '?';

    const formData = this.state.formData;

    for (const apiParamsDict of Object.values(formData)) {
      for (const apiParamKey of Object.keys(apiParamsDict.apiParams)) {
        for (const apiParamValue of apiParamsDict.apiParams[apiParamKey]) {
          search += `${apiParamKey}=${apiParamValue}&`
        }
      }
    }

    const endpoint = this.props.endpoint + search;

    this.props.fetchAuth(endpoint).then(json => {
      if (json.detail) {
        // An error happened
      } else {
        this.props.onResultsChange(json.results);
      }
    });

    console.log(search);

    // if (pushLocation) {
    //   const newRoute = this.props.history.location.pathname + search;
    //   this.props.history.push(newRoute)
    // }

  };

  render() {
    const childrenElems = React.Children.map(this.props.children, child => {
      const childrenFormData = this.state.formData[child.props.name];

      return React.cloneElement(child, {
        onValueChange: this.handleValueChange,
        value: childrenFormData && childrenFormData.value,
        validated: Boolean(childrenFormData && childrenFormData.apiParams)
      })
    });

    return <form>
      {childrenElems}
      <div className="col-12 col-sm-7 col-md-6 col-lg-12 col-xl-12">
        <label htmlFor="submit">&nbsp;</label>
        <button name="submit" id="submit" type="submit" className="btn btn-primary" onClick={this.handleFormSubmit}>
          <FormattedMessage id="search" defaultMessage={`Search`} />
        </button>
      </div>
    </form>
  }
}

export default ApiForm;