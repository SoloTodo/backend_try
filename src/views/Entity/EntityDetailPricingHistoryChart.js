import React, {Component} from 'react';
import Loading from "../../components/Loading";
import {Line} from 'react-chartjs-2';
import {
  apiResourceStateToPropsUtils,
} from "../../react-utils/ApiResource";
import {
  chartColors,
  lightenDarkenColor
} from "../../react-utils/colors";
import connect from "react-redux/es/connect/connect";
import {formatCurrency} from "../../react-utils/utils";
import {injectIntl} from "react-intl";
import './EntityDetailPricingHistoryChart.css'
import moment from "moment";
import {backendStateToPropsUtils} from "../../utils";

class EntityDetailPricingHistoryChart extends Component {
  preparePricingHistoryChartData() {
    const entity = this.props.ApiResourceObject(this.props.entity);
    const targetCurrency = this.props.chart.currency;

    const exchangeRate =
      targetCurrency.exchange_rate /
      entity.currency.exchangeRate;

    let initiallyAvailable = false;
    let includesStockInfo = false;
    const chartData = this.props.chart.data;

    if (chartData.length) {
      initiallyAvailable = chartData[0].isAvailable;
      includesStockInfo = typeof(chartData[0].stock) !== 'undefined'
    }

    const isCurrentlyAvailable = entity.activeRegistry && entity.activeRegistry.stock !== 0;

    const datapoints = [
      this.makeEmptyDatapoint(this.props.chart.startDate, initiallyAvailable, includesStockInfo),
      ...chartData,
    ];

    if (!isCurrentlyAvailable && chartData.length) {
      const lastDataPoint = chartData[chartData.length - 1];

      datapoints.push(this.makeEmptyDatapoint(moment(lastDataPoint.timestamp), false, includesStockInfo))
    }

    const lastPricingUpdate = moment(entity.lastPricingUpdate);

    if (lastPricingUpdate.isBefore(this.props.chart.endDate)) {
      datapoints.push(this.makeEmptyDatapoint(lastPricingUpdate, isCurrentlyAvailable, includesStockInfo))
    }

    datapoints.push(this.makeEmptyDatapoint(moment(this.props.chart.endDate).add(1, 'days'), initiallyAvailable, includesStockInfo));

    let lastPriceHistorySeen = undefined;

    let result = [];
    for (const pricingHistory of datapoints) {
      if (typeof lastPriceHistorySeen !== 'undefined') {
        result = result.concat(this.fillTimeLapse(
          lastPriceHistorySeen.timestamp, pricingHistory.timestamp, lastPriceHistorySeen.isAvailable, includesStockInfo))
      }
      lastPriceHistorySeen = pricingHistory;

      const subresult = {
        timestamp: pricingHistory.timestamp,
        normalPrice: pricingHistory.normalPrice * exchangeRate,
        offerPrice: pricingHistory.offerPrice * exchangeRate,
        cellMonthlyPayment: pricingHistory.cellMonthlyPayment * exchangeRate,
        isAvailable: Number(pricingHistory.isAvailable)
      };

      if (includesStockInfo) {
        subresult.stock = pricingHistory.stock
      }

      result.push(subresult);
    }

    return result;
  }

  makeEmptyDatapoint = (date, isAvailable, includesStockInfo) => {
    const result = {
      timestamp: date,
      normalPrice: NaN,
      offerPrice: NaN,
      cellMonthlyPayment: NaN,
      isAvailable: Number(isAvailable)
    };

    if (includesStockInfo) {
      result.stock = NaN
    }

    return result;
  };

  fillTimeLapse(startDate, endDate, isAvailable, includesStockInfo) {
    const result = [];
    const targetDate = endDate.clone().startOf('day');
    let iterDate = startDate.clone().add(1, 'days').startOf('day');

    while (iterDate < targetDate) {
      result.push(this.makeEmptyDatapoint(iterDate.clone(), isAvailable, includesStockInfo));
      iterDate.add(1, 'days')
    }

    return result;
  }

