import React, { Component } from 'react';
import {FormattedMessage} from "react-intl";
import {NavLink} from "react-router-dom";

class Page404 extends Component {
  render() {
    return (
      <div className="app flex-row align-items-center">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12">
              <div className="clearfix">
                <h1 className="float-left display-3 mr-4">404</h1>
                <h4 className="pt-3"><FormattedMessage id="404_title" defaultMessage={`Oops! You're lost`} /></h4>
                <p className="text-muted"><FormattedMessage id="404_body" defaultMessage={`The page you are looking for was not found.`} /></p>
              </div>
            </div>
            <div className="col-12">
              <NavLink to="/" className="btn btn-lg btn-primary"><FormattedMessage id="404_home_link" defaultMessage={`Go back to homepage`} /></NavLink>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Page404;
