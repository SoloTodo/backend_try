import React, {Component} from 'react'
import {Pie} from "react-chartjs-2";
import {connect} from "react-redux";
import Loading from "../components/Loading";
import {addApiResourceStateToPropsUtils} from "../ApiResource";
import {chartColors} from "../colors";

class ApiFormResultPieChart extends Component {
  render() {
    if (!this.props.data) {
      return <Loading />
    }

    const field = this.props.label_field;

    const data = this.props.data.map(datapoint => this.props.ApiResourceObject(datapoint));

    const dataField = this.props.data_field || 'count';

    const chartData = {
      datasets: [{
        data: data.map(datapoint => datapoint[dataField]),
        backgroundColor: data.map((datapoint, index) => chartColors[index % chartColors.length]),
      }],
      labels: data.map(datapoint => datapoint[field].name)
    };

    const chartOptions = {
      legend: {
        display: false
      },
      responsive: true
    };

    return (
        <div className="row">
          <div className="col-12 col-xl-8">
            <Pie data={chartData} options={chartOptions} />
          </div>
          <div className="col-12 col-xl-4">
            <table className="table table-striped">
              <thead>
              <tr>
                <th>{this.props.label}</th>
                <th>{this.props.column_header}</th>
              </tr>
              </thead>
              <tbody>
              {data.map(datapoint => (
                  <tr key={datapoint[field].id}>
                    <td>{datapoint[field].name}</td>
                    <td>{this.props.column_value_formatter ? this.props.column_value_formatter(datapoint[dataField]) : datapoint[dataField]}</td>
                  </tr>
              ))}
              </tbody>
            </table>
          </div>
        </div>
    )
  }
}

export default connect(
    addApiResourceStateToPropsUtils()
)(ApiFormResultPieChart)
