import React, { Component } from 'react';
import DashboardStoreEntityVisitsChart from "./DashboardStoreEntityVisitsChart";

class Dashboard extends Component {

  render() {
    document.title = 'Dashboard - SoloTodo';

    return (
        <div className="animated fadeIn">
          <div className="row">
            <DashboardStoreEntityVisitsChart />
          </div>
        </div>
    )
  }
}

export default Dashboard;
