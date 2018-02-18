import React, {Component} from 'react'
import {
  apiResourceStateToPropsUtils,
  filterApiResourceObjectsByType,
} from "../../react-utils/ApiResource";
import connect from "react-redux/es/connect/connect";
import {settings} from "../../settings";
import Loading from "../../components/Loading";
import {FormattedMessage} from "react-intl";
import {
  ApiForm,
  ApiFormChoiceField,
  ApiFormResultTableWithPagination,
  ApiFormTextField,
  ApiFormDiscreteRangeField,
  ApiFormContinuousRangeField,
  ApiFormPriceRangeField
} from "../../react-utils/api_forms";

import {NavLink, Redirect} from "react-router-dom";
import {injectIntl} from "react-intl";
import "./CategoryDetailBrowse.css"
import { toast } from 'react-toastify';
import messages from "../../messages";
import {
  backendStateToPropsUtils
} from "../../utils";
import {areObjectsEqual} from "../../react-utils/utils";

class CategoryDetailBrowse extends Component {
  initialState = {
    formLayout: undefined,
    apiFormFieldChangeHandler: undefined,
    formValues: {},
    productsPage: undefined,
    resultsAggs: {},
    priceRange: undefined,
    columns: undefined
  };

  constructor(props) {
    super(props);
    this.state = {...this.initialState}
  }

  setApiFormFieldChangeHandler = apiFormFieldChangeHandler => {
    this.setState({
      apiFormFieldChangeHandler
    })
  };

  handleFormValueChange = formValues => {
    this.setState({formValues})
  };

  setProductsPage = json => {
    if (json) {
      this.setState({
        productsPage: {
          count: json.payload.count,
          results: json.payload.results
        },
        resultsAggs: json.payload.aggs,
      })
    } else {
      // Only reset the actual results to keep the old filter aggregations
      this.setState({
        productsPage: null
      })
    }
  };

  componentDidMount() {
    this.componentUpdate(this.props.apiResourceObject, this.props.preferredCountry)
  }

  componentWillReceiveProps(nextProps) {
    const oldCategory = this.props.apiResourceObject;
    const newCategory = nextProps.apiResourceObject;

    const oldPreferredCountry = this.props.preferredCountry;
    const newPreferredCountry = nextProps.preferredCountry;

    if (oldCategory.id !== newCategory.id || !areObjectsEqual(oldPreferredCountry, newPreferredCountry)) {
      this.setState(this.initialState, () => this.componentUpdate(newCategory, newPreferredCountry))
    }
  }

  componentUpdate(category, preferredCountry) {
    // Obtain layout of the form fields
    this.props.fetchAuth(settings.apiResourceEndpoints.category_specs_form_layouts + '?category=' + category.id)
        .then(all_form_layouts => {
          const processed_form_layouts = all_form_layouts
              .map(layout => {
                let priority = 0;
                if (layout.website === settings.ownWebsiteUrl) {
                  priority = 2
                } else if (layout.website === null) {
                  priority = 1
                }
                return {
                  ...layout,
                  priority
                }
              });

          processed_form_layouts.sort((a, b) => b.priority - a.priority);

          const formLayout = processed_form_layouts[0] || null;

          if (formLayout && preferredCountry) {
            formLayout.fieldsets = formLayout.fieldsets.map(fieldset => ({
              label: fieldset.label,
              filters: fieldset.filters.filter(filter =>
                  !filter.country || filter.country === preferredCountry.url
              )
            }))
          }

          this.setState({
            formLayout: formLayout,
          })
        });

    const endpoint = this.apiEndpoint();

    // Make an empty call to the endpoint to obtain the global min / max and 80th percentile values
    this.props.fetchAuth(endpoint)
        .then(json => {
          this.setState({
            priceRange: {
              min: Math.floor(parseFloat(json.price_ranges.normal_price_usd.min)),
              max: Math.ceil(parseFloat(json.price_ranges.normal_price_usd.max)),
              p80th: Math.floor(parseFloat(json.price_ranges.normal_price_usd['80th']))
            }
          });
        });

    // Obtain columns for the results

    const columnEndpoints = `${settings.apiResourceEndpoints.category_columns}?categories=${category.id}&purposes=${settings.categoryBrowsePurposeId}`;
    this.props.fetchAuth(columnEndpoints)
        .then(json => {
          const filteredColumns = preferredCountry ?
              json.filter(column => !column.country || column.country === preferredCountry.url) :
              json;

          this.setState({
            columns: filteredColumns
          })
        })
  }

  apiEndpoint = () => {
    return `categories/${this.props.apiResourceObject.id}/browse/`;
  };

