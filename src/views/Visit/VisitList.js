import React, {Component} from 'react'
import {
  listToObject,
} from "../../react-utils/utils";
import {
  apiResourceStateToPropsUtils,
  filterApiResourceObjectsByType,
} from "../../react-utils/ApiResource";
import {
  ApiForm,
  ApiFormResultTableWithPagination,
  ApiFormChoiceField,
  ApiFormRemoveOnlyListField
} from "../../react-utils/api_forms";
import {connect} from "react-redux";
import {FormattedMessage} from "react-intl";
import moment from "moment";
import {settings} from "../../settings";
import messages from "../../messages";
import {NavLink} from "react-router-dom";
import {backendStateToPropsUtils} from "../../utils";


class VisitList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      formValues: {},
      apiFormFieldChangeHandler: undefined,
      visits: undefined
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

  setVisits = json => {
    this.setState({
      visits: json ? json.payload : null
    })
  };

  render() {
    const categories = this.props.categories.filter(category => category.permissions.includes('view_category_visits'));
    const websites = this.props.websites.filter(website => website.permissions.includes('view_website_visits'));

    const categoriesDict = listToObject(categories, 'url');

    const columns = [
      {
        label: <FormattedMessage id="date" defaultMessage="Date" />,
        renderer: visit => moment(visit.timestamp).format('llll')
      },
      {
        label: <FormattedMessage id="product" defaultMessage="Product" />,
        renderer: visit => {
          return <span>
              <NavLink to={'/products/' + visit.product.id}>{visit.product.name}</NavLink>
              <a href={`${visit.website.externalUrl}/products/${visit.product.id}`} target="_blank" rel="noopener noreferrer" className="ml-2">
                <span className="glyphicons glyphicons-link">&nbsp;</span>
              </a>
          </span>
        }
      },
      {
        label: <FormattedMessage id="category" defaultMessage="Category" />,
        renderer: visit => categoriesDict[visit.product.category].name
      },
      {
        label: <FormattedMessage id="website" defaultMessage="Website" />,
        renderer: visit => visit.website.name
      }
    ];

    if (this.props.user.permissions.includes('solotodo.view_visits_user_data')) {
      columns.push({
        label: <FormattedMessage id="user" defaultMessage="User" />,
        renderer: visit => visit.user.email
      });

      columns.push({
        label: <FormattedMessage id="ip" defaultMessage="IP" />,
        renderer: visit => visit.ip
      })
    }

    const displayProductsFilter = this.state.formValues.products && this.state.formValues.products.length;

    return (
        <div className="animated fadeIn">
          <ApiForm
              endpoints={[settings.apiResourceEndpoints.visits + '?ordering=-timestamp']}
              fields={['categories', 'websites', 'products', 'page', 'page_size']}
              onResultsChange={this.setVisits}
              onFormValueChange={this.handleFormValueChange}
              setFieldChangeHandler={this.setApiFormFieldChangeHandler}>
            <div className="row">
              <div className="col-12">
                <div className="card">
                  <div className="card-header">
                    <i className="glyphicons glyphicons-search">&nbsp;</i> <FormattedMessage id="filters" defaultMessage="Filters" />
                  </div>
                  <div className="card-block">
                    <div className="row entity-form-controls">
                      <div className="col-12 col-sm-6 col-md-6 col-lg-6 col-xl-6">
                        <label htmlFor="categories">
                          <FormattedMessage id="categories" defaultMessage={`Categories`} />
                        </label>
                        <ApiFormChoiceField
                            name="categories"
                            id="categories"
                            choices={categories}
                            multiple={true}
                            searchable={!this.props.isExtraSmall}
                            onChange={this.state.apiFormFieldChangeHandler}
                            value={this.state.formValues.categories}
                            placeholder={messages.all_feminine}
                        />
                      </div>
                      <div className="col-12 col-sm-6 col-md-6 col-lg-6 col-xl-6">
                        <label htmlFor="websites">
                          <FormattedMessage id="websites" defaultMessage="Websites" />
                        </label>
                        <ApiFormChoiceField
                            name="websites"
                            id="websites"
                            choices={websites}
                            multiple={true}
                            searchable={false}
                            onChange={this.state.apiFormFieldChangeHandler}
                            value={this.state.formValues.websites}
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
                      <div className={`col-12 col-sm-6 ${displayProductsFilter ? '' : ' hidden-xs-up'}`}>
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
              <div className="col-12">
                <ApiFormResultTableWithPagination
                    label={<FormattedMessage id="visits" defaultMessage="Visits" />}
                    page_size_choices={[50, 100, 200]}
                    page={this.state.formValues.page}
                    page_size={this.state.formValues.page_size}
                    data={this.state.visits}
                    onChange={this.state.apiFormFieldChangeHandler}
                    columns={columns}
                />
              </div>
            </div>
          </ApiForm>
        </div>
    )
  }
}


function mapStateToProps(state) {
  const {ApiResourceObject} = apiResourceStateToPropsUtils(state);
  const {user } = backendStateToPropsUtils(state);

  return {
    ApiResourceObject,
    user,
    websites: filterApiResourceObjectsByType(state.apiResourceObjects, 'websites'),
    categories: filterApiResourceObjectsByType(state.apiResourceObjects, 'categories'),
    isExtraSmall: state.browser.is.extraSmall
  }
}

export default connect(mapStateToProps)(VisitList);
