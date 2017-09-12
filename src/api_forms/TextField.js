import React, {Component} from 'react'
import {UncontrolledTooltip} from "reactstrap";
import queryString from 'query-string';
import changeCase from 'change-case'

class TextField extends Component {
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
    return parameters[changeCase.snake(this.props.name)];
  };

  notifyNewParams() {
    const params = {};

    if (this.state.value) {
      params[changeCase.snake(this.props.name)] = [this.state.value]
    }

    this.props.onApiParamChange({
      apiParams: params,
      urlParams: params,
    })
  }


  handleValueChange = (evt) => {
    this.setState({
      value: evt.target.value
    }, this.notifyNewParams)
  };

  render() {
    return <div className={this.props.classNames}>
      {this.props.tooltipContent &&
      <UncontrolledTooltip placement="top" target={this.props.name}>
        {this.props.tooltipContent}
      </UncontrolledTooltip>}
      <label htmlFor={this.props.name} id={this.props.name}>
        {this.props.label}
      </label>
      <input
          type="text"
          className="form-control"
          name={this.props.name}
          id={this.props.name}
          value={this.state.value}
          onChange={this.handleValueChange}
      />
    </div>
  }
}

export default TextField