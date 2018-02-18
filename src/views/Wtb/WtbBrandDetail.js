import React, {Component} from 'react';
import {FormattedMessage} from "react-intl";
import {NavLink} from "react-router-dom";
import connect from "react-redux/es/connect/connect";
import {
  apiResourceStateToPropsUtils, filterApiResourceObjectsByType
} from "../../react-utils/ApiResource";
import {listToObject} from "../../react-utils/utils";

class WtbBrandDetail extends Component {
  render() {
    const storesDict = listToObject(this.props.stores, 'url');
    const wtbBrand = this.props.ApiResourceObject(this.props.apiResourceObject);

    return (
        <div className="animated fadeIn">
          <div className="row">
            <div className="col-sm-6 col-md-8">
              <div className="card">
                <div className="card-header">
                  <FormattedMessage id="detail" defaultMessage="Detail" />
                </div>
                <div className="card-block">
                  <table className="table table-striped">
                    <tbody>
                    <tr>
                      <th><FormattedMessage id="name" defaultMessage="Name" /></th>
                      <td>{wtbBrand.name}</td>
                    </tr>
                    <tr>
                      <th><FormattedMessage id="prefered_brand" defaultMessage="Prefered brand" /></th>
                      <td>{wtbBrand.preferedBrand}</td>
                    </tr>
                    <tr>
                      <th><FormattedMessage id="website" defaultMessage="Website" /></th>
                      <td>{wtbBrand.website.name}</td>
                    </tr>
                    <tr>
                      <th><FormattedMessage id="scraper" defaultMessage="Scraper" /></th>
                      <td>{wtbBrand.storescraperClass}</td>
                    </tr>
                    <tr>
                      <th><FormattedMessage id="stores" defaultMessage="Stores" /></th>
                      <td>
                        <ul>
                          {wtbBrand.stores.map(storeUrl => (
                              <li key={storeUrl}>{storesDict[storeUrl].name}</li>
                          ))}
                        </ul>
                      </td>
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
                      <NavLink to={`/wtb/brands/${wtbBrand.id}/update_logs`}>
                        <button type="button" className="btn btn-link">
                          <FormattedMessage id="update_logs" defaultMessage="Update logs" />
                        </button>
                      </NavLink>
                    </li>

                    <li>
                      <NavLink to={`/wtb/entities?brands=${wtbBrand.id}`}>
                        <button type="button" className="btn btn-link">
                          <FormattedMessage id="entities" defaultMessage="Entities" />
                        </button>
                      </NavLink>
                    </li>

                    <li>
                      <NavLink to={`/visits/?websites=${wtbBrand.website.id}`}>
                        <button type="button" className="btn btn-link">
                          <FormattedMessage id="visits_list" defaultMessage="Visits (list)"/>
                        </button>
                      </NavLink>
                    </li>

                    <li>
                      <NavLink to={`/visits/stats?grouping=date&websites=${wtbBrand.website.id}`}>
                        <button type="button" className="btn btn-link">
                          <FormattedMessage id="visits_stats" defaultMessage="Visits (stats)"/>
                        </button>
                      </NavLink>
                    </li>

                    <li>
                      <NavLink to={`/leads/?websites=${wtbBrand.website.id}`}>
                        <button type="button" className="btn btn-link">
                          <FormattedMessage id="leads_list" defaultMessage="Leads (list)"/>
                        </button>
                      </NavLink>
                    </li>

                    <li>
                      <NavLink to={`/leads/stats?grouping=date&websites=${wtbBrand.website.id}`}>
                        <button type="button" className="btn btn-link">
                          <FormattedMessage id="leads_stats" defaultMessage="Leads (stats)"/>
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

function mapStateToProps(state) {
  const {ApiResourceObject} = apiResourceStateToPropsUtils(state);

  return {
    ApiResourceObject,
    stores: filterApiResourceObjectsByType(state.apiResourceObjects, 'stores'),
  }
}

export default connect(mapStateToProps)(WtbBrandDetail);
