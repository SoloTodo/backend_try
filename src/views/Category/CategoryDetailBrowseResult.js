import React, {Component} from 'react'
import ReactTable from 'react-table'

import 'react-table/react-table.css'
import Big from 'big.js';

import Loading from "../../components/Loading";
import connect from "react-redux/es/connect/connect";
import {
  apiResourceStateToPropsUtils,
  filterApiResourceObjectsByType
} from "../../react-utils/ApiResource";

import {backendStateToPropsUtils} from '../../utils'


class CategoryDetailBrowseResult extends Component {
  render() {
    if (!this.props.data) {
      return <Loading />
    }

    let data = this.props.data.map(entry => ({
      ...entry,
      entities: entry.entities.map(entity => ({
        ...entity,
        active_registry: {
          ...entity.active_registry,
          offer_price: Big(entity.active_registry.offer_price),
          normal_price: Big(entity.active_registry.normal_price),
        }
      }))
    }));

    const columns = [
      {
        Header: 'Producto',
        columns: [
          {
            Header: 'Producto',
            id: 'product',
            accessor: d => d.product.name
          }
        ]
      },
      {
        Header: 'Plan celular',
        columns: [{
          Header: 'Plan celular',
          id: 'cell_plan',
          accessor: d => d.cell_plan ? d.cell_plan.name : 'N/A',
          aggregate: vals => 'Cualquiera'
        }]
      }
    ];

    for (const specColumn of this.props.specsColumns) {
      columns.push({
        Header: specColumn.label,
        columns: [{
          Header: specColumn.label,
          id: specColumn.label,
          accessor: entry => entry.product.specs[specColumn.es_field],
          aggregate: vals => vals[0]
        }]
      })
    }

    const storeUrlsSet = new Set();

    for (const entry of data) {
      for (const entity of entry.entities) {
        storeUrlsSet.add(entity.store)
      }
    }

    const stores = this.props.stores.filter(store => storeUrlsSet.has(store.url))
    const preferredCurrency = this.props.ApiResourceObject(this.props.preferredCurrency)
    const currenciesDict = {};

    for (const currency of this.props.currencies) {
      currenciesDict[currency.url] = this.props.ApiResourceObject(currency)
    }

    for (const store of stores) {
      columns.push({
        Header: store.name,
        id: store.url,
        columns: [
          {
            Header: 'Oferta',
            id: `${store.id}_store_offer_price`,
            accessor: d => d.entities.filter(entity => entity.store === store.url),
            aggregate: (values, rows) => {
              let minOfferPrice = null;

              for (const value of values) {
                for (const entity of value) {
                  if (minOfferPrice === null || minOfferPrice.gt(entity.active_registry.offer_price)) {
                    minOfferPrice = entity.active_registry.offer_price
                  }
                }
              }

              return this.props.formatCurrency(minOfferPrice, preferredCurrency)
            },
            Cell: entitiesData => {
              if (entitiesData.aggregated) {
                if (entitiesData.value) {
                  return entitiesData.value
                } else {
                  return ''
                }

              } else {
                return <div>
                  {entitiesData.value.map(entity => <div key={entity.id}>
                    <a href={entity.external_url} target="_blank">{this.props.formatCurrency(entity.active_registry.offer_price, preferredCurrency)}</a>
                  </div>)}
                </div>
              }
            }
          }
        ]
      })
    }

    return <ReactTable
        data={data}
        columns={columns}
        defaultPageSize={20}
        pivotBy={['product']}
        className="-striped -highlight"
    />
  }
}

function mapStateToProps(state) {
  const {ApiResourceObject} = apiResourceStateToPropsUtils(state);
  const {formatCurrency, preferredCurrency} = backendStateToPropsUtils(state);

  return {
    stores: filterApiResourceObjectsByType(state.apiResourceObjects, 'stores'),
    currencies: filterApiResourceObjectsByType(state.apiResourceObjects, 'currencies'),
    ApiResourceObject,
    formatCurrency,
    preferredCurrency,
  }
}

export default connect(mapStateToProps)(CategoryDetailBrowseResult);
