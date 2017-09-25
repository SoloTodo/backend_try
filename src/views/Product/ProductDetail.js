import React, {Component} from 'react'
import {FormattedMessage} from "react-intl";
import {connect} from "react-redux";
import {addApiResourceStateToPropsUtils} from "../../ApiResource";
import {settings} from "../../settings";
import Loading from "../../components/Loading";
import ProductDetailPricesTable from "./ProductDetailPricesTable";
import './ProductDetail.css'

class ProductDetail extends Component {
  constructor(props) {
    super(props);

    this.state = {
      renderedSpecs: undefined
    }
  }

  componentWillMount() {
    const product = this.props.ApiResourceObject(this.props.apiResourceObject);

    const specsTemplateUrl = `${settings.apiResourceEndpoints.category_templates}?target=${settings.categoryTemplateTargetId}&purpose=${settings.categoryTemplateDetailPurposeId}&category=${product.category.id}`;

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