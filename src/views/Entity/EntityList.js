import React, {Component} from 'react';
import {connect} from "react-redux";
import {FormattedMessage} from "react-intl";
import ReactPaginate from 'react-paginate';
import Select from 'react-select';
import queryString from 'query-string';
import {
  addApiResourceDispatchToPropsUtils,
  addApiResourceStateToPropsUtils
} from "../../ApiResource";
import {settings} from "../../settings";
import Loading from "../../components/Loading";
import './EntityList.css'
import {NavLink, withRouter} from "react-router-dom";
import {formatCurrency} from "../../utils";
import {UncontrolledTooltip} from "reactstrap";
import messages from "../../messages";

const pageSize = 50;

const nullBooleanOptions = [
  {
    value: 'any',
    label: <FormattedMessage id="all" defaultMessage={`All`} />
  },
  {
    value: 'true',
    label: messages.yes
  },
  {
    value: 'false',
    label: messages.no
  }
];

class EntityList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      formData: this.parseUrlArgs(window.location),
      entities: undefined,
      size: this.getViewportSize()
    };

    this.props.history.listen(this.onHistoryChange);
  }

  parseUrlArgs = (location) => {
    const parameters = queryString.parse(location.search);

    const result = [];

    for (const resource of ['stores', 'product_types']) {
      let resourceObjects = parameters[resource];
      if (!Array.isArray(resourceObjects)) {
        resourceObjects = [resourceObjects]
      }
      resourceObjects = this.props[resource]
          .filter(resourceObject => resourceObjects.includes(resourceObject.id.toString()))
          .map(this.createOption);
      result[resource] = resourceObjects;
    }

    for (const field of ['is_available', 'is_active', 'is_visible', 'is_associated']) {
      let fieldValue = nullBooleanOptions.filter(option => option.value === parameters[field])[0];
      if (!fieldValue) {
        fieldValue = nullBooleanOptions[0]
      }
      result[field] = fieldValue;
    }

    result['search'] = parameters['search'] || '';
    result['page'] = parameters['page'] || 1;

    return result;
  };

  onHistoryChange = (location, action) => {
    if (action !== 'POP') {
      return
    }

    this.setState({
      formData: this.parseUrlArgs(location)
    }, this.updateSearchResults)
  };

  componentDidMount() {
    document.body.classList.add('sidebar-hidden');
    this.updateSearchResults();
    window.onresize = this.onResize
  }

  onResize = () => {
    const size = this.getViewportSize();

    if (size !== this.state.size) {
      this.setState({
        size
      })
    }
  };

  getViewportSize = () => {
    const viewportWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    return viewportWidth < 576 ? 'xs' : 'normal';
  };

  handleValueChange = (name, value, callback=() => {}) => {
    this.setState({
      formData: {
        ...this.state.formData,
        [name]: value
      }
    }, callback)
  };

  onPageChange = (selectedObject) => {
    const page = selectedObject.selected + 1;
    this.handleValueChange('page', page, () => this.updateSearchResults(true));
  };

  handleFormSubmit = (event) => {
    event && event.preventDefault();
    this.setState({
      formData: {
        ...this.state.formData,
        page: 1
      }
    }, () => this.updateSearchResults(true));
  };

  filterPending = (event) => {
    event.preventDefault();

    const optionsDict = nullBooleanOptions.reduce((acum, option) => {
      return {
        ...acum,
        [option.value]: option
      }
    }, {});

    console.log(optionsDict);

    this.setState({
      formData: {
        ...this.state.formData,
        is_available: optionsDict[true],
        is_visible: optionsDict[true],
        is_associated: optionsDict[false],
        page: 1
      }
    }, () => this.updateSearchResults(true));
  };

  updateSearchResults = (pushLocation=false) => {
    this.setState({
      entities: undefined
    });

    let search = '?';

    const formData = this.state.formData;

    for (const resource of ['stores', 'product_types']) {
      for (let resourceObject of formData[resource]) {
        search += `${resource}=${resourceObject.value}&`
      }
    }

    for (const field of ['is_available', 'is_active', 'is_visible', 'is_associated']) {
      search += `${field}=${formData[field].value}&`
    }

    search += `search=${formData.search}&page=${formData.page}`;

    if (pushLocation) {
      const newRoute = this.props.history.location.pathname + search;
      this.props.history.push(newRoute)
    }

    const endpoint = settings.resourceEndpoints.entities + search + `&page_size=${pageSize}`;

    this.props.fetchAuth(endpoint).then(json => {
      this.setState({
        entities: json
      })
    })
  };

  createOptions = (options) => {
    return options.map(this.createOption)
  };

  createOption = (option) => {
    return {
      value: option.id,
      label: option.name
    }
  };


  render() {
    const storeOptions = this.createOptions(this.props.stores);
    const productTypeOptions = this.createOptions(this.props.product_types);

    const preferredCurrency = this.props.ApiResource(this.props.preferredCurrency);

    const labels = {
      normalPrice: <FormattedMessage id="normal_price_short" defaultMessage={`Normal`} />,
      offerPrice: <FormattedMessage id="offer_price_short" defaultMessage={`Offer`} />,
      original: <FormattedMessage id="original_label_short" defaultMessage={`orig.`} />
    };

    const localFormatCurrency = (value, valueCurrency, conversionCurrency) => {
      return formatCurrency(value, valueCurrency, conversionCurrency,
          this.props.preferredNumberFormat.thousands_separator,
          this.props.preferredNumberFormat.decimal_separator)
    };

    let cardContent = undefined;

    if (typeof this.state.entities === 'undefined') {
      cardContent = <Loading />;
    } else if (this.state.entities.detail) {
      cardContent = <span><strong>Error:</strong> {this.state.entities.detail}</span>
    } else {
      let pageRangeDisplayed = 3;
      let marginPagesDisplayed= 2;
      if (this.state.size === 'xs') {
        pageRangeDisplayed = 1;
        marginPagesDisplayed = 1;
      }
      const entities = this.state.entities.results.map(entity => this.props.ApiResource(entity));
      const convertCurrencies = entities.some(entity => entity.currencyUrl !== preferredCurrency.url);
      const displayCellPlanColumn = entities.some(entity => entity.cellPlanName !== null);
      const pageCount = Math.ceil(this.state.entities.count / pageSize);
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
                  forcePage={this.state.formData.page - 1}
                  previousLabel={messages.previous}
                  nextLabel={messages.next}
              />
            </div>
          </div>
        </div>
        <table className="table table-striped">
          <thead>
          <tr>
            <th><FormattedMessage id="name" defaultMessage={`Name`} /></th>
            {displayCellPlanColumn && <th className="hidden-xs-down"><FormattedMessage id="cell_plan_name" defaultMessage={`Cell plan`} /></th>}
            <th><FormattedMessage id="store" defaultMessage={`Store`} /></th>
            <th className="hidden-xs-down"><FormattedMessage id="sku" defaultMessage={`SKU`} /></th>
            <th className="hidden-xs-down"><FormattedMessage id="product_type" defaultMessage={`Product type`} /></th>
            <th className="hidden-sm-down"><FormattedMessage id="product" defaultMessage={`Product`} /></th>
            <th className="hidden-md-down center-aligned"><FormattedMessage id="is_available_short_question" defaultMessage={`Avail?`} /></th>
            <th className="hidden-md-down center-aligned"><FormattedMessage id="is_active_short_question" defaultMessage={`Act?`} /></th>
            <th className="hidden-md-down center-aligned"><FormattedMessage id="is_visible_short_question" defaultMessage={`Vis?`} /></th>

            <th className="hidden-lg-down right-aligned">
              {labels.normalPrice}
              {convertCurrencies &&
              <span>&nbsp;({labels.original})</span>
              }
            </th>
            <th className="hidden-lg-down right-aligned">
              {labels.offerPrice}
              {convertCurrencies &&
              <span>&nbsp;({labels.original})</span>
              }
            </th>
            <th className="show-xxl-up center-aligned"><FormattedMessage id="currency_label" defaultMessage={`Currency`} /></th>
            {convertCurrencies &&
            <th className="show-xxl-up right-aligned">
              {labels.normalPrice}
              {convertCurrencies &&
              <span>&nbsp;({preferredCurrency.isoCode})</span>
              }
            </th>}
            {convertCurrencies &&
            <th className="show-xxl-up right-aligned">
              {labels.offerPrice}
              {convertCurrencies &&
              <span>&nbsp;({preferredCurrency.isoCode})</span>
              }
            </th>
            }
          </tr>
          </thead>
          <tbody>
          {!entities.length && (
              <tr><td className="center-aligned" colSpan="20">
                <em><FormattedMessage id="no_entities_found" defaultMessage={`No entities found`} /></em>
              </td></tr>
          )}
          {entities.map(entity =>
              <tr key={entity.url}>
                <td className="entity-name-cell">
                  <NavLink to={'/entities/' + entity.id}>{entity.name}</NavLink>
                </td>
                {displayCellPlanColumn && <td className="hidden-xs-down">{entity.cellPlanName || <em>N/A</em>}</td>}
                <td><a href={entity.externalUrl} target="_blank">{entity.store.name}</a></td>
                <td className="hidden-xs-down">{entity.sku || <em>N/A</em>}</td>
                <td className="hidden-xs-down">{entity.productType.name}</td>
                <td className="hidden-sm-down">
                  {entity.product ?
                      <span>
                                      <NavLink to={'/products/' + entity.product.id}>{entity.product.name}</NavLink>
                        {entity.cellPlan &&
                        <span>
                                            &nbsp;/&nbsp;<NavLink to={'/products/' + entity.cellPlan.id}>{entity.cellPlan.name}</NavLink>
                                          </span>
                        }
                                    </span>
                      : <em>N/A</em>
                  }
                </td>
                <td className="hidden-md-down center-aligned"><i className={entity.activeRegistry && entity.activeRegistry.stock !== 0 ?
                    'glyphicons glyphicons-check' :
                    'glyphicons glyphicons-unchecked' }/>
                </td>
                <td className="hidden-md-down center-aligned"><i className={entity.activeRegistry ?
                    'glyphicons glyphicons-check' :
                    'glyphicons glyphicons-unchecked'}/>
                </td>
                <td className="hidden-md-down center-aligned"><i className={entity.isVisible ?
                    'glyphicons glyphicons-check' :
                    'glyphicons glyphicons-unchecked'}/>
                </td>
                <td className="hidden-lg-down right-aligned nowrap">
                  {entity.activeRegistry ?
                      <span>{localFormatCurrency(entity.activeRegistry.normal_price, entity.currency)}</span> :
                      <em>N/A</em>
                  }
                </td>
                <td className="hidden-lg-down right-aligned nowrap">
                  {entity.activeRegistry ?
                      <span>{localFormatCurrency(entity.activeRegistry.offer_price, entity.currency)}</span> :
                      <em>N/A</em>
                  }
                </td>
                <td className="show-xxl-up center-aligned">
                  {entity.currency.isoCode}
                </td>
                {convertCurrencies &&
                <td className="show-xxl-up right-aligned nowrap">
                  {entity.activeRegistry ?
                      <span>{localFormatCurrency(entity.activeRegistry.normal_price, entity.currency, preferredCurrency)}</span> :
                      <em>N/A</em>
                  }
                </td>}
                {convertCurrencies &&
                <td className="show-xxl-up right-aligned nowrap">
                  {entity.activeRegistry ?
                      <span>{localFormatCurrency(entity.activeRegistry.offer_price, entity.currency, preferredCurrency)}</span> :
                      <em>N/A</em>
                  }
                </td>
                }
              </tr>
          )}
          </tbody>
        </table>
      </div>
    }

    return (
        <div className="animated fadeIn">
          <UncontrolledTooltip placement="top" target="is_available_label">
            <dl>
              <dt className="left-aligned">{messages.yes}</dt>
              <dd className="left-aligned">
                <FormattedMessage id="entity_is_available_label_yes" defaultMessage='The entity is available for purchase' />
              </dd>
              <dt className="left-aligned">{messages.no}</dt>
              <dd className="left-aligned">
                <FormattedMessage id="entity_is_available_label_no" defaultMessage='The entity is not available for purchase, whether because it is unlisted ("inactive") or "out of stock"' />
              </dd>
            </dl>
          </UncontrolledTooltip>
          <UncontrolledTooltip placement="top" target="is_active_label">
            <dl>
              <dt className="left-aligned">{messages.yes}</dt>
              <dd className="left-aligned">
                <FormattedMessage id="entity_is_active_label_yes" defaultMessage='The entity is listed in the store website. It may be available for purchase or not' />
              </dd>
              <dt className="left-aligned">{messages.no}</dt>
              <dd className="left-aligned">
                <FormattedMessage id="entity_is_active_label_no" defaultMessage='The entity is no longer listed in the store website. It is unavailable for purchase' />
              </dd>
            </dl>
          </UncontrolledTooltip>
          <UncontrolledTooltip placement="top" target="is_visible_label">
            <dl>
              <dt className="left-aligned">{messages.yes}</dt>
              <dd className="left-aligned">
                <FormattedMessage id="entity_is_visible_label_yes" defaultMessage='Defaut state of an entity' />
              </dd>
              <dt className="left-aligned">{messages.no}</dt>
              <dd className="left-aligned">
                <FormattedMessage id="entity_is_visible_label_no" defaultMessage='The entity has been flagged by our staff as non-relevant' />
              </dd>
            </dl>
          </UncontrolledTooltip>
          <UncontrolledTooltip placement="top" target="is_associated_label">
            <dl>
              <dt className="left-aligned">{messages.yes}</dt>
              <dd className="left-aligned">
                <FormattedMessage id="entity_is_associated_label_yes" defaultMessage='The entity has been matched with a product' />
              </dd>
              <dt className="left-aligned">{messages.no}</dt>
              <dd className="left-aligned">
                <FormattedMessage id="entity_is_associated_label_no" defaultMessage="The entity hasn't been matched" />
              </dd>
            </dl>
          </UncontrolledTooltip>
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <i className="glyphicons glyphicons-search">&nbsp;</i> <FormattedMessage id="filters" defaultMessage={`Filters`} />
                </div>
                <div className="card-block">
                  <div className="row entity-form-controls">
                    <div className="col-12 col-sm-6 col-md-6 col-lg-6 col-xl-6">
                      <label htmlFor="stores"><FormattedMessage id="stores" defaultMessage={`Stores`} /></label>
                      <Select
                          name="stores"
                          id="stores"
                          options={storeOptions}
                          value={this.state.formData.stores}
                          onChange={val => this.handleValueChange('stores', val)}
                          multi={true}
                          placeholder={<FormattedMessage id="all_feminine" defaultMessage={`All`} />}
                      />
                    </div>
                    <div className="col-12 col-sm-6 col-md-6 col-lg-6 col-xl-6">
                      <label htmlFor="product_types"><FormattedMessage id="product_types" defaultMessage={`Product types`} /></label>
                      <Select
                          name="product_types"
                          id="product_types"
                          options={productTypeOptions}
                          value={this.state.formData.product_types}
                          onChange={val => this.handleValueChange('product_types', val)}
                          multi={true}
                          placeholder={<FormattedMessage id="all_masculine" defaultMessage={`All`} />}
                      />
                    </div>
                    <div className="col-12 col-sm-3 col-md-3 col-lg-2 col-xl-2">
                      <label id="is_available_label" className="dashed" htmlFor="is_available"><FormattedMessage id="is_available_question" defaultMessage={`Available?`} /></label>
                      <Select
                          name="is_available"
                          id="is_available"
                          options={nullBooleanOptions}
                          value={this.state.formData.is_available}
                          onChange={val => this.handleValueChange('is_available', val)}
                          clearable={false}
                      />
                    </div>
                    <div className="col-12 col-sm-3 col-md-3 col-lg-2 col-xl-2">
                      <label id="is_active_label" className="dashed" htmlFor="is_active"><FormattedMessage id="is_active_question" defaultMessage={`Active?`} /></label>
                      <Select
                          name="is_active"
                          id="is_active"
                          options={nullBooleanOptions}
                          value={this.state.formData.is_active}
                          onChange={val => this.handleValueChange('is_active', val)}
                          clearable={false}
                      />
                    </div>
                    <div className="col-12 col-sm-3 col-md-3 col-lg-2 col-xl-2">
                      <label id="is_visible_label" className="dashed" htmlFor="is_visible"><FormattedMessage id="is_visible_question" defaultMessage={`Visible?`} /></label>
                      <Select
                          name="is_visible"
                          id="is_visible"
                          options={nullBooleanOptions}
                          value={this.state.formData.is_visible}
                          onChange={val => this.handleValueChange('is_visible', val)}
                          clearable={false}
                      />
                    </div>
                    <div className="col-12 col-sm-3 col-md-3 col-lg-2 col-xl-2">
                      <label id="is_associated_label" className="dashed" htmlFor="is_associated"><FormattedMessage id="is_associated_question" defaultMessage={`Associated?`} /></label>
                      <Select
                          name="is_associated"
                          id="is_associated"
                          options={nullBooleanOptions}
                          value={this.state.formData.is_associated}
                          onChange={val => this.handleValueChange('is_associated', val)}
                          clearable={false}
                      />
                    </div>
                    <div className="col-12 col-sm-5 col-md-6 col-lg-4 col-xl-4">
                      <label htmlFor="search"><FormattedMessage id="keywords" defaultMessage={'Keywords'} /></label>
                      <form onSubmit={this.handleFormSubmit}>
                        <input
                            type="text"
                            name="search"
                            id="search"
                            className="form-control"
                            placeholder="Keywords"
                            value={this.state.formData.search}
                            onChange={event => this.handleValueChange('search', event.target.value)}
                        />
                      </form>
                    </div>
                    <div className="col-12 col-sm-7 col-md-6 col-lg-12 col-xl-12">
                      <label htmlFor="submit" className="hidden-xs-down hidden-lg-up">&nbsp;</label>
                      <button name="submit" id="submit" type="submit" className="btn btn-primary float-right ml-3" onClick={this.handleFormSubmit}>
                        <FormattedMessage id="search" defaultMessage={`Search`} />
                      </button>
                      <button name="filter_pending" id="filter_pending" type="button" className="btn btn-secondary float-right" onClick={this.filterPending}>
                        <FormattedMessage id="filter_pending" defaultMessage={`Filter pending`} />
                      </button>
                    </div>
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
                <div className="card-block">
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
    preferredCurrency: state.apiResources[state.apiResources[settings.ownUserUrl].preferred_currency],
    preferredNumberFormat: state.apiResources[state.apiResources[settings.ownUserUrl].preferred_number_format]
  }
}

export default withRouter(connect(
    addApiResourceStateToPropsUtils(mapStateToProps),
    addApiResourceDispatchToPropsUtils())(EntityList));
