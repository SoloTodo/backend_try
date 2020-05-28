import React, { Component } from 'react';
import {connect} from "react-redux";
import {
  apiResourceStateToPropsUtils,
  filterApiResourceObjectsByType
} from "../../react-utils/ApiResource";
import {FormattedMessage, injectIntl} from "react-intl";
import {NavLink} from "react-router-dom";
import LaddaButton, { XL, EXPAND_LEFT } from 'react-ladda';
import { Markdown } from 'react-showdown';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { toast } from 'react-toastify';
import trim from 'lodash/trim';
import ImageGallery from 'react-image-gallery';
import {formatCurrency, formatDateStr} from "../../react-utils/utils";
import imageNotAvailable from '../../images/image-not-available.svg';
import './EntityDetail.css'
import moment from "moment";
import {backendStateToPropsUtils} from "../../utils";
import EntityCategoryChange from "./EntityCategoryChange";
import EntitySectionPositionTable from "../../components/Entity/EntitySectionPositionTable"
import EntityConditionChange from "./EntityConditionChange";

const DISSOCIATING_STATES = {
  STAND_BY: 1,
  CONFIRMING: 2,
  EXECUTING: 3,
};

class EntityDetail extends Component {
  initialState = {
    updatingPricing: false,
    changingVisibility: false,
    dissociatingState: DISSOCIATING_STATES.STAND_BY,
    dissociationReason: '',
    stock: undefined,
    staffInfo: undefined,
  };

  constructor(props) {
    super(props);

    this.state = {...this.initialState}
  }

  componentDidMount() {
    this.componentUpdate(this.props.apiResourceObject, this.props.user)
  }

  componentDidUpdate(prevProps) {
    const currentEntity = prevProps.apiResourceObject;
    const nextEntity = this.props.apiResourceObject;
    const currentUser = prevProps.user;
    const nextUser = this.props.user;

    if (currentEntity.id !== nextEntity.id || currentUser.id !== nextUser.id) {
      this.setState(this.initialState, () => this.componentUpdate(nextEntity, nextUser));
    }

    // Pricing update notification
    const currentLastPricingUpdate = moment(currentEntity.last_pricing_update);
    const nextLastPricingUpdate = moment(nextEntity.last_pricing_update);

    if (currentEntity.id === nextEntity.id && currentLastPricingUpdate.isBefore(nextLastPricingUpdate)) {
      toast.success(<FormattedMessage
        id="entity_information_updated_successfully"
        defaultMessage="Entity information has been updated successfully and it should be reflected in the panels below. If it doesn't please contact our staff." />, {
        autoClose: false
      })
    }
  }

