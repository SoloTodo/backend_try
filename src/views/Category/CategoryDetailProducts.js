import React, {Component} from 'react'
import {addApiResourceStateToPropsUtils} from "../../ApiResource";
import connect from "react-redux/es/connect/connect";
import {settings} from "../../settings";
import Loading from "../../components/Loading";
import ApiForm from "../../api_forms/ApiForm";
import ApiFormChoiceField from "../../api_forms/ApiFormChoiceField";
import {FormattedMessage} from "react-intl";
import ApiFormResultTableWithPagination from "../../api_forms/ApiFormResultTableWithPagination";
import {NavLink, Redirect} from "react-router-dom";
import ApiFormTextField from "../../api_forms/ApiFormTextField";
import "./CategoryDetailProducts.css"
import ApiFormDiscreteRangeField from "../../api_forms/ApiFormDiscreteRangeField";
import ApiFormContinuousRangeField from "../../api_forms/ApiFormContinouousRangeField";
import { toast } from 'react-toastify';

class CategoryDetailProducts extends Component {
  constructor(props) {
    super(props);

    this.state = {
      formLayout: undefined,
      apiFormFieldChangeHandler: undefined,
      formValues: {},
      productsPage: undefined,
      resultsAggs: {}

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
        resultsAggs: json.payload.aggs
      })
    } else {
      // Keep the old resultsAggs to prevent the form fields from resetting so much
      this.setState({
        productsPage: null
      })
    }
  };

  componentDidMount() {
    const countryUrls = this.props.stores.map(store => this.props.ApiResourceObject(store).country.url);
    const preferredCountryUrl = this.props.preferredCountry.url;

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
        })
  }

  render() {
    const formLayout = this.state.formLayout;

    if (typeof(formLayout) === 'undefined') {
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

    const apiFormFields = ['page', 'page_size', 'search'];
    const processedFormLayout = [{
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
    }];

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
          if (filterAggs) {
            filterChoices = filterAggs.map(choice => ({
              ...choice,
              name: `${filterChoiceIdToNameDict[choice.id]} (${choice.doc_count})`,
            }));
          } else {
            filterChoices = filter.choices
          }

          filterComponent = <ApiFormChoiceField
              name={filter.name}
              choices={filterChoices}
              placeholder={filter.label}
              searchable={true}
              onChange={this.state.apiFormFieldChangeHandler}
              value={this.state.formValues[filter.name]}
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
                name: `${filterChoiceIdToNameDict[choice.id]} (${aggSum})`
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
                name: `${filterChoiceIdToNameDict[choice.id]} (${aggSum})`
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
        label: <FormattedMessage id="name" defaultMessage='Name' />,
        ordering: 'name',
        renderer: result => <NavLink to={'/products/' + result.id}>{result.name}</NavLink>
      },
    ];

    return (
        <div className="animated fadeIn">
          <ApiForm
              endpoints={[`categories/${this.props.apiResourceObject.id}/products/`]}
              fields={apiFormFields}
              onResultsChange={this.setProductsPage}
              onFormValueChange={this.handleFormValueChange}
              setFieldChangeHandler={this.setApiFormFieldChangeHandler}>
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
                        <fieldset key={fieldset.label}>
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

  }
}

export default connect(
    addApiResourceStateToPropsUtils(mapStateToProps))(CategoryDetailProducts);