import React, {Component} from 'react'
import ReactTable from 'react-table'

import 'react-table/react-table.css'
import Big from 'big.js';
import flatten from 'lodash/flatten'

import Loading from "../../components/Loading";
import connect from "react-redux/es/connect/connect";
import {
  apiResourceStateToPropsUtils,
  filterApiResourceObjectsByType
} from "../../react-utils/ApiResource";
import {listToObject} from '../../react-utils/utils'

import {backendStateToPropsUtils} from '../../utils'
import {Link} from "react-router-dom";
import {FormattedMessage, injectIntl} from "react-intl";
import {Accordion, AccordionItem} from "react-sanfona";
import EntityExternalLink from "../../components/Entity/EntityExternalLink";


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

    const preferredStore = this.props.preferredStore;
    const storesDict = listToObject(this.props.stores, 'url');

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
            offer_price,
            normal_price,
          },
          converted_normal_price,
          converted_offer_price
        }
      })
    }));

    const productsDict = {};

    for (const entry of data) {
      productsDict[entry.product.id] = entry.product
    }

    const generalInformationColumns = [];

    if (preferredStore) {
      generalInformationColumns.push({
        Header: <FormattedMessage id="sku" defaultMessage="SKU" />,
        id: 'sku',
        width: 100,
        accessor: d => {
          return d.entities.filter(entity => entity.store === preferredStore.url)
        },
        aggregate: vals => {
          return flatten(vals)
        },
        Cell: d => {
          if (!d.value.length) {
            return null
          }

          if (d.value.length === 1) {
            return <EntityExternalLink
                entity={d.value[0]}
                label={d.value[0].sku}/>
          } else {
            return <Accordion>
              <AccordionItem
                  title="(+)"
                  titleTag="span">
                <ul className="list-unstyled mb-0">
                  {d.value.map(entity => <li key={entity.id}>
                    <EntityExternalLink
                        entity={entity}
                        label={entity.sku} />
                  </li>)}
                </ul>
              </AccordionItem>
            </Accordion>
          }
        }
      })
    }

    generalInformationColumns.push({
      id: 'product_column',
      width: 300,
      Header: <FormattedMessage id="product" defaultMessage="Product" />,
      accessor: d => dataHasCellPlans ? d.product.id : d.product,
      PivotValue: d => {
        const product = productsDict[d.value];
        return <Link to={`/products/${product.id}`}>
          {product.name}
        </Link>
      },
      Cell: d => {
        return <Link to={`/products/${d.value.id}`}>{d.value.name}</Link>
      }
    });

    const dataHasCellPlans = data.some(entry => entry.cell_plan);

    if (dataHasCellPlans) {
      generalInformationColumns.push({
        Header: <FormattedMessage id="cell_plan" defaultMessage="Cell plan" />,
        id: 'cell_plan',
        accessor: d => d.cell_plan ? d.cell_plan.name : 'Liberado',
        aggregate: vals => <FormattedMessage id="any" defaultMessage="Any" />
      })
    }

    const specsColumns = [
      {
        label: 'Marca',
        es_field: 'brand_unicode'
      },
      ...this.props.specsColumns,
    ];

    for (const specColumn of specsColumns) {
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
          accessor: d => {
            d.entities.sort((a, b) => parseFloat(a[priceField].minus(b[priceField])));
            const minPrice = d.entities[0][priceField];
            return d.entities.filter(entity => entity[priceField].eq(minPrice))
          },
          sortMethod: (a, b) => parseFloat(a[0][priceField].minus(b[0][priceField])),
          aggregate: values => {
            const entities = flatten(values);
            entities.sort((a, b) => parseFloat(a[priceField].minus(b[priceField])));
            const minPrice = entities[0][priceField];
            return entities.filter(entity => entity[priceField].eq(minPrice))
          },
          Aggregated: row => {
            return <Accordion>
              <AccordionItem
                  title={this.props.formatCurrency(row.value[0][priceField], preferredCurrency)}
                  titleTag="span">
                <ul className="list-unstyled mb-0">
                  {row.value.map(entity => <li key={entity.id}>
                    <EntityExternalLink
                        entity={entity}
                        label={storesDict[entity.store].name} />
                  </li>)}
                </ul>
              </AccordionItem>
            </Accordion>
          },
          Cell: entitiesData => {
            return <Accordion>
              <AccordionItem
                  title={this.props.formatCurrency(entitiesData.value[0][priceField], preferredCurrency)}
                  titleTag="span">
                <ul className="list-unstyled mb-0">
                  {entitiesData.value.map(entity => <li key={entity.id}>
                    <EntityExternalLink
                        entity={entity}
                        label={storesDict[entity.store].name} />
                  </li>)}
                </ul>
              </AccordionItem>
            </Accordion>
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

    const stores = this.props.stores.filter(store => storeUrlsSet.has(store.url));

    if (preferredStore) {
      stores.sort((a, b) => {
        if (a.id === preferredStore.id) {
          return -1
        } else if (b.id === preferredStore.id) {
          return 1
        } else {
          return a.name.localeCompare(b.name)
        }
      });
    }

    for (const store of stores) {
      const storeColumns = priceTypes.map(priceType => {
        const {label, field} = priceType;
        const priceField = `converted_${field}_price`;

        return {
          Header: label,
          id: `${store.id}_store_${field}_price`,
          accessor: d => d.entities.filter(entity => entity.store === store.url),
          sortMethod: (a, b) => {
            if (!a.length && !b.length) {
              return 0
            }

            if (a.length && !b.length) {
              return -1
            }

            if (b.length && !a.length) {
              return 1
            }

            return parseFloat(a[0][priceField].minus(b[0][priceField]))
          },
          aggregate: values => {
            return flatten(values).sort((a, b) => parseFloat(a[priceField].minus(b[priceField])));
          },
          Aggregated: row => {
            if (!row.value.length) {
              return null
            }

            const bestPrice = row.row[`min_${field}_price`][0][priceField];
            const storeBestPrice = row.value[0][priceField];

            return <div className={storeBestPrice.eq(bestPrice) ? 'bg-green' : ''}>
              {row.value.length === 1 ?
                  <EntityExternalLink
                      entity={row.value[0]}
                      label={this.props.formatCurrency(storeBestPrice, preferredCurrency)} />
                  :
                  <Accordion>
                    <AccordionItem
                        title={this.props.formatCurrency(storeBestPrice, preferredCurrency)}
                        titleTag="span">
                      <ul className="list-unstyled mb-0">
                        {row.value.map(entity => <li key={entity.id}>
                          <EntityExternalLink
                              entity={entity}
                              label={this.props.formatCurrency(entity[priceField], preferredCurrency)} />
                        </li>)}
                      </ul>
                    </AccordionItem>
                  </Accordion>
              }
            </div>
          },
          Cell: entitiesData => {
            if (!entitiesData.value.length) {
              return null
            }

            const bestPrice = entitiesData.row[`min_${field}_price`][0][priceField];
            const bestPriceInEntities = entitiesData.value.some(entity => entity[priceField].eq(bestPrice));

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
        defaultPageSize={10}
        pivotBy={dataHasCellPlans ? ['product_column'] : undefined}
        className="-striped -highlight"
        previousText={<FormattedMessage id="previous" defaultMessage="Previous"/>}
        nextText={<FormattedMessage id="next" defaultMessage="Next" />}
        loadingText={<FormattedMessage id="Loading" defaultMessage="Loading"/>}
        noDataText={<FormattedMessage id="no_results_found" defaultMessage="No results found"/>}
        pageText={<FormattedMessage id="page" defaultMessage="Page"/>}
        ofText={<FormattedMessage id="of" defaultMessage="of"/>}
        rowsText={this.props.intl.formatMessage({id: 'rows'})}
    />
  }
}

function mapStateToProps(state) {
  const {ApiResourceObject} = apiResourceStateToPropsUtils(state);
  const {formatCurrency, preferredCurrency, preferredStore} = backendStateToPropsUtils(state);

  return {
    stores: filterApiResourceObjectsByType(state.apiResourceObjects, 'stores'),
    currencies: filterApiResourceObjectsByType(state.apiResourceObjects, 'currencies'),
    ApiResourceObject,
    formatCurrency,
    preferredCurrency,
    preferredStore
  }
}

export default injectIntl(connect(mapStateToProps)(CategoryDetailBrowseResult));
