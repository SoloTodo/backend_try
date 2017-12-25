import React, {Component} from 'react'
import queryString from 'query-string';
import changeCase from 'change-case'
import './ApiFormDateRangeField.css'
import Tooltip from 'rc-tooltip';
import {Handle} from 'rc-slider';
import 'rc-slider/assets/index.css';
import 'rc-tooltip/assets/bootstrap.css';
import RcPriceRange from "./RcPriceRange";
import { ApiResourceObject } from "solotodo-react-utils";
import {formatCurrency} from "solotodo-react-utils";


class ApiFormPriceRangeField extends Component {
  componentDidMount() {
    this.notifyNewParams(this.parseValueFromUrl())
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.onChange !== nextProps.onChange) {
      this.notifyNewParams(this.parseValueFromUrl(nextProps), nextProps)
    }

    if (typeof(nextProps.value) === 'undefined') {
      this.notifyNewParams(this.parseValueFromUrl(nextProps))
    }
  }

  parseValueFromUrl = (props) => {
    props = props || this.props;
    const parameters = queryString.parse(window.location.search);

    const startValue = parseFloat(parameters[changeCase.snakeCase(props.name) + '_start']) || null;
    const endValue = parseFloat(parameters[changeCase.snakeCase(props.name) + '_end']) || null;

    return {
      startValue,
      endValue
    }
  };

  notifyNewParams(values, props=null) {
    props = props || this.props;

    if (!props.onChange) {
      return;
    }

    const apiParams = {};
    const urlParams = {};
    const baseFieldName = changeCase.snake(props.name);

    if (values.startValue !== null) {
      apiParams[baseFieldName + '_0'] = [values.startValue];
      urlParams[baseFieldName + '_start'] = [values.startValue]
    }

    if (values.endValue !== null) {
      apiParams[baseFieldName + '_1'] = [values.endValue];
      urlParams[baseFieldName + '_end'] = [values.endValue]
    }

    const result = {
      [this.props.name]: {
        apiParams,
        urlParams,
        fieldValues: {
          startValue: values.startValue,
          endValue: values.endValue
        }
      }
    };

    props.onChange(result, Boolean(this.props.updateResultsOnChange))
  }

  render() {
    const min = this.props.min;
    const max = this.props.max;

    let startValue = this.props.value ? this.props.value.startValue : min;
    let endValue = this.props.value ? this.props.value.endValue : max;

    if (startValue <= min) {
      startValue = null
    }

    if (endValue >= max) {
      endValue = null
    }

    const handleValueChange = newValues => {
      let newStartValue = newValues[0] || null;
      let newEndValue = newValues[1] || null;

      if (newStartValue <= min) {
        newStartValue = null
      }

      if (newEndValue >= max) {
        newEndValue = null
      }

      if (!this.props.value || this.props.value.startValue !== newStartValue || this.props.value.endValue !== newEndValue) {
        this.notifyNewParams({
          startValue: newStartValue,
          endValue: newEndValue
        })
      }
    };

    const currency = new ApiResourceObject(this.props.currency, {});
    const conversionCurrency = new ApiResourceObject(this.props.conversionCurrency, {});
    const numberFormat = this.props.numberFormat;

    const handle = (props, startValue, endValue) => {
      const { value, dragging, index, ...restProps } = props;

      const valueForConversion = index === 0 ? startValue : endValue;

      const formattedValue = formatCurrency(valueForConversion, currency, conversionCurrency, numberFormat.thousands_separator, numberFormat.decimal_separator);

      return (
          <Tooltip
              prefixCls="rc-slider-tooltip"
              overlay={<span>{formattedValue}</span>}
              visible={dragging}
              placement="top"
              key={index}
          >
            <Handle value={value || 0} {...restProps} />
          </Tooltip>
      );
    };

    return (
        <div className="row">
          <div className="col-12 pb-3">
            <label>{this.props.label}</label>
            <div className="pb-2">
              <RcPriceRange
                  value={[startValue, endValue]}
                  min={min}
                  max={max}
                  p80th={this.props.p80th}
                  onAfterChange={handleValueChange}
                  handle={handle}
              />
            </div>
          </div>
        </div>)
  }
}

export default ApiFormPriceRangeField