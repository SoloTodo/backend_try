import React, { Component } from 'react';
import {connect} from "react-redux";
import {
  addApiResourceDispatchToPropsUtils,
  addApiResourceStateToPropsUtils, filterApiResourceObjectsByType
} from "../../ApiResource";
import {Line} from 'react-chartjs-2';
import {
  UncontrolledTooltip
} from 'reactstrap';
import moment from 'moment';
import {FormattedMessage, injectIntl} from "react-intl";
import {withRouter} from "react-router-dom";
import Loading from "../../components/Loading";
import {camelize, convertToDecimal, formatCurrency} from "../../utils";
import './EntityDetailPriceHistory.css'
import {createOption, createOptions} from "../../form_utils";
import Select from "react-select";
import queryString from 'query-string';
import {settings} from "../../settings";
import {chartColors, lightenDarkenColor} from "../../colors"

const displayOptions = [
  {
    value: 'all',
    label: <FormattedMessage id="all_masculine" defaultMessage={`All`} />,
    apiValue: 0,
  },
  {
    value: 'available_only',
    label: <FormattedMessage id="available_only" defaultMessage={`Only when available`} />,
    apiValue: 1
  },
];

class EntityDetailPriceHistory extends Component {
  constructor(props) {
    super(props);

    this.entity = this.props.ApiResourceObject(this.props.resourceObject);

    const sortedCurrencies = this.props.currencies.map(currency => {
      let priority = 3;
      let name = currency.name;

      if (currency.id === this.entity.currency.id) {
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
    this.currencyOptions = createOptions(sortedCurrencies);

    this.state = {
      chart: {
        data: undefined,
        startDate: undefined,
        endDate: undefined,
        currency: undefined
      },
      formData: this.parseUrlArgs(window.location),
      modal: false
    };
  }

  parseUrlArgs = (location) => {
    const parameters = queryString.parse(location.search);

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const entityCreationDate = moment(this.entity.creationDate).startOf('day');
    const today = moment().startOf('day');
    const todayMinus30Days = moment().subtract(30, 'days').startOf('day');

    const suggestedStartDate = entityCreationDate.isAfter(todayMinus30Days) ? entityCreationDate : todayMinus30Days;

    // Start date
    let startDate = parameters['start_date'];

    if (dateRegex.test(startDate)) {
      startDate = moment(startDate)
    } else  {
      startDate = suggestedStartDate
    }

    // End date
    let endDate = parameters['end_date'];

    if (dateRegex.test(endDate)) {
      endDate = moment(endDate)
    } else {
      endDate = today
    }

    // Validation of date combination

    if (startDate.isBefore(entityCreationDate) || endDate.isBefore(startDate) || today.isBefore(endDate)) {
      startDate = suggestedStartDate;
      endDate = today;
    }

    // Display
    let display = parameters['display'];

    display = displayOptions.filter(option => option.value === display)[0];
    if (!display) {
      display = displayOptions[0]
    }

    // Currency
    let currency = parseInt(parameters['currency'], 10);

    currency = this.currencyOptions.filter(option => option.value === currency)[0];
    if (!currency) {
      currency = createOption(this.currencyOptions[0])
    }

    return {
      startDate,
      endDate,
      display,
      currency
    };
  };

  handleDateChange = event => {
    const field = camelize((event.target.getAttribute('name')));
    const newDate = moment(event.target.value);

    this.setState({
      formData: {
        ...this.state.formData,
        [field]: newDate
      }
    })
  };

  handleValueChange = (field, val) => {
    this.setState({
      formData: {
        ...this.state.formData,
        [field]: val
      }
    })
  };

  updateChartData = (pushLocation=false) => {
    this.setState({
      chart: {
        ...this.state.chart,
        data: undefined,
      }
    });

    const formData = this.state.formData;
    const startDate = formData.startDate;
    const endDate = formData.endDate;
    const display = formData.display;

    if (pushLocation) {
      const historySearch = this.props.history.location.pathname + `?display=${display.value}&currency=${formData.currency.value}&start_date=${startDate.format('YYYY-MM-DD')}&end_date=${endDate.format('YYYY-MM-DD')}`;
      this.props.history.push(historySearch)
    }

    const offsetEndDate = endDate.clone().add(1, 'days')

    const endpoint = settings.apiResourceEndpoints.entity_histories + `?date_0=${startDate.format('YYYY-MM-DD')}&date_1=${offsetEndDate.format('YYYY-MM-DD')}&entities=${this.entity.id}&available_only=${display.apiValue}`;

    const currency = this.props.currencies.filter(currency => currency.id === formData.currency.value)[0];

    this.props.fetchAuth(endpoint).then(json => {
      const chartData = json['results'].map(entityHistory => ({
        timestamp: moment(entityHistory.timestamp),
        normalPrice: convertToDecimal(entityHistory.normal_price),
        offerPrice: convertToDecimal(entityHistory.offer_price),
        cellMonthlyPayment: convertToDecimal(entityHistory.cell_monthly_payment),
      }));

      this.setState({
        chart: {
          startDate,
          endDate: offsetEndDate,
          currency,
          data: chartData
        }
      });

      if (pushLocation) {
        // Only scroll to the chart when the actual form is submitted, not
        // when the page first loads
        document.getElementById('chart-container').scrollIntoView({behavior: 'smooth'})
      }
    })
  };

  componentDidMount() {
    this.updateChartData();
    this.unlistenHistory = this.props.history.listen(this.onHistoryChange);
  }

  componentWillUnmount() {
    this.unlistenHistory();
  }

  onHistoryChange = (location, action) => {
    if (action !== 'POP') {
      return
    }

    this.setState({
      formData: this.parseUrlArgs(location)
    }, this.updateChartData)
  };

  handleFormSubmit = (event) => {
    event.preventDefault();
    this.updateChartData(true);
  };

  preparePriceHistoryChartData() {
    const targetCurrency = this.state.chart.currency;
    const exchangeRate =
        targetCurrency.exchange_rate /
        this.entity.currency.exchangeRate;

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

  render() {
    let chart = <Loading />;

    if (this.state.chart.data) {
      const filledChartData = this.preparePriceHistoryChartData();

      const maxValue = filledChartData.reduce((acum, datapoint) => {
        return Math.max(acum, datapoint.normalPrice || 0, datapoint.offerPrice || 0, datapoint.cellMonthlyPayment || 0)
      }, 0);

      const currency = this.props.ApiResourceObject(this.state.chart.currency);
      const preferredNumberFormat = this.props.preferredNumberFormat;

      const chartOptions = {
        title: {
          display: true,
          text: `${this.entity.name} - ${this.entity.store.name}`
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
          backgroundColor: lightenDarkenColor(chartColors[0], 40)
        },
        {
          label: this.props.intl.formatMessage({id: 'offer_price'}),
          data: filledChartData.map(datapoint => datapoint.offerPrice),
          fill: false,
          borderColor: chartColors[1],
          backgroundColor: lightenDarkenColor(chartColors[1], 40)
        }];

      const cellMonthlyPaymentData = filledChartData.map(datapoint => datapoint.cellMonthlyPayment);

      if (cellMonthlyPaymentData.some(x => x)) {
        datasets.push({
          label: this.props.intl.formatMessage({id: 'cell_monthly_payment'}),
          data: cellMonthlyPaymentData,
          fill: false,
          borderColor: chartColors[2],
          backgroundColor: lightenDarkenColor(chartColors[2], 40)
        })
      }

      const chartData = {
        labels: filledChartData.map(datapoint => datapoint.timestamp),
        datasets: datasets
      };

      chart = <div id="chart-container" className="flex-grow"><Line data={chartData} options={chartOptions} /></div>
    }

    const entityCreationDate = moment(this.entity.creationDate).startOf('day');

    return (
        <div className="animated fadeIn d-flex flex-column">
          <UncontrolledTooltip placement="top" target="start_date_label">
            <FormattedMessage id="entity_price_history_start_date" defaultMessage="Starting date for the chart. The minimum value is the entity's detection date" /> ({moment(this.entity.creationDate).format('ll')})
          </UncontrolledTooltip>

          <UncontrolledTooltip placement="top" target="end_date_label">
            <FormattedMessage id="entity_price_history_end_date" defaultMessage="Ending date for the chart. The maximum value is today" />
          </UncontrolledTooltip>

          <UncontrolledTooltip placement="top" target="currency_label">
            <FormattedMessage id="entity_price_history_currency" defaultMessage="The price points are converted to this currency. The values are calculated using standard exchange rates" />
          </UncontrolledTooltip>

          <UncontrolledTooltip placement="top" target="display_label">
            <dl>
              <dt><FormattedMessage id="all_masculine" defaultMessage="All" /></dt>
              <dd>
                <FormattedMessage id="entity_price_history_display_all" defaultMessage="All price points are displayed, whether the entity was available for purchase at the time or not" />
              </dd>
              <dt><FormattedMessage id="available_only" defaultMessage="Only when available" /></dt>
              <dd>
                <FormattedMessage id="entity_price_history_display_available_only" defaultMessage="Only show a particular price point if the entity was available for purchase at that time" />
              </dd>
            </dl>
          </UncontrolledTooltip>

          <div className="card">
            <div className="card-header"><strong><FormattedMessage id="filters" defaultMessage={`Filters`} /></strong></div>
            <div className="card-block">
              <form onSubmit={this.handleFormSubmit}>
                <div className="row">
                  <div className="col-12 col-sm-6 col-md-4 col-lg-3 col-xl-2">
                    <div className="form-group">
                      <label id="start_date_label" className="dashed">
                        <FormattedMessage id="start_date" defaultMessage="Start date" />
                      </label>
                      <input type="date" className="form-control"
                             name="start_date" id="start_date"
                             required={true}
                             min={entityCreationDate.format('YYYY-MM-DD')}
                             max={this.state.formData.endDate.format('YYYY-MM-DD')}
                             value={this.state.formData.startDate.format('YYYY-MM-DD')}
                             onChange={this.handleDateChange}
                      />
                    </div>
                  </div>
                  <div className="col-12 col-sm-6 col-md-4 col-lg-3 col-xl-2">
                    <div className="form-group">
                      <label id="end_date_label" className="dashed">
                        <FormattedMessage id="end_date" defaultMessage="End date" />
                      </label>
                      <input type="date" className="form-control"
                             name="end_date"
                             id="end_date"
                             min={this.state.formData.startDate.format('YYYY-MM-DD')}
                             max={moment().startOf('day').format('YYYY-MM-DD')}
                             required={true}
                             value={this.state.formData.endDate.format('YYYY-MM-DD')}
                             onChange={this.handleDateChange} />
                    </div>
                  </div>
                  <div className="col-12 col-sm-6 col-md-4 col-lg-3 col-xl-3">
                    <div className="form-group">
                      <label htmlFor="currency" className="dashed" id="currency_label">
                        <FormattedMessage id="currency" defaultMessage="Currency" />
                      </label>
                      <Select
                          id="currency"
                          options={this.currencyOptions}
                          value={this.state.formData.currency}
                          onChange={val => this.handleValueChange('currency', val)}
                          clearable={false}
                          searchable={false}
                      />
                    </div>
                  </div>
                  <div className="col-12 col-sm-6 col-md-4 col-lg-3 col-xl-3">
                    <div className="form-group">
                      <label htmlFor="display" id="display_label" className="dashed">
                        <FormattedMessage id="display" defaultMessage="Display" />
                      </label>
                      <Select
                          id="display"
                          options={displayOptions}
                          value={this.state.formData.display}
                          onChange={val => this.handleValueChange('display', val)}
                          clearable={false}
                          searchable={false}
                      />
                    </div>
                  </div>
                  <div className="col-12 col-sm-4 col-xl-2">
                    <div className="form-group">
                      <label className="hidden-sm-down">&nbsp;</label>
                      <button type="submit" id="update-button" className="btn btn-primary">
                        <FormattedMessage id="update" defaultMessage="Update" />
                      </button>
                    </div>
                  </div>
                </div>
              </form>
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