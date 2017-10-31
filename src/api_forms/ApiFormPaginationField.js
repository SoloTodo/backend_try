import React, {Component} from 'react'
import ReactPaginate from 'react-paginate';
import queryString from 'query-string';
import {connect} from "react-redux";

class ApiFormPaginationField extends Component {
  componentDidMount() {
    this.notifyNewParams(this.parseValueFromUrl())
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.onChange !== nextProps.onChange) {
      this.notifyNewParams(this.parseValueFromUrl(), nextProps)
    }

    if (typeof(nextProps.page) === 'undefined') {
      this.notifyNewParams(this.parseValueFromUrl())
    }
  }

  parseValueFromUrl = () => {
    const parameters = queryString.parse(window.location.search);
    let value = parseInt(parameters['page'], 10);

    if (Number.isNaN(value)) {
      return 1
    }

    return value
  };

  notifyNewParams(value, props, updateOnFinish=false) {
    props = props ? props : this.props;

    if (!props.onChange) {
      return;
    }

    const params = {};

    if (value) {
      params['page'] = [value]
    }

    const result = {
      page: {
        apiParams: params,
        urlParams: params,
        fieldValues: {id: value, name: ''}
      }
    };

    props.onChange(result, updateOnFinish)
  }


  onPageChange = (selection) => {
    this.notifyNewParams(selection.selected + 1, this.props, true)
  };

  render() {
    if (!this.props.resultCount) {
      return null
    }

    const pageRangeDisplayed = this.props.breakpoint.isExtraSmall ? 2 : 3;
    const marginPagesDisplayed = this.props.breakpoint.isExtraSmall ? 1 : 2;

    let pageCount = 1;
    if (this.props.pageSize) {
      pageCount = Math.ceil(this.props.resultCount / this.props.pageSize.id);
    }

    let page = 1;
    if (this.props.page) {
      page = this.props.page.id
    }

    return <ReactPaginate
        forcePage={page - 1}
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
        onPageChange={this.onPageChange}
        previousLabel="&lsaquo;"
        nextLabel="&rsaquo;"
    />
  }
}

function mapStateToProps(state) {
  return {
    breakpoint: state.breakpoint,
  }
}

export default connect(mapStateToProps)(ApiFormPaginationField)
