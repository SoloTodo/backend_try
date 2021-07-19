import React, {Component} from 'react';
import {connect} from "react-redux";
import {FormattedMessage} from "react-intl";
import {Link, NavLink} from "react-router-dom";
import { toast } from 'react-toastify';
import moment from "moment";

import {
  apiResourceStateToPropsUtils,
  filterApiResourceObjectsByType
} from "../../react-utils/ApiResource";
import {
  ApiForm,
  ApiFormChoiceField,
  ApiFormResultTableWithPagination
} from '../../react-utils/api_forms'

import messages from "../../messages";
import Loading from "../../components/Loading";
import {backendStateToPropsUtils} from "../../utils";

class RatingPendingList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      formValues: {},
      apiFormFieldChangeHandler: undefined,
      ratings: undefined
    }
  }

  setApiFormFieldChangeHandler = apiFormFieldChangeHandler => {
    this.setState({
      apiFormFieldChangeHandler
    })
  };

  handleFormValueChange = formValues => {
    this.setState({formValues})
  };

  setRatings = json => {
    this.setState({
      ratings: json ? json.payload : null
    })
  };

  handleApproveClick = (evt, rating) => {
    evt.preventDefault();

    this.props.fetchAuth(`${rating.url}approve/`, {
      method: 'POST'
    }).then(approvedRating => {
      toast.success(<FormattedMessage id="rating_approved" defaultMessage="Rating approved" />);

      this.setState({
        ratings: {
          count: this.state.ratings.count - 1,
          results: this.state.ratings.results.filter(rating => rating.url !== approvedRating.url)
        }
      })
    })
  };

  handleDeleteClick = (evt, clickedRating) => {
    evt.preventDefault();

    this.props.fetchAuth(`${clickedRating.url}`, {
      method: 'DELETE'
    }).then(response => {
      toast.success(<FormattedMessage id="rating_deleted" defaultMessage="Rating deleted" />);

      this.setState({
        ratings: {
          count: this.state.ratings.count - 1,
          results: this.state.ratings.results.filter(rating => rating.url !== clickedRating.url)
        }
      })
    })
  };

  render() {
    const columns = [
          {
            label: <FormattedMessage id="id" defaultMessage="ID" />,
            renderer: rating => <NavLink to={'/ratings/' + rating.id}>{rating.id}</NavLink>
          },
          {
            label: <FormattedMessage id="creation_date" defaultMessage="Creation date" />,
            renderer: rating => moment(rating.creationDate).format('lll')
          },
          {
            label: <FormattedMessage id="product" defaultMessage="Product" />,
            renderer: rating => <NavLink to={'/products/' + rating.product.id}>{rating.product.name}</NavLink>
          },
          {
            label: <FormattedMessage id="product_rating" defaultMessage="Product rating" />,
            renderer: rating => rating.productRating || <em>Producto no recibido</em>
          },
          {
            label: <FormattedMessage id="product_comments" defaultMessage="Product comments" />,
            renderer: rating => rating.productRating ? rating.productComments : <em>Producto no recibido</em>
          },
          {
            label: <FormattedMessage id="store" defaultMessage="Store" />,
            renderer: rating => <Link to={'/stores/' + rating.store.id}>{rating.store.name}</Link>
          },
          {
            label: <FormattedMessage id="store_rating" defaultMessage="Store rating" />,
            renderer: rating => rating.storeRating
          },
          {
            label: <FormattedMessage id="store_comments" defaultMessage="Store comments" />,
            renderer: rating => rating.storeComments
          },
          {
            label: <FormattedMessage id="purchase_proof" defaultMessage="Purchase proof" />,
            renderer: rating => <a href={rating.purchaseProof}><FormattedMessage id="download" defaultMessage="Download" /></a>
          },
          {
            label: <FormattedMessage id="ip" defaultMessage="IP" />,
            renderer: rating => rating.ip
          },
          {
            label: <FormattedMessage id="user" defaultMessage="User" />,
            renderer: rating => rating.user.email
          },
          {
            label: <FormattedMessage id="approve" defaultMessage="Approve" />,
            renderer: rating => <button onClick={evt => this.handleApproveClick(evt, rating)} className="btn btn-success">
              <FormattedMessage id="approve" defaultMessage="Approve" />
            </button>
          },
          {
            label: <FormattedMessage id="delete" defaultMessage="Delete" />,
            renderer: rating => <button onClick={evt => this.handleDeleteClick(evt, rating)} className="btn btn-danger">
              <FormattedMessage id="delete" defaultMessage="Delete" />
            </button>
          }
        ]
    ;

    return (
        <div className="animated fadeIn">
          <ApiForm
              endpoints={['ratings/?pending_only=1']}
              fields={['stores', 'categories', 'page', 'page_size']}
              onResultsChange={this.setRatings}
              onFormValueChange={this.handleFormValueChange}
              setFieldChangeHandler={this.setApiFormFieldChangeHandler}>
            <div className="row">
              <div className="col-12">
                <div className="card">
                  <div className="card-header">
                    <i className="glyphicons glyphicons-search">&nbsp;</i> <FormattedMessage id="filters" defaultMessage={`Filters`} />
                  </div>
                  <div className="card-block">
                    <div className="row">
                      <div className="col-12 col-sm-6 col-md-6 col-lg-6 col-xl-6">
                        <label htmlFor="stores">
                          <FormattedMessage id="stores" defaultMessage={`Stores`} />
                        </label>
                        <ApiFormChoiceField
                            name="stores"
                            id="stores"
                            choices={this.props.stores}
                            multiple={true}
                            searchable={!this.props.isExtraSmall}
                            onChange={this.state.apiFormFieldChangeHandler}
                            value={this.state.formValues.stores}
                            placeholder={messages.all_feminine}

                        />
                      </div>
                      <div className="col-12 col-sm-6 col-md-6 col-lg-6 col-xl-6">
                        <label htmlFor="categories">
                          <FormattedMessage id="categories" defaultMessage={`Categories`} />
                        </label>
                        <ApiFormChoiceField
                            name="categories"
                            id="categories"
                            choices={this.props.categories}
                            multiple={true}
                            searchable={!this.props.isExtraSmall}
                            onChange={this.state.apiFormFieldChangeHandler}
                            value={this.state.formValues.categories}
                            placeholder={messages.all_feminine}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-12">
                <ApiFormResultTableWithPagination
                    label={<FormattedMessage id="ratings" defaultMessage="Ratings" />}
                    page_size_choices={[50, 100, 200]}
                    page={this.state.formValues.page}
                    page_size={this.state.formValues.page_size}
                    data={this.state.ratings}
                    onChange={this.state.apiFormFieldChangeHandler}
                    columns={columns}
                    ordering={this.state.formValues.ordering}
                    loading={<Loading />}
                />
              </div>
            </div>
          </ApiForm>
        </div>
    )
  }
}

function mapStateToProps(state) {
  const {fetchAuth} = apiResourceStateToPropsUtils(state);
  const {user} = backendStateToPropsUtils(state);

  return {
    fetchAuth,
    user,
    stores: filterApiResourceObjectsByType(state.apiResourceObjects, 'stores'),
    categories: filterApiResourceObjectsByType(state.apiResourceObjects, 'categories'),
    isExtraSmall: state.browser.is.extraSmall
  }
}

export default connect(mapStateToProps)(RatingPendingList);
