import React, {Component} from 'react'
import {
  apiResourceStateToPropsUtils
} from "../../react-utils/ApiResource";
import connect from "react-redux/es/connect/connect";
import {settings} from "../../settings";
import Loading from "../../components/Loading";
import {
  ApiForm,
  ApiFormChoiceField,
  ApiFormResultTableWithPagination,
  ApiFormTextField,
  ApiFormDiscreteRangeField,
  ApiFormContinuousRangeField
} from '../../react-utils/api_forms'
import {FormattedMessage} from "react-intl";
import {NavLink, Redirect} from "react-router-dom";
import "./CategoryDetailProducts.css"
import { toast } from 'react-toastify';
import {backendStateToPropsUtils} from "../../utils";
import {areObjectsEqual} from "../../react-utils/utils";

class CategoryDetailProducts extends Component {
  initialState = {
    formLayout: undefined,
    apiFormFieldChangeHandler: undefined,
    formValues: {},
    productsPage: undefined,
    resultsAggs: {},
    columns: undefined,
  };

  constructor(props) {
    super(props);
    this.state = {...this.initialState}
  }

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

          this.setState({
            formLayout: processed_form_layouts[0] || null,
          })
        });

    // Obtain columns for the results

    const columnEndpoints = `${settings.apiResourceEndpoints.category_columns}?categories=${category.id}&purposes=${settings.categoryProductsPurposeId}`;
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

  render() {
    const formLayout = this.state.formLayout;

    if (typeof(formLayout) === 'undefined' || !this.state.columns) {
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
            debounceTimeout={500}
        />
      }]
    }];

    for (const fieldset of formLayout.fieldsets) {
      const fieldSetFilters = [];
      for (const filter of fieldset.filters) {
        apiFormFields.push(filter.name);

        let originalFilterChoices = undefined;

        if (filter.type === 'exact') {
          originalFilterChoices = filter.choices || [{id: 0, name: 'No'}, {id: 1, name: 'Sí'}]
        } else {
          originalFilterChoices = filter.choices || []
        }

        const filterChoiceIdToNameDict = {};
        for (const choice of (originalFilterChoices || [])) {
          filterChoiceIdToNameDict[choice.id] = choice.name
        }

        let filterAggs = resultsAggs[filter.name];
        let filterComponent = null;

        if (filter.type === 'exact') {
          let filterChoices = undefined;
          const value = this.state.formValues[filter.name];

          let arrayValue = [];
          if (Array.isArray(value)) {
            arrayValue = value
          } else if (value) {
            arrayValue = [value]
          } else {
            arrayValue = null
          }

          if (filterAggs) {
            filterChoices = filterAggs.map(choice => ({
              ...choice,
              name: filterChoiceIdToNameDict[choice.id],
            }));

            if (arrayValue) {
              for (const selectedValue of arrayValue) {
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
            filterChoices = originalFilterChoices
          }

          filterComponent = <ApiFormChoiceField
              name={filter.name}
              choices={filterChoices}
              placeholder={filter.label}
              searchable={true}
              onChange={this.state.apiFormFieldChangeHandler}
              multiple={Boolean(filter.choices)}
          />
        } else if (filter.type === 'lte') {
          let filterChoices = undefined;

          if (filterAggs) {
            let aggSum = 0;

            filterChoices = filterAggs.map(choice => {
              aggSum += choice.doc_count;

              return {
                ...choice,
                name: `${filterChoiceIdToNameDict[choice.id]}`,
                doc_count: aggSum
              };
            });
          } else {
            filterChoices = originalFilterChoices
          }

          filterComponent = <ApiFormChoiceField
              name={filter.name}
              apiField={filter.name + '_1'}
              urlField={filter.name + '_end'}
              choices={filterChoices}
              placeholder={filter.label}
              searchable={true}
              onChange={this.state.apiFormFieldChangeHandler}
          />
        } else if (filter.type === 'gte') {
          let filterChoices = undefined;

          if (filterAggs) {
            let aggSum = filterAggs.reduce((acum, choice) => acum + choice.doc_count, 0);

            filterChoices = filterAggs.map(choice => {
              let result = {
                ...choice,
                name: filterChoiceIdToNameDict[choice.id],
                doc_count: aggSum
              };

              aggSum -= choice.doc_count;

              return result
            });
          } else {
            filterChoices = originalFilterChoices
          }

          filterComponent = <ApiFormChoiceField
              name={filter.name}
              apiField={filter.name + '_0'}
              urlField={filter.name + '_start'}
              choices={filterChoices}
              placeholder={filter.label}
              searchable={true}
              onChange={this.state.apiFormFieldChangeHandler}
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
              filterChoices = originalFilterChoices.map(choice => ({
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
        label: <FormattedMessage id="name" defaultMessage='Name' />,
        ordering: 'name',
        renderer: result => <NavLink to={'/products/' + result.id}>{result.name}</NavLink>
      },
    ];

    for (const layoutColumn of this.state.columns) {
      columns.push({
        label: layoutColumn.label,
        renderer: result => result.specs[layoutColumn.es_field] || <em>N/A</em>
      })
    }

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
                    label={<FormattedMessage id="results" defaultMessage="Results"/>}
                    loading={<Loading />}
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
  const {fetchAuth} = apiResourceStateToPropsUtils(state);
  const {preferredCountry} = backendStateToPropsUtils(state);

  return {
    fetchAuth,
    preferredCountry,
  }
}

export default connect(mapStateToProps)(CategoryDetailProducts);
