import React, {Component} from 'react';
import {NavLink} from "react-router-dom";
import {connect} from "react-redux";
import {FormattedMessage} from "react-intl";
import {
  createOrderingOptionChoices,
  ApiForm,
  ApiFormChoiceField,
  ApiFormDateRangeField,
  ApiFormTextField,
  ApiFormSubmitButton,
  ApiFormResultTableWithPagination
} from "../../react-utils/api_forms";
import {
  formatDateStr,
} from "../../react-utils/utils";
import {
  filterApiResourceObjectsByType,
} from "../../react-utils/ApiResource";

class ProductList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      formValues: {},
      apiFormFieldChangeHandler: undefined,
      products: undefined
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

  setProducts = json => {
    this.setState({
      products: json ? json.payload : null
    })
  };

  render() {
    const stores = this.props.stores;
    const categories = this.props.categories;

    const availabilityCountriesTooltipContent = <p>
      <FormattedMessage id="product_availability_countries_tooltip" defaultMessage='Filter the products that are available for purchase in the selected countries' />
    </p>;

    const availabilityStoresTooltipContent = <p>
      <FormattedMessage id="product_availability_stores_tooltip" defaultMessage='Filter the products that are available for purchase in the selected stores' />
    </p>;

    const creationDateTooltipContent = <p>
      <FormattedMessage id="creation_date_tooltip" defaultMessage='Filter the products that were created between the given dates' />
    </p>;

    const lastUpdatedTooltipContent = <p>
      <FormattedMessage id="last_updated_tooltip" defaultMessage='Filter the products that were last updated between the given dates' />
    </p>;

    const columns = [
      {
        label: <FormattedMessage id="name" defaultMessage='Name' />,
        ordering: 'name',
        renderer: result => <NavLink to={'/products/' + result.id}>{result.name}</NavLink>
      },
      {
        label: <FormattedMessage id="category" defaultMessage='Category' />,
        ordering: 'category',
        renderer: result => result.category.name
      },
      {
        label: <FormattedMessage id="creation_date" defaultMessage='Creation date' />,
        ordering: 'creation_date',
        renderer: result => formatDateStr(result.creationDate),
        cssClasses: 'hidden-xs-down'
      },
      {
        label: <FormattedMessage id="last_updated" defaultMessage='Last updated' />,
        ordering: 'last_updated',
        renderer: result => formatDateStr(result.lastUpdated),
        cssClasses: 'hidden-xs-down'
      }
    ];

    return (
        <div className="animated fadeIn">
          <ApiForm
              endpoints={["products/"]}
              fields={['categories', 'availabilityCountries', 'availabilityStores', 'search', 'creationDate', 'lastUpdated', 'page', 'page_size', 'ordering']}
              onResultsChange={this.setProducts}
              onFormValueChange={this.handleFormValueChange}
              setFieldChangeHandler={this.setApiFormFieldChangeHandler}>
            <ApiFormChoiceField
                name="ordering"
                choices={createOrderingOptionChoices(['id', 'name', 'category', 'creation_date', 'last_updated'])}
                hidden={true}
                initial="name"
                value={this.state.formValues.ordering}
                onChange={this.state.apiFormFieldChangeHandler}
            />
            <div className="row">
              <div className="col-12">
                <div className="card">
                  <div className="card-header">
                    <i className="glyphicons glyphicons-search">&nbsp;</i>
                    <FormattedMessage id="filters" defaultMessage={`Filters`} />
                  </div>
                  <div className="card-block">
                    <div className="row api-form-filters">
                      <div className="col-12 col-sm-6 col-md-6 col-lg-6 col-xl-6">
                        <label>
                          <FormattedMessage id="categories" defaultMessage={`Categories`} />
                        </label>
                        <ApiFormChoiceField
                            name="categories"
                            choices={categories}
                            placeholder={<FormattedMessage id="all_feminine" defaultMessage={`All`} />}
                            searchable={!this.props.breakpoint.isExtraSmall}
                            onChange={this.state.apiFormFieldChangeHandler}
                            value={this.state.formValues.categories}
                        />
                      </div>
                      <div className="col-12 col-sm-6 col-md-6 col-lg-6 col-xl-6">
                        <label>
                          <FormattedMessage id="availability_countries" defaultMessage='Availability countries' />
                        </label>
                        <ApiFormChoiceField
                            name="availabilityCountries"
                            tooltipContent={availabilityCountriesTooltipContent}
                            choices={this.props.countries}
                            placeholder={<FormattedMessage id="do_not_apply" defaultMessage={`Do not apply`} />}
                            searchable={!this.props.breakpoint.isExtraSmall}
                            onChange={this.state.apiFormFieldChangeHandler}
                            value={this.state.formValues.availabilityCountries}
                        />
                      </div>
                      <div className="col-12 col-sm-6 col-md-6 col-lg-6 col-xl-6">
                        <label>
                          <FormattedMessage id="availability_stores" defaultMessage='Availability stores' />
                        </label>
                        <ApiFormChoiceField
                            name="availabilityStores"
                            tooltipContent={availabilityStoresTooltipContent}
                            choices={stores}
                            placeholder={<FormattedMessage id="do_not_apply" defaultMessage={`Do not apply`} />}
                            searchable={!this.props.breakpoint.isExtraSmall}
                            onChange={this.state.apiFormFieldChangeHandler}
                            value={this.state.formValues.availabilityStores}
                        />
                      </div>
                      <div className="col-12 col-sm-6 col-md-6 col-lg-6 col-xl-6">
                        <label>
                          <FormattedMessage id="keyword" defaultMessage='Keywords' />
                        </label>
                        <ApiFormTextField
                            name="search"
                            onChange={this.state.apiFormFieldChangeHandler}
                            value={this.state.formValues.search}
                        />
                      </div>
                      <div className="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6">
                        <label>
                          <FormattedMessage id="creation_date_from_to" defaultMessage='Creation date (from / to)' />
                        </label>
                        <ApiFormDateRangeField
                            name="creationDate"
                            tooltipContent={creationDateTooltipContent}
                            nullable={true}
                            onChange={this.state.apiFormFieldChangeHandler}
                            value={this.state.formValues.creationDate}
                        />
                      </div>
                      <div className="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6">
                        <label>
                          <FormattedMessage id="last_updated_from_to" defaultMessage='Last updated (from / to)' />
                        </label>
                        <ApiFormDateRangeField
                            name="lastUpdated"
                            tooltipContent={lastUpdatedTooltipContent}
                            nullable={true}
                            onChange={this.state.apiFormFieldChangeHandler}
                            value={this.state.formValues.lastUpdated}
                        />
                      </div>
                      <div className="col-12 col-sm-7 col-md-6 col-lg-12 col-xl-12 float-right">
                        <label htmlFor="submit" className="hidden-xs-down hidden-lg-up">&nbsp;</label>
                        <ApiFormSubmitButton
                            label={<FormattedMessage id="search" defaultMessage='Search' />}
                            loadingLabel={<FormattedMessage id="searching" defaultMessage='Searching'/>}
                            onChange={this.state.apiFormFieldChangeHandler}
                            loading={this.state.products === null}
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
                    page_size_choices={[50, 100, 200]}
                    page={this.state.formValues.page}
                    page_size={this.state.formValues.page_size}
                    data={this.state.products}
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
    countries: filterApiResourceObjectsByType(state.apiResourceObjects, 'countries'),
    breakpoint: state.breakpoint
  }
}

export default connect(mapStateToProps)(ProductList);
