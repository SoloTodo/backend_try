import React, {Component} from 'react'
import { Markdown } from 'react-showdown';
import {FormattedMessage, injectIntl} from "react-intl";
import {apiResourceStateToPropsUtils} from "../../react-utils/ApiResource";
import {backendStateToPropsUtils} from "../../utils";
import {connect} from "react-redux";
import {NavLink, Redirect} from "react-router-dom";
import { toast } from 'react-toastify';
import ImageGallery from "react-image-gallery";
import imageNotAvailable from '../../images/image-not-available.svg';
import {settings} from "../../settings";
import EntityCategoryChange from "./EntityCategoryChange";
import {Button} from "reactstrap";
import moment from "moment";


class EntityDetailAssociate extends Component {
  initialState = {
    productChoices: [],
    cellPlanChoices: [],
    selectedProduct: undefined,
    finishedAssociating: false,
    keywords: '',
    hidEntity: false
  };

  constructor(props) {
    super(props);
    this.state = {...this.initialState};
  }

  componentDidMount() {
    this.componentUpdate(this.props.apiResourceObject, this.props.user);
  }

  componentDidUpdate(prevProps,) {
    const currentEntity = prevProps.apiResourceObject;
    const nextEntity = this.props.apiResourceObject;

    if (currentEntity.id !== nextEntity.id) {
      this.setState(this.initialState, () => this.componentUpdate(nextEntity, this.props.user));
    }
  }

