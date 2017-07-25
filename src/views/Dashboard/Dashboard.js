import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';

class Dashboard extends Component {

  render() {
    return (
      <div className="animated fadeIn">
        <FormattedMessage id="hello_world" defaultMessage={`Hello World`} />
      </div>
    )
  }
}

export default Dashboard;
