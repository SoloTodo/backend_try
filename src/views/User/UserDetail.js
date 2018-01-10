import React, { Component } from 'react';
import {connect} from "react-redux";
import {addApiResourceStateToPropsUtils} from "../../react-utils/ApiResource";
import {FormattedMessage} from "react-intl";
import {NavLink} from "react-router-dom";



class UserDetail extends Component {
  render() {
    const user = this.props.ApiResourceObject(this.props.apiResourceObject);

    return (
        <div className="animated fadeIn">
          <div className="row">
            <div className="col-sm-6 col-md-8">
              <div className="card">
                <div className="card-header">{user.first_name}</div>
                <div className="card-block">
                  <table className="table table-striped">
                    <tbody>
                    <tr>
                      <th><FormattedMessage id="email" defaultMessage="E-mail" /></th>
                      <td>{user.email}</td>
                    </tr>
                    <tr>
                      <th><FormattedMessage id="full_name" defaultMessage="Full name" /></th>
                      <td>{user.firstName} {user.lastName}</td>
                    </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="col-sm-6 col-md-4">
              <div className="card">
                <div className="card-header"><FormattedMessage id="options" defaultMessage="Options" /></div>
                <div className="card-block">
                  <ul className="list-without-decoration subnavigation-links">
                    <li>
                      <NavLink to={this.props.match.url + '/staff_summary'}>
                        <button type="button" className="btn btn-link">
                          <FormattedMessage id="staff_summary" defaultMessage="Staff summary" />
                        </button>
                      </NavLink>
                    </li>
                    <li>
                      <NavLink to={this.props.match.url + '/staff_actions'}>
                        <button type="button" className="btn btn-link">
                          <FormattedMessage id="staff_actions" defaultMessage="Staff actions" />
                        </button>
                      </NavLink>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>)
  }
}

export default connect(addApiResourceStateToPropsUtils())(UserDetail);