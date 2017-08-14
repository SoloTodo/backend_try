import React, {Component} from 'react';
import {connect} from "react-redux";
import {FormattedMessage} from "react-intl";
import Select from 'react-select';
import {Table, Column, Cell} from 'fixed-data-table';

import {
  addApiResourceDispatchToPropsUtils,
  addApiResourceStateToPropsUtils,
  filterApiResourcesByType
} from "../../ApiResource";
import {settings} from "../../settings";
import Loading from "../../components/Loading";
import './EntityList.css'

class EntityList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      formData: {
        stores: [],
        product_types: [],
        is_visible: 1,
        is_available: 1,
        is_associated: 1,
        keywords: ''
      },
      entities: undefined
    }
  }

  componentDidMount() {
    if (!this.props.productTypes) {
      this.props.fetchApiResource('product_types', this.props.dispatch)
    }

    if (!this.props.stores) {
      this.props.fetchApiResource('stores', this.props.dispatch)
    }

    this.updateSearchResults();
  }

  handleValueChange = (name, value) => {
    this.setState({
      formData: {
        ...this.state.formData,
        [name]: value
      }
    })
  };

  handleKeywordsChange = event => {
    this.handleValueChange('keywords', event.target.value);
  };

  updateSearchResults = () => {
    let url = settings.resourceEndpoints.entities + '?';

    const formData = this.state.formData;

    for (let store of formData.stores) {
      url += `stores=${store.value}&`
    }

    for (let productType of formData.product_types) {
      url += `product_types=${productType.value}&`
    }

    url += `is_visible=${formData.is_visible.value}&is_available=${formData.is_available.value}&is_associated=${formData.is_associated.value}&search=${formData.keywords}`;

    this.props.fetchAuth(url).then(json => {
      this.setState({
        entities: json
      })
    })
  };


  render() {
    if (!this.props.stores || !this.props.productTypes) {
      return <Loading />
    }

    const storeOptions = this.props.stores.map(store => ({
      value: store.id,
      label: store.name
    }));

    const productTypeOptions = this.props.productTypes.map(productType => ({
      value: productType.id,
      label: productType.name
    }));

    const nullBooleanOptions = [
      {
        value: 1,
        label: <FormattedMessage id="any" defaultMessage={`Any`} />
      },
      {
        value: 2,
        label: <FormattedMessage id="yes" defaultMessage={`Yes`} />
      },
      {
        value: 3,
        label: <FormattedMessage id="no" defaultMessage={`No`} />
      }
    ];

    const entities = this.state.entities;

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
                    <div className="col-12 col-sm-4 col-md-4 col-lg-2 col-xl-2">
                      <label htmlFor="is_visible"><FormattedMessage id="is_visible_question" defaultMessage={`Visible?`} /></label>
                      <Select
                          name="is_visible"
                          id="is_visible"
                          options={nullBooleanOptions}
                          value={this.state.formData.is_visible}
                          onChange={val => this.handleValueChange('is_visible', val)}
                          clearable={false}
                      />
                    </div>
                    <div className="col-12 col-sm-4 col-md-4 col-lg-2 col-xl-2">
                      <label htmlFor="is_available"><FormattedMessage id="is_available_question" defaultMessage={`Available?`} /></label>
                      <Select
                          name="is_available"
                          id="is_available"
                          options={nullBooleanOptions}
                          value={this.state.formData.is_available}
                          onChange={val => this.handleValueChange('is_available', val)}
                          clearable={false}
                      />
                    </div>
                    <div className="col-12 col-sm-4 col-md-4 col-lg-2 col-xl-2">
                      <label htmlFor="is_associated"><FormattedMessage id="is_associated_question" defaultMessage={`Associated?`} /></label>
                      <Select
                          name="is_associated"
                          id="is_associated"
                          options={nullBooleanOptions}
                          value={this.state.formData.is_associated}
                          onChange={val => this.handleValueChange('is_associated', val)}
                          clearable={false}
                      />
                    </div>
                    <div className="col-12 col-sm-9 col-md-10 col-lg-4 col-xl-4">
                      <label htmlFor="keywords"><FormattedMessage id="keywords" defaultMessage={`Keywords`} /></label>
                      <input
                          type="text"
                          name="keywords"
                          id="keywords"
                          className="form-control"
                          placeholder="Keywords"
                          value={this.state.formData.keywords}
                          onChange={this.handleKeywordsChange}
                      />
                    </div>
                    <div className="col-12 col-sm-3 col-md-2 col-lg-2 col-xl-2">
                      <label htmlFor="submit" className="hidden-xs-down">&nbsp;</label>
                      <button name="submit" id="submit" type="submit" className="btn btn-primary" onClick={this.updateSearchResults}>
                        <FormattedMessage id="search" defaultMessage={`Search`} />
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
                  {entities ?
                      <Table
                          rowHeight={50}
                          headerHeight={50}
                          rowsCount={entities.results.length}
                          width={1000}
                          height={500}
                          {...this.props}>
                        <Column
                            header={<Cell>URL</Cell>}
                            cell={({rowIndex, ...props}) => (
                                <Cell {...props}>
                                  {entities.results[rowIndex].url}
                                </Cell>
                            )}
                            fixed={true}
                            width={600}
                        />
                        <Column
                            header={<Cell>Sentence! (flexGrow greediness=2)</Cell>}
                            cell={<Cell data={entities.results} />}
                            flexGrow={2}
                            width={200}
                        />
                        <Column
                            header={<Cell>Company (flexGrow greediness=1)</Cell>}
                            cell={<Cell data={entities.results} />}
                            flexGrow={1}
                            width={200}
                        />
                        <Column
                            width={100}
                            header={<Cell>Last Name</Cell>}
                            cell={<Cell data={entities.results} />}
                        />
                      </Table> :
                      <Loading />
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
    )
  }
}

function mapStateToProps(state) {
  let productTypes = undefined;
  if (state.loadedResources.includes('product_types')) {
    productTypes = filterApiResourcesByType(state.apiResources, 'product_types')
        .filter(productType => productType.permissions.includes('view_product_type_entities'))
  }

  let stores = undefined;
  if (state.loadedResources.includes('stores')) {
    stores = filterApiResourcesByType(state.apiResources, 'stores')
        .filter(store => store.permissions.includes('view_store_entities'))
  }

  return {
    productTypes,
    stores,
  }
}

export default connect(
    addApiResourceStateToPropsUtils(mapStateToProps),
    addApiResourceDispatchToPropsUtils())(EntityList);
