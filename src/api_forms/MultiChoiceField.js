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

  componentDidMount() {
    this.notifyNewParams()
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.urlParams !== nextProps.urlParams) {
      const selectedChoices = this.parseAndCleanOptions(nextProps.urlParams);
      this.setState({
        selectedChoices
      }, this.notifyNewParams)
    }

    if (this.props.onApiParamChange !== nextProps.onApiParamChange) {
      this.notifyNewParams(nextProps)
    }
  }

  parseAndCleanOptions = (urlParams=null) => {
    urlParams = urlParams ? urlParams : this.props.urlParams;

    const parameters = queryString.parse(urlParams);

    let choiceIds = parameters[changeCase.snake(this.props.name)];

    if (!Array.isArray(choiceIds)) {
      choiceIds = [choiceIds]
    }

    return this.props.choices
        .filter(choice => choiceIds.includes(choice.id.toString()));
  };

  notifyNewParams(props) {
    props = props ? props : this.props;

    if (!props.onApiParamChange) {
      return;
    }

    const fieldName = changeCase.snake(props.name);
    const params = {[fieldName] : this.state.selectedChoices.map(x => x.id)};

    const result = {
      [this.props.name]: {
        apiParams: params,
        urlParams: params,
        fieldValues: this.state.value
      }
    };

    props.onApiParamChange(result)
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

    return <Select
        name={this.props.name}
        id={this.props.name}
        options={choices}
        value={selectedChoices}
        onChange={this.handleValueChange}
        multi={true}
        placeholder={this.props.placeholder}
        searchable={this.props.searchable}
        autoBlur={true}
    />
  }
}

export default MultiChoiceField