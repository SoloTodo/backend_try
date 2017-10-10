import React, {Component} from 'react'
import {addApiResourceStateToPropsUtils} from "../../ApiResource";
import connect from "react-redux/es/connect/connect";
import {settings} from "../../settings";
import Loading from "../../components/Loading";
import ApiForm from "../../api_forms/ApiForm";
import ApiFormChoiceField from "../../api_forms/ApiFormChoiceField";
import ApiFormRangeField from "../../api_forms/ApiFormRangeField";
import {FormattedMessage} from "react-intl";
import ApiFormResultTableWithPagination from "../../api_forms/ApiFormResultTableWithPagination";
import {NavLink} from "react-router-dom";
import ApiFormSubmitButton from "../../api_forms/ApiFormSubmitButton";

class CategoryDetailProducts extends Component {
  constructor(props) {
    super(props);

    this.state = {
      formLayouts: undefined,
      formLayout: undefined,
      apiFormFieldChangeHandler: undefined,
      formValues: {},
      productsPage: undefined

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
    this.setState({
      productsPage: json ? json.payload : null
    })
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
            formLayouts: processed_form_layouts,
            formLayout: processed_form_layouts[0],
          })
        })
  }

  render() {
    const formLayout = this.state.formLayout;
    let aggs = null;
    let products = null;

    if (this.state.productsPage) {
      aggs = this.state.productsPage.aggs;
      products = this.state.productsPage
    }

    if (!formLayout) {
      return <Loading />
    }

    const apiFormFields = ['page', 'page_size'];
    const processedFormLayout = [];

    for (const fieldset of formLayout.fieldsets) {
      const fieldSetFilters = [];
      for (const filter of fieldset.filters) {
        apiFormFields.push(filter.name);
        let filterChoices = [];
        if (aggs) {
          filterChoices = aggs[filter.name].map(agg => ({
            ...agg,
            name: `${agg.label} (${agg.doc_count})`
          }))
        }

        let filterComponent = null;
        if (filter.type === 'exact') {
          filterComponent = <ApiFormChoiceField
              name={filter.name}
              choices={filterChoices}
              placeholder={filter.label}
              searchable={true}
              onChange={this.state.apiFormFieldChangeHandler}
              value={this.state.formValues[filter.name]}
              multiple={true}
          />
        } else if (['gte', 'lte'].includes(filter.type)) {
          filterComponent = <ApiFormChoiceField
              name={filter.name}
              choices={filterChoices}
              placeholder={filter.label}
              searchable={true}
              onChange={this.state.apiFormFieldChangeHandler}
              value={this.state.formValues[filter.name]}
          />
        } else if (filter.type === 'range') {
          filterComponent = <ApiFormRangeField
              name={filter.name}
              label={filter.label}
              onChange={this.state.apiFormFieldChangeHandler}
              choices={filterChoices}
              value={this.state.formValues[filter.name]}
          />
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
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <i className="glyphicons glyphicons-search">&nbsp;</i>
                  <FormattedMessage id="settings" defaultMessage="Settings" />
                </div>
                <div className="card-block">
                  Insert settings here
                </div>
              </div>
            </div>
          </div>
          <ApiForm
              endpoints={[`categories/${this.props.apiResourceObject.id}/products/`]}
              fields={apiFormFields}
              onResultsChange={this.setProductsPage}
              onFormValueChange={this.handleFormValueChange}
              setFieldChangeHandler={this.setApiFormFieldChangeHandler}
              updateOnChange={true}>
            <div className="row">
              <div className="col-xl-4">
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
                    <ApiFormSubmitButton
                        label={<FormattedMessage id="search" defaultMessage="Search" />}
                        loadingLabel={<FormattedMessage id="searching" defaultMessage="Searching" />}
                        onChange={this.state.apiFormFieldChangeHandler}
                        loading={this.state.productsPage === null}
                    />
                  </div>
                </div>
              </div>
              <div className="col-xl-8">
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