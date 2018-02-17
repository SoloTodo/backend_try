import React, {Component} from 'react';
import {FormattedMessage} from "react-intl";
import {NavLink} from "react-router-dom";
import {connect} from "react-redux";
import {
  filterApiResourceObjectsByType
} from "../../react-utils/ApiResource";

class CategoryList extends Component {
  render() {
    return(
        <div className="animated fadeIn">
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-header"><FormattedMessage id="categories" defaultMessage="Categories" /></div>
                <div className="card-block">
                  <table className="table table-striped">
                    <thead>
                    <tr>
                      <th><FormattedMessage id="id" defaultMessage="ID"/></th>
                      <th><FormattedMessage id="name" defaultMessage="Name"/></th>
                    </tr>
                    </thead>
                    <tbody>
                    {this.props.categories.map(category => (
                        <tr key={category.id}>
                          <td>{category.id}</td>
                          <td className="col-12"><NavLink to={'/categories/' + category.id}>{category.name}</NavLink></td>
                        </tr>
                    ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

    )
  }
}

function mapStateToProps(state) {
  return {
    categories: filterApiResourceObjectsByType(state.apiResourceObjects, 'categories'),
  }
}

export default connect(mapStateToProps)(CategoryList);