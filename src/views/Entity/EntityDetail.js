import React, { Component } from 'react';
import {connect} from "react-redux";
import {
  addApiResourceDispatchToPropsUtils,
  addApiResourceStateToPropsUtils
} from "../../react-utils/ApiResource";
import {
  createOption,
  createOptions,
} from "../../react-utils/form_utils";
import {FormattedMessage, injectIntl} from "react-intl";
import {NavLink} from "react-router-dom";
import LaddaButton, { XL, EXPAND_LEFT } from 'react-ladda';
import { Markdown } from 'react-showdown';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { toast } from 'react-toastify';
import Select from 'react-select';
import trim from 'lodash/trim';
import ImageGallery from 'react-image-gallery';
import {settings} from "../../settings";
import {formatCurrency, formatDateStr} from "../../react-utils/utils";
import imageNotAvailable from '../../images/image-not-available.svg';
import './EntityDetail.css'
import moment from "moment";

const DISSOCIATING_STATES = {
  STAND_BY: 1,
  CONFIRMING: 2,
  EXECUTING: 3,
};

class EntityDetail extends Component {
  constructor(props) {
    super(props);

    this.state = {
      updatingPricing: false,
      changingVisibility: false,
      categoryForChange: null,
      dissociatingState: DISSOCIATING_STATES.STAND_BY,
      dissociationReason: '',
      stock: undefined,
      staffInfo: undefined
    }
  }

  componentDidMount() {
    window.scrollTo(0, 0);
    const entity = this.props.apiResourceObject;

    // If the user is staff:
    // if some other staff has been editing this entity in the last 10 minutes, show a warning
    // Othjerwise register the staff entry
    let registerStaffAccess = false;

    const userHasStaffPermissions = this.userHasStaffPermissions();

    if (userHasStaffPermissions) {
      if (entity.last_staff_access) {
        const lastStaffAccess = moment(entity.last_staff_access);
        const durationSinceLastStaffAccess = moment.duration(moment().diff(lastStaffAccess));
        if (durationSinceLastStaffAccess.asMinutes() < 10) {
          if (entity.last_staff_access_user !== this.props.user.detail_url) {
            toast.warn(<FormattedMessage
                id="entity_staff_overlap_warning"
                defaultMessage="Someone has been working here recently. Be mindful!"/>, {autoClose: false})
          }
        } else {
          registerStaffAccess = true;
        }
      } else {
        registerStaffAccess = true;
      }
    } else {
      if (!entity.is_visible) {
        toast.warn(<FormattedMessage
            id="entity_invisible_warning"
            defaultMessage="Our staff has marked this entity as non-relevant, so it is ignored by our system. If this is not the case please contact us."/>, {autoClose: false})
      }

      if (entity.is_visible && entity.active_registry && entity.active_registry.is_available && !entity.product) {
        toast.info(<FormattedMessage
            id="entity_not_associated_info"
            defaultMessage="This entity has not yet been processed by our staff. Please contact us if you want to prioritize it."/>, {autoClose: false})
      }

      if (!entity.active_registry.is_available) {
        toast.info(<FormattedMessage
            id="entity_not_available_info"
            defaultMessage="Please note that this entity is not available for purchase according to our system."/>, {autoClose: false})
      }
    }

    if (registerStaffAccess) {
      this.props.fetchAuth(`${entity.url}register_staff_access/`, {method: 'POST'})
          .then(json => {
            this.saveEntityChanges(json)
          })
    }

    if (this.userHasStockPermissions()) {
      if (entity.active_registry && entity.active_registry.is_available) {
        const endpoint = entity.active_registry.url + 'stock/';
        this.props.fetchAuth(endpoint).then(json => {
          const stock = json.stock;
          this.setState({
            stock
          })
        })
      } else {
        this.setState({
          stock: 0
        })
      }
    }

    if (userHasStaffPermissions) {
      const endpoint = entity.url + 'staff_info/';
      this.props.fetchAuth(endpoint).then(staffInfo => {
        this.setState({
          staffInfo
        })
      })
    }
  }

