import React, { Component } from 'react';
import {connect} from "react-redux";
import {
  addApiResourceDispatchToPropsUtils,
  addApiResourceStateToPropsUtils
} from "../../ApiResource";
import {FormattedMessage, injectIntl} from "react-intl";
import {NavLink} from "react-router-dom";
import LaddaButton, { XL, EXPAND_LEFT } from 'react-ladda';
import ReactMarkdown from 'react-markdown';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { polyfill } from 'smoothscroll-polyfill'
import { ToastContainer, toast } from 'react-toastify';
import Select from 'react-select';
import {settings} from "../../settings";
import {formatCurrency, formatDateStr} from "../../utils";
import EntityDetailMenu from "./EntityDetailMenu";
import imageNotAvailable from '../../images/image-not-available.svg';
import 'react-toastify/dist/ReactToastify.min.css';
import './EntityDetail.css'
import {createOption, createOptions} from "../../form_utils";
import LoadingInline from "../../components/LoadingInline";


class EntityDetail extends Component {
  constructor(props) {
    super(props);
    polyfill();

    this.state = {
      updatingPricing: false,
      changingVisibility: false,
      categoryForChange: null
    }
  }

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
        toast.success(<FormattedMessage
            id="entity_information_updated_successfully"
            defaultMessage="Entity information has been updated successfully and it should be reflected in the panels below. If it doesn't please contact our staff." />, {
          autoClose: false
        })
      } else {
        // Something wrong happened
        toast.error(<FormattedMessage id="entity_information_updated_error" defaultMessage="There was a problem updating the entity, it has been notified to our staff" />, {
          autoClose: false
        })
      }
    })
  };

  handleVisibilityToggle = (event) => {
    this.setState({
      changingVisibility: true
    });

    this.props.fetchAuth(`${this.props.resourceObject.url}toggle_visibility/`, {
      method: 'POST'
    }).then(json => {
      this.props.dispatch({type: 'updateApiResource', payload: json});
      this.setState({
        changingVisibility: false
      });
      toast.success(<FormattedMessage id="entity_visibility_updated_successfully" defaultMessage="Entity visibility updated!" />);
    })
  };

  handleVisibilityToggleClick = (event) => {
    if (this.props.resourceObject.product) {
      toast.warn(<FormattedMessage id="hiding_associated_entity_warning" defaultMessage="Please deassociate the the entity before hiding it" />, {
        autoClose: false
      });
    }
  };

  changeCategory = () => {
    const requestBody = JSON.stringify({category: this.state.categoryForChange.id});

    this.props.fetchAuth(`${this.props.resourceObject.url}change_category/`, {
      method: 'POST',
      body: requestBody
    }).then(json => {
      this.setState({
        categoryForChange: null
      });

      this.props.dispatch({type: 'updateApiResource', payload: json});
      toast.success(<FormattedMessage id="entity_category_changed_successfully" defaultMessage="Entity category changed!" />);

      this.props.fetchApiResourceObject('entities', this.props.resourceObject.id, this.props.dispatch)
    });
  };

  userHasStaffPermissionOverSelectedCategory = () => {
    return this.state.categoryForChange.permissions.includes('category_entities_staff')
  };

  handleChangeCategory = newCategoryChoice => {
    this.setState({
      categoryForChange: newCategoryChoice
    }, () => {
      if (this.userHasStaffPermissionOverSelectedCategory()) {
        this.changeCategory();
      }
    });
  };

  handleChangeCategoryClick = (event) => {
    if (this.props.resourceObject.product) {
      toast.warn(<FormattedMessage id="changing_category_of_associated_entity_warning" defaultMessage="Please deassociate the the entity before changing it's category" />, {
        autoClose: false
      });
    }
  };

  resetCategoryForChange = () => {
    this.setState({
      categoryForChange: null
    })
  };

  render() {
    const localFormatCurrency = (value, valueCurrency, conversionCurrency) => {
      return formatCurrency(value, valueCurrency, conversionCurrency,
          this.props.preferredNumberFormat.thousands_separator,
          this.props.preferredNumberFormat.decimal_separator)
    };

    const entity = this.props.ApiResource(this.props.resourceObject);

    let stock = 0;
    if (entity.activeRegistry) {
      if (entity.activeRegistry.stock === -1) {
        stock = <FormattedMessage id="unknown" defaultMessage="Unknown" />;
      } else {
        stock = entity.activeRegistry.stock
      }
    }

    const hasStaffPermissions =
        entity.category.permissions.includes('category_entities_staff') &&
        entity.store.permissions.includes('store_entities_staff');

    const canUpdatePricing =
        entity.store.permissions.includes('update_store_pricing') ||
        hasStaffPermissions ||
        entity.category.permissions.includes('update_category_entities_pricing');

    const preferredCurrency = this.props.ApiResource(this.props.preferredCurrency);
    const visibilitySwitchEnabled = !this.state.changingVisibility && !entity.product;
    const categorySelectEnabled = !this.state.categoryForChange && !entity.product;
    const categoryOptions = createOptions(this.props.categories);
    const isModalOpen = Boolean(this.state.categoryForChange) && !this.userHasStaffPermissionOverSelectedCategory();

    return (
        <div className="animated fadeIn">
          <ToastContainer
              position="top-right"
              type="default"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              pauseOnHover
          />

          <div className="row">
            <div className="col-sm-12 col-md-8 col-lg-6 col-xl-5">
              <div className="card">
                <div className="card-header"><strong><FormattedMessage id="picture" defaultMessage={`Picture`}/></strong></div>
                <div className="card-block center-aligned">
                  <img src={entity.pictureUrl || imageNotAvailable} className="img-fluid" alt={entity.name} />
                </div>
              </div>
            </div>
            <div className="col-sm-12 col-md-4 col-lg-6">
              <EntityDetailMenu entity={entity}/>
              {canUpdatePricing &&
              <div className="card">
                <div className="card-header"><strong><FormattedMessage
                    id="update_information"
                    defaultMessage={`Update information`}/></strong></div>
                <div className="card-block">
                  <p>
                    <FormattedMessage id="update_entity_description"
                                      defaultMessage={`Updates the entity information from the store website`}/>
                  </p>
                  <LaddaButton
                      loading={this.state.updatingPricing}
                      onClick={this.updatePricingInformation}
                      data-color="#eee"
                      data-size={XL}
                      data-style={EXPAND_LEFT}
                      data-spinner-size={30}
                      data-spinner-color="#ddd"
                      data-spinner-lines={12}
                      className="btn btn-primary mb-3">
                    {this.state.updatingPricing ?
                        <FormattedMessage id="updating"
                                          defaultMessage={`Updating`}/> :
                        <FormattedMessage id="update_information"
                                          defaultMessage={`Update information`}/>
                    }
                  </LaddaButton>
                </div>
              </div>
              }
            </div>
          </div>
          <div className="row">
            <div className="col-12 col-md-6">
              <div className="card">
                <div className="card-header"><strong><FormattedMessage id="general_information" defaultMessage={`General Information`}/></strong></div>
                <div className="card-block">
                  <table className="table table-striped mb-0">
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
                      <td>
                        {entity.store.permissions.includes('backend_view_store') ?
                            <NavLink to={'/stores/' + entity.store.id}>{entity.store.name}</NavLink> :
                            entity.store.name
                        }
                      </td>
                    </tr>
                    <tr>
                      <th><FormattedMessage id="url" defaultMessage={`URL`} /></th>
                      <td className="overflowed-table-cell"><a href={entity.externalUrl} target="_blank">{entity.externalUrl}</a></td>
                    </tr>
                    <tr>
                      <th><FormattedMessage id="category" defaultMessage={`Category`} /></th>
                      <td>
                        {hasStaffPermissions ?
                            <div onClick={this.handleChangeCategoryClick}>
                              <Select
                                  name="categories"
                                  id="categories"
                                  options={categoryOptions}
                                  value={createOption(entity.category)}
                                  onChange={this.handleChangeCategory}
                                  searchable={false}
                                  clearable={false}
                                  disabled={!categorySelectEnabled}
                              />
                            </div>
                            :
                            entity.category.name
                        }
                      </td>
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
                      <td>{formatDateStr(entity.creationDate)}</td>
                    </tr>
                    <tr>
                      <th><FormattedMessage id="last_update" defaultMessage={`Last update`} /></th>
                      <td>{formatDateStr(entity.lastUpdated)}</td>
                    </tr>
                    <tr>
                      <th><FormattedMessage id="is_visible_question" defaultMessage={`Visible?`} /></th>
                      <td>
                        {hasStaffPermissions ?
                            <div>
                              <label
                                  id="visibility-toggle"
                                  className={`switch switch-text ${visibilitySwitchEnabled ? 'switch-primary' : 'switch-secondary'}`}
                                  onClick={this.handleVisibilityToggleClick}>
                                <input
                                    type="checkbox"
                                    className="switch-input"
                                    checked={entity.isVisible}
                                    onChange={this.handleVisibilityToggle}
                                    disabled={!visibilitySwitchEnabled}
                                />
                                <span className="switch-label"
                                      data-on={this.props.intl.formatMessage({id: 'yes'})}
                                      data-off={this.props.intl.formatMessage({id: 'no'})}>&nbsp;</span>
                                <span className="switch-handle">&nbsp;</span>
                              </label>
                              {this.state.changingVisibility && <LoadingInline />}
                            </div>
                            : <i className={entity.isVisible ?
                                'glyphicons glyphicons-check' :
                                'glyphicons glyphicons-unchecked'}/> }
                      </td>
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
                  <table className="table table-striped mb-0">
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
                      <td>{entity.currency.isoCode}</td>
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

              {entity.store.permissions.includes('associate_store_entities') && entity.category.permissions.includes('associate_category_entities') && <div className="card">
                <div className="card-header"><strong><FormattedMessage id="staff_information" defaultMessage={`Staff Information`}/></strong></div>
                <div className="card-block">
                  <table className="table table-striped">
                    <tbody>
                    <tr>
                      <th><FormattedMessage id="key" defaultMessage={`Key`} /></th>
                      <td>{entity.key}</td>
                    </tr>
                    <tr>
                      <th><FormattedMessage id="original_category" defaultMessage={`Original category`} /></th>
                      <td>{entity.scrapedCategory.name}</td>
                    </tr>
                    <tr>
                      <th><FormattedMessage id="discovery_url" defaultMessage={`Discovery URL`} /></th>
                      <td className="overflowed-table-cell"><a href={entity.discoveryUrl} target="_blank">{entity.discoveryUrl}</a></td>
                    </tr>
                    </tbody>
                  </table>
                </div>
              </div>}
            </div>

            <div className="col-12">
              <div className="card">
                <div className="card-header"><strong><FormattedMessage id="description" defaultMessage={`Description`}/></strong></div>
                <div className="card-block" id="description-container">
                  <ReactMarkdown source={entity.description} />
                </div>
              </div>
            </div>

          </div>

          <Modal isOpen={isModalOpen}>
            <ModalHeader><FormattedMessage id="entity_irreversible_category_change_title" defaultMessage='Irreversible category change' /></ModalHeader>
            <ModalBody>
              <FormattedMessage id="entity_irreversible_category_change_body" defaultMessage="You don't have staff permissions over the category you are assigning. If you proceed you will not be able to edit (or maybe even access) this entity any more." />

            </ModalBody>
            <ModalFooter>
              <Button color="primary" onClick={this.changeCategory}><FormattedMessage id="entity_irreversible_category_change_proceed" defaultMessage='OK, Proceed either way' /></Button>{' '}
              <Button color="secondary" onClick={this.resetCategoryForChange}><FormattedMessage id="cancel" defaultMessage='Cancel' /></Button>
            </ModalFooter>
          </Modal>
        </div>)
  }
}

function mapStateToProps(state) {
  return {
    preferredCurrency: state.apiResources[state.apiResources[settings.ownUserUrl].preferred_currency],
    preferredNumberFormat: state.apiResources[state.apiResources[settings.ownUserUrl].preferred_number_format]
  }
}

export default injectIntl(connect(
    addApiResourceStateToPropsUtils(mapStateToProps),
    addApiResourceDispatchToPropsUtils())(EntityDetail));