  componentUpdate(entity, user) {
    // If the user is staff:
    // if some other staff has been editing this entity in the last 10 minutes, show a warning
    // Othjerwise register the staff entry

    const userHasStaffPermissions = this.userHasStaffPermissions(entity);

    if (this.userHasStockPermissions(entity)) {
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
        let registerStaffAccess = false;

        if (staffInfo.last_staff_access) {
          const lastStaffAccess = moment(staffInfo.last_staff_access);
          const durationSinceLastStaffAccess = moment.duration(moment().diff(lastStaffAccess));
          if (durationSinceLastStaffAccess.asMinutes() < 10) {
            if (staffInfo.last_staff_access_user !== user.detail_url) {
              toast.warn(<FormattedMessage id="entity_staff_overlap_warning" defaultMessage="Someone has been working here recently. Be mindful!"/>, {autoClose: false})
            }
          } else {
            registerStaffAccess = true;
          }
        } else {
          registerStaffAccess = true;
        }

        if (registerStaffAccess) {
          this.props.fetchAuth(`${entity.url}register_staff_access/`, {method: 'POST'}).then(json => {
            this.props.updateEntity(json);
          })
        }

        this.setState({
          staffInfo
        })
      })
    }
  }

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
        this.props.updateEntity(json);
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
        this.props.updateEntity(json);
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
      this.props.updateEntity(json);
      this.setState({
        dissociatingState: DISSOCIATING_STATES.STAND_BY,
        dissociationReason: ''
      });
    });
  };

  handleDissociateClick = (event) => {
    this.setState({
      dissociatingState: DISSOCIATING_STATES.CONFIRMING
    });
  };

  resetdissociating = () => {
    this.setState({
      dissociatingState: DISSOCIATING_STATES.STAND_BY
    })
  };

  userHasStockPermissions = entity => {
    entity = entity || this.props.apiResourceObject;
    entity = this.props.ApiResourceObject(entity);

    return entity.store.permissions.includes('view_store_stocks');
  };

  userHasStaffPermissions = entity => {
    entity = entity || this.props.apiResourceObject;
    entity = this.props.ApiResourceObject(entity);
    return entity.category.permissions.includes('is_category_staff');
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

    const originalCondition = conditions.filter(condition => condition.id === entity.scrapedCondition)[0];
    const currentCondition = conditions.filter(condition => condition.id === entity.condition)[0];

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
                <FormattedMessage id="options" defaultMessage="Options" />
              </div>
              <div className="card-block">
                <ul className="list-without-decoration subnavigation-links">
                  <li><NavLink to={`/entities/${entity.id}/events`}>
                    <button type="button" className="btn btn-link">
                      <FormattedMessage id="events" defaultMessage="Events" />
                    </button>
                  </NavLink></li>

                  <li><NavLink to={`/entities/${entity.id}/pricing_history`}>
                    <button type="button" className="btn btn-link">
                      <FormattedMessage id="pricing_history" defaultMessage="Pricing history" />
                    </button>
                  </NavLink></li>

                  {hasStaffPermissions &&
                  <li><NavLink to={'/entities/' + entity.id + '/associate'}>
                    <button type="button" className="btn btn-link">
                      <FormattedMessage id="associate_to_prduct" defaultMessage="Associate" />
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
                  {displayStocksCell &&
                  <li><NavLink to={'/entities/estimated_sales/?ids=' + entity.id + '&grouping=entity'}>
                    <button type="button" className="btn btn-link">
                      <FormattedMessage id="estimated_sales" defaultMessage="Estimated sales" />
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
                    <td className="overflowed-table-cell"><a href={entity.externalUrl} target="_blank" rel="noopener noreferrer">{entity.externalUrl}</a></td>
                  </tr>
                  <tr>
                    <th><FormattedMessage id="category" defaultMessage='Category' /></th>
                    <td>
                      {hasStaffPermissions ?
                        <EntityCategoryChange entity={entity} />
                        :
                        entity.category.name
                      }
                    </td>
                  </tr>
                  <tr>
                    <th><FormattedMessage id="condition" defaultMessage="Condition" /></th>
                    <td>
                      {hasStaffPermissions ?
                        <EntityConditionChange entity={entity}/> :
                        currentCondition.name
                      }
                    </td>
                  </tr>
                  <tr>
                    <th>Condición Original</th>
                    <td>{originalCondition.name}</td>
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
            <EntitySectionPositionTable entity={entity}/>
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
                  {entity.seller &&
                      <tr>
                        <th>Vendedor</th>
                        <td>{entity.seller}</td>
                      </tr>
                  }
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
                    <td className="overflowed-table-cell"><a href={staffInfo.discoveryUrl} target="_blank" rel="noopener noreferrer">{staffInfo.discoveryUrl}</a></td>
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

        <Modal autoFocus={false} isOpen={this.state.dissociatingState !== DISSOCIATING_STATES.STAND_BY}>
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
  const {ApiResourceObject, fetchAuth, fetchApiResourceObject} = apiResourceStateToPropsUtils(state);
  const {user, preferredCurrency, preferredNumberFormat } = backendStateToPropsUtils(state);

  return {
    ApiResourceObject,
    fetchAuth,
    fetchApiResourceObject,
    user,
    preferredCurrency,
    preferredNumberFormat,
    categories: filterApiResourceObjectsByType(state.apiResourceObjects, 'categories'),
  }
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
    updateEntity: entity => {
      dispatch({
        type: 'updateApiResourceObject',
        apiResourceObject: entity
      });
    }
  }
}


export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(EntityDetail));