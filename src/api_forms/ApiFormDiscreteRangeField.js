import React, {Component} from 'react'
import queryString from 'query-string';
import changeCase from 'change-case'
import './ApiFormDateRangeField.css'
import Tooltip from 'rc-tooltip';
import {Range, Handle} from 'rc-slider';
import 'rc-slider/assets/index.css';
import 'rc-tooltip/assets/bootstrap.css';
import {FormattedMessage} from "react-intl";
import RcDiscreteRange from "./RcDiscreteRange";


class ApiFormDiscreteRangeField extends Component {
  componentDidMount() {
    this.notifyNewParams(this.parseIdFromUrl())
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.onChange !== nextProps.onChange) {
      this.notifyNewParams(this.parseIdFromUrl(), nextProps)
    }

    if (typeof(nextProps.value) === 'undefined') {
      this.notifyNewParams(this.parseIdFromUrl())
    }
  }

  parseIdFromUrl = () => {
    // Obtain URL params
    const parameters = queryString.parse(window.location.search);

    const startId = parseInt(parameters[changeCase.snakeCase(this.props.name) + '_start'], 10) || null;
    const endId = parseInt(parameters[changeCase.snakeCase(this.props.name) + '_end'], 10) || null;

    return {
      startId,
      endId
    }
  };

  notifyNewParams(ids, props=null) {
    props = props ? props : this.props;

    if (!props.onChange) {
      return;
    }

    const apiParams = {};
    const urlParams = {};
    const baseFieldName = changeCase.snake(props.name);

    if (ids.startId) {
      apiParams[baseFieldName + '_0'] = [ids.startId];
      urlParams[baseFieldName + '_start'] = [ids.startId]
    }

    if (ids.endId) {
      apiParams[baseFieldName + '_1'] = [ids.endId];
      urlParams[baseFieldName + '_end'] = [ids.endId]
    }

    const result = {
      [this.props.name]: {
        apiParams,
        urlParams,
        fieldValues: {
          startId: ids.startId,
          endId: ids.endId
        }
      }
    };

    props.onChange(result, Boolean(this.props.updateResultsOnChange))
  }

  render() {
    const choices = this.props.choices;

    if (!choices || !choices.length) {
      return (
          <div>
            <label>{this.props.label}</label>
            <Range />
          </div>)
    }
    let startId = null;
    let endId = null;
    if (this.props.value) {
      startId = this.props.value.startId;
      endId = this.props.value.endId;
    }

    let marks = {};
    let valueDocCountDict = {};
    let ongoingDocCount = 0;

    let startValue = null;
    let endValue = null;

    for (const choice of choices) {
      marks[choice.value] = choice.label;

      if (choice.id === startId) {
        startValue = choice.value
      }

      if (choice.id === endId) {
        endValue = choice.value
      }

      valueDocCountDict[choice.value] = {
        ownDocCount: choice.doc_count,
        aggregatedDocCount: ongoingDocCount
      };

      ongoingDocCount += choice.doc_count;
    }

    const min = choices[0].value;
    const max = choices[choices.length - 1].value;

    if (startValue === null) {
      startValue = min
    }

    if (endValue === null) {
      endValue = max
    }

    const handleValueChange = newValues => {
      let newStartId = null;
      let newEndId = null;

      for (const choice of choices) {
        if (choice.value === newValues[0]) {
          newStartId = choice.id
        }

        if (choice.value === newValues[1]) {
          newEndId = choice.id
        }
      }

      if (newValues[0] <= min) {
        newStartId = null
      }

      if (newValues[1] >= max) {
        newEndId = null
      }

      // The range may change dynamically due to changes in the results
      // e.g. The original search form may contain notebook with screen sizes
      // from 4 to 21", but applying a filter compressed the range to 14 - 17"
      // The internal range values may change (to accomodate the new range)
      // but if the actual value doesn't change then don't notify it.
      if (this.props.value.startId !== newStartId || this.props.value.endId !== newEndId) {
        this.notifyNewParams({
          startId: newStartId,
          endId: newEndId
        })
      }

    };

    const handle = (props) => {
      const { value, dragging, index, ...restProps } = props;

      let startDocCounts = {};
      let endDocCounts = {};
      if (index === 0) {
        startDocCounts = valueDocCountDict[value];
        endDocCounts = valueDocCountDict[endValue];
      } else {
        startDocCounts = valueDocCountDict[startValue];
        endDocCounts = valueDocCountDict[value];
      }

      const resultCount = endDocCounts.ownDocCount + endDocCounts.aggregatedDocCount - startDocCounts.aggregatedDocCount;

      return (
          <Tooltip
              prefixCls="rc-slider-tooltip"
              overlay={<span>{resultCount} <FormattedMessage id="results_lower_case" defaultMessage="results" /></span>}
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
              <RcDiscreteRange
                  marks={marks}
                  min={min}
                  max={max}
                  onAfterChange={handleValueChange}
                  handle={handle}
              />
            </div>
          </div>
        </div>)
  }
}

export default ApiFormDiscreteRangeField