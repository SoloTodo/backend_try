import React, {Component} from 'react'
import Select from "react-select";
import queryString from 'query-string';
import {createOption, createOptions} from "../form_utils";
import changeCase from 'change-case'

class ApiFormChoiceField extends Component {
  componentWillMount() {
    this.notifyNewParams(this.parseValueFromUrl())
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.onChange !== nextProps.onChange) {
      this.notifyNewParams(this.parseValueFromUrl(), nextProps)
    }

    if (typeof(nextProps.value) === 'undefined') {
      this.notifyNewParams(this.parseValueFromUrl())
    }

    if (typeof(this.props.choices) === 'undefined' && typeof(nextProps.choices) !== 'undefined') {
      // this.notifyNewParams(this.parseValueFromUrl(nextProps))
    }
  }

  parseValueFromUrl = (props) => {
    props = props || this.props;

    const parameters = queryString.parse(window.location.search);

    const urlField = props.urlField || changeCase.snake(props.name);
    let valueIds = parameters[urlField];

    if (props.multiple) {
      if (!valueIds) {
        valueIds = []
      } else if (!Array.isArray(valueIds)) {
        valueIds = [valueIds]
      }

      valueIds = valueIds
          .filter(choiceId => Boolean(parseInt(choiceId, 10)))
          .map(choiceId => parseInt(choiceId, 10));

      if (props.choices) {
        return props.choices
            .filter(choice => valueIds.includes(choice.id))
      } else {
        return valueIds.map(valueId => ({id: valueId, name: ''}))
      }
    } else {
      let valueId = undefined;

      if (!valueIds) {
        valueId = null;
      } else if (Array.isArray(valueIds)) {
        valueId = valueIds[0]
      } else {
        valueId = valueIds
      }

      const initialValueId =
          props.initial ? props.initial :
              props.required ? props.choices[0].id : null;

      if (!valueId) {
        valueId = initialValueId
      }

      let value = undefined;

      if (valueId === null) {
        value = null
      } else if (props.choices) {
        value = props.choices.filter(choice => choice.id === valueId)[0];
      } else {
        value = {id: valueId, name: ''}
      }

      return value
    }
  };

  notifyNewParams(valueOrValues, props) {
    props = props ? props : this.props;

    if (!props.onChange) {
      return;
    }

    let values = undefined;

    if (valueOrValues) {
      if (Array.isArray(valueOrValues)) {
        values = valueOrValues
      } else {
        values = [valueOrValues]
      }
    } else {
      values = []
    }

    const valueIds = values.map(value => value.id);
    const fieldName = changeCase.snake(props.name);

    const urlParams = {};
    if (values.length && props.urlField !== null) {
      urlParams[props.urlField || fieldName] = valueIds
    }

    const apiParams = {};
    if (values.length && props.apiField !== null) {
      apiParams[props.apiField || fieldName] = valueIds
    }

    if (values.length && props.additionalApiFields) {
      for (const field of props.additionalApiFields) {
        const paramName = changeCase.snake(field);
        const paramValue = values.map(x => x[field]);
        if (paramValue.some(x => Boolean(x))) {
          apiParams[paramName] = paramValue
        }
      }
    }

    const result = {
      [this.props.name]: {
        apiParams: apiParams,
        urlParams: urlParams,
        fieldValues: valueOrValues
      }
    };

    props.onChange(result, Boolean(this.props.updateResultsOnChange))
  }

  handleValueChange = (vals) => {
    let sanitizedValue = null;
    if (this.props.multiple) {
      sanitizedValue = vals.map(val => val.option)
    } else if (vals) {
      sanitizedValue = vals.option
    }

    this.notifyNewParams(sanitizedValue)
  };

  render() {
    let propsValue = this.props.value;

    const choices = this.props.choices || [];

    let widgetValue = undefined;

    if (this.props.multiple) {
      widgetValue = [];

      for (const value of propsValue || []) {
        const matchingChoice = choices.filter(choice => choice.id === value.id)[0];
        const sanitizedValue = {...value, docCount: 0};
        if (matchingChoice) {
          sanitizedValue.name = matchingChoice.name;
          sanitizedValue.docCount = matchingChoice.doc_count;
        }

        widgetValue.push(sanitizedValue)
      }
    } else {
      if (propsValue) {
        const matchingChoice = choices.filter(choice => choice.id === propsValue.id)[0];
        const sanitizedValue = {...propsValue, docCount: 0};
        if (matchingChoice) {
          sanitizedValue.name = matchingChoice.name;
          sanitizedValue.docCount = matchingChoice.doc_count;
        }
        widgetValue = sanitizedValue
      } else {
        widgetValue = null
      }
    }

    const selectedChoices = this.props.multiple ?
        createOptions(widgetValue) :
        widgetValue ? createOption(widgetValue) : null;


    if (this.props.hidden) {
      return null
    } else {
      return <Select
          name={this.props.name}
          id={this.props.name}
          options={createOptions(this.props.choices || [])}
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