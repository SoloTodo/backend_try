import React, { Component } from 'react';
import {connect} from "react-redux";
import {
  apiResourceStateToPropsUtils
} from "../../react-utils/ApiResource";
import {FormattedMessage} from "react-intl";
import moment from "moment";
import {Link} from "react-router-dom";
import {backendStateToPropsUtils} from "../../utils";


class RatingDetail extends Component {
  render() {
    const rating = this.props.ApiResourceObject(this.props.apiResourceObject);
    const isRatingsStaff = this.props.user.permissions.includes('solotodo.is_ratings_staff');

    return (
        <div className="animated fadeIn">
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-header">Rating #{rating.id}</div>
                <div className="card-block">
                  <table className="table table-striped">
                    <tbody>
                    <tr>
                      <th><FormattedMessage id="id" defaultMessage="ID" /></th>
                      <td>{moment(rating.creationDate).format('lll')}</td>
                    </tr>
                    <tr>
                      <th><FormattedMessage id="store" defaultMessage="Store" /></th>
                      <td><Link to={`/stores/${rating.store.id}`}>{rating.store.name}</Link></td>
                    </tr>
                    <tr>
                      <th><FormattedMessage id="store_rating" defaultMessage="Store rating" /></th>
                      <td>{rating.storeRating}</td>
                    </tr>
                    <tr>
                      <th><FormattedMessage id="store_comments" defaultMessage="Store comments" /></th>
                      <td>{rating.storeComments}</td>
                    </tr>
                    <tr>
                      <th><FormattedMessage id="product" defaultMessage="Product" /></th>
                      <td><Link to={`/products/${rating.product.id}`}>{rating.product.name}</Link></td>
                    </tr>
                    <tr>
                      <th><FormattedMessage id="product_rating" defaultMessage="Product rating" /></th>
                      <td>{rating.productRating || <em>Producto no recibido</em>}</td>
                    </tr>
                    <tr>
                      <th><FormattedMessage id="product_comments" defaultMessage="Product comments" /></th>
                      <td>{rating.productRating ? rating.productComments : <em>Producto no recibido</em>}</td>
                    </tr>
                    <tr>
                      <th><FormattedMessage id="approval_date" defaultMessage="Approval date" /></th>
                      <td>
                        {rating.approvalDate ? moment(rating.approvalDate).format('lll')
                            : <FormattedMessage id="pending" defaultMessage="Pending" />}
                      </td>
                    </tr>
                    {isRatingsStaff && <tr>
                      <th><FormattedMessage id="user" defaultMessage="User"/>
                      </th>
                      <td>{rating.user.email}</td>
                    </tr>
                    }

                    {isRatingsStaff && <tr>
                      <th><FormattedMessage id="ip" defaultMessage="IP"/></th>
                      <td>{rating.ip}</td>
                    </tr>
                    }

                    {isRatingsStaff && <tr>
                      <th><FormattedMessage id="purchase_proof" defaultMessage="Purchase proof"/></th>
                      <td><a href={rating.purchaseProof}><FormattedMessage id="download" defaultMessage="Download"/></a></td>
                    </tr>
                    }
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>)
  }
}

function mapStateToProps(state) {
  const {ApiResourceObject} = apiResourceStateToPropsUtils(state);
  const {user} = backendStateToPropsUtils(state);

  return {
    ApiResourceObject,
    user
  }
}

export default connect(mapStateToProps)(RatingDetail);