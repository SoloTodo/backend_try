import React, {Component} from 'react'
import {fillTimeLapse} from "../../utils";
import Loading from "../../components/Loading";
import {chartColors} from "../../colors";
import {Line} from "react-chartjs-2";

class StoreDetailVisitsTimelapse extends Component {
  render() {
    if (!this.props.data) {
      return <Loading />
    }

    const data = fillTimeLapse(
        this.props.data,
        this.props.startDate,
        this.props.endDate,
        'date',
        'count',
        0
    );

    const chartOptions = {
      legend: {
        display: false
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
            maxTicksLimit: 5
          },
        }]
      },
      maintainAspectRatio: false,
    };

    const datasets = [
      {
        label: 'Visits',
        data: data.map(x => x.count),
        // fill: false,
        borderColor: chartColors[1],
        backgroundColor: 'rgba(182, 217, 87, 0.3)',
      }
    ];

    const lineChartData = {
      labels: data.map(datapoint => datapoint.date),
      datasets: datasets
    };

    return <Line data={lineChartData} options={chartOptions} />
  }
}

export default StoreDetailVisitsTimelapse