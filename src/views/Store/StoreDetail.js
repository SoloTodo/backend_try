import React, { Component } from 'react';
import {connect} from "react-redux";
import {addApiResourceStateToPropsUtils} from "../../ApiResource";
import NavLink from "react-router-dom/es/NavLink";
import {FormattedMessage} from "react-intl";



class StoreDetail extends Component {
  render() {
    const store = this.props.ApiResource(this.props.resourceObject);

    return (
        <div className="animated fadeIn">
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
            <div className="col-sm-6 col-md-4">
              <div className="card">
                <div className="card-header"><strong><FormattedMessage id="options" defaultMessage={`Options`} /></strong></div>
                <div className="card-block">
                  <ul className="list-without-decoration">
                    {store.permissions.includes('view_store') &&
                        <li><NavLink to={'/stores/' + store.id}>
                          <button type="button" className="btn btn-link">
                            <FormattedMessage id="general_information" defaultMessage={`General Information`} />
                          </button>
                        </NavLink></li>
                    }
                    {store.permissions.includes('update_store_prices') &&
                        <li><NavLink to={'/stores/' + store.id + '/update'}>
                          <button type="button" className="btn btn-link">
                            <FormattedMessage id="update" defaultMessage={`Update`} />
                          </button>
                        </NavLink></li>
                    }
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>)
  }
}

export default connect(addApiResourceStateToPropsUtils())(StoreDetail);