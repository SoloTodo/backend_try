import React, {Component} from 'react'
import {
  filterApiResourceObjectsByType
} from "../../react-utils/ApiResource";
import {connect} from "react-redux";
import {FormattedMessage} from "react-intl";
import moment from "moment";
import {
  listToObject,
} from '../../react-utils/utils';
import {
  ApiForm,
  ApiFormResultTableWithPagination,
  ApiFormChoiceField,
  ApiFormRemoveOnlyListField
} from '../../react-utils/api_forms';
import {settings} from "../../settings";
import messages from "../../messages";
import {NavLink} from "react-router-dom";
import {backendStateToPropsUtils} from "../../utils";

class LeadList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      formValues: {},
      apiFormFieldChangeHandler: undefined,
      leads: undefined
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

  setLeads = json => {
    this.setState({
      leads: json ? json.payload : null
    })
  };

  render() {
    const categories = this.props.categories.filter(category => category.permissions.includes('view_category_leads'));
    const stores = this.props.stores.filter(store => store.permissions.includes('view_store_leads'));
    const websites = this.props.websites.filter(website => website.permissions.includes('view_website_leads'));

    const categoriesDict = listToObject(categories, 'url');
    const storesDict = listToObject(stores, 'url');

    const columns = [
      {
        label: <FormattedMessage id="date" defaultMessage="Date" />,
        renderer: lead => moment(lead.timestamp).format('llll')
      },
      {
        label: <FormattedMessage id="entity" defaultMessage="Entity" />,
        renderer: lead => (
            <span>
              <NavLink to={'/entities/' + lead.entity.id}>{lead.entity.name}</NavLink>
              <a href={lead.entity.external_url} target="_blank" className="ml-2">
                <span className="glyphicons glyphicons-link">&nbsp;</span>
              </a>
            </span>
        )
      },
      {
        label: <FormattedMessage id="product" defaultMessage="Product" />,
        renderer: lead => lead.entity.product ? <NavLink to={'/products/' + lead.entity.product.id}>{lead.entity.product.name}</NavLink> : <em>N/A</em>
      },
      {
        label: <FormattedMessage id="store" defaultMessage="Store" />,
        renderer: lead => {
          const store = storesDict[lead.entity.store];
          return <NavLink to={'/stores/' + store.id}>{store.name}</NavLink>
        }
      },
      {
        label: <FormattedMessage id="category" defaultMessage="Category" />,
        renderer: lead => {
          const category = categoriesDict[lead.entity.category];
          return <NavLink to={'/categories/' + category.id}>{category.name}</NavLink>
        }
      },
      {
        label: <FormattedMessage id="website" defaultMessage="Website" />,
        renderer: lead => lead.website.name
      }
    ];

    if (this.props.user.permissions.includes('solotodo.view_leads_user_data')) {
      columns.push({
        label: <FormattedMessage id="user" defaultMessage="User" />,
        renderer: lead => lead.user.email
      });

      columns.push({
        label: <FormattedMessage id="ip" defaultMessage="IP" />,
        renderer: lead => lead.ip
      })
    }

    const displayEntitiesFilter = this.state.formValues.entities && this.state.formValues.entities.length;
    const displayProductsFilter = this.state.formValues.products && this.state.formValues.products.length;

    return (
        <div className="animated fadeIn">
          <ApiForm
              endpoints={[settings.apiResourceEndpoints.leads + '?ordering=-timestamp']}
              fields={['stores', 'categories', 'websites', 'entities', 'products', 'page', 'page_size']}
              onResultsChange={this.setLeads}
              onFormValueChange={this.handleFormValueChange}
              setFieldChangeHandler={this.setApiFormFieldChangeHandler}>
            <div className="row">
              <div className="col-12">
                <div className="card">
                  <div className="card-header">
                    <i className="glyphicons glyphicons-search">&nbsp;</i> <FormattedMessage id="filters" defaultMessage={`Filters`} />
                  </div>
                  <div className="card-block">
                    <div className="row entity-form-controls">
                      <div className="col-12 col-sm-6 col-md-6 col-lg-6 col-xl-6">
                        <label htmlFor="stores">
                          <FormattedMessage id="stores" defaultMessage={`Stores`} />
                        </label>
                        <ApiFormChoiceField
                            name="stores"
                            id="stores"
                            choices={stores}
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
              <div className={`col-12 ${displayEntitiesFilter || displayProductsFilter ? '' : ' hidden-xs-up'}`}>
                <div className="card">
                  <div className="card-header">
                    <span className="glyphicons glyphicons-filter">&nbsp;</span>
                    <FormattedMessage id="additional_filters" defaultMessage="Additional filters" />
                  </div>
                  <div className="card-block">
                    <div className="row api-form-filters">
                      <div className={`col-12 col-sm-6 ${displayEntitiesFilter ? '' : ' hidden-xs-up'}`}>
                        <label htmlFor="entities">
                          <FormattedMessage id="entities" defaultMessage="Entities" />
                        </label>
                        <ApiFormRemoveOnlyListField
                            name="entities"
                            id="entities"
                            value={this.state.formValues.entities}
                            onChange={this.state.apiFormFieldChangeHandler}
                            resource="entities"
                        />
                      </div>
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
                    label={<FormattedMessage id="leads" defaultMessage="Leads" />}
                    page_size_choices={[50, 100, 200]}
                    page={this.state.formValues.page}
                    page_size={this.state.formValues.page_size}
                    data={this.state.leads}
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
  const {user} = backendStateToPropsUtils(state);

  return {
    user,
    stores: filterApiResourceObjectsByType(state.apiResourceObjects, 'stores'),
    categories: filterApiResourceObjectsByType(state.apiResourceObjects, 'categories'),
    websites: filterApiResourceObjectsByType(state.apiResourceObjects, 'websites'),
    isExtraSmall: state.breakpoint.isExtraSmall
  }
}

export default connect(mapStateToProps)(LeadList);
