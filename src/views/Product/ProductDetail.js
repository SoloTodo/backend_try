import React, {Component} from 'react'
import {FormattedMessage} from "react-intl";
import {connect} from "react-redux";
import {addApiResourceStateToPropsUtils} from "../../react-utils/ApiResource";
import {settings} from "../../settings";
import Loading from "../../components/Loading";
import ProductDetailPricesTable from "./ProductDetailPricesTable";
import './ProductDetail.css'
import {NavLink} from "react-router-dom";
import { toast } from 'react-toastify';
import JSONTree from 'react-json-tree'

import {
  ButtonDropdown, DropdownItem, DropdownMenu,
  DropdownToggle, Modal, ModalBody, ModalHeader
} from "reactstrap";

class ProductDetail extends Component {
  constructor(props) {
    super(props);

    this.state = {
      renderedSpecs: undefined,
      websiteDropDownOpen: false,
      specsModalOpen: false,
    }
  }

  componentWillMount() {
    const product = this.props.ApiResourceObject(this.props.apiResourceObject);

    const specsTemplateUrl = `${settings.apiResourceEndpoints.category_templates}?website=${settings.websiteId}&purpose=${settings.categoryTemplateDetailPurposeId}&category=${product.category.id}`;

    this.props.fetchAuth(specsTemplateUrl)
        .then(categoryTemplates => {
          if (!categoryTemplates.length) {
            this.setState({
              renderedSpecs: null
            });
            return
          }

          this.props.fetchAuth(`${categoryTemplates[0].url}render?product=${product.id}`)
              .then(renderData => {
                this.setState({
                  renderedSpecs: renderData.body
                })
              })
        })
  }

  websiteDropDownToggle = evt => {
    this.setState({
      websiteDropDownOpen: !this.state.websiteDropDownOpen
    });
  };

  specsModalToggle = evt => {
    this.setState({
      specsModalOpen: !this.state.specsModalOpen
    });
  };

  clone = evt => {
    const toastId = toast.info(<FormattedMessage
        id="product_currently_cloning"
        defaultMessage="Cloning product, please wait!" />, {
      autoClose: false
    });

    this.props.fetchAuth(this.props.apiResourceObject.url + 'clone/', {method: 'POST'}).then(json => {
      const clonedInstanceId = json.instance_id;
      const clonedInstanceUrl = `${settings.endpoint}metamodel/instances/${clonedInstanceId}`;
      toast.dismiss(toastId);
      window.open(clonedInstanceUrl, '_blank')
    })
  };

