import React, { Component } from 'react';
import {connect} from "react-redux";
import {
  addApiResourceDispatchToPropsUtils,
  addApiResourceStateToPropsUtils
} from "../../ApiResource";
import {FormattedMessage} from "react-intl";
import {settings} from "../../settings";
import Loading from "../../components/Loading";
import {NavLink} from "react-router-dom";
import {
  DropdownItem, DropdownMenu,
  DropdownToggle, UncontrolledDropdown
} from "reactstrap";
import './StoreUpdate.css';

class StoreUpdate extends Component {
  constructor(props) {
    super(props);
    this.state = {
      formData: {
        categories: [],
        async: true,
        stores: []
      },
      availableStores: undefined,
      updatedStores: undefined,
    }
  }

  componentDidMount() {
    if (typeof this.state.availableStores === 'undefined') {
      this.setState({
        availableStores: null
      });

      this.props.fetchAuth(`${settings.resourceEndpoints.store_update_logs}latest/`)
          .then((latestUpdateLogs) => {
            const storesForUpdate = this.props.stores
                .filter(store => store.permissions.includes('update_store_pricing')
                    && store.is_active);

            const availableStores = storesForUpdate.map(store => ({
              store,
              latestUpdateLog: latestUpdateLogs[store.url]
            }));

            this.setState({
              availableStores
            });

            this.selectPendingStores();
          })
    }
  }

  handleInputChange = (event) => {
    const target = event.target;

    let value = undefined;

    if (target.type === 'checkbox') {
      value = target.checked
    } else if (event.target.multiple) {
      value = [...event.target.options].filter(o => o.selected).map(o => o.value);
    } else {
      value = target.value
    }

    this.setState({
      formData: {...this.state.formData, [target.name]: value}
    });
  };

  handleStoreSelection = (event) => {
    const target = event.target;
    let newStores = undefined;

    if (target.checked) {
      newStores = [...this.state.formData.stores, target.name];
    } else {
      newStores = this.state.formData.stores.filter(store => store !== target.name)
    }

    this.setState({
      formData: {
        ...this.state.formData,
        stores: newStores
      }
    })
  };

  selectAllStores = () => {
    const newStores = this.state.availableStores.map(storeEntry => storeEntry.store.url);
    this.setState({
      formData: {
        ...this.state.formData,
        stores: newStores
      }
    })
  };

  selectNoneStores = () => {
    this.setState({
      formData: {
        ...this.state.formData,
        stores: []
      }
    })
  };

  selectPendingStores = () => {
    const newStores = this.state.availableStores
        .filter(storeEntry => !storeEntry.latestUpdateLog || storeEntry.latestUpdateLog.status !== 3)
        .map(storeEntry => storeEntry.store.url);
    this.setState({
      formData: {
        ...this.state.formData,
        stores: newStores
      }
    })
  };

  updateStores = () => {
    let categories = this.state.formData.categories;
    if (categories.length === 0) {
      categories = null
    }

    this.setState({
      updatedStores: 0
    });

    for (let store of this.state.formData.stores) {
      const payload = {
        categories: categories,
        async: this.state.formData.async
      };

      this.props.fetchAuth(`${store}update_pricing/`, {
        method: 'POST',
        body: JSON.stringify(payload)
      }).then(() => {
        this.setState({
          updatedStores: this.state.updatedStores + 1
        })
      })
    }
  };

