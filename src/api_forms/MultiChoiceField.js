import React, {Component} from 'react'
import {UncontrolledTooltip} from "reactstrap";
import Select from "react-select";
import {createOptions} from "../form_utils";

class MultiChoiceField extends Component {
  componentWillMount() {
    this.sanitizeProps(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.sanitizeProps(nextProps);
  }

  sanitizeProps = (props) => {
    if (!props.validated) {
      let choiceIds = props.value;

      if (!Array.isArray(choiceIds)) {
        choiceIds = [choiceIds]
      }

      const validatedValues = this.props.choices
          .filter(choice => choiceIds.includes(choice.id.toString()))

      this.props.onValueChange(
          this.props.name,
          validatedValues,
          {
            [this.props.name]: validatedValues.map(x => x.id)
          }
      )
    }
  };

  handleValueChange = (vals) => {
    const sanitizedVals = vals.map(val => val.option);
    this.props.onValueChange(
        this.props.name,
        sanitizedVals,
        {
          [this.props.name]: sanitizedVals.map(x => x.id)
        }
    )
  };

  render() {
    const choices = createOptions(this.props.choices);
    const selectedChoices = this.props.validated ? createOptions(this.props.value) : [];

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