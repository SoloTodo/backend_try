import React, {Component} from 'react';
import {NavLink, withRouter} from "react-router-dom";
import {connect} from "react-redux";
import {FormattedMessage} from "react-intl";
import {
  addApiResourceDispatchToPropsUtils,
  addApiResourceStateToPropsUtils, filterApiResourceObjectsByType
} from "../../ApiResource";
import MultiChoiceField from "../../api_forms/MultiChoiceField";
import ApiForm from "../../api_forms/ApiForm";
import ApiResultDisplay from "../../api_forms/ApiResultDisplay";
import {settings} from "../../settings";
import DateRangeField from "../../api_forms/DateRangeField";
import {formatDateStr} from "../../utils";
import TextField from "../../api_forms/TextField";

class ProductList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      products: undefined,
      page: 1,
      pageSize: 50,
      ordering: '-creation_date'
    };
  }

  handleProductsChange = payload => {
    if (payload) {
      this.props.dispatch({
        type: 'addApiResourceObjects',
        apiResourceObjects: payload.results
      });

      this.setState({
        products: {
          urls: payload.results.map(product => product.url),
          count: payload.count
        }
      })
    } else {
      this.setState({
        products: undefined
      })
    }
  };

  handlePageChange = page => {
    this.setState({
      page
    })
  };

  handleOrderingChange = ordering => {
    this.setState({
      ordering
    })
  };

  render() {
    const stores = this.props.stores.filter(store => store.permissions.includes('backend_view_store'));
    const categories = this.props.categories.filter(store => store.permissions.includes('backend_view_category'));

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
        label: <FormattedMessage id="id" defaultMessage='ID' />,
        field: 'id',
      },
      {
        label: <FormattedMessage id="name" defaultMessage='Name' />,
        field: 'name',
        renderer: result => <NavLink to={'/products/' + result.id}>{result.name}</NavLink>
      },
      {
        label: <FormattedMessage id="category" defaultMessage='Category' />,
        field: 'category',
        renderer: result => result.category.name
      },
      {
        label: <FormattedMessage id="creation_date" defaultMessage='Creation date' />,
        field: 'creation_date',
        renderer: result => formatDateStr(result.creationDate)
      },
      {
        label: <FormattedMessage id="last_updated" defaultMessage='Last updated' />,
        field: 'last_updated',
        renderer: result => formatDateStr(result.lastUpdated)
      }
    ];

    return (
        <div className="animated fadeIn">
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <i className="glyphicons glyphicons-search">&nbsp;</i> <FormattedMessage id="filters" defaultMessage={`Filters`} />
                </div>
                <div className="card-block">
                  <ApiForm
                      endpoint={settings.apiResourceEndpoints.products}
                      onResultsChange={this.handleProductsChange}
                      fetchAuth={this.props.fetchAuth}
                      page={this.state.page}
                      pageSize={this.state.pageSize}
                      ordering={this.state.ordering}
                      onPageChange={this.handlePageChange}
                  >
                    <MultiChoiceField
                        name="categories"
                        label={<FormattedMessage id="categories" defaultMessage={`Categories`} />}
                        classNames="col-12 col-sm-6 col-md-6 col-lg-6 col-xl-6"
                        choices={categories}
                        placeholder={<FormattedMessage id="all_feminine" defaultMessage={`All`} />}
                        searchable={!this.props.breakpoint.isExtraSmall}
                    />
                    <MultiChoiceField
                        name="availabilityCountries"
                        label={<FormattedMessage id="availability_countries" defaultMessage='Availability countries' />}
                        classNames="col-12 col-sm-6 col-md-6 col-lg-6 col-xl-6"
                        tooltipContent={availabilityCountriesTooltipContent}
                        choices={this.props.countries}
                        placeholder={<FormattedMessage id="do_not_apply" defaultMessage={`Do not apply`} />}
                        searchable={!this.props.breakpoint.isExtraSmall}
                    />
                    <MultiChoiceField
                        name="availabilityStores"
                        label={<FormattedMessage id="availability_stores" defaultMessage='Availability stores' />}
                        classNames="col-12 col-sm-6 col-md-6 col-lg-6 col-xl-6"
                        tooltipContent={availabilityStoresTooltipContent}
                        choices={stores}
                        placeholder={<FormattedMessage id="do_not_apply" defaultMessage={`Do not apply`} />}
                        searchable={!this.props.breakpoint.isExtraSmall}
                    />
                    <TextField
                        name="search"
                        label={<FormattedMessage id="keyword" defaultMessage='Keywords' />}
                        classNames="col-12 col-sm-6 col-md-6 col-lg-6 col-xl-6"
                    />
                    <DateRangeField
                        name="creationDate"
                        label={<FormattedMessage id="creation_date_from_to" defaultMessage='Creation date (from / to)' />}
                        classNames="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6"
                        tooltipContent={creationDateTooltipContent}
                        nullable={true}
                    />
                    <DateRangeField
                        name="lastUpdated"
                        label={<FormattedMessage id="last_updated_from_to" defaultMessage='Last updated (from / to)' />}
                        classNames="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6"
                        tooltipContent={lastUpdatedTooltipContent}
                        nullable={true}
                    />
                  </ApiForm>
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <i className="glyphicons glyphicons-list">&nbsp;</i> <FormattedMessage id="entities" defaultMessage={`Entities`} />
                </div>
                <div className="card-block" id="results-container">
                  <ApiResultDisplay
                      results={this.state.products}
                      page={this.state.page}
                      pageSize={this.state.pageSize}
                      ordering={this.state.ordering}
                      onPageChange={this.handlePageChange}
                      onOrderingChange={this.handleOrderingChange}
                      columns={columns}
                  />
                </div>
              </div>
            </div>
          </div>
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

export default withRouter(connect(
    addApiResourceStateToPropsUtils(mapStateToProps),
    addApiResourceDispatchToPropsUtils())(ProductList));