  componentWillReceiveProps(nextProps) {
    const currentEntity = this.props.ApiResourceObject(this.props.apiResourceObject);
    const nextEntity = this.props.ApiResourceObject(nextProps.apiResourceObject);

    // Pricing update notification
    const currentLastPricingUpdate = moment(currentEntity.lastPricingUpdate);
    const nextLastPricingUpdate = moment(nextEntity.lastPricingUpdate);

    if (currentLastPricingUpdate.isBefore(nextLastPricingUpdate)) {
      toast.success(<FormattedMessage
          id="entity_information_updated_successfully"
          defaultMessage="Entity information has been updated successfully and it should be reflected in the panels below. If it doesn't please contact our staff." />, {
        autoClose: false
      })
    }
  }

  saveEntityChanges = (changedEntity) => {
    this.props.dispatch({
      type: 'updateApiResourceObject',
      apiResourceObject: changedEntity
    });
  };

  updatePricingInformation = () => {
    this.setState({
      updatingPricing: true
    });

    this.props.fetchAuth(`${this.props.apiResourceObject.url}update_pricing/`, {
      method: 'POST'
    }).then(json => {
      this.setState({
        updatingPricing: false
      });
      if (json.url) {
        this.saveEntityChanges(json);
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
    }, () => {
      this.props.fetchAuth(`${this.props.apiResourceObject.url}toggle_visibility/`, {
        method: 'POST'
      }).then(json => {
        this.saveEntityChanges(json);
        this.setState({
          changingVisibility: false
        });
      })
    });
  };

  handleVisibilityToggleClick = (event) => {
    if (this.props.apiResourceObject.product) {
      toast.warn(<FormattedMessage id="hiding_associated_entity_warning" defaultMessage="Please dissociate the the entity before hiding it" />, {
        autoClose: false
      });
    }
  };

  changeCategory = () => {
    const requestBody = JSON.stringify({category: this.state.categoryForChange.id});

    this.props.fetchAuth(`${this.props.apiResourceObject.url}change_category/`, {
      method: 'POST',
      body: requestBody
    }).then(json => {
      this.setState({
        categoryForChange: null
      }, () => {
        // We may no longer have permissions to access the entity, so fetch it again.
        // If we don't, the rsource will be deleted from the app ApiResources and
        // we will be automatically redirected to another page.
        this.props.fetchApiResourceObject('entities', json.id, this.props.dispatch)
      });
    });
  };

  dissociate = () => {
    this.setState({
      dissociatingState: DISSOCIATING_STATES.EXECUTING
    });

    const requestBody = {};
    const reason = trim(this.state.dissociationReason);

    if (reason) {
      requestBody.reason = reason
    }

    this.props.fetchAuth(`${this.props.apiResourceObject.url}dissociate/`, {
      method: 'POST',
      body: JSON.stringify(requestBody)
    }).then(json => {
      this.saveEntityChanges(json);
      this.setState({
        dissociatingState: DISSOCIATING_STATES.STAND_BY,
        dissociationReason: ''
      });
    });
  };

  userHasStaffPermissionOverSelectedCategory = () => {
    return this.state.categoryForChange.permissions.includes('category_entities_staff')
  };

  handleChangeCategory = newCategoryChoice => {
    this.setState({
      categoryForChange: newCategoryChoice.option
    }, () => {
      if (this.userHasStaffPermissionOverSelectedCategory()) {
        this.changeCategory();
      }
    });
  };

  handleChangeCategoryClick = (event) => {
    if (this.props.apiResourceObject.product) {
      toast.warn(<FormattedMessage id="changing_category_of_associated_entity_warning" defaultMessage="Please deassociate the the entity before changing it's category" />, {
        autoClose: false
      });
    }
  };

  handleDissociateClick = (event) => {
    this.setState({
      dissociatingState: DISSOCIATING_STATES.CONFIRMING
    });
  };

  resetCategoryForChange = () => {
    this.setState({
      categoryForChange: null
    })
  };

  resetdissociating = () => {
    this.setState({
      dissociatingState: DISSOCIATING_STATES.STAND_BY
    })
  };

  userHasStockPermissions = () => {
    const entity = this.props.ApiResourceObject(this.props.apiResourceObject);
    return entity.category.permissions.includes('view_category_stocks') &&
        entity.store.permissions.includes('view_store_stocks');
  };

  userHasStaffPermissions = () => {
    const entity = this.props.ApiResourceObject(this.props.apiResourceObject);
    return entity.category.permissions.includes('category_entities_staff') &&
        entity.store.permissions.includes('is_store_staff');
  };

  render() {
    const localFormatCurrency = (value, valueCurrency, conversionCurrency) => {
      return formatCurrency(value, valueCurrency, conversionCurrency,
          this.props.preferredNumberFormat.thousands_separator,
          this.props.preferredNumberFormat.decimal_separator)
    };

    const entity = this.props.ApiResourceObject(this.props.apiResourceObject);

    const displayStocksCell = this.userHasStockPermissions();

    const hasStaffPermissions = this.userHasStaffPermissions();


    const canUpdatePricing =
        entity.store.permissions.includes('update_store_pricing') ||
        hasStaffPermissions ||
        entity.category.permissions.includes('update_category_entities_pricing');

    const preferredCurrency = this.props.ApiResourceObject(this.props.preferredCurrency);
    const visibilitySwitchEnabled = !this.state.changingVisibility && !entity.product;
    const categorySelectEnabled = !this.state.categoryForChange && !entity.product;
    const categoryOptions = createOptions(this.props.categories);

    const conditions = [
      {
        'id': 'https://schema.org/NewCondition',
        'name': <FormattedMessage id="condition_new" defaultMessage="New"/>
      },
      {
        'id': 'https://schema.org/DamagedCondition',
        'name': <FormattedMessage id="condition_damaged" defaultMessage="Damaged"/>
      },
      {
        'id': 'https://schema.org/RefurbishedCondition',
        'name': <FormattedMessage id="condition_refurbished" defaultMessage="Refurbished"/>
      },
      {
        'id': 'https://schema.org/UsedCondition',
        'name': <FormattedMessage id="condition_used" defaultMessage="Used"/>
      }
    ];

    const currentCondition = conditions.filter(condition => condition.id === entity.condition)[0];

    const isModalOpen = Boolean(this.state.categoryForChange) && !this.userHasStaffPermissionOverSelectedCategory();

    let images = null;

    if (entity.pictureUrls && entity.pictureUrls.length) {
      images = entity.pictureUrls.map(pictureUrl => ({
        original: pictureUrl,
        thumbnail: pictureUrl
      }))
    }

    const staffInfo = this.state.staffInfo ? this.props.ApiResourceObject(this.state.staffInfo) : null;

    return (
        <div className="animated fadeIn">
          <div className="row">
            <div className="col-sm-12 col-md-8 col-lg-6 col-xl-5" id="entity-pictures-carousel-card">
              <div className="card">
                <div className="card-header">
                  <span className="glyphicons glyphicons-pictures">&nbsp;</span>
                  <FormattedMessage id="pictures" defaultMessage='Pictures'/>
                </div>
                <div className="card-block center-aligned">
                  {images ?
                      <ImageGallery
                          items={images}
                          showFullscreenButton={false}
                          showPlayButton={false}
                      />
                      : <img src={imageNotAvailable} className="img-fluid" alt={entity.name} />
                  }
                </div>
              </div>
            </div>
            <div className="col-sm-12 col-md-4 col-lg-6 col-xl-5">
              <div className="card">
                <div className="card-header">
                  <FormattedMessage id="options" defaultMessage={`Options`} />
                </div>
                <div className="card-block">
                  <ul className="list-without-decoration subnavigation-links">
                    <li><NavLink to={`/entities/${entity.id}/events`}>
                      <button type="button" className="btn btn-link">
                        <FormattedMessage id="events" defaultMessage={`Events`} />
                      </button>
                    </NavLink></li>

                    <li><NavLink to={`/entities/${entity.id}/pricing_history`}>
                      <button type="button" className="btn btn-link">
                        <FormattedMessage id="pricing_history" defaultMessage={`Pricing history`} />
                      </button>
                    </NavLink></li>

                    {entity.store.permissions.includes('is_store_staff') && entity.category.permissions.includes('is_category_staff') &&
                    <li><NavLink to={'/entities/' + entity.id + '/associate'}>
                      <button type="button" className="btn btn-link">
                        <FormattedMessage id="associate_to_prduct" defaultMessage={`Associate`} />
                      </button>
                    </NavLink></li>}
                    {entity.store.permissions.includes('view_store_leads') && entity.category.permissions.includes('view_category_leads') &&
                    <li><NavLink to={'/leads/?entities=' + entity.id}>
                      <button type="button" className="btn btn-link">
                        <FormattedMessage id="leads_list" defaultMessage="Leads (list)" />
                      </button>
                    </NavLink></li>}
                    {entity.store.permissions.includes('view_store_leads') && entity.category.permissions.includes('view_category_leads') &&
                    <li><NavLink to={'/leads/stats?grouping=date&entities=' + entity.id}>
                      <button type="button" className="btn btn-link">
                        <FormattedMessage id="leads_stats" defaultMessage="Leads (stats)" />
                      </button>
                    </NavLink></li>}
                  </ul>
                </div>
              </div>
              {canUpdatePricing &&
              <div className="card">
                <div className="card-header">
                  <FormattedMessage id="update_information" defaultMessage='Update information'/>
                </div>
                <div className="card-block">
                  <p>
                    <FormattedMessage id="update_entity_description"
                                      defaultMessage='Updates the entity information from the store website'/>
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
                                          defaultMessage='Updating'/> :
                        <FormattedMessage id="update_information"
                                          defaultMessage='Update information'/>
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
                <div className="card-header">
                  <FormattedMessage id="general_information" defaultMessage='General Information'/>
                </div>
                <div className="card-block">
                  <table className="table table-striped mb-0">
                    <tbody>
                    <tr>
                      <th><FormattedMessage id="name" defaultMessage='Name' /></th>
                      <td>{entity.name}</td>
                    </tr>
                    <tr>
                      <th><FormattedMessage id="cell_plan_name" defaultMessage='Cell plan name' /></th>
                      <td>{entity.cellPlanName || <em>N/A</em>}</td>
                    </tr>
                    <tr>
                      <th><FormattedMessage id="store" defaultMessage='Store' /></th>
                      <td>
                        <NavLink to={'/stores/' + entity.store.id}>{entity.store.name}</NavLink>
                      </td>
                    </tr>
                    <tr>
                      <th><FormattedMessage id="url" defaultMessage='URL' /></th>
                      <td className="overflowed-table-cell"><a href={entity.externalUrl} target="_blank">{entity.externalUrl}</a></td>
                    </tr>
                    <tr>
                      <th><FormattedMessage id="category" defaultMessage='Category' /></th>
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
                      <th><FormattedMessage id="condition" defaultMessage="Condition" /></th>
                      <td>
                        {currentCondition.name}
                      </td>
                    </tr>
                    <tr>
                      <th><FormattedMessage id="part_number" defaultMessage='Part Number' /></th>
                      <td>{entity.partNumber || <em>N/A</em>}</td>
                    </tr>
                    <tr>
                      <th><FormattedMessage id="sku" defaultMessage='SKU' /></th>
                      <td>{entity.sku || <em>N/A</em>}</td>
                    </tr>
                    <tr>
                      <th><FormattedMessage id="ean" defaultMessage='EAN' /></th>
                      <td>{entity.ean || <em>N/A</em>}</td>
                    </tr>
                    <tr>
                      <th><FormattedMessage id="detection_date" defaultMessage='Detection date' /></th>
                      <td>{formatDateStr(entity.creationDate)}</td>
                    </tr>
                    <tr>
                      <th><FormattedMessage id="is_visible_question" defaultMessage='Visible?' /></th>
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
                <div className="card-header">
                  <FormattedMessage id="pricing_information" defaultMessage='Pricing Information'/>
                </div>
                <div className="card-block">
                  <table className="table table-striped mb-0">
                    <tbody>
                    <tr>
                      <th><FormattedMessage id="product" defaultMessage='Product' /></th>
                      <td>{entity.product ?
                          <NavLink to={'/products/' + entity.product.id}>{entity.product.name}</NavLink> :
                          <em>N/A</em>}</td>
                    </tr>
                    {hasStaffPermissions && entity.product && <tr>
                      <th>&nbsp;</th>
                      <td><button className="btn btn-danger" onClick={this.handleDissociateClick} disabled={this.state.dissociatingState !== DISSOCIATING_STATES.STAND_BY}><FormattedMessage id="dissociate" defaultMessage='Dissociate' /></button></td>
                    </tr>
                    }
                    <tr>
                      <th><FormattedMessage id="cell_plan" defaultMessage='Cell Plan' /></th>
                      <td>{entity.cellPlan ? <NavLink to={'/products/' + entity.cellPlan.id}>{entity.cellPlan.name}</NavLink> : <em>N/A</em>}</td>
                    </tr>
                    <tr>
                      <th><FormattedMessage id="normal_price" defaultMessage='Normal price' /></th>
                      <td>
                        {entity.activeRegistry ?
                            <span>{localFormatCurrency(entity.activeRegistry.normal_price, entity.currency)}</span> :
                            <em>N/A</em>
                        }
                      </td>
                    </tr>
                    <tr>
                      <th><FormattedMessage id="offer_price" defaultMessage='Offer price' /></th>
                      <td>
                        {entity.activeRegistry ?
                            <span>{localFormatCurrency(entity.activeRegistry.offer_price, entity.currency)}</span> :
                            <em>N/A</em>
                        }
                      </td>
                    </tr>

                    <tr>
                      <th><FormattedMessage id="currency" defaultMessage='Currency' /></th>
                      <td>{entity.currency.isoCode}</td>
                    </tr>

                    {preferredCurrency.url !== entity.currency.url &&
                    <tr>
                      <th>
                        <FormattedMessage id="normal_price" defaultMessage='Normal price' />
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
                        <FormattedMessage id="offer_price" defaultMessage='Offer price' />
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
                      <th><FormattedMessage id="is_active_question" defaultMessage='Is active?' /></th>
                      <td><i className={entity.activeRegistry ?
                          'glyphicons glyphicons-check' :
                          'glyphicons glyphicons-unchecked'}/>
                      </td>
                    </tr>

                    <tr>
                      <th><FormattedMessage id="is_available_question" defaultMessage='Is available?' /></th>
                      <td><i className={entity.activeRegistry && entity.activeRegistry.is_available ?
                          'glyphicons glyphicons-check' :
                          'glyphicons glyphicons-unchecked'}/>
                      </td>
                    </tr>

                    {displayStocksCell && <tr>
                      <th><FormattedMessage id="stock" defaultMessage='Stock' /></th>
                      <td>
                        {this.state.stock}
                      </td>
                    </tr>
                    }

                    <tr>
                      <th><FormattedMessage id="last_pricing_update" defaultMessage='Last update' /></th>
                      <td>{formatDateStr(entity.lastPricingUpdate)}</td>
                    </tr>

                    </tbody>
                  </table>
                </div>
              </div>

              {staffInfo && <div className="card">
                <div className="card-header">
                  <FormattedMessage id="staff_information" defaultMessage='Staff Information'/>
                </div>
                <div className="card-block">
                  <table className="table table-striped">
                    <tbody>
                    <tr>
                      <th><FormattedMessage id="key" defaultMessage='Key' /></th>
                      <td>{entity.key}</td>
                    </tr>
                    <tr>
                      <th><FormattedMessage id="original_category" defaultMessage='Original category' /></th>
                      <td>{staffInfo.scrapedCategory.name}</td>
                    </tr>
                    <tr>
                      <th><FormattedMessage id="discovery_url" defaultMessage='Discovery URL' /></th>
                      <td className="overflowed-table-cell"><a href={staffInfo.discoveryUrl} target="_blank">{staffInfo.discoveryUrl}</a></td>
                    </tr>
                    <tr>
                      <th><FormattedMessage id="last_association" defaultMessage='Last association' /></th>
                      <td>{staffInfo.lastAssociation ? `${formatDateStr(staffInfo.lastAssociation)} (${staffInfo.lastAssociationUser.firstName} ${staffInfo.lastAssociationUser.lastName})` : <em>N/A</em>}</td>
                    </tr>
                    <tr>
                      <th><FormattedMessage id="last_access" defaultMessage='Last access' /></th>
                      <td>{staffInfo.lastStaffAccess ? `${formatDateStr(staffInfo.lastStaffAccess)} (${staffInfo.lastStaffAccessUser.firstName} ${staffInfo.lastStaffAccessUser.lastName})` : <em>N/A</em>}</td>
                    </tr>
                    </tbody>
                  </table>
                </div>
              </div>}
            </div>

            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <FormattedMessage id="description" defaultMessage='Description'/>
                </div>
                <div className="card-block" id="description-container">
                  <Markdown markup={ entity.description } tables={true} />
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

          <Modal isOpen={this.state.dissociatingState !== DISSOCIATING_STATES.STAND_BY}>
            <ModalHeader><FormattedMessage id="entity_dissociation_title" defaultMessage='Confirm entity dissociation' /></ModalHeader>
            <ModalBody>
              <p>
                <FormattedMessage id="entity_dissociation_body" defaultMessage="Please confirm the dissociation of the entity" />
              </p>
              {staffInfo && staffInfo.lastAssociationUserUrl !== this.props.user.detail_url &&
              <div>
                <p>
                  <FormattedMessage id="entity_dissociation_different_user" defaultMessage="This entity was associated by a different user. If possible please leave a message for him/her about the reason for the dissociation" />
                </p>
                <p>
                  <textarea placeholder={this.props.intl.formatMessage({id: 'entity_dissociation_reason_placeholder'})}
                            onChange={(event) => {this.setState({dissociationReason: event.target.value})}}
                            value={this.state.dissociationReason}>
                  </textarea>
                </p>
              </div>}
            </ModalBody>
            <ModalFooter>
              <LaddaButton
                  loading={this.state.dissociatingState === DISSOCIATING_STATES.EXECUTING}
                  onClick={this.dissociate}
                  data-color="#eee"
                  data-size={XL}
                  data-style={EXPAND_LEFT}
                  data-spinner-size={30}
                  data-spinner-color="#ddd"
                  data-spinner-lines={12}
                  className="btn btn-danger">
                {this.state.dissociatingState === DISSOCIATING_STATES.EXECUTING ?
                    <FormattedMessage id="dissociating" defaultMessage='Dissociating'/> :
                    <FormattedMessage id="dissociate" defaultMessage='Dissociate' />
                }
              </LaddaButton>
              {' '}
              <Button color="secondary"
                      onClick={this.resetdissociating}
                      disabled={this.state.dissociatingState === DISSOCIATING_STATES.EXECUTING}>
                <FormattedMessage id="cancel" defaultMessage='Cancel' />
              </Button>
            </ModalFooter>
          </Modal>
        </div>)
  }
}

function mapStateToProps(state) {
  return {
    preferredCurrency: state.apiResourceObjects[state.apiResourceObjects[settings.ownUserUrl].preferred_currency],
    preferredNumberFormat: state.apiResourceObjects[state.apiResourceObjects[settings.ownUserUrl].preferred_number_format],
    user: state.apiResourceObjects[settings.ownUserUrl],
  }
}

export default injectIntl(connect(
    addApiResourceStateToPropsUtils(mapStateToProps),
    addApiResourceDispatchToPropsUtils())(EntityDetail));