import React, { Component } from 'react';
import {
  addApiResourceDispatchToPropsUtils,
  addApiResourceStateToPropsUtils
} from '../../ApiResource';
import {connect} from "react-redux";
import {FormattedMessage} from "react-intl";
import NavLink from "react-router-dom/es/NavLink";
import Loading from "../../components/Loading";


class StoreList extends Component {
  constructor() {
    super();
    this.state = {
      stores: undefined
    }
  }

  componentDidMount() {
    if (typeof this.state.stores === 'undefined') {
      this.setState({
        stores: null
      });
      this.props
          .fetchApiResource('stores', this.props.dispatch)
          .then(json =>  {
            const filtered_stores = json.filter(store => store.permissions.includes('backend_view_store'));
            this.setState({stores: filtered_stores})
          })
    }
  }

  render() {
    const stores = this.state.stores;

    if (!stores) {
      return <Loading />
    }
    const apiResourceStores = stores.map(x => this.props.ApiResource(x));

    return <div className="animated fadeIn">
      <div className="row">
        <div className="col-12 col-md-10 col-lg-10 col-xl-8">
          <div className="card">
            <div className="card-header">
              <i className="glyphicons glyphicons-list">&nbsp;</i> <FormattedMessage id="stores" defaultMessage={`Stores`} />
            </div>
            <div className="card-block">
              <table className="table table-striped">
                <thead>
                <tr>
                  <th><FormattedMessage id="name" defaultMessage={`Name`} /></th>
                  <th><FormattedMessage id="country" defaultMessage={`Country`} /></th>
                  <th className="hidden-xs-down"><FormattedMessage id="type" defaultMessage={`type`} /></th>
                  <th className="text-center hidden-xs-down"><FormattedMessage id="active_question" defaultMessage={`Active?`} /></th>
                  <th className="hidden-sm-down"><FormattedMessage id="scraper" defaultMessage={`Scraper`} /></th>
                </tr>
                </thead>
                <tbody>
                {apiResourceStores.map(store => (
                    <tr key={store.url}>
                      <td>
                        <NavLink to={'/stores/' + store.id}>{store.name}</NavLink>
                      </td>
                      <td>{store.country.name}</td>
                      <td className="hidden-xs-down">{store.type.name}</td>
                      <td className="text-center hidden-xs-down"><i className={store.isActive ? 'glyphicons glyphicons-check' : 'glyphicons glyphicons-unchecked'}>&nbsp;</i></td>
                      <td className="hidden-sm-down">{store.storescraperClass}</td>
                    </tr>
                ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  }
}

export default connect(
    addApiResourceStateToPropsUtils(),
    addApiResourceDispatchToPropsUtils())(StoreList);