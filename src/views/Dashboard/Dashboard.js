import React, { Component } from 'react';
// import DashboardStoreLeadsChart from "./DashboardStoreLeadsChart";
// import DashboardBestSellingEntities from "./DashboardBestSellingEntities";

class Dashboard extends Component {

  render() {
    document.title = 'Dashboard - SoloTodo';

    return (
        <div className="animated fadeIn">
          <div className="row">
            {/*<DashboardStoreLeadsChart />*/}
            {/*<DashboardBestSellingEntities />*/}
          </div>
        </div>
    )
  }
}

export default Dashboard;
