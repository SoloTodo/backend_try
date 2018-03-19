import React, {Component} from 'react';
import {connect} from "react-redux";
import {FormattedMessage} from "react-intl";
import {
  filterApiResourceObjectsByType
} from "../../react-utils/ApiResource";
import {Link, NavLink} from "react-router-dom";
import messages from "../../messages";
import {
  ApiForm,
  ApiFormChoiceField,
  ApiFormResultTableWithPagination
} from '../../react-utils/api_forms'
import Loading from "../../components/Loading";
import moment from "moment";
import ApiFormRemoveOnlyListField from "../../react-utils/api_forms/ApiFormRemoveOnlyListField";
import {backendStateToPropsUtils} from "../../utils";

class RatingList extends Component {
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
        label: <FormattedMessage id="approval_date" defaultMessage="Approval date" />,
        renderer: rating => rating.approvalDate ? moment(rating.approvalDate).format('lll') : 'N/A'
      },
      {
        label: <FormattedMessage id="product" defaultMessage="Product" />,
        renderer: rating => <NavLink to={'/products/' + rating.product.id}>{rating.product.name}</NavLink>
      },
      {
        label: <FormattedMessage id="product_rating" defaultMessage="Product rating" />,
        renderer: rating => rating.productRating
      },
      {
        label: <FormattedMessage id="store" defaultMessage="Store" />,
        renderer: rating => <Link to={'/stores/' + rating.store.id}>{rating.store.name}</Link>
      },
      {
        label: <FormattedMessage id="store_rating" defaultMessage="Store rating" />,
        renderer: rating => rating.storeRating
      }
    ];

    if (this.props.user.permissions.includes('solotodo.is_ratings_staff')) {
      columns.push(...[{
        label: <FormattedMessage id="ip" defaultMessage="IP" />,
        renderer: rating => rating.ip
      },
        {
          label: <FormattedMessage id="user" defaultMessage="User" />,
          renderer: rating => rating.user.email
        },
      ])
    }


    const displayProductsFilter = this.state.formValues.products && this.state.formValues.products.length;

    return (
        <div className="animated fadeIn">
          <ApiForm
              endpoints={['ratings/']}
              fields={['stores', 'categories', 'page', 'page_size', 'products']}
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

              <div className={`col-12 ${displayProductsFilter ? '' : ' hidden-xs-up'}`}>
                <div className="card">
                  <div className="card-header">
                    <span className="glyphicons glyphicons-filter">&nbsp;</span>
                    <FormattedMessage id="additional_filters" defaultMessage="Additional filters" />
                  </div>
                  <div className="card-block">
                    <div className="row api-form-filters">
                      <div className="col-12 col-sm-6">
                        <label htmlFor="products">
                          <FormattedMessage id="products" defaultMessage="Products" />
                        </label>
                        <ApiFormRemoveOnlyListField
                            name="products"
                            id="products"
                            value={this.state.formValues.products}
                            onChange={this.state.apiFormFieldChangeHandler}
                            resource="products"
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
  const {user} = backendStateToPropsUtils(state);

  return {
    user,
    stores: filterApiResourceObjectsByType(state.apiResourceObjects, 'stores'),
    categories: filterApiResourceObjectsByType(state.apiResourceObjects, 'categories'),
    isExtraSmall: state.browser.is.extraSmall
  }
}

export default connect(mapStateToProps)(RatingList);
