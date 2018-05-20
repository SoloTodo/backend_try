import React, {Component} from 'react';
import {FormattedMessage} from "react-intl";
import {Link} from "react-router-dom";
import OrderTable from "../../components/OrderTable";
import {connect} from "react-redux";
import {
  apiResourceStateToPropsUtils
} from "../../react-utils/ApiResource";
import {backendStateToPropsUtils} from "../../utils";

class ProductDetailPriceTableTab extends Component {
  render() {
    const entities = this.props.entities;
    const prefererredCurrency = this.props.ApiResourceObject(this.props.preferredCurrency);

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
        field: entity => entity.cellMonthlyPayment !== null ? this.props.formatCurrency(entity.activeRegistry.cell_monthly_payment, entity.currency) : <em>N/A</em>,
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
          field: entity => entity.cellMonthlyPayment !== null ? this.props.formatCurrency(entity.convertedCellMonthlyPayment, prefererredCurrency) : <em>N/A</em>,
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
  const {ApiResourceObject} = apiResourceStateToPropsUtils(state);
  const {preferredCurrency, formatCurrency} = backendStateToPropsUtils(state);

  return {
    ApiResourceObject,
    preferredCurrency,
    formatCurrency
  }
}


export default connect(mapStateToProps)(ProductDetailPriceTableTab);
