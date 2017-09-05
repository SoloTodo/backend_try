import React, {Component} from 'react';
import {connect} from "react-redux";
import {FormattedMessage} from "react-intl";
import ReactPaginate from 'react-paginate';
import Select from 'react-select';
import queryString from 'query-string';
import { toast } from 'react-toastify';
import {
  addApiResourceDispatchToPropsUtils,
  addApiResourceStateToPropsUtils, filterApiResourcesByType
} from "../../ApiResource";
import {settings} from "../../settings";
import Loading from "../../components/Loading";
import './EntityList.css'
import {NavLink, withRouter} from "react-router-dom";
import {formatCurrency} from "../../utils";
import {UncontrolledTooltip} from "reactstrap";
import messages from "../../messages";
import {createOption, createOptions} from "../../form_utils";
import moment from "moment";

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

    this.resourceObjectsWithPermission = {
      stores: this.props.stores.filter(store => store.permissions.includes('view_store_entities')),
      categories: this.props.categories.filter(category => category.permissions.includes('view_category_entities')),
    };

    this.state = {
      formData: this.parseUrlArgs(window.location),
      entities: undefined
    };
  }

  componentDidMount() {
    this.updateSearchResults();
    this.unlistenHistory = this.props.history.listen(this.onHistoryChange);
  }

  componentWillUnmount() {
    this.unlistenHistory();
  }

  componentWillReceiveProps(nextProps) {
    if (!this.state.entities) {
      return
    }

    const currentEntitiesDict = this.props.entities.reduce((acum, entity) => ({...acum, [entity.url]: entity}), {});
    const nextEntitiesDict = nextProps.entities.reduce((acum, entity) => ({...acum, [entity.url]: entity}), {});

    let updateSearchResults = false;

    for (const entityUrl of this.state.entities.urls) {
      // If one of the entities currnetly displayed has changed, re-execute search
      const currentEntity = currentEntitiesDict[entityUrl];
      const nextEntity = nextEntitiesDict[entityUrl];

      if (!nextEntity) {
        updateSearchResults = true;
        break
      }

      const currentEntityLastUpdated = moment(currentEntity.last_updated);
      const nextEntityLastUpdated = moment(nextEntity.last_updated);

      if (currentEntityLastUpdated.isBefore(nextEntityLastUpdated)) {
        updateSearchResults = true;
        break
      }
    }

    if (updateSearchResults) {
      toast.info(<FormattedMessage id="entity_list_changes_detected" defaultMessage="Entity changes detected, updating search results" />);
      this.updateSearchResults();
    }
  }

  parseUrlArgs = (location) => {
    const parameters = queryString.parse(location.search);

    const result = {};

    for (const resource of ['stores', 'categories']) {
      let resourceObjects = parameters[resource];
      if (!Array.isArray(resourceObjects)) {
        resourceObjects = [resourceObjects]
      }
      resourceObjects = this.resourceObjectsWithPermission[resource]
          .filter(resourceObject => resourceObjects.includes(resourceObject.id.toString()))
          .map(createOption);
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

    for (const resource of ['stores', 'categories']) {
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

    const endpoint = settings.resourceEndpoints.entities + search + `&page_size=${pageSize}&ordering=name`;

    this.props.fetchAuth(endpoint).then(json => {
      if (json.detail) {

      } else {
        this.props.dispatch({
          type: 'addApiResources',
          apiResources: json.results,
          resourceType: 'entities'
        });

        this.setState({
          entities: {
            urls: json.results.map(entity => entity.url),
            count: json.count
          }
        })
      }
    });

    if (pushLocation && this.props.breakpoint.isExtraSmall) {
      document.getElementById('results-container').scrollIntoView({behavior: 'smooth'})
    }
  };

  render() {
    const storeOptions = createOptions(this.resourceObjectsWithPermission.stores);
    const categoryOptions = createOptions(this.resourceObjectsWithPermission.categories);

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

    if (!this.state.entities) {
      cardContent = <Loading />;
    } else {
      let pageRangeDisplayed = 3;
      let marginPagesDisplayed= 2;
      if (this.props.breakpoint.isExtraSmall) {
        pageRangeDisplayed = 1;
        marginPagesDisplayed = 1;
      }

      const entitiesDict = this.props.entities.reduce((acum, entity) => ({...acum, [entity.url]: entity}), {});
      const entities = this.state.entities.urls.map(entityUrl => this.props.ApiResource(entitiesDict[entityUrl]));
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
            <th className="hidden-xs-down"><FormattedMessage id="category" defaultMessage={`Category`} /></th>
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
                <td className="hidden-xs-down">{entity.category.name}</td>
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
                          searchable={!this.props.breakpoint.isExtraSmall}
                      />
                    </div>
                    <div className="col-12 col-sm-6 col-md-6 col-lg-6 col-xl-6">
                      <label htmlFor="categories"><FormattedMessage id="categories" defaultMessage={`Categories`} /></label>
                      <Select
                          name="categories"
                          id="categories"
                          options={categoryOptions}
                          value={this.state.formData.categories}
                          onChange={val => this.handleValueChange('categories', val)}
                          multi={true}
                          placeholder={<FormattedMessage id="all_masculine" defaultMessage={`All`} />}
                          searchable={!this.props.breakpoint.isExtraSmall}
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
                          searchable={false}
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
                          searchable={false}
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
                          searchable={false}
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
                          searchable={false}
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
    preferredCurrency: state.apiResources[state.apiResources[settings.ownUserUrl].preferred_currency],
    preferredNumberFormat: state.apiResources[state.apiResources[settings.ownUserUrl].preferred_number_format],
    entities: filterApiResourcesByType(state.apiResources, 'entities'),
    breakpoint: state.breakpoint
  }
}

export default withRouter(connect(
    addApiResourceStateToPropsUtils(mapStateToProps),
    addApiResourceDispatchToPropsUtils())(EntityList));
