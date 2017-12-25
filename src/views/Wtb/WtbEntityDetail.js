import React, { Component } from 'react';
import {connect} from "react-redux";
import {
  addApiResourceDispatchToPropsUtils,
  addApiResourceStateToPropsUtils
} from "solotodo-react-utils";
import {FormattedMessage, injectIntl} from "react-intl";
import {NavLink} from "react-router-dom";
import LaddaButton, { XL, EXPAND_LEFT } from 'react-ladda';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { toast } from 'react-toastify';
import Select from 'react-select';
import {settings} from "../../settings";
import {formatDateStr} from "solotodo-react-utils";
import './WtbEntityDetail.css'
import {createOption, createOptions} from "../../form_utils";

const DISSOCIATING_STATES = {
  STAND_BY: 1,
  CONFIRMING: 2,
  EXECUTING: 3,
};

class WtbEntityDetail extends Component {
  constructor(props) {
    super(props);

    this.state = {
      changingVisibility: false,
      categoryForChange: null,
      dissociatingState: DISSOCIATING_STATES.STAND_BY,
      staffInfo: undefined
    }
  }

  componentDidMount() {
    window.scrollTo(0, 0);
    const wtbEntity = this.props.apiResourceObject;

    const userHasStaffPermissions = this.userHasStaffPermissions();

    if (!userHasStaffPermissions) {
      if (!wtbEntity.is_visible) {
        toast.warn(<FormattedMessage
            id="entity_invisible_warning"
            defaultMessage="Our staff has marked this entity as non-relevant, so it is ignored by our system. If this is not the case please contact us."/>, {autoClose: false})
      }

      if (wtbEntity.is_visible && wtbEntity.is_active && !wtbEntity.product) {
        toast.info(<FormattedMessage
            id="entity_not_associated_info"
            defaultMessage="This entity has not yet been processed by our staff. Please contact us if you want to prioritize it."/>, {autoClose: false})
      }

      if (!wtbEntity.is_active) {
        toast.info(<FormattedMessage
            id="entity_not_active_info"
            defaultMessage="Please note that this entity is no loger listed in the website according to our system."/>, {autoClose: false})
      }
    }

    if (userHasStaffPermissions) {
      const endpoint = wtbEntity.url + 'staff_info/';
      this.props.fetchAuth(endpoint).then(staffInfo => {
        this.setState({
          staffInfo
        })
      })
    }
  }

  saveWtbEntityChanges = (changedWtbEntity) => {
    this.props.dispatch({
      type: 'updateApiResourceObject',
      apiResourceObject: changedWtbEntity
    });
  };

  handleVisibilityToggle = (event) => {
    this.setState({
      changingVisibility: true
    }, () => {
      this.props.fetchAuth(`${this.props.apiResourceObject.url}toggle_visibility/`, {
        method: 'POST'
      }).then(json => {
        this.saveWtbEntityChanges(json);
        this.setState({
          changingVisibility: false
        });
      })
    });
  };

