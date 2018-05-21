import React, {Component} from 'react'
import classNames from 'classnames';
import {connect} from "react-redux";
import {Nav, NavItem, NavLink, TabContent, TabPane} from "reactstrap";

import {
  apiResourceStateToPropsUtils,
  filterApiResourceObjectsByType
} from "../../react-utils/ApiResource";
import {listToObject} from "../../react-utils/utils";

import {backendStateToPropsUtils} from "../../utils";
import {settings} from '../../settings';
import Loading from "../../components/Loading";
import ProductDetailPriceTableTab from "./ProductDetailPriceTableTab";

class ProductDetailPricesTable extends Component {
  initialState = {
    availableEntities: undefined,
    cellPlanPrices: undefined,
    activeTab: 0
  };

  constructor(props) {
    super(props);
    this.state = {...this.initialState}
  }

  componentDidMount() {
    this.componentUpdate(this.props.product)
  }

  componentWillReceiveProps(nextProps) {
    const currentProduct = this.props.product;
    const nextProduct = nextProps.product;

    if (currentProduct.id !== nextProduct.id) {
      this.setState(this.initialState, () => this.componentUpdate(nextProduct));
    }
  }

  componentUpdate(product) {
    this.props
        .fetchAuth(product.url + 'entities/')
        .then(entities => {
          const availableEntities = entities.filter(entity => entity.active_registry && entity.active_registry.is_available)

          this.setState({
            availableEntities
          });

          /* If some of the entities are associated to cell plans with contract
          retrieve the monthly prices of those plans.*/
          const contractCellPlansInEntities = availableEntities
              .filter(entity => entity.active_registry.cell_monthly_payment !== null && entity.cell_plan !== null)
              .map(entity => entity.cell_plan);

          if (contractCellPlansInEntities.length) {
            let cellPlanPricesUrl = 'products/available_entities/?';

            for (const cellPlan of contractCellPlansInEntities) {
              cellPlanPricesUrl += `ids=${cellPlan.id}&`;
            }

            this.props.fetchAuth(cellPlanPricesUrl).then(cellPlanPricesResult => {
              const cellPlanPrices = {};

              for (const priceEntry of cellPlanPricesResult.results) {
                cellPlanPrices[priceEntry.product.id] = parseFloat(priceEntry.entities[0].active_registry.normal_price);
              }

              this.setState({
                cellPlanPrices
              })
            })
          }
        })
  }

  toggleActiveTab = tab => {
    this.setState({
      activeTab: tab
    })
  };

  render() {
    if (!this.state.availableEntities) {
      return <Loading />
    }

    const currenciesDict = listToObject(this.props.currencies, 'url');

    const entities = this.state.availableEntities.map(e => {
      const currency = currenciesDict[e.currency];
      const normalPrice = parseFloat(e.active_registry.normal_price);
      const offerPrice = parseFloat(e.active_registry.offer_price);
      const cellMonthlyPayment = e.active_registry.cell_monthly_payment !== null ? parseFloat(e.active_registry.cell_monthly_payment) : null;

      const expandedEntity = {
        ...e,
        normalPrice,
        offerPrice,
        cellMonthlyPayment,
        convertedNormalPrice: this.props.convertToPreferredCurrency(normalPrice, currency),
        convertedOfferPrice: this.props.convertToPreferredCurrency(offerPrice, currency),
        convertedCellMonthlyPayment: this.props.convertToPreferredCurrency(cellMonthlyPayment, currency),
      };

      let cellPlanPrice = null;

      if (this.state.cellPlanPrices && e.cell_plan) {
        cellPlanPrice = this.state.cellPlanPrices[e.cell_plan.id];

        if (typeof(cellPlanPrice) !== 'undefined') {
          expandedEntity.cellPlanPrice = cellPlanPrice;
        }
      }

      return this.props.ApiResourceObject(expandedEntity);
    });

    const retail_and_wholesaler_entities = [];
    const mobile_network_operators_entities = {};

    for (const entity of entities) {
      if (entity.store.type.id === settings.mobileNetworkOperatorId) {
        if (typeof(mobile_network_operators_entities[entity.store.id]) === 'undefined') {
          mobile_network_operators_entities[entity.store.id] = []
        }

        mobile_network_operators_entities[entity.store.id].push(entity)
      } else {
        retail_and_wholesaler_entities.push(entity)
      }
    }

    const storesDict = listToObject(this.props.stores, 'id');

    if (Object.keys(mobile_network_operators_entities).length === 0) {
      return <ProductDetailPriceTableTab
          entities={retail_and_wholesaler_entities}
          />
    } else {
      return <div>
        <Nav tabs>
          <NavItem>
            <NavLink
                className={classNames({ active: this.state.activeTab === 0 })}
                onClick={() => { this.toggleActiveTab(0); }}
            >
              Retail
            </NavLink>
          </NavItem>
          {Object.keys(mobile_network_operators_entities).map(storeId => <NavItem key={storeId}>
                <NavLink
                    className={classNames({ active: this.state.activeTab === storeId })}
                    onClick={() => { this.toggleActiveTab(storeId); }}
                >
                  {storesDict[storeId].name}
                </NavLink>
              </NavItem>
          )}
        </Nav>
        <TabContent activeTab={this.state.activeTab}>
          <TabPane tabId={0}>
            <ProductDetailPriceTableTab
                entities={retail_and_wholesaler_entities}
                />
          </TabPane>
          {Object.keys(mobile_network_operators_entities).map(storeId => (
              <TabPane key={storeId} tabId={storeId}>
                <ProductDetailPriceTableTab
                    entities={mobile_network_operators_entities[storeId]}
                    />
              </TabPane>)
          )}
        </TabContent>
      </div>
    }
  }
}

function mapStateToProps(state) {
  const {ApiResourceObject, fetchAuth} = apiResourceStateToPropsUtils(state);
  const {preferredCurrency, convertToPreferredCurrency} = backendStateToPropsUtils(state);

  return {
    ApiResourceObject,
    fetchAuth,
    preferredCurrency,
    convertToPreferredCurrency,
    currencies: filterApiResourceObjectsByType(state.apiResourceObjects, 'currencies'),
    stores: filterApiResourceObjectsByType(state.apiResourceObjects, 'stores'),
  }
}


export default connect(mapStateToProps)(ProductDetailPricesTable);
