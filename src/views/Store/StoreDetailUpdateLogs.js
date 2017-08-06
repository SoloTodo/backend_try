import React, { Component } from 'react';
import ReactPaginate from 'react-paginate';
import {connect} from "react-redux";
import {addApiResourceStateToPropsUtils} from "../../ApiResource";
import {FormattedMessage} from "react-intl";
import {settings} from "../../settings";

const pageSize = 5;

class StoreDetailUpdateLogs extends Component {
  constructor(props) {
    super(props);
    this.state = {
      updateLogs: {},
      resultCount: undefined,
      page: 1
    }
  }

  updatePage(page) {
    const store = this.props.resourceObject;
    return this.props.fetchAuth(`${settings.resourceEndpoints.store_update_logs}?store=${store.id}&page=${page}&page_size=${pageSize}`)
        .then(json => {
          const newUpdateLogs = {
            ...this.state.updateLogs,
            [page]: json.results
          };
          this.setState({
            updateLogs: newUpdateLogs,
            page
          });

          return json
        })
  }

  componentDidMount() {
    this.updatePage(1)
        .then(json => {
          this.setState({
            resultCount: json.count
          })
        })
  }

  onPageChange = (selectedObject) => {
    const page = selectedObject.selected + 1;
    this.updatePage(page)
  };

  render() {
    if (typeof this.state.resultCount === 'undefined') {
      return <div />
    }

    const rawPageLogs = this.state.updateLogs[this.state.page];

    const pageLogs = rawPageLogs.map(rawPageLog => {
      const pageLog = this.props.ApiResource(rawPageLog);
      pageLog.productTypes = pageLog.productTypes.map(pt => this.props.ApiResource(this.props.apiResources[pt]));
      return pageLog
    });

    const statusDict = {
      1: 'Pending',
      2: 'In process',
      3: 'Success',
      4: 'Error'
    };

    const pageCount = Math.ceil(this.state.resultCount / pageSize);

    return (
        <div className="animated fadeIn">
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <strong>
                    <FormattedMessage id="update_logs" defaultMessage={`Update logs`} />
                  </strong>
                </div>
                <div className="card-block">
                  <div className="row">
                    <div className="col-12">
                      <ReactPaginate
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
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-12">
                      <table className="table table-striped">
                        <thead>
                        <tr>
                          <th>Start</th>
                          <th>Last update</th>
                          <th>Status</th>
                          <th>Async</th>
                          <th>Concurrency</th>
                          <th>Product types</th>
                          <th>Log</th>
                        </tr>
                        </thead>
                        <tbody>
                        {pageLogs.map(log => (
                            <tr key={log.url}>
                              <td>{log.creationDate.toLocaleString()}</td>
                              <td>{log.lastUpdated.toLocaleString()}</td>
                              <td>{statusDict[log.status]}</td>
                              <td><i className={log.useAsync ? 'glyphicons glyphicons-check' : 'glyphicons glyphicons-unchecked'}>&nbsp;</i></td>
                              <td>
                                {log.discoveryUrlConcurrency
                                    ? `${log.discoveryUrlConcurrency} / ${log.productsForUrlConcurrency}`
                                    : 'N/A'
                                }
                              </td>
                              <td>
                                <ul>
                                  {log.productTypes.map(pt => (
                                      <li key={pt.url}>{pt.name}</li>
                                  ))}
                                </ul>
                              </td>
                              <td>
                                <a href={log.registryFile} target="_blank">Download</a>
                              </td>
                            </tr>
                        ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
    )
  }
}

export default connect(addApiResourceStateToPropsUtils())(StoreDetailUpdateLogs);