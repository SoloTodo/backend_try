import React, {Component} from 'react'
import {fillTimeLapse} from "../../utils";
import {chartColors} from "../../colors";
import {Line} from "react-chartjs-2";
import moment from "moment";
import Loading from "../../components/Loading";

class LeadStatsTimelapse extends Component {
  render() {
    if (!this.props.data) {
      return <Loading />
    }

    const data = this.props.data.map(datapoint => ({
      ...datapoint,
      date: moment(datapoint.date)
    }));

    const chartData = fillTimeLapse(
        data,
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
        data: chartData.map(x => x.count),
        // fill: false,
        borderColor: chartColors[1],
        backgroundColor: 'rgba(182, 217, 87, 0.3)',
      }
    ];

    const lineChartData = {
      labels: chartData.map(datapoint => datapoint.date),
      datasets: datasets
    };

    return <Line data={lineChartData} options={chartOptions} />
  }
}

export default LeadStatsTimelapse