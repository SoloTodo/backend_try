import React, { Component } from 'react';
import {connect} from "react-redux";
import {addApiResourceStateToPropsUtils} from "../../react-utils/ApiResource";
import {FormattedMessage} from "react-intl";
import StoreDetailMenu from "./StoreDetailMenu";



class StoreDetail extends Component {
  render() {
    const store = this.props.ApiResourceObject(this.props.apiResourceObject);

    return (
        <div className="animated fadeIn">
          <div className="row">
            <div className="col-sm-6 col-md-8">
              <div className="card">
                <div className="card-header">{store.name}</div>
                <div className="card-block">
                  <table className="table table-striped">
                    <tbody>
                    <tr>
                      <th><FormattedMessage id="name" defaultMessage={`Name`} /></th>
                      <td>{store.name}</td>
                    </tr>
                    <tr>
                      <th><FormattedMessage id="type" defaultMessage={`Type`} /></th>
                      <td>{store.type.name}</td>
                    </tr>
                    <tr>
                      <th><FormattedMessage id="country" defaultMessage={`Country`} /></th>
                      <td>{store.country.name}</td>
                    </tr>
                    <tr>
                      <th><FormattedMessage id="active_question" defaultMessage={`Is active?`} /></th>
                      <td><i className={store.isActive ? 'glyphicons glyphicons-check' : 'glyphicons glyphicons-unchecked'}>&nbsp;</i></td>
                    </tr>
                    <tr>
                      <th>Scraper</th>
                      <td>{store.storescraperClass}</td>
                    </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <StoreDetailMenu store={store} />
          </div>
        </div>)
  }
}

export default connect(addApiResourceStateToPropsUtils())(StoreDetail);