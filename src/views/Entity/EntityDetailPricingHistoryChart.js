import React, {Component} from 'react';
import Loading from "../../components/Loading";
import {Line} from 'react-chartjs-2';
import {addApiResourceStateToPropsUtils} from "../../ApiResource";
import connect from "react-redux/es/connect/connect";
import {chartColors, lightenDarkenColor} from "../../colors"
import {formatCurrency} from "../../utils";
import {settings} from "../../settings";
import {injectIntl} from "react-intl";
import './EntityDetailPricingHistoryChart.css'
import moment from "moment";

class EntityDetailPricingHistoryChart extends Component {
  preparePricingHistoryChartData() {
    const entity = this.props.ApiResourceObject(this.props.entity);
    const targetCurrency = this.props.chart.currency;
    const exchangeRate =
        targetCurrency.exchange_rate /
        entity.currency.exchangeRate;

    let initiallyAvailable = false;
    let includesStockInfo = false;
    if (this.props.chart.data.length) {
      initiallyAvailable = this.props.chart.data[0].isAvailable;
      includesStockInfo = typeof(this.props.chart.data[0].stock) !== 'undefined'
    }

    const datapoints = [
      this.makeEmptyDatapoint(this.props.chart.startDate, initiallyAvailable, includesStockInfo),
      ...this.props.chart.data,
      this.makeEmptyDatapoint(moment(this.props.chart.endDate).add(1, 'days'), initiallyAvailable, includesStockInfo),
    ];

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

    const maxValue = filledChartData.reduce((acum, datapoint) => {
      return Math.max(acum, datapoint.normalPrice || 0, datapoint.offerPrice || 0, datapoint.cellMonthlyPayment || 0)
    }, 0);

    const currency = this.props.ApiResourceObject(this.props.chart.currency);
    const preferredNumberFormat = this.props.preferredNumberFormat;

    const includesStockInfo = this.props.chart.data.some(datapoint => Boolean(datapoint.stock));

    const yAxes = [
      {
        id: 'price-axis',
        ticks: {
          beginAtZero: true,
          suggestedMax: maxValue * 1.1,
          callback: function (value, index, values) {
            return formatCurrency(value, currency, null,
                preferredNumberFormat.thousands_separator,
                preferredNumberFormat.decimal_sepator)
          }
        }
      },
      {
        id: 'availability-axis',
        display: false,
        ticks: {
          beginAtZero: true,
          max: 1,
        }
      }
    ];

    if (includesStockInfo) {
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
      )
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
          title: (tooltipItems, data) => {
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
      }];

    const cellMonthlyPaymentData = filledChartData.map(datapoint => datapoint.cellMonthlyPayment);

    if (cellMonthlyPaymentData.some(x => x)) {
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

    if (includesStockInfo) {
      datasets.push({
        label: this.props.intl.formatMessage({id: 'stock'}),
        data: filledChartData
            .map(datapoint => datapoint.stock > 0 ? datapoint.stock : NaN),
        yAxisID: 'stock-axis',
        fill: false,
        borderColor: chartColors[1],
        backgroundColor: lightenDarkenColor(chartColors[1], 40),
        lineTension: 0
      })
    }

    datasets.push({
      label: this.props.intl.formatMessage({id: 'available'}),
      data: filledChartData.map(datapoint => datapoint.isAvailable),
      yAxisID: 'availability-axis',
      customId: 'availability',
      fill: true,
      borderColor: 'rgba(182, 217, 87, 0)',
      backgroundColor:  'rgba(182, 217, 87, 0.15)',
      lineTension: 0,
      pointRadius: 0,
      steppedLine: 'before'
    });

    datasets.push({
      label: this.props.intl.formatMessage({id: 'unavailable'}),
      data: filledChartData.map(datapoint => 1 - datapoint.isAvailable),
      yAxisID: 'availability-axis',
      fill: true,
      borderColor: 'rgba(255, 0, 0, 0)',
      backgroundColor:  'rgba(255, 0, 0, 0.1)',
      lineTension: 0,
      pointRadius: 0,
      steppedLine: 'before'
    });

    const chartData = {
      labels: filledChartData.map(datapoint => datapoint.timestamp),
      datasets: datasets
    };

    return <div id="chart-container" className="flex-grow">
      <Line data={chartData} options={chartOptions} />
    </div>
  }

}

function mapStateToProps(state) {
  return {
    preferredNumberFormat: state.apiResourceObjects[state.apiResourceObjects[settings.ownUserUrl].preferred_number_format]
  }
}

export default injectIntl(connect(
    addApiResourceStateToPropsUtils(mapStateToProps))(EntityDetailPricingHistoryChart));

