import React, {Component} from 'react';
import {addApiResourceStateToPropsUtils} from "../../ApiResource";
import {connect} from "react-redux";
import {FormattedMessage} from "react-intl";
import CategoryDetailMenu from "./CategoryDetailMenu";

class CategoryDetail extends Component {
  render() {
    const category = this.props.ApiResourceObject(this.props.apiResourceObject);

    return (
        <div className="animated fadeIn">
          <div className="row">
            <div className="col-sm-6 col-md-8">
              <div className="card">
                <div className="card-header">{category.name}</div>
                <div className="card-block">
                  <table className="table table-striped">
                    <tbody>
                    <tr>
                      <th><FormattedMessage id="name" defaultMessage="name" /></th>
                      <td>{category.name}</td>
                    </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <CategoryDetailMenu category={category} />
          </div>
        </div>)
  }
}

export default connect(addApiResourceStateToPropsUtils())(CategoryDetail);