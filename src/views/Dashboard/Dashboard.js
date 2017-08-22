import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';

class Dashboard extends Component {

  render() {
    document.title = 'Dashboard - SoloTodo';

    return (
      <div className="animated fadeIn">
        <FormattedMessage id="hello_world" defaultMessage={`Hello World`} />
      </div>
    )
  }
}

export default Dashboard;
