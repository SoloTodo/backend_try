import React, {Component} from 'react'
import {createOrderingOptionChoice} from "./utils";

class ApiFormOrderingColumn extends Component {
  renderOrderingArrow = (field, orderingField, orderingDescending) => {
    if (field === orderingField) {
      if (orderingDescending) {
        return <span> &#9660;</span>
      } else {
        return <span> &#9650;</span>
      }
    }
  };

  onChangeOrdering = evt => {
    evt.preventDefault();

    if (!this.props.onChange) {
      return
    }

    const orderingPattern = /^(-?)(.+)$/;
    const orderingComponents = orderingPattern.exec(this.props.ordering.name);

    const currentOrderingDescending = Boolean(orderingComponents[1]);
    const currentOrderingField = orderingComponents[2];

    const newOrderingField = this.props.name;

    let newOrdering = null;
    if (currentOrderingField === newOrderingField) {
      newOrdering = `${currentOrderingDescending ? '' : '-'}${currentOrderingField}`;
    } else {
      newOrdering = newOrderingField
    }

    const result = {
      ordering: {
        apiParams: {
          ordering: [newOrdering]
        },
        urlParams: {
          ordering: [newOrdering]
        },
        fieldValues: createOrderingOptionChoice(newOrdering)
      }
    };

    this.props.onChange(result, true)
  };

  render() {
    if (this.props.name) {
      const orderingPattern = /^(-?)(.+)$/;

      let orderingDescending = null;
      let orderingField = null;
      if (this.props.ordering) {
        const orderingComponents = orderingPattern.exec(this.props.ordering.name);
        orderingDescending = Boolean(orderingComponents[1]);
        orderingField = orderingComponents[2];
      }

      return <a href="" onClick={this.onChangeOrdering}>
        {this.props.label} {this.renderOrderingArrow(this.props.name, orderingField, orderingDescending)}
      </a>
    } else {
      return <span>{this.props.label}</span>
    }
  }
}

export default ApiFormOrderingColumn;