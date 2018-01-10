import React, { Component } from 'react';
import Loading from "../../react-utils/components/Loading";
// import DashboardStoreLeadsChart from "./DashboardStoreLeadsChart";
// import DashboardBestSellingEntities from "./DashboardBestSellingEntities";

class Dashboard extends Component {
  componentDidMount() {
    this.setState({}, () => console.log('wat2'));
  }

  render() {
    document.title = 'Dashboard - SoloTodo';

    return (
        <div className="animated fadeIn">
          <div className="row">
            <Loading />
          </div>
        </div>
    )
  }
}

export default Dashboard;
