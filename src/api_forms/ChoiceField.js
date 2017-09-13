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

  componentWillMount() {
    this.notifyNewParams()
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.urlParams !== nextProps.urlParams) {
      const value = this.parseAndCleanValue(nextProps.urlParams);
      this.setState({
        value
      }, this.notifyNewParams)
    }
  }

  parseAndCleanValue = (urlParams=null) => {
    urlParams = urlParams ? urlParams : this.props.urlParams;

    const parameters = queryString.parse(urlParams);

    let choiceId = parameters[changeCase.snake(this.props.name)];

    if (Array.isArray(choiceId)) {
      choiceId = choiceId[0]
    }

    let value = this.props.choices.filter(choice => choice.id === choiceId)[0];

    if (!value) {
      value = this.props.choices[0]
    }

    return value
  };

  notifyNewParams() {
    const fieldName = changeCase.snake(this.props.name);
    const params = {[fieldName] : [this.state.value.id]};

    this.props.onApiParamChange({
      apiParams: params,
      urlParams: params,
      fieldValues: this.state.value
    })
  }

  handleValueChange = (val) => {
    this.setState({
      value: val.option
    }, this.notifyNewParams)
  };

  render() {
    const choices = createOptions(this.props.choices);
    const selectedValue = createOption(this.state.value);

    return <div className={this.props.classNames}>
      {this.props.tooltipContent &&
      <UncontrolledTooltip placement="top" target={this.props.name}>
        {this.props.tooltipContent}
      </UncontrolledTooltip>}
      <label htmlFor={this.props.name} id={this.props.name}>
        {this.props.label}
      </label>
      <Select
          name={this.props.name}
          id={this.props.name}
          options={choices}
          value={selectedValue}
          onChange={this.handleValueChange}
          multi={false}
          placeholder={this.props.placeholder}
          searchable={this.props.searchable}
      />
    </div>
  }
}

export default ChoiceField