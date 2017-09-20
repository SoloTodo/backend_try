import React, {Component} from 'react'
import Loading from "../components/Loading";
import {FormattedMessage} from "react-intl";
import {connect} from "react-redux";
import {addApiResourceStateToPropsUtils} from "../ApiResource";
import './ApiFormResultsTable.css'
import ApiFormOrderingColumn from "./ApiFormOrderingColumn";

class ApiFormResultsTable extends Component {
  render() {
    if (!this.props.results) {
      return <Loading/>;
    }

    const results = this.props.results.map(entry => this.props.ApiResourceObject(entry));

    const finalColumns = [];

    let i = 1;
    for (const column of this.props.columns) {
      if (column.displayFilter && !column.displayFilter(results)) {
        continue;
      }
      finalColumns.push({
        ...column,
        id: i++
      })
    }

    return <div>
      <table className="table table-striped">
        <thead>
        <tr>
          {finalColumns.map(column => (
              <th key={column.id} className={column.cssClasses}>
                <ApiFormOrderingColumn
                    name={column.ordering}
                    label={column.label}
                    ordering={this.props.ordering}
                    onChange={this.props.onChange}
                />
              </th>
          ))}

        </tr>
        </thead>
        <tbody>
        {results.length ? results.map(entry => (
            <tr key={entry.id}>
              {finalColumns.map(column => (
                  <td key={column.id} className={column.cssClasses}>
                    {column.renderer ? column.renderer(entry) : entry[column.field]}
                  </td>))}
            </tr>
        )) : <tr>
          <td colSpan="10" className="text-center">
            <em><FormattedMessage id="no_results_found" defaultMessage="No results found"/></em>
          </td>
        </tr>}
        </tbody>
      </table>
    </div>
  }
}


function mapStateToProps(state) {
  return {
    breakpoint: state.breakpoint,
  }
}

export default connect(
    addApiResourceStateToPropsUtils(mapStateToProps))(ApiFormResultsTable)
