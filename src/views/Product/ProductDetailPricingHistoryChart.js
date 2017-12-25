import React, {Component} from 'react';
import Loading from "../../components/Loading";
import {Line} from 'react-chartjs-2';
import {addApiResourceStateToPropsUtils} from "solotodo-react-utils";
import connect from "react-redux/es/connect/connect";
import {chartColors, lightenDarkenColor} from "../../colors"
import {convertToDecimal, formatCurrency} from "solotodo-react-utils";
import {injectIntl} from "react-intl";
import './ProductDetailPricingHistoryChart.css'
import moment from "moment";

class ProductDetailPricingHistoryChart extends Component {
  preparePricingHistoryChartData() {
    const priceField = `${this.props.chart.priceType.id}Price`;

    const currency = this.props.chart.currency && this.props.ApiResourceObject(this.props.chart.currency);
    const exchangeRate = this.props.chart.currency && convertToDecimal(this.props.chart.currency.exchange_rate);

    let result = [];

    for (const datapoint of this.props.chart.data) {
      const entity = this.props.ApiResourceObject(datapoint.entity);

      const entityCurrencyExchangeRate = convertToDecimal(entity.currency.exchangeRate);

      let lastTimestampSeen = undefined;

      let pricingHistory = [];

      for (const entityHistory of datapoint.pricingHistory) {
        const timestamp = moment(entityHistory.timestamp);

        if (lastTimestampSeen) {
          pricingHistory = pricingHistory.concat(this.fillTimeLapse(lastTimestampSeen, timestamp))
        }

        let price = entityHistory[priceField];
        let formattedPrice = undefined;

        if (exchangeRate) {
          price *= exchangeRate / entityCurrencyExchangeRate;
          formattedPrice = this.props.formatCurrency(price, currency)
        } else {
          formattedPrice = this.props.formatCurrency(price, entity.currency)
        }

        lastTimestampSeen = timestamp;

        pricingHistory.push({
          entity,
          price,
          formattedPrice,
          timestamp,
        })
      }

      result.push({
        entity,
        pricingHistory
      })
    }

    return result;
  }

  makeEmptyDatapoint = (date) => {
    return {
      timestamp: date,
      price: NaN,
    };
  };

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
    if (!this.props.chart) {
      return <Loading />;
    }

    const product = this.props.ApiResourceObject(this.props.product);
    const filledChartData = this.preparePricingHistoryChartData();

    const maxPriceValue = filledChartData.reduce((acum, datapoint) => {
      const localMax = datapoint.pricingHistory.reduce((localAcum, pricePoint) => Math.max(localAcum, pricePoint.price || 0), 0);
      return Math.max(acum, localMax)
    }, 0);

    const currency = this.props.chart.currency && this.props.ApiResourceObject(this.props.chart.currency);
    const preferredNumberFormat = this.props.preferredNumberFormat;

    const yAxes = [
      {
        id: 'price-axis',
        ticks: {
          // beginAtZero: true,
          suggestedMax: maxPriceValue * 1.1,
          callback: function (value, index, values) {
            if (currency) {
              return formatCurrency(value, currency, null,
                  preferredNumberFormat.thousands_separator,
                  preferredNumberFormat.decimal_separator);
            } else {
              return value
            }
          }
        }
      }
    ];

    const endDate = this.props.chart.endDate.clone().add(1, 'days');

    const datasets = filledChartData.map((dataset, idx) => {
      const color = chartColors[idx % chartColors.length];

      let datasetLabel = dataset.entity.store.name;
      if (dataset.entity.cellPlan) {
        datasetLabel += ` (${dataset.entity.cellPlan.name})`
      }

      return {
        label: datasetLabel,
        data: dataset.pricingHistory.map(datapoint => ({x: datapoint.timestamp, y: datapoint.price.toString(), formattedPrice: datapoint.formattedPrice, store: dataset.entity.store.name, cellPlan: dataset.entity.cellPlan})),
        fill: false,
        borderColor: color,
        backgroundColor: lightenDarkenColor(color, 40),
        lineTension: 0
      }
    });

    const chartOptions = {
      title: {
        display: true,
        text: product.name
      },
      scales: {
        xAxes: [{
          type: 'time',
          time: {
            min: this.props.chart.startDate.format('YYYY-MM-DD'),
            max: endDate.format('YYYY-MM-DD'),
            displayFormats: {
              day: 'MMM DD'
            },
            unit: 'day'
          }
        }],
        yAxes: yAxes
      },
      legend: {
        position: 'bottom'
      },
      maintainAspectRatio: false,
      tooltips: {
        callbacks: {
          title: (tooltipItems, data) => {
            return tooltipItems.length && tooltipItems[0].xLabel.format('llll')
          },
          label: (tooltipItem, data) => {
            const datapoint = data.datasets[tooltipItem.datasetIndex].data[0];
            if (datapoint.cellPlan) {
              return `${datapoint.store} (${datapoint.cellPlan.name}): ${datapoint.formattedPrice}`
            } else {
              return `${datapoint.store}: ${datapoint.formattedPrice}`
            }
          }
        },
        mode: 'nearest',
        intersect: false,
        // position: 'nearest'
      }
    };

    const chartData = {
      datasets: datasets
    };

    return <div id="chart-container" className="flex-grow">
      <Line data={chartData} options={chartOptions} />
    </div>
  }

}

export default injectIntl(connect(
    addApiResourceStateToPropsUtils())(ProductDetailPricingHistoryChart));

