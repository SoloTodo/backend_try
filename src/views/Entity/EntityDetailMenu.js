import React from 'react';
import {FormattedMessage} from "react-intl";
import {NavLink} from "react-router-dom";

export default function EntityDetailMenu(props) {
  const entity = props.entity;

  return (<div className="col-sm-12 col-md-4">
    <div className="card">
      <div className="card-header"><strong><FormattedMessage id="options" defaultMessage={`Options`} /></strong></div>
      <div className="card-block">
        <ul className="list-without-decoration subnavigation-links">
          <li><NavLink to={'/entities/' + entity.id}>
            <button type="button" className="btn btn-link">
              <FormattedMessage id="general_information" defaultMessage={`General Information`} />
            </button>
          </NavLink></li>
        </ul>
      </div>
    </div>
  </div>)
}