  componentUpdate(entity, user) {
    const endpoint = `${entity.url}cell_plan_choices/`;
    const userHasStaffPermissions = this.userHasStaffPermissions(entity);

    this.props.fetchAuth(endpoint).then(cellPlanChoices => {
      this.setState({
        cellPlanChoices
      })
    });

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

  userHasStaffPermissions = entity => {
    entity = entity || this.props.apiResourceObject;
    entity = this.props.ApiResourceObject(entity);
    return entity.category.permissions.includes('is_category_staff');
  };

  handleProductSearchSubmit = evt => {
    evt.preventDefault();

    const entity = this.props.ApiResourceObject(this.props.apiResourceObject);
    const endpoint = `${entity.category.url}products/?page_size=200&search=${encodeURIComponent(this.state.keywords)}`;

    const toastId = toast.info(<FormattedMessage
        id="searching_product"
        defaultMessage="Searching..." />, {
      autoClose: false
    });

    this.props.fetchAuth(endpoint).then(json => {
      const productChoices = json.results;
      const selectedProduct = productChoices.length ? productChoices[0] : undefined;

      toast.dismiss(toastId);

      if (!productChoices.length) {
        toast.error(<FormattedMessage
            id="no_products_found"
            defaultMessage="No products found" />)
      }

      this.setState({
        productChoices,
        selectedProduct
      })
    });
  };

  handleProductSelectChange = evt => {
    const selectedProduct = this.state.productChoices.filter(product => product.id.toString() === evt.target.value)[0];

    this.setState({
      selectedProduct
    })
  };

  handleProductClone = evt => {
    const toastId = toast.info(<FormattedMessage
        id="product_currently_cloning"
        defaultMessage="Cloning product, please wait!" />, {
      autoClose: false
    });

    const endpoint = `${settings.apiResourceEndpoints.products}${this.state.selectedProduct.id}/clone/`;

    this.props.fetchAuth(endpoint, {method: 'POST'}).then(json => {
      const clonedInstanceId = json.instance_id;
      const clonedInstanceUrl = `${settings.endpoint}metamodel/instances/${clonedInstanceId}`;
      toast.dismiss(toastId);
      window.open(clonedInstanceUrl, '_blank')
    })
  };

  handleProductAssociationSubmit = evt => {
    evt.preventDefault();

    const entity = this.props.ApiResourceObject(this.props.apiResourceObject);

    const payload = {
      product: this.state.selectedProduct.id
    };

    const selectedCellPlanId = document.getElementById('cell_plan').value;

    let matchExistingCellPlan = false;

    if (selectedCellPlanId) {
      payload.cell_plan = selectedCellPlanId;
      matchExistingCellPlan = entity.cellPlan && entity.cellPlan.id.toString() === selectedCellPlanId
    } else {
      matchExistingCellPlan = !entity.cellPlan
    }

    if (entity.product && entity.product.id === this.state.selectedProduct.id && matchExistingCellPlan) {
      toast.error(<FormattedMessage
          id="please_select_a_different_product_cell_plan"
          defaultMessage="Please select a different product / cell plan from the current ones" />, {
        autoClose: false
      });

      return;
    }

    const toastId = toast.info(<FormattedMessage
        id="associating_please_wait"
        defaultMessage="Associating entity, please wait!" />, {
      autoClose: false
    });

    this.props.fetchAuth(entity.url + 'associate/', {
      method: 'POST',
      body: JSON.stringify(payload)
    }).then(json => {
      toast.dismiss(toastId);

      this.setState({
        finishedAssociating: true
      }, () => this.props.updateEntity(json));
    })
  };

  handleEntityHideClick = evt => {
    const toastId = toast.info(<FormattedMessage
        id="hiding_entity"
        defaultMessage="Hiding entity" />, {
      autoClose: false
    });

    this.props.fetchAuth(`${this.props.apiResourceObject.url}toggle_visibility/`, {
      method: 'POST'
    }).then(json => {
      toast.dismiss(toastId);

      this.setState({
        hidEntity: true
      }, () => this.props.updateEntity(json))
    })
  };

  render() {
    const entity = this.props.ApiResourceObject(this.props.apiResourceObject);

    if (this.state.hidEntity) {
      toast.success(<FormattedMessage
          id="entity_hiding_successful"
          defaultMessage="The entity has been hidden successfully" />);

      return <Redirect push to={{
        pathname: '/entities/pending',
        search: '?categories=' + entity.category.id
      }} />
    }

    if (this.state.finishedAssociating) {
      toast.success(<FormattedMessage
          id="association_successful"
          defaultMessage="The entity has been associated successfully" />);

      return <Redirect push to={{
        pathname: '/entities/pending',
        search: '?categories=' + entity.category.id
      }} />
    }

    if (!entity.isVisible) {
      toast.warn(<FormattedMessage
          id="non_visible_entity_association"
          defaultMessage="This entity is not visible, so it can't be associated. Mark it as visible if you want to associate it." />, {
        autoClose: false
      });

      return <Redirect to={{
        pathname: `/entities/${entity.id}`,
      }} />
    }

    let images = null;

    if (entity.pictureUrls && entity.pictureUrls.length) {
      images = entity.pictureUrls.map(pictureUrl => ({
        original: pictureUrl,
        thumbnail: pictureUrl
      }))
    }

    const cell_plan_selector_visibility_class = this.state.cellPlanChoices.length ? '' : 'd-none';

    const selectedProductId = this.state.selectedProduct ? this.state.selectedProduct.id : '';

    return (
        <div className="animated fadeIn">
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <i className="fa fa-file-text-o" aria-hidden="true">&nbsp;</i>
                  <FormattedMessage id="information" defaultMessage="Information" />
                </div>
                <div className="card-block">
                  <div className="row">
                    <div className="col-12 col-sm-6">
                      <dl>
                        <dt><FormattedMessage id="name" defaultMessage="Name" /></dt>
                        <dd>{entity.name}</dd>

                        {entity.cellPlanName &&
                        <dt><FormattedMessage id="cell_plan_name" defaultMessage="Cell plan name" /></dt>
                        }
                        {entity.cellPlanName &&
                        <dd>{entity.cellPlanName}</dd>
                        }

                        <dt><FormattedMessage id="store" defaultMessage="Store" /></dt>
                        <dd>{entity.store.name}</dd>

                        <dt><FormattedMessage id="url" defaultMessage="URL" /></dt>
                        <dd><a href={entity.externalUrl} target="_blank" rel="noopener noreferrer">{entity.externalUrl}</a></dd>

                        <dt><FormattedMessage id="hide" defaultMessage="Hide" /></dt>
                        <dd><Button onClick={this.handleEntityHideClick}><FormattedMessage id="hide_entity" defaultMessage="Hide entity" /></Button></dd>
                      </dl>
                    </div>
                    <div className="col-12 col-sm-6">
                      <dl>

                        <dt><FormattedMessage id="category" defaultMessage="Category" /></dt>
                        <dd>
                          <EntityCategoryChange entity={entity} />
                        </dd>

                        {entity.partNumber &&
                        <dt><FormattedMessage id="part_number" defaultMessage="Part number" /></dt>
                        }
                        {entity.partNumber &&
                        <dd>{entity.partNumber}</dd>
                        }

                        {entity.ean &&
                        <dt><FormattedMessage id="ean" defaultMessage="EAN" /></dt>
                        }
                        {entity.ean &&
                        <dd>{entity.ean}</dd>
                        }

                        <dt><FormattedMessage id="current_product" defaultMessage="Current product" /></dt>
                        <dd>{entity.product ? <NavLink to={`/products/${entity.product.id}`}>{entity.product.name}</NavLink> : <em>N/A</em>}</dd>

                        <dt><FormattedMessage id="current_cell_plan" defaultMessage="Current cell plan" /></dt>
                        <dd>{entity.cellPlan ? <NavLink to={`/products/${entity.cellPlan.id}`}>{entity.cellPlan.name}</NavLink> : <em>N/A</em>}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <FormattedMessage id="form" defaultMessage="Form" />
                </div>
                <div className="card-block" id="entity_association_card">
                  <form onSubmit={this.handleProductSearchSubmit}>
                    <div className="form-group">
                      <input autoComplete="off" type="text" id="search" className="form-control" placeholder={this.props.intl.formatMessage({id: 'keywords'})} value={this.state.keywords} onChange={evt => this.setState({keywords: evt.target.value})} />
                    </div>
                  </form>

                  <form onSubmit={this.handleProductAssociationSubmit}>
                    <div className="form-group">
                      <label htmlFor="product"><FormattedMessage id="product" defaultMessage="Product"/></label>
                      <select size={10} className="form-control" id="product" name="product" required={true} value={selectedProductId} onChange={this.handleProductSelectChange}>
                        {this.state.productChoices.map(product => (
                            <option key={product.id} value={product.id}>{product.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className={`form-group ${cell_plan_selector_visibility_class}`}>
                      <label htmlFor="cell_plan"><FormattedMessage id="cell_plan" defaultMessage="Cell plan"/></label>
                      <select className="form-control" id="cell_plan" name="cell_plan">
                        <option value="">N/A</option>
                        {this.state.cellPlanChoices.map(product => (
                            <option key={product.id} value={product.id}>{product.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="btn-toolbar" role="toolbar">

                      <div className="btn-group mr-2" role="group">
                        <button type="submit" className="btn btn-success" disabled={false}>
                          <FormattedMessage id="associate"
                                            defaultMessage="Associate"/>
                        </button>
                      </div>

                      {this.state.selectedProduct &&
                      <div className="btn-group mr-2" role="group">
                        <a className="btn btn-secondary"
                           href={`/products/${this.state.selectedProduct.id}`}
                           target="_blank" rel="noopener noreferrer">
                          <FormattedMessage id="view_product"
                                            defaultMessage="View product"/>
                        </a>
                      </div>
                      }

                      {this.state.selectedProduct &&
                      <div className="btn-group mr-2" role="group">
                        <a className="btn btn-secondary"
                           href={`${settings.solotodoUrl}products/${this.state.selectedProduct.id}`}
                           target="_blank" rel="noopener noreferrer">
                          <FormattedMessage id="view_in_solotodo" defaultMessage="View in SoloTodo"/>
                        </a>
                      </div>
                      }

                      {this.state.selectedProduct &&
                      <div className="btn-group mr-2" role="group">
                        <a className="btn btn-secondary"
                           href={`${settings.endpoint}metamodel/instances/${this.state.selectedProduct.instance_model_id}`}
                           target="_blank" rel="noopener noreferrer">
                          <FormattedMessage id="edit" defaultMessage="Edit"/>
                        </a>
                      </div>
                      }

                      {this.state.selectedProduct &&
                      <div className="btn-group mr-2" role="group">
                        <button type="button" className="btn btn-info" onClick={this.handleProductClone}>
                          <FormattedMessage id="clone" defaultMessage="Clone"/>
                        </button>
                      </div>
                      }
                    </div>

                  </form>
                </div>
              </div>
            </div>

            <div className="col-12 col-lg-6 col-xl-6">
              <div className="card">
                <div className="card-header">
                  <FormattedMessage id="description" defaultMessage='Description'/>
                </div>
                <div className="card-block" id="description-container">
                  <Markdown markup={ entity.description } tables={true} />
                </div>
              </div>
            </div>

            <div className="col-12 col-sm-12 col-lg-6 col-xl-6">
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
          </div>
        </div>
    )
  }
}

function mapStateToProps(state) {
  const {ApiResourceObject, fetchAuth} = apiResourceStateToPropsUtils(state);
  const {user} = backendStateToPropsUtils(state);

  return {
    user,
    ApiResourceObject,
    fetchAuth,
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

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(EntityDetailAssociate));