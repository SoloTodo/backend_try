import React, {Component} from 'react'
import {Range} from "rc-slider";

class RcContinuousRange extends Component {
  constructor(props) {
    super(props);

    this.state = {
      startValue: props.value[0],
      endValue: props.value[1]
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.min !== nextProps.min || this.props.max !== nextProps.max) {
      this.onChange([this.state.startValue, this.state.endValue], nextProps)
    }

    if (this.props.value[0] !== nextProps.value[0] || this.props.value[1] !== nextProps.value[1]) {
      this.onChange([nextProps.value[0], nextProps.value[1]], nextProps)
    }
  }

  onChange = (values, newProps) => {
    const props = newProps ? newProps : this.props;

    let startValue = values[0];
    let endValue = values[1];

    if (startValue <= props.min) {
      startValue = undefined
    }

    if (endValue >= props.max) {
      endValue = undefined
    }

    this.setState({
      startValue,
      endValue
    }, () => {
      if (newProps) {
        newProps.onAfterChange([startValue, endValue])
      }
    })
  };

  render() {
    let startValue = this.state.startValue;
    let endValue = this.state.endValue;

    if (startValue === null || typeof(startValue) === 'undefined') {
      startValue = this.props.min
    }

    if (endValue === null || typeof(endValue) === 'undefined') {
      endValue = this.props.max
    }

    return <Range
        min={this.props.min}
        max={this.props.max}
        value={[startValue, endValue]}
        onChange={this.onChange}
        step={this.props.step}
        onAfterChange={this.props.onAfterChange}
        handle={this.props.handle}
        allowCross={false}
    />
  }
}

export default RcContinuousRange;