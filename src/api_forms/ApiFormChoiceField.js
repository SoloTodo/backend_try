import React, {Component} from 'react'
import Select from "react-select";
import queryString from 'query-string';
import {createOption, createOptions} from "../form_utils";
import changeCase from 'change-case'

class ApiFormChoiceField extends Component {
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

    let choiceIds = parameters[changeCase.snake(this.props.name)];

    if (this.props.multiple) {
      if (!Array.isArray(choiceIds)) {
        choiceIds = [choiceIds]
      }

      return this.props.choices
          .filter(choice => choiceIds.includes(choice.id.toString()));
    } else {
      const defaultValue =
          this.props.initial ? this.props.choices.filter(choice => choice.id.toString() === this.props.initial)[0]:
          this.props.required ? this.props.choices[0] :
          null;

      if (Array.isArray(choiceIds)) {
        choiceIds = choiceIds[0]
      }

      let value = this.props.choices.filter(choice => choice.id.toString() === choiceIds)[0];

      if (value) {
        return [value]
      } else if (defaultValue) {
        return [defaultValue]
      } else {
        return null
      }
    }
  };

  notifyNewParams(value, props) {
    props = props ? props : this.props;

    if (!props.onChange) {
      return;
    }

    const fieldName = changeCase.snake(props.name);

    const urlParams = {};
    if (value && props.urlField !== null) {
      urlParams[props.urlField || fieldName] = value.map(x => x.id)
    }

    const apiParams = value ? {[fieldName] : value.map(x => x.id)} : {};

    if (value && props.additionalApiFields) {
      for (const field of props.additionalApiFields) {
        const paramName = changeCase.snake(field);
        const paramValue = value.map(x => x[field]);
        if (paramValue.some(x => Boolean(x))) {
          apiParams[paramName] = paramValue
        }
      }
    }

    let fieldValues = null;
    if (this.props.multiple) {
      fieldValues = value
    } else if (value) {
      fieldValues = value[0]
    }

    const result = {
      [this.props.name]: {
        apiParams: apiParams,
        urlParams: urlParams,
        fieldValues: fieldValues
      }
    };

    props.onChange(result, Boolean(this.props.updateResultsOnChange))
  }

  handleValueChange = (vals) => {
    let sanitizedValue = null;
    if (this.props.multiple) {
      sanitizedValue = vals.map(val => val.option)
    } else if (vals) {
      sanitizedValue = [vals.option]
    }

    this.notifyNewParams(sanitizedValue)
  };

  render() {
    const choices = createOptions(this.props.choices);

    const selectedChoices = this.props.multiple ?
        createOptions(this.props.value || []) :
        this.props.value ? createOption(this.props.value) : null;

    if (this.props.hidden) {
      return null
    } else {
      return <Select
          name={this.props.name}
          id={this.props.name}
          options={choices}
          value={selectedChoices}
          onChange={this.handleValueChange}
          multi={this.props.multiple}
          placeholder={this.props.placeholder}
          searchable={this.props.searchable}
          clearable={!this.props.required}
          autoBlur={true}
      />
    }
  }
}

export default ApiFormChoiceField