import React, { Component } from 'react';
import DashboardStoreEntityVisitsChart from "./DashboardStoreEntityVisitsChart";
import DashboardBestSellingEntities from "./DashboardBestSellingEntities";

class Dashboard extends Component {

  render() {
    document.title = 'Dashboard - SoloTodo';

    return (
        <div className="animated fadeIn">
          <div className="row">
            <DashboardStoreEntityVisitsChart />
            <DashboardBestSellingEntities />
          </div>
        </div>
    )
  }
}

export default Dashboard;
