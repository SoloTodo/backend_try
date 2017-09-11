import React, {Component} from 'react';
import {withRouter} from "react-router-dom";
import {connect} from "react-redux";
import ReactPaginate from 'react-paginate';
import {FormattedMessage} from "react-intl";
import {
  addApiResourceDispatchToPropsUtils,
  addApiResourceStateToPropsUtils, filterApiResourceObjectsByType
} from "../../ApiResource";
import Loading from "../../components/Loading";
import messages from "../../messages";
import MultiChoiceField from "../../api_forms/MultiChoiceField";
import ApiForm from "../../api_forms/ApiForm";
import {settings} from "../../settings";

const pageSize = 50;

class ProductList extends Component {
  constructor(props) {
    super(props);

    this.apiResourceObjectsWithPermission = {
      countries: this.props.countries,
      stores: this.props.stores.filter(store => store.permissions.includes('backend_view_store')),
      categories: this.props.categories.filter(store => store.permissions.includes('backend_view_category')),
    };

    this.state = {
      products: undefined
    };
  }

  handleProductsChange = products => {
    this.props.dispatch({
      type: 'addApiResourceObjects',
      apiResourceObjects: products
    });

    this.setState({
      products: {
        urls: products.map(entity => entity.url),
      }
    })
  };

  render() {
    let cardContent = undefined;

    if (!this.state.products) {
      cardContent = <Loading />;
    } else {
      let pageRangeDisplayed = 3;
      let marginPagesDisplayed= 2;
      if (this.props.breakpoint.isExtraSmall) {
        pageRangeDisplayed = 1;
        marginPagesDisplayed = 1;
      }

      const productsDict = this.props.products.reduce((acum, product) => ({...acum, [product.url]: product}), {});
      const products = this.state.products.urls.map(productUrl => this.props.ApiResourceObject(productsDict[productUrl]));

      const pageCount = Math.ceil(this.state.products.count / pageSize);
      cardContent = <div>
        <div className="row">
          <div className="col-12">
            <div className="float-right">
              <ReactPaginate
                  pageCount={pageCount}
                  pageRangeDisplayed={pageRangeDisplayed}
                  marginPagesDisplayed={marginPagesDisplayed}
                  containerClassName="pagination"
                  pageClassName="page-item"
                  pageLinkClassName="page-link"
                  activeClassName="active"
                  previousClassName="page-item"
                  nextClassName="page-item"
                  previousLinkClassName="page-link"
                  nextLinkClassName="page-link"
                  disabledClassName="disabled"
                  hrefBuilder={page => `?page=${page}`}
                  onPageChange={this.onPageChange}
                  forcePage={1}
                  previousLabel={messages.previous}
                  nextLabel={messages.next}
              />
            </div>
          </div>
        </div>
        <table className="table table-striped">
          <thead>
          <tr>
            <th><FormattedMessage id="id" defaultMessage='ID' /></th>
            <th><FormattedMessage id="name" defaultMessage='Name' /></th>
            <th><FormattedMessage id="category" defaultMessage='Category' /></th>
            <th><FormattedMessage id="creation_date" defaultMessage='Creation date' /></th>
            <th><FormattedMessage id="last_updated" defaultMessage='Last updated' /></th>
          </tr>
          </thead>
          <tbody>
          {!products.length && (
              <tr><td className="center-aligned" colSpan="20">
                <em><FormattedMessage id="no_products_found" defaultMessage='No products found' /></em>
              </td></tr>
          )}
          {products.map(product =>
              <tr key={product.url}>
                <td>{product.id}</td>
                <td>{product.name}</td>
                <td>{product.category.name}</td>
                <td>{product.creationDate}</td>
                <td>{product.lastUpdated}</td>
              </tr>
          )}
          </tbody>
        </table>
      </div>
    }

    const categoriesTooltipContent = <p>
      <FormattedMessage id="product_availability_countries_tooltip" defaultMessage='Filter the products that are available for purchase in the selected countries' />
    </p>;

    return (
        <div className="animated fadeIn">
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <i className="glyphicons glyphicons-search">&nbsp;</i> <FormattedMessage id="filters" defaultMessage={`Filters`} />
                </div>
                <div className="card-block">
                  <div className="row entity-form-controls">
                    <ApiForm
                        endpoint={settings.apiResourceEndpoints.products}
                        onResultsChange={this.handleProductsChange}
                        fetchAuth={this.props.fetchAuth}
                    >
                      <MultiChoiceField
                          classNames="col-12 col-sm-6 col-md-6 col-lg-6 col-xl-6"
                          tooltipContent={categoriesTooltipContent}
                          name="categories"
                          choices={this.apiResourceObjectsWithPermission.categories}
                          label={<FormattedMessage id="categories" defaultMessage={`Categories`} />}
                          placeholder={<FormattedMessage id="all_feminine" defaultMessage={`All`} />}
                          searchable={!this.props.breakpoint.isExtraSmall}
                      />
                    </ApiForm>
                  </div>
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
                  {cardContent}
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
    products: filterApiResourceObjectsByType(state.apiResourceObjects, 'products'),
    breakpoint: state.breakpoint
  }
}

export default withRouter(connect(
    addApiResourceStateToPropsUtils(mapStateToProps),
    addApiResourceDispatchToPropsUtils())(ProductList));