  handleVisibilityToggleClick = (event) => {
    if (this.props.apiResourceObject.product) {
      toast.warn(<FormattedMessage id="hiding_associated_entity_warning" defaultMessage="Please deassociate the the entity before hiding it" />, {
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
        this.props.fetchApiResourceObject('wtb_entities', json.id, this.props.dispatch)
      });
    });
  };

  dissociate = () => {
    this.setState({
      dissociatingState: DISSOCIATING_STATES.EXECUTING
    });

    this.props.fetchAuth(`${this.props.apiResourceObject.url}dissociate/`, {
      method: 'POST'
    }).then(json => {
      this.saveWtbEntityChanges(json);
      this.setState({
        dissociatingState: DISSOCIATING_STATES.STAND_BY,
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
      toast.warn(<FormattedMessage id="changing_category_of_associated_entity_warning" defaultMessage="Please dissociate the the entity before changing it's category" />, {
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

  resetDissociating = () => {
    this.setState({
      dissociatingState: DISSOCIATING_STATES.STAND_BY
    })
  };

  userHasStaffPermissions = () => {
    const entity = this.props.ApiResourceObject(this.props.apiResourceObject);
    return entity.category.permissions.includes('category_entities_staff') &&
        entity.brand.permissions.includes('is_wtb_brand_staff');
  };

  render() {
    const wtbEntity = this.props.ApiResourceObject(this.props.apiResourceObject);

    const hasStaffPermissions = this.userHasStaffPermissions();

    const visibilitySwitchEnabled = !this.state.changingVisibility && !wtbEntity.product;
    const categorySelectEnabled = !this.state.categoryForChange && !wtbEntity.product;
    const categoryOptions = createOptions(this.props.categories);

    const isModalOpen = Boolean(this.state.categoryForChange) && !this.userHasStaffPermissionOverSelectedCategory();

    const staffInfo = this.state.staffInfo ? this.props.ApiResourceObject(this.state.staffInfo) : null;

    return (
        <div className="animated fadeIn">
          <div className="row">
            <div className="col-sm-12 col-md-8 col-lg-6 col-xl-5" id="entity-pictures-carousel-card">
              <div className="card">
                <div className="card-header">
                  <span className="glyphicons glyphicons-pictures">&nbsp;</span>
                  <FormattedMessage id="picture" defaultMessage='Picture'/>
                </div>
                <div className="card-block center-aligned">
                  <img src={wtbEntity.pictureUrl} className="img-fluid" alt={wtbEntity.name} />
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
                    {hasStaffPermissions &&
                    <li><NavLink to={'/wtb/entities/' + wtbEntity.id + '/associate'}>
                      <button type="button" className="btn btn-link">
                        <FormattedMessage id="associate_to_prduct" defaultMessage={`Associate`} />
                      </button>
                    </NavLink></li>}

                    {wtbEntity.product &&
                    <li>
                      <NavLink to={`/visits/?websites=${wtbEntity.brand.website.id}&products=${wtbEntity.product.id}`}>
                        <button type="button" className="btn btn-link">
                          <FormattedMessage id="visits_list"
                                            defaultMessage="Visits (list)"/>
                        </button>
                      </NavLink>
                    </li>
                    }
                    {wtbEntity.product &&
                    <li>
                      <NavLink to={`/visits/stats?grouping=date&websites=${wtbEntity.brand.website.id}&products=${wtbEntity.product.id}`}>
                        <button type="button" className="btn btn-link">
                          <FormattedMessage id="visits_stats"
                                            defaultMessage="Visits (stats)"/>
                        </button>
                      </NavLink>
                    </li>
                    }

                    {wtbEntity.product &&
                    <li>
                      <NavLink to={`/leads/?websites=${wtbEntity.brand.website.id}&products=${wtbEntity.product.id}`}>
                        <button type="button" className="btn btn-link">
                          <FormattedMessage id="leads_list"
                                            defaultMessage="Leads (list)"/>
                        </button>
                      </NavLink>
                    </li>
                    }
                    {wtbEntity.product &&
                    <li>
                      <NavLink to={`/leads/stats?grouping=date&websites=${wtbEntity.brand.website.id}&products=${wtbEntity.product.id}`}>
                        <button type="button" className="btn btn-link">
                          <FormattedMessage id="leads_stats"
                                            defaultMessage="Leads (stats)"/>
                        </button>
                      </NavLink>
                    </li>
                    }
                  </ul>
                </div>
              </div>
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
                      <td>{wtbEntity.name}</td>
                    </tr>
                    <tr>
                      <th><FormattedMessage id="brand" defaultMessage='Brand' /></th>
                      <td>
                        <NavLink to={'/wtb/brands/' + wtbEntity.brand.id}>{wtbEntity.brand.name}</NavLink>
                      </td>
                    </tr>
                    <tr>
                      <th><FormattedMessage id="url" defaultMessage='URL' /></th>
                      <td className="overflowed-table-cell"><a href={wtbEntity.externalUrl} target="_blank">{wtbEntity.externalUrl}</a></td>
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
                                  value={createOption(wtbEntity.category)}
                                  onChange={this.handleChangeCategory}
                                  searchable={false}
                                  clearable={false}
                                  disabled={!categorySelectEnabled}
                              />
                            </div>
                            :
                            wtbEntity.category.name
                        }
                      </td>
                    </tr>
                    <tr>
                      <th><FormattedMessage id="key" defaultMessage='Key' /></th>
                      <td>{wtbEntity.key}</td>
                    </tr>
                    <tr>
                      <th><FormattedMessage id="detection_date" defaultMessage='Detection date' /></th>
                      <td>{formatDateStr(wtbEntity.creationDate)}</td>
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
                                    checked={wtbEntity.isVisible}
                                    onChange={this.handleVisibilityToggle}
                                    disabled={!visibilitySwitchEnabled}
                                />
                                <span className="switch-label"
                                      data-on={this.props.intl.formatMessage({id: 'yes'})}
                                      data-off={this.props.intl.formatMessage({id: 'no'})}>&nbsp;</span>
                                <span className="switch-handle">&nbsp;</span>
                              </label>
                            </div>
                            : <i className={wtbEntity.isVisible ?
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
                      <td>{wtbEntity.product ?
                          <NavLink to={'/products/' + wtbEntity.product.id}>{wtbEntity.product.name}</NavLink> :
                          <em>N/A</em>}</td>
                    </tr>
                    {hasStaffPermissions && wtbEntity.product && <tr>
                      <th>&nbsp;</th>
                      <td><button className="btn btn-danger" onClick={this.handleDissociateClick} disabled={this.state.dissociatingState !== DISSOCIATING_STATES.STAND_BY}><FormattedMessage id="dissociate" defaultMessage='Dissociate' /></button></td>
                    </tr>
                    }

                    <tr>
                      <th><FormattedMessage id="is_active_question" defaultMessage='Is active?' /></th>
                      <td><i className={wtbEntity.isActive ?
                          'glyphicons glyphicons-check' :
                          'glyphicons glyphicons-unchecked'}/>
                      </td>
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
                      <th><FormattedMessage id="last_association" defaultMessage='Last association' /></th>
                      <td>{staffInfo.lastAssociation ? `${formatDateStr(staffInfo.lastAssociation)} (${staffInfo.lastAssociationUser.firstName} ${staffInfo.lastAssociationUser.lastName})` : <em>N/A</em>}</td>
                    </tr>
                    </tbody>
                  </table>
                </div>
              </div>}
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
                      onClick={this.resetDissociating}
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
    addApiResourceDispatchToPropsUtils())(WtbEntityDetail));