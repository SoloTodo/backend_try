import React from 'react';
import {FormattedMessage} from "react-intl";
import {NavLink} from "react-router-dom";
import './StoreDetailMenu.css';

export default function StoreDetailMenu(props) {
  const store = props.store;

  return (<div className="col-sm-6 col-md-4">
    <div className="card">
      <div className="card-header"><strong><FormattedMessage id="options" defaultMessage="Options" /></strong></div>
      <div className="card-block">
        <ul className="list-without-decoration subnavigation-links">
          {store.permissions.includes('view_store') &&
          <li><NavLink to={'/stores/' + store.id}>
            <button type="button" className="btn btn-link">
              <FormattedMessage id="general_information" defaultMessage="General Information" />
            </button>
          </NavLink></li>
          }
          {store.permissions.includes('update_store_pricing') &&
          <li>
            <NavLink to={'/stores/' + store.id + '/update_pricing'}>
              <button type="button" className="btn btn-link">
                <FormattedMessage id="update_pricing" defaultMessage="Update pricing" />
              </button>
            </NavLink></li>
          }
          {store.permissions.includes('view_store_update_logs') &&
          <li>
            <NavLink to={'/stores/' + store.id + '/update_logs'}>
              <button type="button" className="btn btn-link">
                <FormattedMessage id="update_logs" defaultMessage="Update logs" />
              </button>
            </NavLink></li>
          }
          {store.permissions.includes('view_store_leads') &&
          <li>
            <NavLink to={'/stores/' + store.id + '/visits'}>
              <button type="button" className="btn btn-link">
                <FormattedMessage id="visits" defaultMessage="Visits" />
              </button>
            </NavLink></li>
          }
        </ul>
      </div>
    </div>
  </div>)
}