  render() {
    if (!this.props.chart) {
      return <Loading />;
    }

    const entity = this.props.ApiResourceObject(this.props.entity);
    const filledChartData = this.preparePricingHistoryChartData();

    const maxPriceValue = filledChartData.reduce((acum, datapoint) => {
      return Math.max(acum, datapoint.normalPrice || 0, datapoint.offerPrice || 0, datapoint.cellMonthlyPayment || 0)
    }, 0);

    const currency = this.props.ApiResourceObject(this.props.chart.currency);
    const preferredNumberFormat = this.props.preferredNumberFormat;

    const yAxes = [
      {
        id: 'price-axis',
        ticks: {
          beginAtZero: true,
          suggestedMax: maxPriceValue * 1.1,
          callback: value => {
            return formatCurrency(value, currency, null,
              preferredNumberFormat.thousands_separator,
              preferredNumberFormat.decimal_sepator)
          }
        }
      }

    ];

    const datasets = [
      {
        label: this.props.intl.formatMessage({id: 'normal_price'}),
        data: filledChartData.map(datapoint => datapoint.normalPrice),
        yAxisID: 'price-axis',
        fill: false,
        borderColor: '#0e85bf',
        backgroundColor: lightenDarkenColor('#0e85bf', 40),
        lineTension: 0
      },
      {
        label: this.props.intl.formatMessage({id: 'offer_price'}),
        data: filledChartData.map(datapoint => datapoint.offerPrice),
        yAxisID: 'price-axis',
        fill: false,
        borderColor: '#5CB9E6',
        backgroundColor: lightenDarkenColor('#5CB9E6', 40),
        lineTension: 0
      }
    ];

    const cellMonthlyPaymentData = filledChartData.map(datapoint => datapoint.cellMonthlyPayment);
    if (cellMonthlyPaymentData.some(x => Boolean(x))) {
      datasets.push({
        label: this.props.intl.formatMessage({id: 'cell_monthly_payment'}),
        data: cellMonthlyPaymentData,
        yAxisID: 'price-axis',
        fill: false,
        borderColor: chartColors[2],
        backgroundColor: lightenDarkenColor(chartColors[2], 40),
        lineTension: 0
      })
    }

    const stockData = filledChartData
      .map(datapoint => datapoint.stock > 0 ? datapoint.stock : NaN);
    if (stockData.some(x => Boolean(x))) {
      const maxStock = filledChartData.reduce((acum, datapoint) => {
        return Math.max(acum, datapoint.stock || 0)
      }, 0);

      yAxes.push(
        {
          id: 'stock-axis',
          position: 'right',
          ticks: {
            beginAtZero: true,
            suggestedMax: maxStock * 1.1
          },
          scaleLabel: {
            display: true,
            labelString: this.props.intl.formatMessage({id: 'stock'})
          },
          gridLines: {
            display: false
          }
        }
      );

      datasets.push({
        label: this.props.intl.formatMessage({id: 'stock'}),
        data: stockData,
        yAxisID: 'stock-axis',
        fill: false,
        borderColor: chartColors[1],
        backgroundColor: lightenDarkenColor(chartColors[1], 40),
        lineTension: 0
      })
    }

    const unavailabilityDataSetData = filledChartData.map(datapoint => 1 - datapoint.isAvailable);
    if (unavailabilityDataSetData.some(x => Boolean(x))) {
      yAxes.push({
        id: 'availability-axis',
        display: false,
        ticks: {
          beginAtZero: true,
          max: 1,
        }
      });

      datasets.push({
        label: this.props.intl.formatMessage({id: 'unavailable'}),
        data: filledChartData.map(datapoint => 1 - datapoint.isAvailable),
        yAxisID: 'availability-axis',
        fill: true,
        borderColor: 'rgba(217, 83, 79, 0)',
        backgroundColor:  'rgba(217, 83, 79, 0.15)',
        lineTension: 0,
        pointRadius: 0,
        steppedLine: 'before'
      })
    }

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
        yAxes: yAxes
      },
      legend: {
        position: 'bottom'
      },
      maintainAspectRatio: false,
      tooltips: {
        callbacks: {
          title: tooltipItems => {
            return tooltipItems.length && tooltipItems[0].xLabel.format('llll')
          },
          label: (tooltipItem, data) => {
            const yAxisId = data.datasets[tooltipItem.datasetIndex].yAxisID;
            if (yAxisId === 'price-axis') {
              const formattedCurrency = formatCurrency(
                tooltipItem.yLabel, currency, null,
                preferredNumberFormat.thousands_separator,
                preferredNumberFormat.decimal_separator);
              return `${data.datasets[tooltipItem.datasetIndex].label}: ${formattedCurrency}`
            }
            if (yAxisId === 'stock-axis') {
              return `${data.datasets[tooltipItem.datasetIndex].label}: ${tooltipItem.yLabel}`
            }
            if (yAxisId === 'stock-axis') {
              return `${data.datasets[tooltipItem.datasetIndex].label}: ${tooltipItem.yLabel}`
            }
          }
        },
        filter: function (tooltipItem, data) {
          const yAxisId = data.datasets[tooltipItem.datasetIndex].yAxisID;
          return yAxisId === 'price-axis' || yAxisId === 'stock-axis'
        },
        mode: 'index',
        intersect: false,
        position: 'nearest'
      }
    };

    const chartData = {
      labels: filledChartData.map(datapoint => datapoint.timestamp),
      datasets: datasets
    };

    return <div id="chart-container">
      <Line data={chartData} options={chartOptions} />
    </div>
  }

}

function mapStateToProps(state) {
  const {ApiResourceObject} = apiResourceStateToPropsUtils(state);
  const {preferredNumberFormat } = backendStateToPropsUtils(state);

  return {
    ApiResourceObject,
    preferredNumberFormat,
  }
}


export default injectIntl(connect(mapStateToProps)(EntityDetailPricingHistoryChart));