import React, { Component } from 'react';
import {connect} from "react-redux";
import {
  addApiResourceDispatchToPropsUtils,
  addApiResourceStateToPropsUtils, filterApiResourcesByType
} from "../../ApiResource";
import {Line} from 'react-chartjs-2';
import 'datejs';
import {FormattedMessage} from "react-intl";
import {withRouter} from "react-router-dom";
import Loading from "../../components/Loading";
import {camelize} from "../../utils";
import './EntityDetailPriceHistory.css'
import {createOption, createOptions} from "../../form_utils";
import Select from "react-select";
import queryString from 'query-string';
import {settings} from "../../settings";
import {chartColors, lightenDarkenColor} from "../../colors"

const displayOptions = [
  {
    value: 'all',
    label: <FormattedMessage id="all" defaultMessage={`All`} />
  },
  {
    value: 'only_available',
    label: <FormattedMessage id="only_available" defaultMessage={`Only when available`} />
  },
];


class EntityDetailPriceHistory extends Component {
  constructor(props) {
    super(props);

    this.state = {
      chart: {
        data: undefined,
        startDate: undefined,
        endDate: undefined
      },
      formData: this.parseUrlArgs(window.location)
    }
  }

  parseUrlArgs = (location) => {
    const parameters = queryString.parse(location.search);

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

    // Start date
    let startDate = parameters['start_date'];

    if (dateRegex.test(startDate)) {
      startDate = Date.parse(startDate)
    } else {
      startDate = Date.today().addDays(-30)
    }

    // End date
    let endDate = parameters['end_date'];

    if (dateRegex.test(endDate)) {
      endDate = Date.parse(endDate)
    } else {
      endDate = Date.today()
    }

    if (startDate.compareTo(endDate) === 1) {
      endDate = startDate;
    }

    // Display
    let display = parameters['display'];

    display = displayOptions.filter(option => option.value === display)[0];
    if (!display) {
      display = displayOptions[0]
    }

    // Currency
    let currency = parseInt(parameters['currency'], 10);
    const currencyOptions = createOptions(this.props.currencies);

    currency = currencyOptions.filter(option => option.value === currency)[0];
    if (!currency) {
      currency = createOption(this.props.ApiResource(this.props.resourceObject).currency)
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
    const newDate = Date.parse(event.target.value);

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

    if (pushLocation) {
      const historySearch = this.props.history.location.pathname + `?display=${formData.display.value}&currency=${formData.currency.value}&start_date=${startDate.toString('yyyy-MM-dd')}&end_date=${endDate.toString('yyyy-MM-dd')}`;
      this.props.history.push(historySearch)
    }

    const endpoint = settings.resourceEndpoints.entity_histories + `?date_0=${startDate.toString('yyyy-MM-dd')}&date_1=${endDate.toString('yyyy-MM-dd')}&entities=${this.props.resourceObject.id}`;

    this.props.fetchAuth(endpoint).then(json => {
      this.setState({
        chart: {
          startDate,
          endDate,
          data: json['results']
        }
      })
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

  fillPriceHistoriesMissingDates() {
    const result = [];
    let lastPriceHistorySeen = undefined;

    for (const priceHistory of this.state.chart.data) {
      if (typeof lastPriceHistorySeen !== 'undefined') {
        const targetDate = new Date(priceHistory.timestamp).clearTime();
        let iterDate = new Date(lastPriceHistorySeen.timestamp).clearTime().addDays(1);

        while (iterDate < targetDate) {
          result.push({
            timestamp: iterDate,
            normal_price: NaN,
            offer_price: NaN,
            cell_monthly_payment: NaN
          });

          iterDate = iterDate.addDays(1)
        }

      }
      lastPriceHistorySeen = priceHistory;
      result.push(priceHistory);
    }

    return result;
  }

  render() {
    const entity = this.props.ApiResource(this.props.resourceObject);

    const currencyPriority = (currency) => {
      switch(currency.id) {
        case entity.currency.id: return 1;
        case this.props.preferredCurrency.id: return 2;
        default: return 3
      }
    };

    const sortedCurrencies = [...this.props.currencies];
    sortedCurrencies.sort((a, b) => {
      return currencyPriority(a) - currencyPriority(b)
    });
    const currencyOptions = createOptions(sortedCurrencies);

    let chart = <Loading />;

    if (this.state.chart.data) {
      const maxValue = this.state.chart.data.reduce((acum, datapoint) => {
        return Math.max(acum, datapoint.normal_price, datapoint.offer_price, datapoint.cell_monthly_payment)
      }, 0);

      const chartEndDate = new Date(this.state.chart.endDate).addDays(1);

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
              min: this.state.chart.startDate,
              max: chartEndDate,
              unit: 'day'
            }
          }],
          yAxes: [{
            ticks: {
              beginAtZero: true,
              suggestedMax: maxValue * 1.1,
            }
          }]
        },
        legend: {
          position: 'bottom',
          text: 'foo'
        },
        maintainAspectRatio: false
      };

      const filledChartData = this.fillPriceHistoriesMissingDates();

      const chartData = {
        labels: filledChartData.map(datapoint => new Date(datapoint.timestamp)),
        datasets: [
          {
            label: 'Normal price',
            data: filledChartData.map(datapoint => datapoint.normal_price),
            fill: false,
            borderColor: chartColors[0],
            backgroundColor: lightenDarkenColor(chartColors[0], 40)
          },
          {
            label: 'Offer price',
            data: filledChartData.map(datapoint => datapoint.offer_price),
            fill: false,
            borderColor: chartColors[1],
            backgroundColor: lightenDarkenColor(chartColors[1], 40)
          },
          {
            label: 'Cell monthly payment',
            data: filledChartData.map(datapoint => datapoint.cell_monthly_payment),
            fill: false,
            borderColor: chartColors[2],
            backgroundColor: lightenDarkenColor(chartColors[2], 40)
          }
        ]
      };

      chart = <Line height={400} data={chartData} options={chartOptions} />
    }

