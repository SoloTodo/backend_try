import React, {Component} from 'react';
import {FormattedMessage} from "react-intl";
import {NavLink} from "react-router-dom";
import {
  filterApiResourceObjectsByType
} from "../../react-utils/ApiResource";
import {connect} from "react-redux";
import {settings} from "../../settings";

class UserList extends Component {
  render() {
    return (
        <div className="animated fadeIn">
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <FormattedMessage id="users" defaultMessage="Users" />
                </div>
                <div className="card-block">
                  <table className="table table-striped">
                    <thead>
                    <tr>
                      <th>
                        <FormattedMessage id="email" defaultMessage="E-mail"/>
                      </th>
                      <th>
                        <FormattedMessage id="name" defaultMessage="Name"/>
                      </th>
                    </tr>
                    </thead>

                    <tbody>

                    {this.props.users.map(user => (
                        <tr key={user.id}>
                          <td>
                            <NavLink to={`/users/${user.id}`}>{user.email}</NavLink>
                          </td>
                          <td>
                            {user.first_name} {user.last_name}
                          </td>
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

function mapStateToProps(state) {
  return {
    users: filterApiResourceObjectsByType(state.apiResourceObjects, 'users')
        .filter(user => user.url !== settings.ownUserUrl && user.is_staff)
  }
}

export default connect(mapStateToProps)(UserList);
