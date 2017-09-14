import React, { Component } from 'react';
import {connect} from "react-redux";
import {
  addApiResourceDispatchToPropsUtils,
  addApiResourceStateToPropsUtils, filterApiResourceObjectsByType
} from "../../ApiResource";
import {Line} from 'react-chartjs-2';
import moment from 'moment';
import {FormattedMessage, injectIntl} from "react-intl";
import {withRouter} from "react-router-dom";
import Loading from "../../components/Loading";
import {convertToDecimal, formatCurrency} from "../../utils";
import './EntityDetailPriceHistory.css'
import {settings} from "../../settings";
import {chartColors, lightenDarkenColor} from "../../colors"
import ApiForm from "../../api_forms/ApiForm";
import DateRangeField from "../../api_forms/DateRangeField";
import ChoiceField from "../../api_forms/ChoiceField";
import { toast } from 'react-toastify';

class EntityDetailPriceHistory extends Component {
  constructor(props) {
    super(props);
    const entity = this.props.ApiResourceObject(this.props.apiResourceObject)

    const sortedCurrencies = this.props.currencies.map(currency => {
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

    sortedCurrencies.sort((a, b) => a.priority - b.priority);
    this.currencyOptions = sortedCurrencies;

    this.state = {
      chart: null,
    };
  }

  setChartData = (bundle) => {
    if (!bundle) {
      this.setState({
        chart: null
      });
      return;
    }

    const convertedData = bundle.payload.results.map(entityHistory => ({
      timestamp: moment(entityHistory.timestamp),
      normalPrice: convertToDecimal(entityHistory.normal_price),
      offerPrice: convertToDecimal(entityHistory.offer_price),
      cellMonthlyPayment: convertToDecimal(entityHistory.cell_monthly_payment),
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

  preparePriceHistoryChartData() {
    const entity = this.props.ApiResourceObject(this.props.apiResourceObject);
    const targetCurrency = this.state.chart.currency;
    const exchangeRate =
        targetCurrency.exchange_rate /
        entity.currency.exchangeRate;

    const datapoints = [
      this.makeEmptyDatapoint(this.state.chart.startDate),
      ...this.state.chart.data,
      this.makeEmptyDatapoint(this.state.chart.endDate),
    ];
    let lastPriceHistorySeen = undefined;

    let result = [];
    for (const priceHistory of datapoints) {
      if (typeof lastPriceHistorySeen !== 'undefined') {
        result = result.concat(this.fillTimeLapse(lastPriceHistorySeen.timestamp, priceHistory.timestamp))
      }
      lastPriceHistorySeen = priceHistory;
      result.push({
        timestamp: priceHistory.timestamp,
        normalPrice: priceHistory.normalPrice * exchangeRate,
        offerPrice: priceHistory.offerPrice * exchangeRate,
        cellMonthlyPayment: priceHistory.cellMonthlyPayment * exchangeRate
      });
    }

    return result;
  }

  makeEmptyDatapoint(date) {
    return {
      timestamp: date,
      normalPrice: NaN,
      offerPrice: NaN,
      cellMonthlyPayment: NaN
    }
  }

  fillTimeLapse(startDate, endDate) {
    const result = [];
    const targetDate = endDate.clone().startOf('day');
    let iterDate = startDate.clone().add(1, 'days').startOf('day');

    while (iterDate < targetDate) {
      result.push(this.makeEmptyDatapoint(iterDate.clone()));
      iterDate.add(1, 'days')
    }

    return result;
  }

  handleObservedObjectChange = changes => {
    toast.info(<FormattedMessage
            id="entity_price_history_auto_updated"
            defaultMessage="The pricing information of this entity has just been updated, refreshing chart."/>,
        {autoClose: false});
  };

  render() {
    const entity = this.props.ApiResourceObject(this.props.apiResourceObject);
    let chart = <Loading />;

    if (this.state.chart) {
      const filledChartData = this.preparePriceHistoryChartData();

      const maxValue = filledChartData.reduce((acum, datapoint) => {
        return Math.max(acum, datapoint.normalPrice || 0, datapoint.offerPrice || 0, datapoint.cellMonthlyPayment || 0)
      }, 0);

      const currency = this.props.ApiResourceObject(this.state.chart.currency);
      const preferredNumberFormat = this.props.preferredNumberFormat;

      const chartOptions = {
        title: {
          display: true,
          text: `${entity.name} - ${entity.store.name}`
        },
        scales: {
          xAxes: [{
            type: 'time',
            time: {
              displayFormats: {
                day: 'MMM DD'
              },
              unit: 'day'
            }
          }],
          yAxes: [{
            ticks: {
              beginAtZero: true,
              suggestedMax: maxValue * 1.1,
              callback: function (value, index, values) {
                return formatCurrency(value, currency, null,
                    preferredNumberFormat.thousands_separator,
                    preferredNumberFormat.decimal_sepator)
              }
            }
          }]
        },
        legend: {
          position: 'bottom'
        },
        maintainAspectRatio: false,
        tooltips: {
          callbacks: {
            title: (tooltipItems, data) => {
              return tooltipItems[0].xLabel.format('llll')
            },
            label: (tooltipItem, data) => {
              const formattedCurrency = formatCurrency(
                  tooltipItem.yLabel, currency, null,
                  preferredNumberFormat.thousands_separator,
                  preferredNumberFormat.decimal_separator);
              return `${data.datasets[tooltipItem.datasetIndex].label}: ${formattedCurrency}`
            }
          },
          mode: 'index',
          intersect: false,
          position: 'nearest'
        }
      };

      const datasets = [
        {
          label: this.props.intl.formatMessage({id: 'normal_price'}),
          data: filledChartData.map(datapoint => datapoint.normalPrice),
          fill: false,
          borderColor: chartColors[0],
          backgroundColor: lightenDarkenColor(chartColors[0], 40),
          lineTension: 0
        },
        {
          label: this.props.intl.formatMessage({id: 'offer_price'}),
          data: filledChartData.map(datapoint => datapoint.offerPrice),
          fill: false,
          borderColor: chartColors[1],
          backgroundColor: lightenDarkenColor(chartColors[1], 40),
          lineTension: 0
        }];

      const cellMonthlyPaymentData = filledChartData.map(datapoint => datapoint.cellMonthlyPayment);

      if (cellMonthlyPaymentData.some(x => x)) {
        datasets.push({
          label: this.props.intl.formatMessage({id: 'cell_monthly_payment'}),
          data: cellMonthlyPaymentData,
          fill: false,
          borderColor: chartColors[2],
          backgroundColor: lightenDarkenColor(chartColors[2], 40),
          lineTension: 0
        })
      }

      const chartData = {
        labels: filledChartData.map(datapoint => datapoint.timestamp),
        datasets: datasets
      };

      chart = <div id="chart-container" className="flex-grow"><Line data={chartData} options={chartOptions} /></div>
    }

    const entityCreationDate = moment(entity.creationDate).startOf('day');
    const todayMinus30Days = moment().startOf('day').subtract(30, 'days');

    let dateRangeInitialMin = entityCreationDate;
    if (entityCreationDate.isBefore(todayMinus30Days)) {
      dateRangeInitialMin = todayMinus30Days;
    }

    const dateRangeInitialMax = moment().startOf('day')

    const endpoint = `${settings.apiResourceEndpoints.entity_histories}?entities=${entity.id}`;
    const displayOptions = [
      {
        id: 0,
        name: <FormattedMessage id="all_masculine" defaultMessage={`All`} />,
      },
      {
        id: 1,
        name: <FormattedMessage id="available_only" defaultMessage={`Only when available`} />,
      },
    ];

    const dateRangeTooltip = <div>
      <FormattedMessage id="entity_price_history_date_rage" defaultMessage="Date range for the chart. The minimum value is the entity's detection date" /> ({moment(entity.creationDate).format('ll')})
    </div>;

    const currencyTooltip = <FormattedMessage id="entity_price_history_currency" defaultMessage="The price points are converted to this currency. The values are calculated using standard exchange rates" />;

    const displayTooltip =
        <dl>
          <dt><FormattedMessage id="all_masculine" defaultMessage="All" /></dt>
          <dd>
            <FormattedMessage id="entity_price_history_display_all" defaultMessage="All price points are displayed, whether the entity was available for purchase at the time or not" />
          </dd>
          <dt><FormattedMessage id="available_only" defaultMessage="Only when available" /></dt>
          <dd>
            <FormattedMessage id="entity_price_history_display_available_only" defaultMessage="Only show a particular price point if the entity was available for purchase at that time" />
          </dd>
        </dl>;

    return (
        <div className="animated fadeIn d-flex flex-column">
          <div className="card">
            <div className="card-header"><strong><FormattedMessage id="filters" defaultMessage={`Filters`} /></strong></div>
            <div className="card-block">
              <ApiForm
                  endpoint={endpoint}
                  onResultsChange={this.setChartData}
                  observedObjects={[this.props.apiResourceObject]}
                  observedObjectsField="last_pricing_update"
                  onObservedObjectChange={this.handleObservedObjectChange}
              >
                <DateRangeField
                    name="timestamp"
                    label={<FormattedMessage id="date_range_from_to" defaultMessage='Date range (from / to)' />}
                    classNames="col-12 col-sm-12 col-md-10 col-lg-5 col-xl-4"
                    min={entityCreationDate}
                    tooltipContent={dateRangeTooltip}
                    initial={[dateRangeInitialMin, dateRangeInitialMax]}
                />
                <ChoiceField
                    name="currency"
                    label={<FormattedMessage id="currency" defaultMessage={`Currency`} />}
                    classNames="col-12 col-sm-6 col-md-5 col-lg-3 col-xl-3"
                    choices={this.currencyOptions}
                    searchable={false}
                    tooltipContent={currencyTooltip}
                />
                <ChoiceField
                    name="availableOnly"
                    label={<FormattedMessage id="display" defaultMessage={`Display`} />}
                    classNames="col-12 col-sm-6 col-md-5 col-lg-3 col-xl-3"
                    choices={displayOptions}
                    searchable={false}
                    tooltipContent={displayTooltip}
                />
              </ApiForm>
            </div>
          </div>
          <div className="card d-flex flex-column flex-grow">
            <div className="card-header"><strong><FormattedMessage id="result" defaultMessage={`Result`} /></strong></div>
            <div className="card-block d-flex flex-column">
              {chart}
            </div>
          </div>
        </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    currencies: filterApiResourceObjectsByType(state.apiResourceObjects, 'currencies'),
    preferredCurrency: state.apiResourceObjects[state.apiResourceObjects[settings.ownUserUrl].preferred_currency],
    preferredNumberFormat: state.apiResourceObjects[state.apiResourceObjects[settings.ownUserUrl].preferred_number_format]
  }
}

export default injectIntl(withRouter(connect(
    addApiResourceStateToPropsUtils(mapStateToProps),
    addApiResourceDispatchToPropsUtils())(EntityDetailPriceHistory)));