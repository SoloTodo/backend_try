import React, {Component} from 'react'
import {UncontrolledTooltip} from "reactstrap";
import Select from "react-select";
import queryString from 'query-string';
import {createOptions} from "../form_utils";
import changeCase from 'change-case'

class MultiChoiceField extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedChoices: this.parseAndCleanOptions()
    };
  }

  componentWillMount() {
    this.notifyNewParams()
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.urlParams !== nextProps.urlParams) {
      const selectedChoices = this.parseAndCleanOptions(nextProps.urlParams);
      this.setState({
        selectedChoices
      }, this.notifyNewParams)
    }
  }

  parseAndCleanOptions = (urlParams=null) => {
    urlParams = urlParams ? urlParams : this.props.urlParams;

    const parameters = queryString.parse(urlParams);

    let choiceIds = parameters[changeCase.snake(this.props.name)];

    if (!Array.isArray(choiceIds)) {
      choiceIds = [choiceIds]
    }

    const validatedValues = this.props.choices
        .filter(choice => choiceIds.includes(choice.id.toString()));

    return validatedValues
  };

  notifyNewParams() {
    const params = {[changeCase.snake(this.props.name)] : this.state.selectedChoices.map(x => x.id)}

    this.props.onApiParamChange({
      apiParams: params,
      urlParams: params,
    })
  }

  handleValueChange = (vals) => {
    const sanitizedVals = vals.map(val => val.option);
    this.setState({
      selectedChoices: sanitizedVals
    }, this.notifyNewParams)
  };

  render() {
    const choices = createOptions(this.props.choices);
    const selectedChoices = createOptions(this.state.selectedChoices);

    return <div className={this.props.classNames}>
      {this.props.tooltipContent &&
      <UncontrolledTooltip placement="top" target={this.props.name}>
        {this.props.tooltipContent}
      </UncontrolledTooltip>}
      <label htmlFor={this.props.name} id={this.props.name} className={this.props.tooltipContent ? 'dashed' : ''}>
        {this.props.label}
      </label>
      <Select
          name={this.props.name}
          id={this.props.name}
          options={choices}
          value={selectedChoices}
          onChange={this.handleValueChange}
          multi={true}
          placeholder={this.props.placeholder}
          searchable={this.props.searchable}
      />
    </div>
  }
}

export default MultiChoiceField