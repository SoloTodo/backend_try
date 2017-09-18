import React, {Component} from 'react'
import {UncontrolledTooltip} from "reactstrap";
import queryString from 'query-string';
import changeCase from 'change-case'
import moment from "moment";
import './DateRangeField.css'

class DateRangeField extends Component {
  constructor(props) {
    super(props);

    const {startDate, endDate} = this.parseAndCleanDates();

    this.state = {
      startDate: startDate,
      endDate: endDate,
    };
  }

  componentDidMount() {
    this.notifyNewParams()
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.urlParams !== nextProps.urlParams) {
      const {startDate, endDate} = this.parseAndCleanDates(nextProps.urlParams);
      this.setState({
        startDate,
        endDate
      }, this.notifyNewParams)
    }

    if (this.props.onApiParamChange !== nextProps.onApiParamChange) {
      this.notifyNewParams(nextProps)
    }
  }

  parseAndCleanDates = (urlParams=null) => {
    urlParams = urlParams ? urlParams : this.props.urlParams;

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

    // Obtain URL params
    const parameters = queryString.parse(urlParams);
    const startDateStr = parameters[changeCase.snakeCase(this.props.name) + '_start'];
    let startDate = null;
    if (dateRegex.test(startDateStr)) {
      startDate = moment(startDateStr);
    }

    const endDateStr = parameters[changeCase.snakeCase(this.props.name) + '_end'];
    let endDate = null;
    if (dateRegex.test(endDateStr)) {
      endDate = moment(endDateStr);
    }

    let defaultStartDate = this.props.min;
    if (!defaultStartDate) {
      defaultStartDate = moment(endDate).subtract(30, 'days');
    }

    const max = this.props.max ? this.props.max : moment().startOf('day');

    if (!this.props.nullable) {
      // If they are empty, replace with initial values, if given
      if (this.props.initial) {
        if (!startDate) {
          startDate = this.props.initial[0]
        }
        if (!endDate) {
          endDate = this.props.initial[1]
        }
      }

      // If dates still not available, use default values
      if (!endDate) {
        endDate = max;
      }

      if (!startDate) {
        startDate = defaultStartDate
      }
    }

    const min = this.props.min;

    if (
        (min && startDate && min.isAfter(startDate)) ||
        (startDate && endDate && startDate.isAfter(endDate)) ||
        (endDate && endDate.isAfter(max))) {

      startDate = this.props.nullable ? null : min ? min : defaultStartDate;
      endDate = this.props.nullable ? null : max
    }

    return {
      startDate,
      endDate
    }
  };

  notifyNewParams(props) {
    props = props ? props : this.props;

    if (!props.onApiParamChange) {
      return;
    }

    const apiParams = {};
    const urlParams = {};
    const base_field_name = changeCase.snake(props.name);
    if (this.state.startDate) {
      apiParams[base_field_name + '_0'] = [this.state.startDate.format('YYYY-MM-DD')];
      urlParams[base_field_name + '_start'] = [this.state.startDate.format('YYYY-MM-DD')]
    }
    if (this.state.endDate) {
      apiParams[base_field_name + '_1'] = [moment(this.state.endDate).add(1, 'days').format('YYYY-MM-DD')];
      urlParams[base_field_name + '_end'] = [this.state.endDate.format('YYYY-MM-DD')]
    }

    const result = {
      [this.props.name]: {
        apiParams,
        urlParams,
        fieldValues: {
          startDate: this.state.startDate,
          endDate: this.state.endDate
        }
      }
    };

    props.onApiParamChange(result)
  }

  handleDateChange = (event, field) => {
    this.setState({
      [field]: event.target.value ? moment(event.target.value) : null
    }, this.notifyNewParams)
  };

  render() {
    const max = this.props.max ? this.props.max : moment().startOf('day');

    return <div className={this.props.classNames}>
      {this.props.tooltipContent &&
      <UncontrolledTooltip placement="top" target={this.props.name}>
        {this.props.tooltipContent}
      </UncontrolledTooltip>}
      <label htmlFor={this.props.name} id={this.props.name} className={this.props.tooltipContent ? 'dashed' : ''}>
        {this.props.label}
      </label>
      <div className="row">
        <div className="col-12 col-sm-6">
          <input
              type="date"
              className="form-control"
              required={!this.props.nullable}
              min={this.props.min ? this.props.min.format('YYYY-MM-DD') : ''}
              max={this.state.endDate ? this.state.endDate.format('YYYY-MM-DD') : max.format('YYYY-MM-DD')}
              value={this.state.startDate ? this.state.startDate.format('YYYY-MM-DD') : ''}
              onChange={evt => this.handleDateChange(evt, 'startDate')}
          />

        </div>
        <div className="col-12 col-sm-6 end-date-container">
          <input
              type="date"
              className="form-control"
              required={!this.props.nullable}
              min={this.state.startDate ?
                  this.state.startDate.format('YYYY-MM-DD') :
                  this.props.min ?
                      this.props.min.format('YYYY-MM-DD') : ''}
              max={max.format('YYYY-MM-DD')}
              value={this.state.endDate ? this.state.endDate.format('YYYY-MM-DD') : ''}
              onChange={evt => this.handleDateChange(evt, 'endDate')}
          />
        </div>
      </div>
    </div>
  }
}

export default DateRangeField