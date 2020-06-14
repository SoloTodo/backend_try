import React, {Component} from 'react';
import {FormattedMessage} from "react-intl";
import {
  apiResourceStateToPropsUtils
} from "../../react-utils/ApiResource";
import {chartColors} from "../../react-utils/colors";
import {connect} from "react-redux";
import {settings} from "../../settings";
import moment from "moment";
import {fillTimeLapse} from "../../react-utils/utils";
import Loading from "../../components/Loading";
import {Line} from "react-chartjs-2";
import './DashboardStoreLeadsChart.css'
import {Link} from "react-router-dom";
import {backendStateToPropsUtils} from "../../utils";

class DashboardStoreLeadsChart extends Component {
  constructor(props) {
    super(props);

    this.state = {
      chartData: undefined
    }
  }

  componentWillMount() {
    const user = this.props.ApiResourceObject(this.props.user);

    if (!user.preferredStoreUrl) {
      return
    }

    const tomorrow = moment().add(1, 'days').startOf('day');
    const oneWeekAgo = moment().subtract(7, 'days').startOf('day');

    const endpointParams = `timestamp_after=${oneWeekAgo.toISOString()}&timestamp_before=${tomorrow.toISOString()}&stores=${user.preferredStore.id}&grouping=date`;

    const endpoint = `${settings.apiResourceEndpoints.leads}grouped/?${endpointParams}`;

    this.props.fetchAuth(endpoint).then(json => {
      let chartData = json.map(entry => ({
        ...entry,
        date: moment(entry.date)
      }));

      chartData = fillTimeLapse(chartData, oneWeekAgo, moment().startOf('day'), 'date', 'count', 0);

      this.setState({
        chartData
      })
    })
  }

  render() {
    const user = this.props.ApiResourceObject(this.props.user);

    if (!user.preferredStoreUrl) {
      return null
    }

    let chart = undefined;

    if (this.state.chartData) {
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
          data: this.state.chartData.map(x => x.count),
          // fill: false,
          borderColor: chartColors[1],
          backgroundColor: 'rgba(182, 217, 87, 0.3)',
        }
      ];

      const lineChartData = {
        labels: this.state.chartData.map(datapoint => datapoint.date),
        datasets: datasets
      };

      chart = <div id="dashboard-store-entity-visit-chart-container" className="flex-grow mt-3">
        <Line data={lineChartData} options={chartOptions} />
      </div>
    }

    return (
        <div className="col-12">
          <div className="card">
            <div className="card-body card-block">
              <div className="row">
                <div className="col-12 col-sm-8">
                  <h4 className="mb-0 card-title">
                    <FormattedMessage id="traffic_from_solotodo" defaultMessage="Traffic from SoloTodo.com"/>
                  </h4>
                  <div className="small text-muted">
                    <FormattedMessage id="last_7_days" defaultMessage="Last 7 days"/>
                  </div>
                </div>
                <div className="col-12 col-sm-4 text-right">
                  <Link to={'/leads/stats?stores=' + user.preferredStore.id} className="btn btn-info mr-3">
                    <FormattedMessage id="view_full_report" defaultMessage="View full report"/>
                  </Link>
                </div>
              </div>
              <div className="row">
                <div className="col-12">
                  {chart ? chart : <Loading />}
                </div>
              </div>
            </div>
          </div>
        </div>
    )
  }
}


function mapStateToProps(state) {
  const {ApiResourceObject, fetchAuth} = apiResourceStateToPropsUtils(state);
  const {user} = backendStateToPropsUtils(state);

  return {
    ApiResourceObject,
    fetchAuth,
    user
  }
}

export default connect(mapStateToProps)(DashboardStoreLeadsChart);
