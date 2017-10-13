import React, {Component} from 'react'
import queryString from 'query-string';
import changeCase from 'change-case'
import {DebounceInput} from 'react-debounce-input';

class ApiFormTextField extends Component {
  componentDidMount() {
    this.notifyNewParams(this.parseValueFromUrl())
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.onChange !== nextProps.onChange) {
      this.notifyNewParams(this.parseValueFromUrl(), nextProps)
    }

    if (typeof(nextProps.value) === 'undefined') {
      this.notifyNewParams(this.parseValueFromUrl())
    }
  }

  parseValueFromUrl = () => {
    const parameters = queryString.parse(window.location.search);

    let value = parameters[changeCase.snake(this.props.name)];

    if (Array.isArray(value)) {
      value = value[0]
    }

    return value ? value : this.props.initial || '';
  };

  notifyNewParams(value, props) {
    props = props ? props : this.props;

    if (!props.onChange) {
      return;
    }

    const fieldName = changeCase.snake(props.name);

    const urlParams = {};
    if (value && props.urlField !== null) {
      urlParams[props.urlField || fieldName] = [value]
    }

    const apiParams = value ? {[fieldName]: [value]} : {};

    const result = {
      [this.props.name]: {
        apiParams: apiParams,
        urlParams: urlParams,
        fieldValues: value
      }
    };

    props.onChange(result, Boolean(this.props.updateResultsOnChange))
  }

  handleValueChange = evt => {
    evt.preventDefault();
    this.notifyNewParams(evt.target.value)
  };

  render() {
    const value = this.props.value ? this.props.value : '';
    const debounceTimeout = this.props.debounceTimeout || 0;

    return (
        <DebounceInput
            type="text"
            name={this.props.name}
            id={this.props.name}
            className="form-control"
            debounceTimeout={debounceTimeout}
            onChange={this.handleValueChange}
            value={value}
        />
    )
  }
}

export default ApiFormTextField