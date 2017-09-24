import React, {Component} from 'react'

function OrderTableHeader ({column, ordering, descending, onChange}) {
  if (!column.ordering) {
    return column.label
  }

  let orderingArrow = null;

  if (ordering === column.name) {
    orderingArrow = descending ? <span>&#9660;</span> : <span>&#9650;</span>;
  }

  return <a href="" onClick={evt => onChange(evt, column)}>
    {column.label} {orderingArrow}
  </a>
}

class OrderTable extends Component {
  constructor(props) {
    super(props);

    this.state = {
      ordering: props.initialOrdering || props.columns[0].name,
      descending: props.initialDescending,
    }
  }

  handleSortingChange = (evt, column) => {
    evt.preventDefault();

    let newOrdering = this.state.ordering;
    let newDescending = undefined;

    if (column.name === this.state.ordering) {
      newDescending = !this.state.descending
    } else {
      newOrdering = column.name;
      newDescending = false
    }

    this.setState({
      ordering: newOrdering,
      descending: newDescending
    })
  };

  render() {
    const columns = this.props.columns;

    const valueFunction = columns.filter(column => column.name === this.state.ordering)[0].ordering;
    const valueMultiplier = this.state.descending ? -1 : 1;

    const sortedData = [...this.props.data];
    sortedData.sort((a, b) => {
      const aValue = valueFunction(a);
      const bValue = valueFunction(b);

      if (aValue === bValue) {
        return 0;
      }

      return aValue > bValue ? valueMultiplier : -valueMultiplier;
    });

    return (
        <table className="table table-striped">
          <thead>
          <tr>
            {columns.map(column => (
                <th key={column.name} className={'text-nowrap ' + column.className}>
                  <OrderTableHeader
                    column={column}
                    ordering={this.state.ordering}
                    descending={this.state.descending}
                    onChange={this.handleSortingChange}
                  />
                </th>
            ))}
          </tr>
          </thead>
          <tbody>
          {sortedData.map(entry => (
              <tr key={entry.id}>
                {columns.map(column => (
                    <td key={column.name} className={'text-nowrap ' + column.className}>
                      {column.field(entry)}
                    </td>
                ))}
              </tr>
          ))}
          </tbody>
        </table>
    )
  }
}

export default OrderTable;