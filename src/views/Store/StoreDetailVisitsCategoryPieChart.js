import React, {Component} from 'react'
import {Pie} from "react-chartjs-2";
import Loading from "../../components/Loading";
import {chartColors} from "../../colors";

class StoreDetailVisitsCategoryPieChart extends Component {
  render() {
    if (!this.props.data) {
      return <Loading />
    }

    const sortedData = [...this.props.data];
    sortedData.sort((a, b) => b.count - a.count);

    const data = {
      datasets: [{
        data: sortedData.map(datapoint => datapoint.count),
        backgroundColor: sortedData.map((datapoint, index) => chartColors[index % chartColors.length]),
        label: 'Category'
      }],
      labels: sortedData.map(datapoint => datapoint.category.name)
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
            <Pie data={data} options={chartOptions} />
          </div>
          <div className="col-12 col-xl-4">
            <table className="table table-striped">
              <thead>
              <tr>
                <th>Category</th>
                <th>Count</th>
              </tr>
              </thead>
              <tbody>
              {sortedData.map(datapoint => (
                  <tr key={datapoint.category.id}>
                    <td>{datapoint.category.name}</td>
                    <td>{datapoint.count}</td>
                  </tr>
              ))}
              </tbody>
            </table>
          </div>
        </div>
    )
  }
}

export default StoreDetailVisitsCategoryPieChart;