    return (
        <div className="animated fadeIn">
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-header"><strong><FormattedMessage id="chart" defaultMessage={`Chart`} /></strong></div>
                <div className="card-block">
                  <div className="row">
                    <div className="col-12 col-sm-6 col-md-4 col-lg-3 col-xl-2">
                      <div className="form-group">
                        <label htmlFor="start_date">Start date</label>
                        <input type="date" className="form-control"
                               name="start_date" id="start_date"
                               required={true}
                               value={this.state.formData.startDate.toString('yyyy-MM-dd')}
                               onChange={this.handleDateChange}
                        />
                      </div>
                    </div>
                    <div className="col-12 col-sm-6 col-md-4 col-lg-3 col-xl-2">
                      <div className="form-group">
                        <label htmlFor="start_date">End date</label>
                        <input type="date" className="form-control"
                               name="end_date"
                               id="end_date"
                               min={this.state.formData.startDate.toString('yyyy-MM-dd')}
                               required={true}
                               value={this.state.formData.endDate.toString('yyyy-MM-dd')}
                               onChange={this.handleDateChange} />
                      </div>
                    </div>
                    <div className="col-12 col-sm-6 col-md-4 col-lg-3 col-xl-3">
                      <div className="form-group">
                        <label htmlFor="currency">Currency</label>
                        <Select
                            id="currency"
                            options={currencyOptions}
                            value={this.state.formData.currency}
                            onChange={val => this.handleValueChange('currency', val)}
                            clearable={false}
                        />
                      </div>
                    </div>
                    <div className="col-12 col-sm-6 col-md-4 col-lg-3 col-xl-3">
                      <div className="form-group">
                        <label htmlFor="display">Display</label>
                        <Select
                            id="display"
                            options={displayOptions}
                            value={this.state.formData.display}
                            onChange={val => this.handleValueChange('display', val)}
                            clearable={false}
                        />
                      </div>
                    </div>
                    <div className="col-12 col-sm-4 col-xl-2">
                      <div className="form-group">
                        <label className="hidden-sm-down">&nbsp;</label>
                        <button type="button" id="update-button" className="btn btn-primary"
                                onClick={() => this.updateChartData(true)}>
                          Update
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-header"><strong><FormattedMessage id="chart" defaultMessage={`Chart`} /></strong></div>
                <div className="card-block">
                  {chart}
                </div>
              </div>
            </div>
          </div>
        </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    currencies: filterApiResourcesByType(state.apiResources, 'currencies'),
    preferredCurrency: state.apiResources[state.apiResources[settings.ownUserUrl].preferred_currency],
    preferredNumberFormat: state.apiResources[state.apiResources[settings.ownUserUrl].preferred_number_format]
  }
}

export default withRouter(connect(
    addApiResourceStateToPropsUtils(mapStateToProps),
    addApiResourceDispatchToPropsUtils())(EntityDetailPriceHistory));