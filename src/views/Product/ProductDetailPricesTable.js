import React, {Component} from 'react'
import {
  addApiResourceStateToPropsUtils,
  filterApiResourceObjectsByType
} from "../../react-utils/ApiResource";
import Loading from "../../components/Loading";
import {connect} from "react-redux";
import {FormattedMessage} from "react-intl";
import OrderTable from "../../components/OrderTable";
import {settings} from "../../settings";
import {listToObject} from "../../react-utils/utils";
import {Link} from "react-router-dom";

class ProductDetailPricesTable extends Component {
  constructor(props) {
    super(props);

    this.state = {
      availableEntities: undefined
    }
  }

  componentDidMount() {
    this.props
        .fetchAuth(this.props.product.url + 'entities/')
        .then(entities => {
          this.setState({
            availableEntities: entities.filter(entity => entity.active_registry && entity.active_registry.is_available)
          })
        })
  }

  render() {
    if (!this.state.availableEntities) {
      return <Loading />
    }

    const currenciesDict = listToObject(this.props.currencies, 'url');
    const prefererredCurrency = this.props.ApiResourceObject(this.props.preferredCurrency);

    let entities = this.state.availableEntities.map(e => {
      const currency = currenciesDict[e.currency];
      const normalPrice = parseFloat(e.active_registry.normal_price);
      const offerPrice = parseFloat(e.active_registry.offer_price);
      const cellMonthlyPayment = parseFloat(e.active_registry.cell_monthly_payment);

      const expandedEntity = {
        ...e,
        normalPrice,
        offerPrice,
        cellMonthlyPayment,
        convertedNormalPrice: this.props.convertToPreferredCurrency(normalPrice, currency),
        convertedOfferPrice: this.props.convertToPreferredCurrency(offerPrice, currency),
        convertedCellMonthlyPayment: this.props.convertToPreferredCurrency(cellMonthlyPayment, currency),
      };

      return this.props.ApiResourceObject(expandedEntity);
    });

    const columns = [
      {
        name: 'stores',
        label: <FormattedMessage id="store" defaultMessage="Stores" />,
        field: entity => <span className="">
          <Link to={'/entities/' + entity.id}>{entity.store.name}</Link>
          <a href={entity.externalUrl} target="_blank" className="ml-2">
            <span className="glyphicons glyphicons-link">&nbsp;</span>
          </a>
        </span>,
        ordering: entity => entity.store.name
      }
    ];

    // If there are entities available in multiple countries, add a Country column

    let multipleCountries = false;

    if (entities.length) {
      const firstEntityCountryId = entities[0].store.country.id;
      multipleCountries = entities.some(entity => entity.store.country.id !== firstEntityCountryId)
    }

    if (multipleCountries) {
      columns.push({
        name: 'country',
        label: <FormattedMessage id="country" defaultMessage="Country" />,
        field: entity => entity.store.country.name,
        ordering: entity => entity.store.country.name
      })
    }

    // If some of the entities have cell plans associated, add the column

    if (entities.some(entity => Boolean(entity.cellPlan))) {
      columns.push({
        name: 'cellPlan',
        label: <FormattedMessage id="cell_plan" defaultMessage="Cell plan" />,
        field: entity => entity.cellPlan ? entity.cellPlan.name : <em>N/A</em>,
        ordering: entity => entity.cellPlan ? entity.cellPlan.name : ''
      })
    }

    /*
      Check whether there are multiple currencies in the results. We do this here
      because if there are, then we disable sorting by the original prices as
      their values are not going to be in the same currency.
    */

    let commonCurrency = null;
    if (entities.length) {
      commonCurrency = entities[0].currency;

      for (const entity of entities) {
        if (entity.currency.id !== commonCurrency.id) {
          commonCurrency = null;
          break
        }
      }
    }

    // Normal and offer price

    columns.push({
      name: 'normalPrice',
      label: <FormattedMessage id="normal_price" defaultMessage="Normal" />,
      field: entity => this.props.formatCurrency(entity.activeRegistry.normal_price, entity.currency),
      ordering: commonCurrency ? entity => entity.normalPrice : undefined,
      className: 'text-right'
    });

    columns.push({
      name: 'offerPrice',
      label: <FormattedMessage id="offer_price" defaultMessage="Offer price" />,
      field: entity => this.props.formatCurrency(entity.activeRegistry.offer_price, entity.currency),
      ordering: commonCurrency ? entity => entity.offerPrice : undefined,
      className: 'text-right'
    });

    // Add cell monthly payment, if there are any entities with it

    const hasCellMonthlyPayments = entities.some(entity => entity.activeRegistry.cell_monthly_payment !== null);

    if (hasCellMonthlyPayments) {
      columns.push({
        name: 'cellMonthlyPayment',
        label: <FormattedMessage id="monthly_payment" defaultMessage="Monthly payment" />,
        field: entity => entity.cellMonthlyPayment ? this.props.formatCurrency(entity.activeRegistry.cell_monthly_payment, entity.currency) : <em>N/A</em>,
        ordering: commonCurrency ? entity => entity.cellMonthlyPayment : undefined,
        className: 'text-right'
      })
    }

    // If the entities are not in the same currency, or the common currency is different from our preferred, add conversion columns

    if (entities.length && (!commonCurrency || commonCurrency.id !== prefererredCurrency.id)) {
      columns.push({
        name: 'convertedNormalPrice',
        label: <span><FormattedMessage id="normal_price" defaultMessage="Normal" /> ({prefererredCurrency.isoCode})</span>,
        field: entity => this.props.formatCurrency(entity.convertedNormalPrice, prefererredCurrency),
        ordering: entity => entity.convertedNormalPrice,
        className: 'text-right'
      });

      columns.push({
        name: 'convertedOfferPrice',
        label: <span><FormattedMessage id="offer_price" defaultMessage="Offer price" /> ({prefererredCurrency.isoCode})</span>,
        field: entity => this.props.formatCurrency(entity.convertedOfferPrice, prefererredCurrency),
        ordering: entity => entity.convertedOfferPrice,
        className: 'text-right'
      });

      if (hasCellMonthlyPayments) {
        columns.push({
          name: 'convertedCellMonthlyPayment',
          label: <span><FormattedMessage id="monthly_payment" defaultMessage="Monthly payment" /> ({prefererredCurrency.isoCode})</span>,
          field: entity => entity.cellMonthlyPayment ? this.props.formatCurrency(entity.convertedCellMonthlyPayment, prefererredCurrency) : <em>N/A</em>,
          ordering: entity => entity.convertedCellMonthlyPayment,
          className: 'text-right'
        });
      }
    }

    return (
        <OrderTable
            columns={columns}
            data={entities}
            initialOrdering="offerPrice"
        />
    )
  }
}

function mapStateToProps(state) {
  return {
    currencies: filterApiResourceObjectsByType(state.apiResourceObjects, 'currencies'),
    preferredCurrency: state.apiResourceObjects[state.apiResourceObjects[settings.ownUserUrl].preferred_currency],
  }
}


export default connect(addApiResourceStateToPropsUtils(mapStateToProps))(ProductDetailPricesTable);
