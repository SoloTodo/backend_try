import React, { Component } from 'react';
import {connect} from "react-redux";
import {
  apiResourceStateToPropsUtils
} from "../../react-utils/ApiResource";
import {FormattedMessage} from "react-intl";
import StoreDetailMenu from "./StoreDetailMenu";
import {backendStateToPropsUtils} from "../../utils";
import moment from "moment/moment";



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
                      <th><FormattedMessage id="last_activation" defaultMessage="Last activation" /></th>
                      <td>
                        {store.lastActivation ? moment(store.lastActivation).format('lll') : 'N/A'}
                      </td>
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
            <StoreDetailMenu store={store} user={this.props.user} />
          </div>
        </div>)
  }
}

function mapStateToProps(state) {
  const {ApiResourceObject} = apiResourceStateToPropsUtils(state);
  const {user} = backendStateToPropsUtils(state);

  return {
    ApiResourceObject,
    user
  }
}

export default connect(mapStateToProps)(StoreDetail);