  render() {
    const product = this.props.ApiResourceObject(this.props.apiResourceObject);

    let techSpecs = null;

    switch (this.state.renderedSpecs) {
      case undefined:
        techSpecs = <Loading />;
        break;
      case null:
        techSpecs = <em><FormattedMessage id="no_tech_specs_available" defaultMessage="The tech specs of this product are not available at this time"/></em>;
        break;
      default:
        techSpecs = <div className="product_specs" dangerouslySetInnerHTML={{ __html: this.state.renderedSpecs }} />
    }

    const websites = this.props.websites.filter(website => website.id !== settings.ownWebsiteId);

    return (
        <div className="animated fadeIn">
          <div className="row">
            <div className="col-sm-12 col-md-8 col-lg-8 col-xl-5">
              <div className="card">
                <div className="card-header">
                  <span className="glyphicons glyphicons-picture">&nbsp;</span>
                  <FormattedMessage id="picture" defaultMessage='Picture'/>
                </div>
                <div className="card-block center-aligned">
                  <div className="product-image-container">
                    <img src={product.pictureUrl} alt={product.name} className="img-fluid"  />
                  </div>
                </div>
              </div>
            </div>
            <div id="prices-card" className="col-12">
              <div className="card">
                <div className="card-header">
                  <FormattedMessage id="current_prices" defaultMessage="Current prices" />
                </div>
                <div className="card-block">
                  <ProductDetailPricesTable
                      product={this.props.apiResourceObject} />
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <FormattedMessage id="options" defaultMessage="Options" />
                </div>
                <div className="card-block">
                  <ul className="list-without-decoration subnavigation-links">
                    <li>
                      <NavLink to={`/products/${product.id}/pricing_history`}>
                        <button type="button" className="btn btn-link">
                          <FormattedMessage id="pricing_history" defaultMessage="Pricing history"/>
                        </button>
                      </NavLink>
                    </li>
                    {product.category.permissions.includes('view_category_visits') &&
                    <li>
                      <NavLink to={'/visits/?products=' + product.id}>
                        <button type="button" className="btn btn-link">
                          <FormattedMessage id="visits_list" defaultMessage="Visits (list)"/>
                        </button>
                      </NavLink>
                    </li>
                    }
                    {product.category.permissions.includes('view_category_visits') &&
                    <li>
                      <NavLink to={'/visits/stats?grouping=date&products=' + product.id}>
                        <button type="button" className="btn btn-link">
                          <FormattedMessage id="visits_stats" defaultMessage="Visits (stats)"/>
                        </button>
                      </NavLink>
                    </li>
                    }

                    {product.category.permissions.includes('view_category_leads') &&
                    <li>
                      <NavLink to={'/leads/?products=' + product.id}>
                        <button type="button" className="btn btn-link">
                          <FormattedMessage id="leads_list" defaultMessage="Leads (list)"/>
                        </button>
                      </NavLink>
                    </li>
                    }
                    {product.category.permissions.includes('view_category_leads') &&
                    <li>
                      <NavLink to={'/leads/stats?grouping=date&products=' + product.id}>
                        <button type="button" className="btn btn-link">
                          <FormattedMessage id="leads_stats" defaultMessage="Leads (stats)"/>
                        </button>
                      </NavLink>
                    </li>
                    }

                    {product.category.permissions.includes('is_category_staff') &&
                    <li>
                      <NavLink to={`/products/${product.id}/entities`}>
                        <button type="button" className="btn btn-link">
                          <FormattedMessage id="associated_entities" defaultMessage="Associated entities"/>
                        </button>
                      </NavLink>
                    </li>
                    }

                    {product.category.permissions.includes('is_category_staff') &&
                    <li>
                      <a href={`${settings.endpoint}metamodel/instances/${product.instanceModelId}`}>
                        <button type="button" className="btn btn-link">
                          <FormattedMessage id="edit" defaultMessage="Edit"/>
                        </button>
                      </a>
                    </li>
                    }

                    {product.category.permissions.includes('is_category_staff') &&
                    <li>
                      <button type="button" className="btn btn-link" onClick={this.clone}>
                        <FormattedMessage id="clone" defaultMessage="Clone"/>
                      </button>
                    </li>
                    }

                    {product.category.permissions.includes('is_category_staff') &&
                    <li>
                      <Modal isOpen={this.state.specsModalOpen} toggle={this.specsModalToggle} size="lg">
                        <ModalHeader toggle={this.specsModalToggle}>
                          <FormattedMessage id="specs" defaultMessage="Specs"/>
                        </ModalHeader>
                        <ModalBody>
                          <JSONTree data={product.specs} theme="default" />
                        </ModalBody>
                      </Modal>

                      <button type="button" className="btn btn-link" onClick={this.specsModalToggle}>
                        <FormattedMessage id="json_specs" defaultMessage="Specs (as JSON)"/>
                      </button>
                    </li>
                    }

                    {websites.length &&
                    <li>
                      <ButtonDropdown isOpen={this.state.websiteDropDownOpen}
                                      toggle={this.websiteDropDownToggle}>
                        <DropdownToggle caret>
                          <FormattedMessage id="view_in_website"
                                            defaultMessage="View in website"/>
                        </DropdownToggle>
                        <DropdownMenu>
                          {websites.map(website => (
                              <DropdownItem key={website.id}>
                                <a href={`${website.external_url}/products/${product.id}`}
                                   target="_blank">{website.name}</a>
                              </DropdownItem>
                          ))}
                        </DropdownMenu>
                      </ButtonDropdown>
                    </li>
                    }
                  </ul>
                </div>
              </div>
            </div>
            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <FormattedMessage id="tech_specs" defaultMessage="Tech specs" />
                </div>
                <div className="card-block">
                  {techSpecs}
                </div>
              </div>
            </div>
          </div>
        </div>
    )
  }
}

export default connect(
    addApiResourceStateToPropsUtils())(ProductDetail);