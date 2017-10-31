import React, {Component} from 'react'
import queryString from 'query-string';
import changeCase from 'change-case'
import './ApiFormDateRangeField.css'
import Tooltip from 'rc-tooltip';
import {Range, Handle} from 'rc-slider';
import 'rc-slider/assets/index.css';
import 'rc-tooltip/assets/bootstrap.css';
import {FormattedMessage} from "react-intl";
import RcContinuousRange from "./RcContinuousRange";


class ApiFormContinuousRangeField extends Component {
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

    const startValue = parseInt(parameters[changeCase.snakeCase(props.name) + '_start'], 10) || null;
    const endValue = parseInt(parameters[changeCase.snakeCase(props.name) + '_end'], 10) || null;

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
    const originalChoices = this.props.choices;

    if (!originalChoices || !originalChoices.length) {
      return (
          <div>
            <label>{this.props.label}</label>
            <Range />
          </div>)
    }

    const step = this.props.step;

    const bucketDocCountDict = {};

    for (const choice of originalChoices) {
      const bucket = Math.floor(choice.value / step) * step;

      if (!bucketDocCountDict[bucket]) {
        bucketDocCountDict[bucket] = {
          exactDocCount: choice.value === bucket ? choice.doc_count : 0,
          bucketDocCount: 0
        }
      }

      bucketDocCountDict[bucket].bucketDocCount += choice.doc_count;
    }

    const originalMin = originalChoices[0].value;
    const originalMax = originalChoices[originalChoices.length - 1].value;
    const steppedMin = Math.floor((originalMin / step)) * step;
    const newChoices = [];


    for (let steppedValue = steppedMin; steppedValue < originalMax + step; steppedValue += step) {
      const bucketDocData = bucketDocCountDict[steppedValue] || {};

      newChoices.push({
        value: steppedValue,
        bucketDocCount: bucketDocData.bucketDocCount || 0,
        exactDocCount: bucketDocData.exactDocCount || 0,
      })
    }

    let marks = {};
    let valueDocCountDict = {};
    let ongoingDocCount = 0;

    for (const choice of newChoices) {
      marks[choice.value] = choice.value;

      valueDocCountDict[choice.value] = {
        ownDocCount: choice.exactDocCount,
        aggregatedDocCount: ongoingDocCount
      };

      ongoingDocCount += choice.bucketDocCount;
    }

    const min = newChoices[0].value;
    const max = newChoices[newChoices.length - 1].value;


    let startValue = this.props.value ? this.props.value.startValue : undefined;
    let endValue = this.props.value ? this.props.value.endValue : undefined;

    if (typeof(startValue) === 'undefined') {
      startValue = null
    } else if (startValue < min) {
      startValue = min
    }

    if (typeof(endValue) === 'undefined') {
      endValue = null
    } else if (endValue > max) {
      endValue = max
    }

    const handleValueChange = newValues => {
      let newStartValue = null;
      let newEndValue = null;

      for (const choice of newChoices) {
        if (choice.value === newValues[0]) {
          newStartValue = choice.value
        }

        if (choice.value === newValues[1]) {
          newEndValue = choice.value
        }
      }

      if (newValues[0] <= min) {
        newStartValue = null
      }

      if (newValues[1] >= max) {
        newEndValue = null
      }

      if (!this.props.value || this.props.value.startValue !== newStartValue || this.props.value.endValue !== newEndValue) {
        this.notifyNewParams({
          startValue: newStartValue,
          endValue: newEndValue
        })
      }
    };

    const handle = (props) => {
      const { value, dragging, index, ...restProps } = props;

      let concreteStartValue = startValue !== null ? startValue : min;
      let concreteEndValue = endValue !== null ? endValue : max;

      let startDocCounts = {};
      let endDocCounts = {};
      let valueRangeAsText = '';

      if (index === 0) {
        startDocCounts = valueDocCountDict[value];
        endDocCounts = valueDocCountDict[concreteEndValue];
        valueRangeAsText = `${value} - ${concreteEndValue}`
      } else {
        startDocCounts = valueDocCountDict[concreteStartValue];
        endDocCounts = valueDocCountDict[value];
        valueRangeAsText = `${concreteStartValue} - ${value}`
      }

      const resultCount = endDocCounts.ownDocCount + endDocCounts.aggregatedDocCount - startDocCounts.aggregatedDocCount;

      return (
          <Tooltip
              prefixCls="rc-slider-tooltip"
              overlay={<span>{valueRangeAsText} {this.props.unit} ({resultCount} <FormattedMessage id="results_lower_case" defaultMessage="results" />)</span>}
              visible={dragging}
              placement="top"
              key={index}
          >
            <Handle value={value} {...restProps} />
          </Tooltip>
      );
    };

    return (
        <div className="row">
          <div className="col-12 pb-3">
            <label>{this.props.label}</label>
            <div className="pb-2">
              <RcContinuousRange
                  value={[startValue, endValue]}
                  min={min}
                  max={max}
                  step={this.props.step}
                  onAfterChange={handleValueChange}
                  handle={handle}
              />
            </div>
          </div>
        </div>)
  }
}

export default ApiFormContinuousRangeField