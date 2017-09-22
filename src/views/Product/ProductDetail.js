import React, {Component} from 'react'
import {FormattedMessage} from "react-intl";
import {addApiResourceStateToPropsUtils} from "../../ApiResource";
import {connect} from "react-redux";
import ProductDetailPricesTable from "./ProductDetailPricesTable";

class ProductDetail extends Component {
  render() {
    const product = this.props.ApiResourceObject(this.props.apiResourceObject);

    return (
        <div className="animated fadeIn">
          <div className="row">
            <div className="col-sm-12 col-md-8 col-lg-8 col-xl-8">
              <div className="card">
                <div className="card-header">
                  <span className="glyphicons glyphicons-picture">&nbsp;</span>
                  <FormattedMessage id="picture" defaultMessage='Picture'/>
                </div>
                <div className="card-block center-aligned">
                  <img src={product.pictureUrl} alt={product.name} className="img-fluid"  />
                </div>
              </div>
            </div>
            <div className="col-12">
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
          </div>
        </div>
    )
  }
}

export default connect(
    addApiResourceStateToPropsUtils())(ProductDetail);