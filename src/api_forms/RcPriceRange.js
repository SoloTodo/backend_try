import React, {Component} from 'react'
import {Range} from "rc-slider";

class RcPriceRange extends Component {
  constructor(props) {
    super(props);

    const normalizedValues = this.normalizeValues(props);

    this.state = {
      startValue: normalizedValues[0],
      endValue: normalizedValues[1]
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.min !== nextProps.min || this.props.max !== nextProps.max) {
      const normalizedValues = this.normalizeValues(nextProps);
      this.onChange(normalizedValues)
    }

    if (this.props.value[0] !== nextProps.value[0] || this.props.value[1] !== nextProps.value[1]) {
      const normalizedValues = this.normalizeValues(nextProps);
      this.onChange(normalizedValues)
    }
  }

  normalizeValues(props) {
    const originalStartValue = props.value[0];
    const originalEndValue = props.value[1];

    let startValue = null;
    let endValue = null;

    if (originalStartValue !== null) {
      startValue = this.normalizeValue(originalStartValue, props)
    }

    if (originalEndValue !== null) {
      endValue = this.normalizeValue(originalEndValue, props)
    }

    return [startValue, endValue]
  }

  normalizeValue(denormalizedValue, props) {
    if (typeof(props.min) === 'undefined' ||
        typeof(props.max) === 'undefined' ||
        typeof(props.p80th) === 'undefined') {
      return null
    }

    if (denormalizedValue <= props.p80th) {
      return 800 * (denormalizedValue - props.min) / (props.p80th - props.min)
    } else {
      return 800 + 200 * (denormalizedValue - props.p80th) / (props.max - props.p80th)
    }
  }

  denormalizeValue(value, props) {
    if (typeof(props.min) === 'undefined' ||
        typeof(props.max) === 'undefined' ||
        typeof(props.p80th) === 'undefined') {
      return null
    }

    if (value <= 800) {
      return props.min + (value / 800) * (props.p80th - props.min)
    } else {
      return props.p80th + ((value - 800) / 200) * (props.max - props.p80th)
    }
  }

  onChange = (values) => {
    let startValue = values[0];
    let endValue = values[1];

    if (startValue <= 0) {
      startValue = null
    }

    if (endValue >= 1000) {
      endValue = null
    }

    this.setState({
      startValue,
      endValue
    })
  };

  onAfterChange = () => {
    const startValue = this.state.startValue;
    const endValue = this.state.endValue;

    let denormalizedStartValue = null;
    let denormalizedEndValue = null;

    if (startValue !== null) {
      denormalizedStartValue = this.denormalizeValue(startValue, this.props)
    }

    if (endValue !== null) {
      denormalizedEndValue = this.denormalizeValue(endValue, this.props)
    }

    this.props.onAfterChange([denormalizedStartValue, denormalizedEndValue])
  };

  handle = rangeProps => {
    const { value, index } = rangeProps;

    const startValue = this.state.startValue;
    const endValue = this.state.endValue;

    let denormalizedStartValue = null;
    let denormalizedEndValue = null;

    if (index === 0) {
      denormalizedStartValue = this.denormalizeValue(value, this.props);
      denormalizedEndValue = this.denormalizeValue(endValue, this.props);
    } else {
      denormalizedStartValue = this.denormalizeValue(startValue, this.props);
      denormalizedEndValue = this.denormalizeValue(value, this.props);
    }

    return this.props.handle(rangeProps, denormalizedStartValue, denormalizedEndValue)
  };

  render() {
    let startValue = this.state.startValue;
    let endValue = this.state.endValue;

    if (startValue === null) {
      startValue = 0
    }

    if (endValue === null) {
      endValue = 1000
    }

    return <Range
        min={0}
        max={1000}
        value={[startValue, endValue]}
        onChange={this.onChange}
        onAfterChange={this.onAfterChange}
        handle={this.handle}
        allowCross={false}
    />
  }
}

export default RcPriceRange;