  render() {
    if (!this.state.availableStores || !this.props.categories) {
      return <Loading />
    }

    const formData = this.state.formData;

    const availableStores = this.state.availableStores.map(storeEntry => {
      let newLatestUpdateLog = storeEntry.latestUpdateLog;

      if (newLatestUpdateLog) {
        newLatestUpdateLog = this.props.ApiResource(newLatestUpdateLog)
      }

      return {
        store: this.props.ApiResource(storeEntry.store),
        latestUpdateLog: newLatestUpdateLog
      }});

    const statusDict = {
      1: <FormattedMessage id="pending" defaultMessage={`Pending`} />,
      2: <FormattedMessage id="in_process" defaultMessage={`In process`} />,
      3: <FormattedMessage id="success" defaultMessage={`Success`} />,
      4: <FormattedMessage id="error" defaultMessage={`Error`} />
    };

    const categoryDict = this.props.categories.reduce(
        (acum, category) => ({
          ...acum,
          [category.url]: category.name
        }), {}
    );

    return (
        <div className="animated fadeIn">
          {this.state.updatedStores && (
              <div className="row">
                <div className="col-12">
                  <div className={`alert alert-success mt-3`} role="alert">
                    Requested updates: {this.state.updatedStores}
                  </div>
                </div>
              </div>
          )}
          <div className="row">
            <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-4">
              <div className="card">
                <div className="card-header">
                  <i className="glyphicons glyphicons-list">&nbsp;</i> <FormattedMessage id="parameters" defaultMessage={`Parameters`} />
                </div>
                <div className="card-block">
                  <div className="form-group">
                    <label htmlFor="categories"><FormattedMessage id="categories" defaultMessage={`Categories`} /></label>
                    <select className="form-control" id="categories" name="categories" multiple="multiple" size="8"
                            value={formData.categories} onChange={this.handleInputChange}>
                      {this.props.categories.map(category => (
                          <option key={category.url} value={category.url}>{category.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="checkbox">
                    <label htmlFor="async">
                      <input
                          name="async"
                          id="async"
                          type="checkbox"
                          checked={formData.async}
                          onChange={this.handleInputChange} /> <FormattedMessage id="use_async_question" defaultMessage={`Use async?`} />
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <i className="glyphicons glyphicons-list">&nbsp;</i> <FormattedMessage id="stores" defaultMessage={`Stores`} />
                </div>
                <div className="card-block">
                  <div className="row pb-3">
                    <div className="col-12 d-flex justify-content-start">
                      <UncontrolledDropdown className="no-flex">
                        <DropdownToggle caret color="primary">
                          <FormattedMessage id="select_dropdown" defaultMessage={`Select`} />
                        </DropdownToggle>
                        <DropdownMenu>
                          <DropdownItem onClick={this.selectPendingStores}><FormattedMessage id="pending" defaultMessage={`Pending`} /></DropdownItem>
                          <DropdownItem onClick={this.selectAllStores}><FormattedMessage id="all" defaultMessage={`All`} /></DropdownItem>
                          <DropdownItem onClick={this.selectNoneStores}><FormattedMessage id="none" defaultMessage={`None`} /></DropdownItem>
                        </DropdownMenu>
                      </UncontrolledDropdown>

                      <div className="spacer flex-1">&nbsp;</div>

                      <div className="no-flex">
                        <button type="button" className="btn btn-success" disabled={!formData.stores.length} onClick={this.updateStores}>
                          <FormattedMessage id="update" defaultMessage={`Update`} /> ({formData.stores.length})
                        </button>
                      </div>
                    </div>
                  </div>
                  <table className="table table-striped">
                    <thead>
                    <tr>
                      <th>&nbsp;</th>
                      <th><FormattedMessage id="name" defaultMessage={`Name`} /></th>
                      <th><FormattedMessage id="status" defaultMessage={`Status`} /></th>
                      <th className="hidden-xs-down"><FormattedMessage id="result" defaultMessage={`Result`} /></th>
                      <th className="hidden-sm-down"><FormattedMessage id="last_update" defaultMessage={`Last update`} /></th>
                      <th className="hidden-sm-down"><FormattedMessage id="categories" defaultMessage={`Categories`} /></th>
                      <th className="hidden-sm-down"><FormattedMessage id="start" defaultMessage={`Start`} /></th>
                      <th className="hidden-md-down"><FormattedMessage id="log" defaultMessage={`Log`} /></th>
                    </tr>
                    </thead>
                    <tbody>
                    {availableStores.map(storeEntry => (
                        storeEntry.latestUpdateLog ?
                            <tr key={storeEntry.store.url}>
                              <td className="text-center">
                                <input
                                    type="checkbox"
                                    checked={formData.stores.includes(storeEntry.store.url)}
                                    onChange={this.handleStoreSelection}
                                    name={storeEntry.store.url}
                                />
                              </td>
                              <td>
                                <NavLink to={'/stores/' + storeEntry.store.id}>{storeEntry.store.name}</NavLink>
                              </td>
                              <td>{statusDict[storeEntry.latestUpdateLog.status]}</td>
                              <td className="hidden-xs-down">
                                {storeEntry.latestUpdateLog.availableProductsCount
                                    ? `${storeEntry.latestUpdateLog.availableProductsCount} / ${storeEntry.latestUpdateLog.unavailableProductsCount} / ${storeEntry.latestUpdateLog.discoveryUrlsWithoutProductsCount}`
                                    : 'N/A'
                                }
                              </td>
                              <td className="hidden-sm-down">{storeEntry.latestUpdateLog.lastUpdated.toLocaleString()}</td>
                              <td className="hidden-sm-down">
                                <ul>
                                  {storeEntry.latestUpdateLog.categories.map(pt => (
                                      <li key={pt}>{categoryDict[pt]}</li>
                                  ))}
                                </ul>
                              </td>

                              <td className="hidden-sm-down">{storeEntry.latestUpdateLog.creationDate.toLocaleString()}</td>

                              <td className="hidden-md-down">
                                {storeEntry.latestUpdateLog.registryFile ?
                                    <a href={storeEntry.latestUpdateLog.registryFile} target="_blank"><FormattedMessage id="download" defaultMessage={`Download`} /></a> :
                                    <FormattedMessage id="unavailable" defaultMessage={`Unavailable`} />
                                }
                              </td>
                            </tr>
                            : <tr key={storeEntry.store.url}>
                              <td className="text-center">
                                <input
                                    type="checkbox"
                                    checked={formData.stores.includes(storeEntry.store.url)}
                                    onChange={this.handleStoreSelection}
                                    name={storeEntry.store.url}
                                />
                              </td>
                              <td><NavLink to={'/stores/' + storeEntry.store.id}>{storeEntry.store.name}</NavLink></td>
                              <td className="text-center" colSpan="8">
                                {typeof storeEntry.latestUpdateLog === 'undefined' ?
                                    <FormattedMessage id="loading_dots" defaultMessage={`Loading...`} /> :
                                    <FormattedMessage id="no_registry_found" defaultMessage={`No registry found`} />
                                }
                              </td>
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

export default connect(
    addApiResourceStateToPropsUtils(),
    addApiResourceDispatchToPropsUtils())(StoreUpdate);