import React, {Component} from 'react';
import {FormattedMessage} from "react-intl";
import {NavLink} from "react-router-dom";

class ReportList extends Component {
  render() {
    const reports = this.props.reports;

    return (
        <div className="animated fadeIn">
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <FormattedMessage id="reports" defaultMessage="Reportes" />
                </div>
                <div className="card-block">
                  <table className="table table-striped">
                    <thead>
                    <tr>
                      <th>
                        <FormattedMessage id="name" defaultMessage="Name"/>
                      </th>
                    </tr>
                    </thead>

                    <tbody>

                    {reports.map(report => (
                        <tr key={report.id}>
                          <td><NavLink to={`/reports/${report.slug}`}>{report.name}</NavLink></td>
                        </tr>
                    ))}

                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>)
  }
}

export default ReportList