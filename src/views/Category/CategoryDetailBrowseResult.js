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
import {Link} from "react-router-dom";
import {FormattedMessage} from "react-intl";


class CategoryDetailBrowseResult extends Component {
  render() {
    if (!this.props.data) {
      return <Loading />
    }

    const preferredCurrency = this.props.ApiResourceObject({
      ...this.props.preferredCurrency,
      exchange_rate: Big(this.props.preferredCurrency.exchange_rate)
    });
    const currenciesDict = {};

    for (const currency of this.props.currencies) {
      currenciesDict[currency.url] = this.props.ApiResourceObject({
        ...currency,
        exchange_rate: Big(currency.exchange_rate)
      })
    }

    const data = this.props.data.map(entry => ({
      ...entry,
      entities: entry.entities.map(entity => {
        const normal_price = Big(entity.active_registry.normal_price);
        const offer_price = Big(entity.active_registry.offer_price);

        let converted_normal_price = null;
        let converted_offer_price = null;

        if (entity.currency === preferredCurrency.url) {
          converted_normal_price = normal_price;
          converted_offer_price = offer_price
        } else {
          const exchangeRate = preferredCurrency.exchangeRate.div(currenciesDict[entity.currency].exchangeRate)
          converted_normal_price = normal_price.times(exchangeRate)
          converted_offer_price = offer_price.times(exchangeRate)
        }

        return {
          ...entity,
          active_registry: {
            ...entity.active_registry,
            offer_price,
            normal_price,
          },
          converted_normal_price,
          converted_offer_price
        }
      })
    }));

    const generalInformationColumns = [
      {
        id: 'product',
        Header: <FormattedMessage id="product" defaultMessage="Product" />,
        accessor: d => d.product.name
      }
    ];

    const dataHasCellPlans = data.some(entry => entry.cell_plan);

    if (dataHasCellPlans) {
      generalInformationColumns.push({
        Header: <FormattedMessage id="cell_plan" defaultMessage="Cell plan" />,
        id: 'cell_plan',
        accessor: d => d.cell_plan ? d.cell_plan.name : 'Liberado',
        aggregate: vals => <FormattedMessage id="any" defaultMessage="Any" />
      })
    }

    for (const specColumn of this.props.specsColumns) {
      generalInformationColumns.push({
        Header: specColumn.label,
        id: specColumn.label,
        accessor: entry => entry.product.specs[specColumn.es_field],
        aggregate: vals => vals[0]
      })
    }


    const columns = [
      {
        Header: <FormattedMessage id="general_information" defaultMessage="General information" />,
        id: 'general_information',
        columns: generalInformationColumns
      }
    ];

    const priceTypes = [
      {
        label: <FormattedMessage id="normal" defaultMessage="Normal" />,
        field: 'normal'
      },
      {
        label: <FormattedMessage id="offer" defaultMessage="Offer" />,
        field: 'offer'
      }
    ];

    columns.push({
      Header: <FormattedMessage id="minima" defaultMessage="Minimum" />,
      columns: priceTypes.map(priceType => {
        const {label, field} = priceType;
        const priceField = `converted_${field}_price`;

        return {
          Header: label,
          id: `min_${field}_price`,
          accessor: 'entities',
          aggregate: values => {
            let minPrice = null;

            for (const value of values) {
              for (const entity of value) {
                const entity_price = entity[priceField];

                if (minPrice === null || minPrice.gt(entity_price)) {
                  minPrice = entity_price
                }
              }
            }

            return minPrice
          },
          Cell: entitiesData => {
            if (entitiesData.aggregated) {
              if (entitiesData.value) {
                return this.props.formatCurrency(entitiesData.value, preferredCurrency)
              } else {
                return ''
              }
            } else {
              let minPrice = null;

              for (const entity of entitiesData.value) {
                if (!minPrice || minPrice.gt(entity[priceField])) {
                  minPrice = entity[priceField]
                }
              }

              return this.props.formatCurrency(minPrice, preferredCurrency)
            }
          }
        }
      })
    });

    const storeUrlsSet = new Set();

    for (const entry of data) {
      for (const entity of entry.entities) {
        storeUrlsSet.add(entity.store)
      }
    }

    const stores = this.props.stores.filter(store => storeUrlsSet.has(store.url))

    for (const store of stores) {
      const storeColumns = priceTypes.map(priceType => {
        const {label, field} = priceType;
        const priceField = `converted_${field}_price`;

        return {
          Header: label,
          id: `${store.id}_store_${field}_price`,
          accessor: d => d.entities.filter(entity => entity.store === store.url),
          aggregate: values => {
            let minPrice = null;

            for (const value of values) {
              for (const entity of value) {
                const entity_price = entity[priceField];

                if (minPrice === null || minPrice.gt(entity_price)) {
                  minPrice = entity_price
                }
              }
            }

            return minPrice
          },
          Cell: entitiesData => {
            if (entitiesData.aggregated) {
              if (entitiesData.value) {
                return this.props.formatCurrency(entitiesData.value, preferredCurrency)
              } else {
                return ''
              }

            } else {
              if (!entitiesData.value.length) {
                return null
              }

              const bestPrice = entitiesData.row[`min_${field}_price`][0][priceField];
              const bestPriceInEntities = entitiesData.value.some(entity => entity[priceField] === bestPrice);

              return <div className={bestPriceInEntities ? 'bg-green' : ''}>
                {entitiesData.value.map(entity => <div key={entity.id}>
                  <Link to={'/entities/' + entity.id}>
                    {this.props.formatCurrency(entity[priceField], preferredCurrency)}
                  </Link>
                  <a href={entity.external_url} target="_blank" className="ml-2">
                    <span className="glyphicons glyphicons-link">&nbsp;</span>
                  </a>
                </div>)}
              </div>
            }
          }
        }
      });

      columns.push({
        Header: store.name,
        id: store.url,
        columns: storeColumns
      })
    }

    return <ReactTable
        data={data}
        columns={columns}
        defaultPageSize={20}
        pivotBy={dataHasCellPlans ? ['product'] : undefined}
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
