import React, {Component} from 'react'
import {Range} from "rc-slider";

class RcDiscreteRange extends Component {
  constructor(props) {
    super(props);

    this.state = {
      startValue: undefined,
      endValue: undefined
    }
  }

  componentWillReceiveProps(newProps) {
    const oldMarks = this.props.marks;
    const newMarks = newProps.marks;

    if (JSON.stringify(oldMarks) !== JSON.stringify(newMarks)) {
      this.onChange([this.state.startValue, this.state.endValue], newProps)
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

    if (typeof(startValue) === 'undefined') {
      startValue = this.props.min
    }

    if (typeof(endValue) === 'undefined') {
      endValue = this.props.max
    }

    return <Range
        marks={this.props.marks}
        min={this.props.min}
        max={this.props.max}
        value={[startValue, endValue]}
        onChange={this.onChange}
        step={null}
        onAfterChange={this.props.onAfterChange}
        handle={this.props.handle}
        allowCross={false}
    />
  }
}

export default RcDiscreteRange;