import React from 'react';
import {FormattedMessage} from "react-intl";
import {NavLink} from "react-router-dom";

export default function EntityDetailMenu(props) {
  const entity = props.entity;

  return (
    <div className="card">
      <div className="card-header"><strong><FormattedMessage id="options" defaultMessage={`Options`} /></strong></div>
      <div className="card-block">
        <ul className="list-without-decoration subnavigation-links">
          <li><NavLink to={`/entities/${entity.id}/events`}>
            <button type="button" className="btn btn-link">
              <FormattedMessage id="events" defaultMessage={`Events`} />
            </button>
          </NavLink></li>
          <li><NavLink to={`/entities/${entity.id}/price_history`}>
            <button type="button" className="btn btn-link">
              <FormattedMessage id="price_history" defaultMessage={`Price history`} />
            </button>
          </NavLink></li>

          <li><NavLink to={'/entities/' + entity.id}>
            <button type="button" className="btn btn-link">
              <FormattedMessage id="associate_to_prduct" defaultMessage={`Associate`} />
            </button>
          </NavLink></li>
        </ul>
      </div>
    </div>
  )
}