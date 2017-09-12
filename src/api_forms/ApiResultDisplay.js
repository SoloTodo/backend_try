import React, {Component} from 'react'
import ReactPaginate from 'react-paginate';
import Loading from "../components/Loading";
import messages from "../messages";
import {FormattedMessage} from "react-intl";
import {connect} from "react-redux";
import {addApiResourceStateToPropsUtils} from "../ApiResource";
import './ApiResultDisplay.css'

class ApiResultDisplay extends Component {
  handlePageChange = pageSelected => {
    this.props.onPageChange(pageSelected.selected + 1);
  };

  renderOrderingArrow(field, orderingField, orderingDescending) {
    if (field === orderingField) {
      if (orderingDescending) {
        return <span> &#9660;</span>
      } else {
        return <span> &#9650;</span>
      }
    }
  }

  parseOrdering = () => {
    const orderingPattern = /^(-?)(.+)$/;
    const orderingComponents = orderingPattern.exec(this.props.ordering);

    const orderingDescending = Boolean(orderingComponents[1]);
    const orderingField = orderingComponents[2];

    return {
      orderingField,
      orderingDescending
    }
  };

  handleChangeSorting = (evt, field) => {
    evt.preventDefault();

    let {orderingField, orderingDescending} = this.parseOrdering();

    if (field === orderingField) {
      orderingDescending = !orderingDescending
    } else {
      orderingDescending = false;
    }

    const orderingPrefix = orderingDescending ? '-' : '';
    const newOrdering = orderingPrefix + field;

    this.props.onOrderingChange(newOrdering)
  };

  render() {
    if (!this.props.results) {
      return <Loading/>;
    }

    let pageRangeDisplayed = 3;
    let marginPagesDisplayed= 2;
    if (this.props.breakpoint.isExtraSmall) {
      pageRangeDisplayed = 1;
      marginPagesDisplayed = 1;
    }

    const results = this.props.results.urls.map(resourceObjectUrl => this.props.ApiResourceObject(this.props.apiResourceObjects[resourceObjectUrl]));
    const pageCount = Math.ceil(this.props.results.count / this.props.pageSize);

    const {orderingField, orderingDescending} = this.parseOrdering();

    return <div>
      <div className="row">
        <div className="col-12">
          <div className="float-left">
            {(this.props.page - 1) * this.props.pageSize + 1} - {this.props.page * this.props.pageSize} of {this.props.results.count}
          </div>
          <div className="float-right">
            <ReactPaginate
                pageCount={pageCount}
                pageRangeDisplayed={pageRangeDisplayed}
                marginPagesDisplayed={marginPagesDisplayed}
                containerClassName="pagination"
                pageClassName="page-item"
                pageLinkClassName="page-link"
                activeClassName="active"
                previousClassName="page-item"
                nextClassName="page-item"
                previousLinkClassName="page-link"
                nextLinkClassName="page-link"
                disabledClassName="disabled"
                hrefBuilder={page => `?page=${page}`}
                onPageChange={this.handlePageChange}
                forcePage={this.props.page - 1}
                previousLabel={messages.previous}
                nextLabel={messages.next}
            />
          </div>
        </div>
      </div>
      <table className="table table-striped">
        <thead>
        <tr>
          {this.props.columns.map(column => (
              <th key={column.field}>
                <a href="." onClick={(evt) => this.handleChangeSorting(evt, column.field)} className="header-link">
                  {column.label}
                  {this.renderOrderingArrow(column.field, orderingField, orderingDescending)}
                </a>
              </th>
          ))}
        </tr>
        </thead>
        <tbody>
        {!results.length && (
            <tr><td className="center-aligned" colSpan="20">
              <em><FormattedMessage id="no_products_found" defaultMessage='No products found' /></em>
            </td></tr>
        )}
        {results.map(result =>
            <tr key={result.url}>
              {this.props.columns.map(column => (
                  <td key={column.field}>{column.renderer ? column.renderer(result) : result[column.field]}</td>
              ))}
            </tr>
        )}
        </tbody>
      </table>
    </div>
  }
}


function mapStateToProps(state) {
  return {
    apiResourceObjects: state.apiResourceObjects,
    breakpoint: state.breakpoint,
  }
}

export default connect(
    addApiResourceStateToPropsUtils(mapStateToProps))(ApiResultDisplay)
