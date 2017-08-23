import React, { Component } from 'react';
import {connect} from "react-redux";
import {
  addApiResourceDispatchToPropsUtils,
  addApiResourceStateToPropsUtils
} from "../../ApiResource";
import {FormattedMessage} from "react-intl";
import {NavLink} from "react-router-dom";
import LaddaButton, { XL, EXPAND_LEFT } from 'react-ladda';
import {settings} from "../../settings";
import {formatCurrency} from "../../utils";
import EntityDetailMenu from "./EntityDetailMenu";
import imageNotAvailable from '../../images/image-not-available.svg';
import './EntityDetail.css'
import PageAlerts from "../../components/PageAlerts";


class EntityDetail extends Component {
  constructor(props) {
    super(props);

    this.state = {
      updatingPricing: false,
      alerts: []
    }
  }

  onAlertDismiss = (idx) => {
    const oldAlerts = this.state.alerts;
    this.setState({
      alerts: [
        ...oldAlerts.slice(0, idx),
        {...oldAlerts[idx], visible: false},
        ...oldAlerts.slice(idx+1)
      ]
    })
  };

  updatePricingInformation = () => {
    this.setState({
      updatingPricing: true
    });

    this.props.fetchAuth(`${this.props.resourceObject.url}update_pricing/`, {
      method: 'POST'
    }).then(json => {
      this.setState({
        updatingPricing: false
      });
      if (json.url) {
        this.props.dispatch({
          type: 'updateApiResource',
          payload: json
        });
        this.setState({
          alerts: [
            ...this.state.alerts,
            {
              color: 'success',
              title: <FormattedMessage id="success_exclamation" defaultMessage="Success!" />,
              message: <FormattedMessage id="entity_information_updated_successfully" defaultMessage="Entity information updated successfully" />,
              visible: true
            }]
        })
      } else {
        // Something wrong happened
        this.setState({
          alerts: [
            ...this.state.alerts,
            {
              color: 'danger',
              title: <FormattedMessage id="error_exclamation" defaultMessage="Error!" />,
              message: <FormattedMessage id="entity_information_updated_error" defaultMessage="There was a problem updating the entity, it has been notified to our staff" />,
              visible: true
            }]
        })
      }
    })
  };

