import React, {Component} from 'react'
import { Markdown } from 'react-showdown';
import {FormattedMessage, injectIntl} from "react-intl";
import {
  apiResourceStateToPropsUtils
} from "../../react-utils/ApiResource";
import {connect} from "react-redux";
import {NavLink, Redirect} from "react-router-dom";
import { toast } from 'react-toastify';
import ImageGallery from "react-image-gallery";
import imageNotAvailable from '../../images/image-not-available.svg';
import {settings} from "../../settings";

class EntityDetailAssociate extends Component {
  initialState = {
    productChoices: [],
    cellPlanChoices: [],
    selectedProductId: '',
    finishedAssociating: false,
    keywords: ''
  };

  constructor(props) {
    super(props);
    this.state = {...this.initialState};
  }

  componentDidMount() {
    this.componentUpdate(this.props.apiResourceObject);
  }

  componentWillReceiveProps(nextProps) {
    const currentEntity = this.props.apiResourceObject;
    const nextEntity = nextProps.apiResourceObject;

    if (currentEntity.id !== nextEntity.id) {
      this.setState(this.initialState, () => this.componentUpdate(nextEntity));
    }
  }

  componentUpdate(entity) {
    const endpoint = `${entity.url}cell_plan_choices/`;

    this.props.fetchAuth(endpoint).then(cellPlanChoices => {
      this.setState({
        cellPlanChoices
      })
    });
  }

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
      const selectedProductId = productChoices.length ? productChoices[0].id.toString() : '';

      toast.dismiss(toastId);

      if (!productChoices.length) {
        toast.error(<FormattedMessage
            id="no_products_found"
            defaultMessage="No products found" />)
      }

      this.setState({
        productChoices,
        selectedProductId
      })
    });
  };

  handleProductSelectChange = evt => {
    this.setState({
      selectedProductId: evt.target.value
    })
  };

  handleProductClone = evt => {
    const toastId = toast.info(<FormattedMessage
        id="product_currently_cloning"
        defaultMessage="Cloning product, please wait!" />, {
      autoClose: false
    });

    const endpoint = `${settings.apiResourceEndpoints.products}${this.state.selectedProductId}/clone/`;

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
      product: this.state.selectedProductId
    };

    const selectedCellPlanId = document.getElementById('cell_plan').value;

    let matchExistingCellPlan = false;

    if (selectedCellPlanId) {
      payload.cell_plan = selectedCellPlanId;
      matchExistingCellPlan = entity.cellPlan && entity.cellPlan.id.toString() === selectedCellPlanId
    } else {
      matchExistingCellPlan = !entity.cellPlan
    }

    if (entity.product && entity.product.id.toString() === this.state.selectedProductId && matchExistingCellPlan) {
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
      })
    })
  };

  render() {
    const entity = this.props.ApiResourceObject(this.props.apiResourceObject);

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

    return (
        <div className="animated fadeIn">
          <NavLink to="/entities/18279/associate">Break</NavLink>
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
                        <dd><a href={entity.externalUrl} target="_blank">{entity.externalUrl}</a></dd>
                      </dl>
                    </div>
                    <div className="col-12 col-sm-6">
                      <dl>

                        <dt><FormattedMessage id="category" defaultMessage="Category" /></dt>
                        <dd>{entity.category.name}</dd>

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
                      <select size={10} className="form-control" id="product" name="product" required={true} value={this.state.selectedProductId} onChange={this.handleProductSelectChange}>
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
                        <button type="submit" className="btn btn-success" disabled={this.state.selectedProductId === ''}>
                          <FormattedMessage id="associate"
                                            defaultMessage="Associate"/>
                        </button>
                      </div>

                      {this.state.selectedProductId &&
                      <div className="btn-group mr-2" role="group">
                        <a className="btn btn-secondary"
                           href={`/products/${this.state.selectedProductId}`}
                           target="_blank">
                          <FormattedMessage id="view_product"
                                            defaultMessage="View product"/>
                        </a>
                      </div>
                      }

                      {this.state.selectedProductId &&
                      <div className="btn-group mr-2" role="group">
                        <a className="btn btn-secondary"
                           href={`${settings.solotodoUrl}products/${this.state.selectedProductId}`}
                           target="_blank">
                          <FormattedMessage id="view_in_solotodo" defaultMessage="View in SoloTodo"/>
                        </a>
                      </div>
                      }

                      {this.state.selectedProductId &&
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

  return {
    ApiResourceObject,
    fetchAuth,
  }
}

export default injectIntl(connect(mapStateToProps)(EntityDetailAssociate));