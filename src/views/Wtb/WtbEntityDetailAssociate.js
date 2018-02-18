import React, {Component} from 'react'
import {FormattedMessage, injectIntl} from "react-intl";
import {
  apiResourceStateToPropsUtils
} from "../../react-utils/ApiResource";
import {connect} from "react-redux";
import {NavLink, Redirect} from "react-router-dom";
import { toast } from 'react-toastify';
import {settings} from "../../settings";

class WtbEntityDetailAssociate extends Component {
  constructor(props) {
    super(props);

    this.state = {
      productChoices: [],
      selectedProductId: '',
      finishedAssociating: false
    }
  }

  handleProductSearchSubmit = evt => {
    evt.preventDefault();

    const keywords = document.getElementById('search').value;

    const entity = this.props.ApiResourceObject(this.props.apiResourceObject);
    const endpoint = `${entity.category.url}products/?page_size=200&search=${encodeURIComponent(keywords)}`;

    this.props.fetchAuth(endpoint).then(json => {
      const productChoices = json.results;
      const selectedProductId = json.results.length ? json.results[0].id.toString() : '';

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

    if (entity.product && entity.product.id.toString() === this.state.selectedProductId) {
      toast.error(<FormattedMessage
          id="please_select_a_different_product"
          defaultMessage="Please select a different product from the current one" />, {
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
    const wtbEntity = this.props.ApiResourceObject(this.props.apiResourceObject);

    if (this.state.finishedAssociating) {
      toast.success(<FormattedMessage
          id="association_successful"
          defaultMessage="The entity has been associated successfully" />);

      return <Redirect push to={{
        pathname: '/wtb/entities/pending',
        search: '?wtb_brands=' + wtbEntity.brand.id
      }} />
    }

    if (!wtbEntity.isVisible) {
      toast.warn(<FormattedMessage
          id="non_visible_entity_association"
          defaultMessage="This entity is not visible, so it can't be associated. Mark it as visible if you want to associate it." />, {
        autoClose: false
      });

      return <Redirect to={{
        pathname: `/wtb/entities/${wtbEntity.id}`,
      }} />
    }

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
                        <dd>{wtbEntity.name}</dd>

                        <dt><FormattedMessage id="brand" defaultMessage="Brand" /></dt>
                        <dd>{wtbEntity.brand.name}</dd>

                        <dt><FormattedMessage id="url" defaultMessage="URL" /></dt>
                        <dd><a href={wtbEntity.externalUrl} target="_blank">{wtbEntity.externalUrl}</a></dd>
                      </dl>
                    </div>
                    <div className="col-12 col-sm-6">
                      <dl>

                        <dt><FormattedMessage id="category" defaultMessage="Category" /></dt>
                        <dd>{wtbEntity.category.name}</dd>

                        <dt><FormattedMessage id="current_product" defaultMessage="Current product" /></dt>
                        <dd>{wtbEntity.product ? <NavLink to={`/products/${wtbEntity.product.id}`}>{wtbEntity.product.name}</NavLink> : <em>N/A</em>}</dd>
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
                <div className="card-block">
                  <form onSubmit={this.handleProductSearchSubmit}>
                    <div className="form-group">
                      <input autoComplete="off" type="text" id="search" className="form-control" placeholder={this.props.intl.formatMessage({id: 'keywords'})} />
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

export default injectIntl(connect(mapStateToProps)(WtbEntityDetailAssociate));
