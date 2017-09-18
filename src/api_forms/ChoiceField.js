import React, {Component} from 'react'
import {UncontrolledTooltip} from "reactstrap";
import Select from "react-select";
import queryString from 'query-string';
import {createOption, createOptions} from "../form_utils";
import changeCase from 'change-case'

class ChoiceField extends Component {
  constructor(props) {
    super(props);

    this.state = {
      value: this.parseAndCleanValue()
    };
  }

  componentDidMount() {
    this.notifyNewParams()
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.urlParams !== nextProps.urlParams) {
      const value = this.parseAndCleanValue(nextProps.urlParams);
      this.setState({
        value
      }, this.notifyNewParams)
    }

    if (this.props.onApiParamChange !== nextProps.onApiParamChange) {
      this.notifyNewParams(nextProps)
    }
  }

  parseAndCleanValue = (urlParams=null) => {
    urlParams = urlParams ? urlParams : this.props.urlParams;

    const parameters = queryString.parse(urlParams);

    let choiceId = parameters[changeCase.snake(this.props.name)];

    if (Array.isArray(choiceId)) {
      choiceId = choiceId[0]
    }

    let value = this.props.choices.filter(choice => choice.id.toString() === choiceId)[0];

    if (!value) {
      value = this.props.choices[0]
    }

    return value
  };

  notifyNewParams(props) {
    props = props ? props : this.props;

    if (!props.onApiParamChange) {
      return;
    }

    const fieldName = changeCase.snake(props.name);
    const params = {[fieldName] : [this.state.value.id]};

    const result = {
      [this.props.name]: {
        apiParams: params,
        urlParams: params,
        fieldValues: this.state.value
      }
    };

    props.onApiParamChange(result)
  }

  handleValueChange = (val) => {
    this.setState({
      value: val.option
    }, this.notifyNewParams)
  };

  render() {
    const choices = createOptions(this.props.choices);
    const selectedValue = createOption(this.state.value);

    return <Select
        name={this.props.name}
        id={this.props.name}
        options={choices}
        value={selectedValue}
        onChange={this.handleValueChange}
        multi={false}
        placeholder={this.props.placeholder}
        searchable={this.props.searchable}
        clearable={false}
    />
  }
}

export default ChoiceField