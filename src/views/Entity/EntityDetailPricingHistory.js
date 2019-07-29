import React, { Component } from 'react';
import {connect} from "react-redux";
import { toast } from 'react-toastify';
import {UncontrolledTooltip} from "reactstrap";
import {FormattedMessage, injectIntl} from "react-intl";
import moment from 'moment';

import {apiResourceStateToPropsUtils, filterApiResourceObjectsByType} from "../../react-utils/ApiResource";
import {convertToDecimal} from "../../react-utils/utils";
import {
  ApiForm,
  ApiFormDateRangeField,
  ApiFormChoiceField,
} from '../../react-utils/api_forms'

import {backendStateToPropsUtils} from "../../utils";
import EntityDetailPricingHistoryChart from "./EntityDetailPricingHistoryChart";

class EntityDetailPricingHistory extends Component {
  constructor(props) {
    super(props);

    this.state = {
      formValues: {},
      apiFormFieldChangeHandler: undefined,
      chart: undefined
    }
  }

  setApiFormFieldChangeHandler = apiFormFieldChangeHandler => {
    this.setState({
      apiFormFieldChangeHandler
    })
  };

  handleFormValueChange = formValues => {
    this.setState({formValues})
  };

  setChartData = (bundle) => {
    if (!bundle) {
      this.setState({
        chart: null
      });
      return;
    }

    const convertedData = bundle.payload.map(entityHistory => ({
      timestamp: moment(entityHistory.timestamp),
      normalPrice: convertToDecimal(entityHistory.normal_price),
      offerPrice: convertToDecimal(entityHistory.offer_price),
      cellMonthlyPayment: convertToDecimal(entityHistory.cell_monthly_payment),
      isAvailable: entityHistory.is_available,
      stock: entityHistory.stock,
    }));

    this.setState({
      chart: {
        startDate: bundle.fieldValues.timestamp.startDate,
        endDate: bundle.fieldValues.timestamp.endDate,
        currency: bundle.fieldValues.currency,
        data: convertedData
      }
    });
  };

  handleObservedObjectChange = changes => {
    toast.info(<FormattedMessage
            id="entity_price_history_auto_updated"
            defaultMessage="The pricing information of this entity has just been updated, refreshing chart."/>,
        {autoClose: false});
  };

  render() {
    const entity = this.props.ApiResourceObject(this.props.apiResourceObject);

    const entityCreationDate = moment(entity.creationDate).startOf('day');
    const todayMinus30Days = moment().startOf('day').subtract(30, 'days');

    let dateRangeInitialMin = entityCreationDate;
    if (entityCreationDate.isBefore(todayMinus30Days)) {
      dateRangeInitialMin = todayMinus30Days;
    }

    const currencyOptions = this.props.currencies.map(currency => {
      let priority = 3;
      let name = currency.name;

      if (currency.id === entity.currency.id) {
        priority = 1;
        name += ` (${this.props.intl.formatMessage({id: 'default_text'})})`
      } else if (currency.id === this.props.preferredCurrency.id) {
        priority = 2
      }

      return {
        ...currency,
        name: name,
        priority: priority
      }
    });

    currencyOptions.sort((a, b) => a.priority - b.priority);

    return (
        <div className="animated fadeIn d-flex flex-column">
          <UncontrolledTooltip placement="top" target="timestamp_label">
            <FormattedMessage id="entity_price_history_date_rage" defaultMessage="Date range for the chart. The minimum value is the entity's detection date" /> ({moment(entity.creationDate).format('ll')})
          </UncontrolledTooltip>

          <UncontrolledTooltip placement="top" target="currency_label">
            <FormattedMessage id="entity_price_history_currency" defaultMessage="The price points are converted to this currency. The values are calculated using standard exchange rates" />
          </UncontrolledTooltip>

          <ApiForm
              endpoints={[entity.url + 'pricing_history/']}
              fields={['timestamp', 'currency']}
              onResultsChange={this.setChartData}
              observedObjects={[this.props.apiResourceObject]}
              observedObjectsField="last_pricing_update"
              onObservedObjectChange={this.handleObservedObjectChange}
              onFormValueChange={this.handleFormValueChange}
              setFieldChangeHandler={this.setApiFormFieldChangeHandler}>
            <div className="card">
              <div className="card-header">
                <FormattedMessage id="filters" defaultMessage={`Filters`} />
              </div>
              <div className="card-block">
                <div className="row api-form-filters">
                  <div className="col-12 col-sm-12 col-md-12 col-lg-8 col-xl-6">
                    <label id="timestamp_label" className="dashed" htmlFor="timestamp">
                      <FormattedMessage id="date_range_from_to" defaultMessage="Date range (from / to)" />
                    </label>
                    <ApiFormDateRangeField
                        name="timestamp"
                        id="timestamp"
                        label={<FormattedMessage id="date_range_from_to" defaultMessage='Date range (from / to)' />}
                        min={entityCreationDate}
                        initial={[dateRangeInitialMin]}
                        value={this.state.formValues.timestamp}
                        onChange={this.state.apiFormFieldChangeHandler}
                    />
                  </div>
                  <div className="col-12 col-sm-6 col-md-6 col-lg-4 col-xl-4">
                    <label id="currency_label" className="dashed" htmlFor="currency">
                      <FormattedMessage id="currency" defaultMessage="Currency" />
                    </label>
                    <ApiFormChoiceField
                        name="currency"
                        id="currency"
                        label={<FormattedMessage id="currency" defaultMessage={`Currency`} />}
                        choices={currencyOptions}
                        required={true}
                        searchable={false}
                        value={this.state.formValues.currency}
                        onChange={this.state.apiFormFieldChangeHandler}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="card-header">
                <FormattedMessage id="result" defaultMessage={`Result`} />
              </div>
              <div className="card-block">
                <EntityDetailPricingHistoryChart
                    entity={this.props.apiResourceObject}
                    chart={this.state.chart}
                />
              </div>
            </div>
          </ApiForm>
        </div>
    )
  }
}

function mapStateToProps(state) {
  const {ApiResourceObject} = apiResourceStateToPropsUtils(state);
  const {preferredCurrency} = backendStateToPropsUtils(state);

  return {
    ApiResourceObject,
    preferredCurrency,
    currencies: filterApiResourceObjectsByType(state.apiResourceObjects, 'currencies'),
  }
}

export default injectIntl(connect(mapStateToProps)(EntityDetailPricingHistory));