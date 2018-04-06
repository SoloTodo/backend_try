import React, {Component} from 'react';
import {
  filterApiResourceObjectsByType,
} from '../../react-utils/ApiResource'
import {
  createPageSizeChoices,
  ApiForm,
  ApiFormDateRangeField,
  ApiFormChoiceField,
  ApiFormPaginationField,
  ApiFormResultsTable,
  ApiFormRemoveOnlyListField,
  ApiFormResultPieChart
} from '../../react-utils/api_forms'
import {
  listToObject,
} from '../../react-utils/utils'
import {settings} from "../../settings";
import {FormattedMessage} from "react-intl";
import {connect} from "react-redux";
import moment from "moment";
import Loading from "../../components/Loading";
import {NavLink} from "react-router-dom";
import {backendStateToPropsUtils} from "../../utils";

class EntityEstimatedSales extends Component {
  constructor(props) {
    super(props);

    this.state = {
      formValues: {},
      apiFormFieldChangeHandler: undefined,
      estimatedSales: undefined,
      resultsGrouping: undefined
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

  setResults = bundle => {
    this.setState({
      estimatedSales: bundle ? bundle.payload : null,
      resultFormValues: bundle ? bundle.fieldValues : null
    })
  };

  render() {
    const dateRangeInitialMax = moment().startOf('day');
    const dateRangeInitialMin = moment(dateRangeInitialMax).subtract(30, 'days');

    const groupingChoices = [
      {
        id: 'category',
        name: <FormattedMessage id="category" defaultMessage="Category"/>,
        ordering: 'count'
      },
      {
        id: 'store',
        name: <FormattedMessage id="store" defaultMessage="Store"/>,
        ordering: 'count'
      },
      {
        id: 'product',
        name: <FormattedMessage id="product" defaultMessage="Product"/>,
        ordering: 'count'
      },
      {
        id: 'entity',
        name: <FormattedMessage id="entity" defaultMessage="Entidad"/>,
        ordering: 'count'
      },
    ];

    const orderingChoices = [
      {
        id: 'count',
        name: <FormattedMessage id="count" defaultMessage="Count"/>,
        dataField: 'count',
      },
      {
        id: 'normal_price_sum',
        name: <FormattedMessage id="normal_price_sum" defaultMessage="Normal price sum"/>,
        dataField: 'normalPriceSum',
      },
      {
        id: 'offer_price_sum',
        name: <FormattedMessage id="offer_price_sum" defaultMessage="Offer price sum"/>,
        dataField: 'offerPriceSum'
      }
    ];

    let resultComponent = null;
    const resultGrouping = this.state.resultFormValues ? this.state.resultFormValues.grouping.id : null;

    const categories = this.props.categories;
    const stores = this.props.stores;

    const categoriesDict = listToObject(categories, 'url');
    let displayPaginationControls = false;

    switch (resultGrouping) {
      case 'category':
        resultComponent =
            <ApiFormResultPieChart
                data={this.state.estimatedSales}
                label_field='category'
                data_field={this.state.resultFormValues.ordering.dataField}
                label={<FormattedMessage id="category" defaultMessage="Category" />}
                column_header={this.state.resultFormValues.ordering.name}
                column_value_formatter={value => this.props.formatCurrency(value)}
            />;
        break;
      case 'store':
        resultComponent =
            <ApiFormResultPieChart
                data={this.state.estimatedSales}
                label_field='store'
                data_field={this.state.resultFormValues.ordering.dataField}
                label={<FormattedMessage id="store" defaultMessage="Store" />}
                column_header={this.state.resultFormValues.ordering.name}
                column_value_formatter={value => this.props.formatCurrency(value)}
            />;
        break;
      case 'product':
        displayPaginationControls = true;
        const productColumns = [
          {
            label: <FormattedMessage id="product" defaultMessage="Product" />,
            renderer: entry => <NavLink to={'/products/' + entry.product.id}>{entry.product.name}</NavLink>
          },
          {
            label: <FormattedMessage id="category" defaultMessage="Category" />,
            renderer: entry => {
              const category = categoriesDict[entry.product.category];
              return <NavLink to={'/categories/' + category.id}>{category.name}</NavLink>
            }
          },
          {
            label: <FormattedMessage id="count" defaultMessage="Count" />,
            renderer: entry => entry.count
          },
          {
            label: <FormattedMessage id="normal_price_sum" defaultMessage="Normal price sum" />,
            renderer: entry => this.props.formatCurrency(entry.normalPriceSum)
          },
          {
            label: <FormattedMessage id="offer_price_sum" defaultMessage="Offer price sum" />,
            renderer: entry => this.props.formatCurrency(entry.offerPriceSum)
          }
        ];

        resultComponent = <ApiFormResultsTable
            columns={productColumns}
            onChange={this.state.apiFormFieldChangeHandler}
            results={this.state.estimatedSales && this.state.estimatedSales.results}
        />;
        break;
      case 'entity':
        displayPaginationControls = true;
        const storesDict = listToObject(stores, 'url');

        const entityColumns = [
          {
            label: <FormattedMessage id="entity" defaultMessage="Entidad" />,
            renderer: entry => <span>
              <NavLink to={'/entities/' + entry.entity.id}>{entry.entity.name}</NavLink>
              <a href={entry.entity.external_url} target="_blank" className="ml-2">
                <span className="glyphicons glyphicons-link">&nbsp;</span>
              </a>
            </span>
          },
          {
            label: <FormattedMessage id="store" defaultMessage="Store" />,
            renderer: entry => {
              const store = storesDict[entry.entity.store];
              return <NavLink to={'/stores/' + store.id}>{store.name}</NavLink>
            }
          },
          {
            label: <FormattedMessage id="product" defaultMessage="Product" />,
            renderer: entry => {
              if (entry.entity.product) {
                return <NavLink to={'/products/' + entry.entity.product.id}>{entry.entity.product.name}</NavLink>
              } else {
                return <em>N/A</em>
              }

            }
          },
          {
            label: <FormattedMessage id="count" defaultMessage="Count" />,
            renderer: entry => entry.count
          },
          {
            label: <FormattedMessage id="normal_price_sum" defaultMessage="Normal price sum" />,
            renderer: entry => this.props.formatCurrency(entry.normalPriceSum)
          },
          {
            label: <FormattedMessage id="offer_price_sum" defaultMessage="Offer price sum" />,
            renderer: entry => this.props.formatCurrency(entry.offerPriceSum)
          }
        ];

        resultComponent = <ApiFormResultsTable
            columns={entityColumns}
            onChange={this.state.apiFormFieldChangeHandler}
            results={this.state.estimatedSales && this.state.estimatedSales.results}
        />;
        break;
      default:
        resultComponent = <Loading />
    }

    const paginationVisibilityClass = displayPaginationControls ? '' : ' hidden-xs-up';

    const displayEntitiesFilter = this.state.formValues.ids && this.state.formValues.ids.length;
    const displayProductsFilter = this.state.formValues.products && this.state.formValues.products.length;

    return (
        <div className="animated fadeIn d-flex flex-column">
          <ApiForm
              endpoints={[settings.apiResourceEndpoints.entities + 'estimated_sales/']}
              fields={['grouping', 'ordering', 'stores', 'timestamp', 'categories', 'ids', 'products', 'page', 'page_size']}
              onResultsChange={this.setResults}
              onFormValueChange={this.handleFormValueChange}
              setFieldChangeHandler={this.setApiFormFieldChangeHandler}>
            <div className="row">
              <div className="col-12">
                <div className="card">
                  <div className="card-header">
                    <span className="glyphicons glyphicons-filter">&nbsp;</span>
                    <FormattedMessage id="filters" defaultMessage={`Filters`} />
                  </div>
                  <div className="card-block">
                    <div className="row api-form-filters">
                      <div className="col-12 col-sm-12 col-md-4 col-lg-4 col-xl-4">
                        <label htmlFor="stores">
                          <FormattedMessage id="stores" defaultMessage="Stores" />
                        </label>
                        <ApiFormChoiceField
                            name="stores"
                            id="stores"
                            placeholder={<FormattedMessage id="all_feminine" defaultMessage="All" />}
                            choices={stores}
                            multiple={true}
                            searchable={true}
                            value={this.state.formValues.stores}
                            onChange={this.state.apiFormFieldChangeHandler}
                        />
                      </div>

                      <div className="col-12 col-sm-12 col-md-4 col-lg-4 col-xl-4">
                        <label htmlFor="categories">
                          <FormattedMessage id="categories" defaultMessage="categories" />
                        </label>
                        <ApiFormChoiceField
                            name="categories"
                            id="categories"
                            placeholder={<FormattedMessage id="all_feminine" defaultMessage="All" />}
                            choices={categories}
                            multiple={true}
                            searchable={true}
                            value={this.state.formValues.categories}
                            onChange={this.state.apiFormFieldChangeHandler}
                        />
                      </div>

                      <div className="col-12 col-sm-12 col-md-12 col-lg-5 col-xl-4">
                        <label htmlFor="timestamp">
                          <FormattedMessage id="date_range_from_to" defaultMessage="Date range (from / to)" />
                        </label>
                        <ApiFormDateRangeField
                            name="timestamp"
                            id="timestamp"
                            label={<FormattedMessage id="date_range_from_to" defaultMessage='Date range (from / to)' />}
                            initial={[dateRangeInitialMin, dateRangeInitialMax]}
                            value={this.state.formValues.timestamp}
                            onChange={this.state.apiFormFieldChangeHandler}
                        />
                      </div>

                      <div className="col-12 col-sm-6 col-md-6 col-lg-4 col-xl-4">
                        <label htmlFor="grouping">
                          <FormattedMessage id="grouping" defaultMessage="Grouping" />
                        </label>
                        <ApiFormChoiceField
                            name="grouping"
                            id="grouping"
                            required={true}
                            choices={groupingChoices}
                            value={this.state.formValues.grouping}
                            onChange={this.state.apiFormFieldChangeHandler}
                        />
                      </div>

                      <div className="col-12 col-sm-6 col-md-6 col-lg-4 col-xl-4">
                        <label htmlFor="ordering">
                          <FormattedMessage id="ordering" defaultMessage="Ordering" />
                        </label>
                        <ApiFormChoiceField
                            name="ordering"
                            id="ordering"
                            required={true}
                            choices={orderingChoices}
                            value={this.state.formValues.ordering}
                            onChange={this.state.apiFormFieldChangeHandler}
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
                            name="ids"
                            value={this.state.formValues.ids}
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
                <div className="card">
                  <div className="card-header">
                    <span className="glyphicons glyphicons-signal">&nbsp;</span>
                    <FormattedMessage id="results" defaultMessage='Results'/>
                  </div>
                  <div className="card-block">
                    <div id="lead-stats-result-container">
                      <div className={'d-flex justify-content-between flex-wrap align-items-center mb-3 api-form-filters ' + paginationVisibilityClass}>
                        <div className="d-flex results-per-page-fields align-items-center mr-3">
                          <div className="results-per-page-dropdown ml-0 mr-2">
                            <ApiFormChoiceField
                                name="page_size"
                                choices={createPageSizeChoices([50, 100, 200])}
                                onChange={this.state.apiFormFieldChangeHandler}
                                value={this.state.formValues.page_size}
                                required={true}
                                searchable={false}
                            />
                          </div>
                          <label><FormattedMessage id="results_per_page" defaultMessage="Results per page" /></label>
                        </div>
                        <div className="pagination-fields ml-auto d-flex align-items-center mr-0">
                          <ApiFormPaginationField
                              page={this.state.formValues.page}
                              pageSize={this.state.formValues.page_size}
                              resultCount={this.state.estimatedSales && this.state.estimatedSales.count}
                              onChange={this.state.apiFormFieldChangeHandler}
                          />
                        </div>
                      </div>

                      {resultComponent}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ApiForm>
        </div>
    )
  }
}

function mapStateToProps(state) {
  const {formatCurrency } = backendStateToPropsUtils(state);

  return {
    formatCurrency,
    categories: filterApiResourceObjectsByType(state.apiResourceObjects, 'categories'),
    stores: filterApiResourceObjectsByType(state.apiResourceObjects, 'stores')
        .filter(store => store.permissions.includes('view_store_stocks')),
  }
}


export default connect(mapStateToProps)(EntityEstimatedSales);