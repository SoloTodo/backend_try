import React, {Component} from 'react'
import ReactPaginate from 'react-paginate';
import queryString from 'query-string';
import messages from "../messages";

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
        fieldValues: value
      }
    };

    props.onChange(result, updateOnFinish)
  }


  onPageChange = (selection) => {
    this.notifyNewParams(selection.selected + 1, this.props, true)
  };

  render() {
    if (!this.props.results) {
      return null
    }

    const pageCount = Math.ceil(this.props.results.count / this.props.pageSize.id);

    return <ReactPaginate
        forcePage={this.props.page - 1}
        pageCount={pageCount}
        pageRangeDisplayed={3}
        marginPagesDisplayed={2}
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
        previousLabel={messages.previous}
        nextLabel={messages.next}
    />
  }
}

export default ApiFormPaginationField