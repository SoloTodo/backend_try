import React, { Component } from 'react';
import {connect} from "react-redux";
import {addApiResourceStateToPropsUtils} from "../../ApiResource";
import {FormattedMessage} from "react-intl";
import StoreDetailMenu from "./StoreDetailMenu";



class StoreDetail extends Component {
  render() {
    const store = this.props.ApiResource(this.props.resourceObject);

    const locationState = this.props.location.state;

    return (
        <div className="animated fadeIn">
          {locationState && locationState.warning && (
              <div className="row">
                <div className="col-sm-12">
                  <div className="alert alert-warning" role="alert">
                    <strong>Warning!</strong> This store is not associated to a scraper, so it can't be updated
                  </div>
                </div>
              </div>
          )}

          <div className="row">
            <div className="col-sm-6 col-md-4">
              <div className="card">
                <div className="card-header"><strong>{store.name}</strong></div>
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
                      <td>{store.is_active ? 'Yes' : 'No'}</td>
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