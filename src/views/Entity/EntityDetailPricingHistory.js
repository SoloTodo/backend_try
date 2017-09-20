import React, { Component } from 'react';
import {connect} from "react-redux";
import {
  addApiResourceStateToPropsUtils, filterApiResourceObjectsByType
} from "../../ApiResource";
import moment from 'moment';
import {FormattedMessage, injectIntl} from "react-intl";
import {convertToDecimal} from "../../utils";
import {settings} from "../../settings";
import ApiForm from "../../api_forms/ApiForm";
import ApiFormDateRangeField from "../../api_forms/ApiFormDateRangeField";
import ApiFormChoiceField from "../../api_forms/ApiFormChoiceField";
import { toast } from 'react-toastify';
import EntityDetailPricingHistoryChart from "./EntityDetailPricingHistoryChart";
import ApiFormSubmitButton from "../../api_forms/ApiFormSubmitButton";

class EntityDetailPricingHistory extends Component {
  constructor(props) {
    super(props);

    this.state = {
      apiFormChangeHandler: undefined,
      chart: null,
    };
  }

  componentWillReceiveProps(nextProps) {

  }

  componentWillUpdate(nextProps, nextState) {
    console.log('componentwillupdate');
    
    for (const myKey of Object.keys(this.props)) {
      if (JSON.stringify(this.props[myKey]) !== JSON.stringify(nextProps[myKey])) {
        console.log(myKey);
        console.log(this.props[myKey]);
        console.log(nextProps[myKey]);
      }
    }

    for (const myKey of Object.keys(this.state)) {
      if (this.state[myKey] !== nextState[myKey]) {
        console.log(myKey);
        console.log(this.state[myKey]);
        console.log(nextState[myKey]);
      }
    }
  }

  setApiFormValueChangeHandler = apiFormChangeHandler => {
    this.setState({
      apiFormChangeHandler
    })
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

    const dateRangeInitialMax = moment().startOf('day');

    const dateRangeTooltip = <div>
      <FormattedMessage id="entity_price_history_date_rage" defaultMessage="Date range for the chart. The minimum value is the entity's detection date" /> ({moment(entity.creationDate).format('ll')})
    </div>;

    const currencyTooltip = <FormattedMessage id="entity_price_history_currency" defaultMessage="The price points are converted to this currency. The values are calculated using standard exchange rates" />;

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

    console.log('Rendering component');

    return (
        <div className="animated fadeIn d-flex flex-column">
          <ApiForm
              endpoint={entity.url + 'pricing_history/'}
              fields={['timestamp', 'currency']}
              onResultsChange={this.setChartData}
              observedObjects={[this.props.apiResourceObject]}
              observedObjectsField="last_pricing_update"
              onObservedObjectChange={this.handleObservedObjectChange}
              setValueChangeHandler={this.setApiFormValueChangeHandler}
          >
            <div className="card">
              <div className="card-header"><strong><FormattedMessage id="filters" defaultMessage={`Filters`} /></strong></div>
              <div className="card-block">
                <div className="row">
                  <ApiFormDateRangeField
                      name="timestamp"
                      label={<FormattedMessage id="date_range_from_to" defaultMessage='Date range (from / to)' />}
                      classNames="col-12 col-sm-12 col-md-10 col-lg-6 col-xl-4"
                      min={entityCreationDate}
                      tooltipContent={dateRangeTooltip}
                      initial={[dateRangeInitialMin, dateRangeInitialMax]}
                      onApiParamChange={this.state.apiFormChangeHandler}
                      urlParams=''
                  />
                  <ApiFormChoiceField
                      name="currency"
                      label={<FormattedMessage id="currency" defaultMessage={`Currency`} />}
                      classNames="col-12 col-sm-6 col-md-5 col-lg-3 col-xl-3"
                      choices={currencyOptions}
                      searchable={false}
                      tooltipContent={currencyTooltip}
                      onApiParamChange={this.state.apiFormChangeHandler}
                      urlParams=''
                  />
                  <div className="col-12 col-sm-6 col-md-7 col-lg-3 col-xl-2">
                    <label htmlFor="submit">&nbsp;</label>
                    <ApiFormSubmitButton
                        label={<FormattedMessage id="search" defaultMessage='Search' />}
                        onApiParamChange={this.state.apiFormChangeHandler}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="card d-flex flex-column flex-grow">
              <div className="card-header">
                <strong><FormattedMessage id="result" defaultMessage={`Result`} /></strong>
              </div>
              <div className="card-block d-flex flex-column">
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
  return {
    currencies: filterApiResourceObjectsByType(state.apiResourceObjects, 'currencies'),
    preferredCurrency: state.apiResourceObjects[state.apiResourceObjects[settings.ownUserUrl].preferred_currency],
  }
}

export default injectIntl(connect(
    addApiResourceStateToPropsUtils(mapStateToProps)
)(EntityDetailPricingHistory));