  render() {
    const formLayout = this.state.formLayout;

    if (typeof(formLayout) === 'undefined' || typeof(this.state.priceRange) === 'undefined' || !this.state.columns) {
      return <Loading />
    }

    if (formLayout === null) {
      toast.warn(<FormattedMessage id="category_no_search_form" defaultMessage="No search form has been defined for this category"/>);

      return <Redirect to={{
        pathname: `/categories/${this.props.apiResourceObject.id}`,
      }} />
    }

    let products = null;

    if (this.state.productsPage) {
      products = this.state.productsPage
    }

    const resultsAggs = this.state.resultsAggs;

    const currenciesDict = {};
    for (const currency of this.props.currencies) {
      currenciesDict[currency.url] = this.props.ApiResourceObject(currency)
    }

    const usdCurrency = this.props.currencies.filter(currency => currency.url === settings.usdCurrencyUrl)[0];

    const apiFormFields = ['stores', 'countries', 'store_types', 'ordering', 'normal_price_usd', 'page', 'page_size', 'search'];
    const processedFormLayout = [
      {
        id: 'normal_price',
        label: <FormattedMessage id="normal_price" defaultMessage="Normal price" />,
        filters: [{
          name: 'normal_price_usd',
          component: <ApiFormPriceRangeField
              name="normal_price_usd"
              onChange={this.state.apiFormFieldChangeHandler}
              min={this.state.priceRange.min || null}
              max={this.state.priceRange.max || null}
              p80th={this.state.priceRange.p80th || null}
              value={this.state.formValues.normal_price_usd}
              currency={usdCurrency}
              conversionCurrency={this.props.preferredCurrency}
              numberFormat={this.props.preferredNumberFormat}
          />
        }]
      },
      {
        id: 'keywords',
        label: <FormattedMessage id="keywords" defaultMessage="Keywords" />,
        filters: [{
          name: 'search',
          component: <ApiFormTextField
              name="search"
              placeholder={<FormattedMessage id="keywords" defaultMessage="Keywords" />}
              onChange={this.state.apiFormFieldChangeHandler}
              value={this.state.formValues.search}
              debounceTimeout={500}
          />
        }]
      }
    ];

    for (const fieldset of formLayout.fieldsets) {
      const fieldSetFilters = [];
      for (const filter of fieldset.filters) {
        apiFormFields.push(filter.name);

        const filterChoiceIdToNameDict = {};
        for (const choice of (filter.choices || [])) {
          filterChoiceIdToNameDict[choice.id] = choice.name
        }

        let filterAggs = resultsAggs[filter.name];
        let filterComponent = null;

        if (filter.type === 'exact') {
          let filterChoices = undefined;
          const value = this.state.formValues[filter.name];
          if (filterAggs) {
            filterChoices = filterAggs.map(choice => ({
              ...choice,
              name: filterChoiceIdToNameDict[choice.id],
            }));

            if (value) {
              for (const selectedValue of value) {
                let valueInChoices = Boolean(filterChoices.filter(choice => choice.id.toString() === selectedValue.id.toString()).length);
                if (!valueInChoices) {
                  filterChoices.push({
                    ...selectedValue,
                    doc_count: 0
                  })
                }
              }
            }
          } else {
            filterChoices = filter.choices
          }

          filterComponent = <ApiFormChoiceField
              name={filter.name}
              choices={filterChoices}
              placeholder={filter.label}
              searchable={true}
              onChange={this.state.apiFormFieldChangeHandler}
              value={value}
              multiple={true}
          />
        } else if (filter.type === 'lte') {
          let filterChoices = undefined;

          if (filterAggs) {
            let ongoingResultCount = 0;

            filterChoices = filterAggs.map(choice => {
              ongoingResultCount += choice.doc_count;

              return {
                ...choice,
                name: `${filterChoiceIdToNameDict[choice.id]}`,
                doc_count: ongoingResultCount
              };
            });
          } else {
            filterChoices = filter.choices
          }

          filterComponent = <ApiFormChoiceField
              name={filter.name}
              apiField={filter.name + '_1'}
              urlField={filter.name + '_end'}
              choices={filterChoices}
              placeholder={filter.label}
              searchable={true}
              onChange={this.state.apiFormFieldChangeHandler}
              value={this.state.formValues[filter.name]}
          />
        } else if (filter.type === 'gte') {
          let filterChoices = undefined;

          if (filterAggs) {
            let totalResultCount = filterAggs.reduce((acum, elem) => acum + elem.doc_count, 0);

            filterChoices = filterAggs.map(choice => {
              let result = {
                ...choice,
                name: `${filterChoiceIdToNameDict[choice.id]}`,
                doc_count: totalResultCount
              };

              totalResultCount -= choice.doc_count;

              return result
            });
          } else {
            filterChoices = filter.choices
          }

          filterComponent = <ApiFormChoiceField
              name={filter.name}
              apiField={filter.name + '_0'}
              urlField={filter.name + '_start'}
              choices={filterChoices}
              placeholder={filter.label}
              searchable={true}
              onChange={this.state.apiFormFieldChangeHandler}
              value={this.state.formValues[filter.name]}
          />
        } else if (filter.type === 'range') {
          if (filter.continuous_range_step) {
            // Continous (weight....)
            let filterChoices = [];

            if (filterAggs) {
              filterChoices = filterAggs
            }

            filterComponent = <ApiFormContinuousRangeField
                name={filter.name}
                label={filter.label}
                onChange={this.state.apiFormFieldChangeHandler}
                choices={filterChoices}
                value={this.state.formValues[filter.name]}
                step={filter.continuous_range_step}
                unit={filter.continuous_range_unit}
                resultCountSuffix={<FormattedMessage id="results_lower_case" defaultMessage="results" />}
            />
          } else {
            // Discrete (screen size...)
            let filterChoices = undefined;

            if (filterAggs) {
              filterChoices = filterAggs.map(choice => ({
                ...choice,
                label: `${filterChoiceIdToNameDict[choice.id]}`,
              }));
            } else {
              filterChoices = filter.choices.map(choice => ({
                ...choice,
                label: choice.name,
                value: parseFloat(choice.value)
              }))
            }


            filterComponent = <ApiFormDiscreteRangeField
                name={filter.name}
                label={filter.label}
                onChange={this.state.apiFormFieldChangeHandler}
                choices={filterChoices}
                value={this.state.formValues[filter.name]}
                resultCountSuffix={<FormattedMessage id="results_lower_case" defaultMessage="results" />}
            />
          }
        }

        fieldSetFilters.push({
          ...filter,
          component: filterComponent,
        })
      }

      processedFormLayout.push({
        label: fieldset.label,
        filters: fieldSetFilters
      })
    }

    const columns = [
      {
        label: <FormattedMessage id="name" defaultMessage="Name" />,
        renderer: result => <NavLink to={'/products/' + result.productEntries[0].product.id}>{result.productEntries[0].product.name}</NavLink>
      },
      {
        label: <FormattedMessage id="prices_normal_offer" defaultMessage="Prices (normal / offer)" />,
        renderer: result => {
          const priceEntries = result.productEntries[0].prices.map(priceEntry => this.props.ApiResourceObject(priceEntry));

          return <ul className="list-without-decoration">
            {priceEntries.map(priceEntry => (
                <li key={priceEntry.currency.isoCode}>{priceEntry.currency.isoCode} {this.props.formatCurrency(priceEntry.minNormalPrice, priceEntry.currency)} / {this.props.formatCurrency(priceEntry.minOfferPrice, priceEntry.currency)}
                </li>
            ))}
          </ul>
        }
      },
    ];

    for (const layoutColumn of this.state.columns) {
      columns.push({
        label: layoutColumn.label,
        renderer: result => result.productEntries[0].product.specs[layoutColumn.es_field] || <em>N/A</em>
      })
    }

    const countryUrls = this.props.stores.map(store => store.country);
    const countries = this.props.countries.filter(country => countryUrls.includes(country.url));

    const storeTypeUrls = this.props.stores.map(store => store.type);
    const storeTypes = this.props.storeTypes.filter(storeType => storeTypeUrls.includes(storeType.url));

    const orderingChoices = [
      {
        id: 'normal_price_usd',
        name: <FormattedMessage id="normal_price" defaultMessage="Normal price"/>
      },
      {
        id: 'offer_price_usd',
        name: <FormattedMessage id="offer_price" defaultMessage="Offer price"/>
      },
    ];

    for (const orderingChoice of formLayout.orders) {
      const use = orderingChoice.suggested_use;

      if (use === 'ascending') {
        orderingChoices.push({
          id: orderingChoice.name,
          name: orderingChoice.label
        })
      }

      if (use === 'descending') {
        orderingChoices.push({
          id: '-' + orderingChoice.name,
          name: orderingChoice.label
        })
      }

      if (use === 'both') {
        orderingChoices.push({
          id: orderingChoice.name,
          name: `${orderingChoice.label} (${this.props.intl.formatMessage({id: 'ascending'})})`
        });

        orderingChoices.push({
          id: '-' + orderingChoice.name,
          name: `${orderingChoice.label} (${this.props.intl.formatMessage({id: 'descending'})})`
        })
      }
    }

    const apiEndpoint = this.apiEndpoint();

    return (
        <div className="animated fadeIn">
          <ApiForm
              endpoints={[apiEndpoint]}
              fields={apiFormFields}
              onResultsChange={this.setProductsPage}
              onFormValueChange={this.handleFormValueChange}
              setFieldChangeHandler={this.setApiFormFieldChangeHandler}>
            <div className="row">
              <div className="col-12">
                <div className="card">
                  <div className="card-header">
                    <i className="glyphicons glyphicons-search">&nbsp;</i>
                    <FormattedMessage id="pricing_parameters" defaultMessage="Pricing parameters" />
                  </div>
                  <div className="card-block">
                    <div className="row api-form-filters">
                      <div className="col-12 col-sm-6 col-md-6 col-lg-6 col-xl-6">
                        <label htmlFor="stores">
                          <FormattedMessage id="stores" defaultMessage="Stores" />
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
                        <label htmlFor="countries">
                          <FormattedMessage id="countries" defaultMessage="Countries" />
                        </label>
                        <ApiFormChoiceField
                            name="countries"
                            id="countries"
                            choices={countries}
                            multiple={true}
                            onChange={this.state.apiFormFieldChangeHandler}
                            value={this.state.formValues.countries}
                            placeholder={messages.all_masculine}
                        />
                      </div>
                      <div className="col-12 col-sm-6 col-md-6 col-lg-6 col-xl-6">
                        <label htmlFor="store_types">
                          <FormattedMessage id="store_types" defaultMessage="Store types" />
                        </label>
                        <ApiFormChoiceField
                            name="store_types"
                            id="store_types"
                            choices={storeTypes}
                            multiple={true}
                            onChange={this.state.apiFormFieldChangeHandler}
                            value={this.state.formValues.store_types}
                            placeholder={messages.all_masculine}
                        />
                      </div>
                      <div className="col-12 col-sm-6 col-md-6 col-lg-6 col-xl-6">
                        <label htmlFor="ordering">
                          <FormattedMessage id="ordering" defaultMessage="Ordering" />
                        </label>
                        <ApiFormChoiceField
                            name="ordering"
                            id="ordering"
                            choices={orderingChoices}
                            onChange={this.state.apiFormFieldChangeHandler}
                            value={this.state.formValues.ordering}
                            required={true}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-12 col-md-6 col-lg-8 col-xl-8">
                <ApiFormResultTableWithPagination
                    page_size_choices={[50, 100, 200]}
                    page={this.state.formValues.page}
                    page_size={this.state.formValues.page_size}
                    data={products}
                    onChange={this.state.apiFormFieldChangeHandler}
                    columns={columns}
                    ordering={this.state.formValues.ordering}
                    label={<FormattedMessage id="results" defaultMessage="Results"/>}
                />
              </div>
              <div className="col-12 col-md-6 col-lg-4 col-xl-4">
                <div className="card">
                  <div className="card-header">
                    <i className="glyphicons glyphicons-search">&nbsp;</i>
                    <FormattedMessage id="filters" defaultMessage="Filters" />
                  </div>
                  <div className="card-block">
                    {processedFormLayout.map(fieldset => (
                        <fieldset key={fieldset.id || fieldset.label}>
                          <legend>{fieldset.label}</legend>
                          {fieldset.filters.map(filter => (
                              <div key={filter.name} className="pb-2">
                                {filter.component}
                              </div>
                          ))}
                        </fieldset>
                    ))}
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
  const {ApiResourceObject, fetchAuth} = apiResourceStateToPropsUtils(state);
  const {preferredCountry, preferredCurrency, preferredNumberFormat, formatCurrency} = backendStateToPropsUtils(state);

  return {
    ApiResourceObject,
    fetchAuth,
    preferredCountry,
    preferredCurrency,
    preferredNumberFormat,
    formatCurrency,
    currencies: filterApiResourceObjectsByType(state.apiResourceObjects, 'currencies'),
    stores: filterApiResourceObjectsByType(state.apiResourceObjects, 'stores'),
    storeTypes: filterApiResourceObjectsByType(state.apiResourceObjects, 'store_types'),
    countries: filterApiResourceObjectsByType(state.apiResourceObjects, 'countries'),
    isExtraSmall: state.breakpoint.isExtraSmall
  }
}

export default injectIntl(connect(mapStateToProps)(CategoryDetailBrowse));