  render() {
    const entity = this.props.ApiResource(this.props.resourceObject);

    const localFormatCurrency = (value, valueCurrency, conversionCurrency) => {
      return formatCurrency(value, valueCurrency, conversionCurrency,
          this.props.preferredNumberFormat.thousands_separator,
          this.props.preferredNumberFormat.decimal_separator)
    };

    let stock = 0;
    if (entity.activeRegistry) {
      if (entity.activeRegistry.stock === -1) {
        stock = <FormattedMessage id="unknown" defaultMessage="Unknown" />;
      } else {
        stock = entity.activeRegistry.stock
      }
    }

    const canUpdatePricing =
        entity.store.permissions.includes('update_store_prices') ||
        entity.productType.permissions.includes('associate_product_type_entities') ||
        entity.productType.permissions.includes('update_product_type_entities_prices');

    const preferredCurrency = this.props.ApiResource(this.props.preferredCurrency);

    return (
        <div className="animated fadeIn">
          <PageAlerts alerts={this.state.alerts} onAlertDismiss={this.onAlertDismiss}/>

          <div className="row">
            <div className="col-sm-12 col-md-8 col-lg-8 col-xl-6">
              <div className="card">
                <div className="card-header"><strong><FormattedMessage id="picture" defaultMessage={`Picture`}/></strong></div>
                <div className="card-block center-aligned">
                  <img src={entity.pictureUrl || imageNotAvailable} className="img-fluid" alt={entity.name} />
                </div>
              </div>
            </div>
            <EntityDetailMenu entity={entity}/>
          </div>
          <div className="row">
            <div className="col-12 col-md-6">
              <div className="card">
                <div className="card-header"><strong>{entity.name}</strong></div>
                <div className="card-block">
                  {canUpdatePricing &&
                  <LaddaButton
                      loading={this.state.updatingPricing}
                      onClick={this.updatePricingInformation}
                      data-color="#eee"
                      data-size={XL}
                      data-style={EXPAND_LEFT}
                      data-spinner-size={30}
                      data-spinner-color="#ddd"
                      data-spinner-lines={12}
                      className="btn btn-primary mb-3"
                  >
                    {this.state.updatingPricing ?
                        <FormattedMessage id="updating" defaultMessage={`Updating`}/> :
                        <FormattedMessage id="update_information" defaultMessage={`Update information`}/>
                    }
                  </LaddaButton>
                  }
                  <table className="table table-striped">
                    <tbody>
                    <tr>
                      <th><FormattedMessage id="name" defaultMessage={`Name`} /></th>
                      <td>{entity.name}</td>
                    </tr>
                    <tr>
                      <th><FormattedMessage id="cell_plan_name" defaultMessage={`Cell plan name`} /></th>
                      <td>{entity.cellPlanName || <em>N/A</em>}</td>
                    </tr>
                    <tr>
                      <th><FormattedMessage id="store" defaultMessage={`Store`} /></th>
                      <td><NavLink to={'/stores/' + entity.store.id}>{entity.store.name}</NavLink></td>
                    </tr>
                    <tr>
                      <th><FormattedMessage id="url" defaultMessage={`URL`} /></th>
                      <td className="overflowed-table-cell"><NavLink to={entity.externalUrl}>{entity.externalUrl}</NavLink></td>
                    </tr>
                    <tr>
                      <th><FormattedMessage id="product_type" defaultMessage={`Product Type`} /></th>
                      <td>{entity.productType.name}</td>
                    </tr>
                    <tr>
                      <th><FormattedMessage id="product" defaultMessage={`Product`} /></th>
                      <td>{entity.product ? <NavLink to={'/products/' + entity.product.id}>{entity.product.name}</NavLink> : <em>N/A</em>}</td>
                    </tr>
                    <tr>
                      <th><FormattedMessage id="cell_plan" defaultMessage={`Cell Plan`} /></th>
                      <td>{entity.cellPlan ? <NavLink to={'/products/' + entity.cellPlan.id}>{entity.cellPlan.name}</NavLink> : <em>N/A</em>}</td>
                    </tr>
                    <tr>
                      <th><FormattedMessage id="part_number" defaultMessage={`Part Number`} /></th>
                      <td>{entity.partNumber || <em>N/A</em>}</td>
                    </tr>
                    <tr>
                      <th><FormattedMessage id="sku" defaultMessage={`SKU`} /></th>
                      <td>{entity.sku || <em>N/A</em>}</td>
                    </tr>
                    <tr>
                      <th><FormattedMessage id="detection_date" defaultMessage={`Detection date`} /></th>
                      <td>{entity.creationDate.toLocaleString()}</td>
                    </tr>
                    <tr>
                      <th><FormattedMessage id="last_update" defaultMessage={`Last update`} /></th>
                      <td>{entity.lastUpdated.toLocaleString()}</td>
                    </tr>
                    <tr>
                      <th><FormattedMessage id="is_visible_question" defaultMessage={`Visible?`} /></th>
                      <td><i className={entity.isVisible ?
                          'glyphicons glyphicons-check' :
                          'glyphicons glyphicons-unchecked'}/></td>
                    </tr>
                    <tr>
                      <th><FormattedMessage id="description" defaultMessage={`Description`} /></th>
                      <td>{entity.description || <em>N/A</em>}</td>
                    </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div className="col-12 col-md-6">
              <div className="card">
                <div className="card-header"><strong><FormattedMessage id="pricing_information" defaultMessage={`Pricing Information`}/></strong></div>
                <div className="card-block">
                  <table className="table table-striped">
                    <tbody>
                    <tr>
                      <th><FormattedMessage id="normal_price" defaultMessage={`Normal price`} /></th>
                      <td>
                        {entity.activeRegistry ?
                            <span>{localFormatCurrency(entity.activeRegistry.normal_price, entity.currency)}</span> :
                            <em>N/A</em>
                        }
                      </td>
                    </tr>
                    <tr>
                      <th><FormattedMessage id="offer_price" defaultMessage={`Offer price`} /></th>
                      <td>
                        {entity.activeRegistry ?
                            <span>{localFormatCurrency(entity.activeRegistry.offer_price, entity.currency)}</span> :
                            <em>N/A</em>
                        }
                      </td>
                    </tr>

                    <tr>
                      <th><FormattedMessage id="currency" defaultMessage={`Currency`} /></th>
                      <td>{entity.currency.name}</td>
                    </tr>

                    {preferredCurrency.url !== entity.currency.url &&
                    <tr>
                      <th>
                        <FormattedMessage id="normal_price" defaultMessage={`Normal price`} />
                        <span>&nbsp;({preferredCurrency.isoCode})</span>
                      </th>
                      <td>
                        {entity.activeRegistry ?
                            <span>{localFormatCurrency(entity.activeRegistry.normal_price, entity.currency, preferredCurrency)}</span> :
                            <em>N/A</em>
                        }
                      </td>
                    </tr>
                    }

                    {preferredCurrency.url !== entity.currency.url &&
                    <tr>
                      <th>
                        <FormattedMessage id="offer_price" defaultMessage={`Offer price`} />
                        <span>&nbsp;({preferredCurrency.isoCode})</span>
                      </th>
                      <td>
                        {entity.activeRegistry ?
                            <span>{localFormatCurrency(entity.activeRegistry.offer_price, entity.currency, preferredCurrency)}</span> :
                            <em>N/A</em>
                        }
                      </td>
                    </tr>
                    }

                    <tr>
                      <th><FormattedMessage id="is_active_question" defaultMessage={`Is active?`} /></th>
                      <td><i className={entity.activeRegistry ?
                          'glyphicons glyphicons-check' :
                          'glyphicons glyphicons-unchecked'}/>
                      </td>
                    </tr>

                    <tr>
                      <th><FormattedMessage id="is_available_question" defaultMessage={`Is available?`} /></th>
                      <td><i className={entity.activeRegistry && entity.activeRegistry.stock !== 0 ?
                          'glyphicons glyphicons-check' :
                          'glyphicons glyphicons-unchecked'}/>
                      </td>
                    </tr>

                    <tr>
                      <th><FormattedMessage id="stock" defaultMessage={`Stock`} /></th>
                      <td>
                        {stock}
                      </td>
                    </tr>

                    </tbody>
                  </table>
                </div>
              </div>

              {entity.store.permissions.includes('associate_store_entities') && entity.productType.permissions.includes('associate_product_type_entities') && <div className="card">
                <div className="card-header"><strong><FormattedMessage id="staff_information" defaultMessage={`Staff Information`}/></strong></div>
                <div className="card-block">
                  <table className="table table-striped">
                    <tbody>
                    <tr>
                      <th><FormattedMessage id="key" defaultMessage={`Key`} /></th>
                      <td>{entity.key}</td>
                    </tr>
                    <tr>
                      <th><FormattedMessage id="original_product_type" defaultMessage={`Original Product Type`} /></th>
                      <td>{entity.scrapedProductType.name}</td>
                    </tr>
                    <tr>
                      <th><FormattedMessage id="discovery_url" defaultMessage={`Discovery URL`} /></th>
                      <td className="overflowed-table-cell"><NavLink to={entity.discoveryUrl}>{entity.discoveryUrl}</NavLink></td>
                    </tr>
                    </tbody>
                  </table>
                </div>
              </div>}
            </div>

          </div>
        </div>)
  }
}

function mapStateToProps(state) {
  return {
    preferredCurrency: state.apiResources[state.apiResources[settings.ownUserUrl].preferred_currency],
    preferredNumberFormat: state.apiResources[state.apiResources[settings.ownUserUrl].preferred_number_format]
  }
}

export default connect(
    addApiResourceStateToPropsUtils(mapStateToProps),
    addApiResourceDispatchToPropsUtils())(EntityDetail);