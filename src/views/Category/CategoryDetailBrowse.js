import React, {Component} from 'react'
import {
  addApiResourceStateToPropsUtils,
  filterApiResourceObjectsByType
} from "../../ApiResource";
import connect from "react-redux/es/connect/connect";
import {settings} from "../../settings";
import Loading from "../../components/Loading";
import ApiForm from "../../api_forms/ApiForm";
import ApiFormChoiceField from "../../api_forms/ApiFormChoiceField";
import {FormattedMessage} from "react-intl";
import ApiFormResultTableWithPagination from "../../api_forms/ApiFormResultTableWithPagination";
import {NavLink, Redirect} from "react-router-dom";
import {injectIntl} from "react-intl";
import ApiFormTextField from "../../api_forms/ApiFormTextField";
import "./CategoryDetailBrowse.css"
import ApiFormDiscreteRangeField from "../../api_forms/ApiFormDiscreteRangeField";
import ApiFormContinuousRangeField from "../../api_forms/ApiFormContinouousRangeField";
import { toast } from 'react-toastify';
import messages from "../../messages";
import ApiFormPriceRangeField from "../../api_forms/ApiFormPriceRangeField";

class CategoryDetailBrowse extends Component {
  constructor(props) {
    super(props);

    this.state = {
      formLayout: undefined,
      apiFormFieldChangeHandler: undefined,
      formValues: {},
      productsPage: undefined,
      resultsAggs: {},
      priceRange: undefined
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
    const countryUrls = this.props.stores.map(store => this.props.ApiResourceObject(store).country.url);
    const preferredCountryUrl = this.props.preferredCountry.url;

    // Obtain layout of the form fields
    this.props.fetchAuth(settings.apiResourceEndpoints.category_specs_form_layouts + '?category=' + this.props.apiResourceObject.id)
        .then(all_form_layouts => {
          const processed_form_layouts = all_form_layouts
              .filter(layout => layout.country === null || countryUrls.includes(layout.country))
              .map(layout => {
                let priority = 0;
                if (layout.country === preferredCountryUrl) {
                  priority = 2
                } else if (layout.country === null) {
                  priority = 1
                }
                return {
                  ...layout,
                  priority
                }
              });

          processed_form_layouts.sort((a, b) => b.priority - a.priority);

          this.setState({
            formLayout: processed_form_layouts[0] || null,
          })
        });

    const endpoint = `categories/${this.props.apiResourceObject.id}/browse/`;

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
        })
  }

  render() {
    const formLayout = this.state.formLayout;

    if (typeof(formLayout) === 'undefined' || typeof(this.state.priceRange) === 'undefined') {
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
              updateResultsOnChange={true}
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
              updateResultsOnChange={true}
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
                let valueInChoices = Boolean(filterChoices.filter(choice => choice.id === selectedValue.id).length);
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
              updateResultsOnChange={true}
          />
        } else if (filter.type === 'lte') {
          let filterChoices = undefined;

          if (filterAggs) {
            let aggSum = 0;

            filterChoices = filterAggs.map(choice => {
              aggSum += choice.doc_count;

              return {
                ...choice,
                name: `${filterChoiceIdToNameDict[choice.id]}`
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
              updateResultsOnChange={true}
          />
        } else if (filter.type === 'gte') {
          let filterChoices = undefined;

          if (filterAggs) {
            let aggSum = filterAggs.reduce((acum, choice) => acum + choice.doc_count, 0);

            filterChoices = filterAggs.map(choice => {
              let result = {
                ...choice,
                name: `${filterChoiceIdToNameDict[choice.id]}`
              };

              aggSum -= choice.doc_count;

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
              updateResultsOnChange={true}
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
                updateResultsOnChange={true}
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
                updateResultsOnChange={true}
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

    for (const layoutColumn of formLayout.columns) {
      columns.push({
        label: layoutColumn.label,
        renderer: result => result.productEntries[0].product.specs[layoutColumn.field] || <em>N/A</em>
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

    return (
        <div className="animated fadeIn">
          <ApiForm
              endpoints={[`categories/${this.props.apiResourceObject.id}/browse/`]}
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
                            searchable={!this.props.breakpoint.isExtraSmall}
                            onChange={this.state.apiFormFieldChangeHandler}
                            value={this.state.formValues.stores}
                            placeholder={messages.all_feminine}
                            updateResultsOnChange={true}
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
                            updateResultsOnChange={true}
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
                            updateResultsOnChange={true}
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
                            updateResultsOnChange={true}
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
  return {
    breakpoint: state.breakpoint,
    countries: filterApiResourceObjectsByType(state.apiResourceObjects, 'countries'),
    storeTypes: filterApiResourceObjectsByType(state.apiResourceObjects, 'store_types'),
    currencies: filterApiResourceObjectsByType(state.apiResourceObjects, 'currencies'),
  }
}

export default injectIntl(connect(
    addApiResourceStateToPropsUtils(mapStateToProps))(CategoryDetailBrowse));