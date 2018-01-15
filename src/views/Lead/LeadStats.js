import React, {Component} from 'react';
import {settings} from "../../settings";
import {FormattedMessage, injectIntl} from "react-intl";
import {connect} from "react-redux";
import {
  createPageSizeChoices,
  ApiForm,
  ApiFormDateRangeField,
  ApiFormChoiceField,
  ApiFormSubmitButton,
  ApiFormPaginationField,
  ApiFormResultsTable,
  ApiFormRemoveOnlyListField,
  ApiFormResultPieChart
} from "../../react-utils/api_forms";
import {
  listToObject,
} from "../../react-utils/utils";
import {
  addApiResourceStateToPropsUtils
} from "../../react-utils/ApiResource";
import moment from "moment";
import Loading from "../../components/Loading";
import {NavLink} from "react-router-dom";
import './LeadStats.css'
import LeadStatsTimelapse from "./LeadStatsTimelapse";

class LeadStats extends Component {
  constructor(props) {
    super(props);

    this.state = {
      formValues: {},
      apiFormFieldChangeHandler: undefined,
      leadStats: undefined,
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

  setResults = (bundle) => {
    if (!bundle) {
      this.setState({
        leadStats: null,
        resultsGrouping: null,
      });
      return;
    }

    this.setState({
      leadStats: bundle.payload,
      resultFormValues: bundle.fieldValues
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
        id: 'date',
        name: <FormattedMessage id="date" defaultMessage="Date"/>,
        ordering: null
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

    let resultComponent = null;
    const resultGrouping = this.state.resultFormValues ? this.state.resultFormValues.grouping.id : null;

    const categories = this.props.categories.filter(category => category.permissions.includes('view_category_leads'));
    const stores = this.props.stores.filter(store => store.permissions.includes('view_store_leads'));
    const websites = this.props.websites.filter(website => website.permissions.includes('view_website_leads'));

    const categoriesDict = listToObject(categories, 'url');
    let displayPaginationControls = false;

    switch (resultGrouping) {
      case 'category':
        resultComponent =
            <ApiFormResultPieChart
                data={this.state.leadStats}
                label_field='category'
                label={<FormattedMessage id="category" defaultMessage="Category" />}
                column_header={<FormattedMessage id="count" defaultMessage="Count" />}
            />;
        break;
      case 'store':
        resultComponent =
            <ApiFormResultPieChart
                data={this.state.leadStats}
                label_field='store'
                label={<FormattedMessage id="store" defaultMessage="Store" />}
                column_header={<FormattedMessage id="count" defaultMessage="Count" />}

            />;
        break;
      case 'date':
        resultComponent =
            <LeadStatsTimelapse
                startDate={this.state.resultFormValues.timestamp && this.state.resultFormValues.timestamp.startDate}
                endDate={this.state.resultFormValues.timestamp && this.state.resultFormValues.timestamp.endDate}
                data={this.state.leadStats}
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
          }
        ];

        resultComponent = <ApiFormResultsTable
            columns={productColumns}
            onChange={this.state.apiFormFieldChangeHandler}
            results={this.state.leadStats && this.state.leadStats.results}
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
            renderer: entry => <NavLink to={'/products/' + entry.entity.product.id}>{entry.entity.product.name}</NavLink>
          },
          {
            label: <FormattedMessage id="count" defaultMessage="Count" />,
            renderer: entry => entry.count
          }
        ];

        resultComponent = <ApiFormResultsTable
            columns={entityColumns}
            onChange={this.state.apiFormFieldChangeHandler}
            results={this.state.leadStats && this.state.leadStats.results}
        />;
        break;
      default:
        resultComponent = <Loading />
    }

    const paginationVisibilityClass = displayPaginationControls ? '' : ' hidden-xs-up';

    const displayEntitiesFilter = this.state.formValues.entities && this.state.formValues.entities.length;
    const displayProductsFilter = this.state.formValues.products && this.state.formValues.products.length;

    return (
        <div className="animated fadeIn d-flex flex-column">
          <ApiForm
              endpoints={[settings.apiResourceEndpoints.leads + 'grouped/']}
              fields={['grouping', 'stores', 'timestamp', 'categories', 'websites', 'entities', 'products', 'page', 'page_size']}
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

                      <div className="col-12 col-sm-12 col-md-4 col-lg-4 col-xl-4">
                        <label htmlFor="websites">
                          <FormattedMessage id="websites" defaultMessage="Websites" />
                        </label>
                        <ApiFormChoiceField
                            name="websites"
                            id="websites"
                            placeholder={<FormattedMessage id="all_masculine" defaultMessage="All" />}
                            choices={websites}
                            multiple={true}
                            searchable={false}
                            value={this.state.formValues.websites}
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
                            additionalApiFields={['ordering']}
                        />
                      </div>

                      <div className="col-12 col-sm-6 col-md-4 col-lg-3 col-xl-2">
                        <label className="hidden-xs-down">&nbsp;</label>
                        <ApiFormSubmitButton
                            label={<FormattedMessage id="update" defaultMessage='Update' />}
                            loadingLabel={<FormattedMessage id="updating" defaultMessage='Updating'/>}
                            onChange={this.state.apiFormFieldChangeHandler}
                            loading={this.state.leadStats === null}
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
                            updateResultsOnChange={true}
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
                            updateResultsOnChange={true}
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
                                initial={'50'}
                                onChange={this.state.apiFormFieldChangeHandler}
                                value={this.state.formValues.page_size}
                                required={true}
                                updateResultsOnChange={true}
                                searchable={false}
                            />
                          </div>
                          <label><FormattedMessage id="results_per_page" defaultMessage="Results per page" /></label>
                        </div>
                        <div className="pagination-fields ml-auto d-flex align-items-center mr-0">
                          <ApiFormPaginationField
                              page={this.state.formValues.page}
                              pageSize={this.state.formValues.page_size}
                              resultCount={this.state.leadStats && this.state.leadStats.count}
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

export default injectIntl(connect(
    addApiResourceStateToPropsUtils()
)(LeadStats));
