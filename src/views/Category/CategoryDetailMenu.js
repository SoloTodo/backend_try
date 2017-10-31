import React from 'react';
import {FormattedMessage} from "react-intl";
import {NavLink} from "react-router-dom";

export default function CategoryDetailMenu(props) {
  const category = props.category;

  return (<div className="col-sm-6 col-md-4">
    <div className="card">
      <div className="card-header"><FormattedMessage id="options" defaultMessage="Options" /></div>
      <div className="card-block">
        <ul className="list-without-decoration subnavigation-links">
          {category.permissions.includes('view_category') &&
          <li><NavLink to={'/categories/' + category.id}>
            <button type="button" className="btn btn-link">
              <FormattedMessage id="general_information" defaultMessage="General Information" />
            </button>
          </NavLink></li>
          }
          {category.permissions.includes('view_category') &&
          <li><NavLink to={'/categories/' + category.id + '/browse'}>
            <button type="button" className="btn btn-link">
              <FormattedMessage id="browse" defaultMessage="Browse" />
            </button>
          </NavLink></li>
          }
          {category.permissions.includes('view_category') &&
          <li><NavLink to={'/categories/' + category.id + '/products'}>
            <button type="button" className="btn btn-link">
              <FormattedMessage id="products" defaultMessage="Products" />
            </button>
          </NavLink></li>
          }
          {category.permissions.includes('view_category_leads') &&
          <li>
            <NavLink to={'/leads/?categories=' + category.id}>
              <button type="button" className="btn btn-link">
                <FormattedMessage id="leads_list" defaultMessage="Leads (list)" />
              </button>
            </NavLink>
          </li>
          }
          {category.permissions.includes('view_category_leads') &&
          <li>
            <NavLink to={'/leads/stats?grouping=store&categories=' + category.id}>
              <button type="button" className="btn btn-link">
                <FormattedMessage id="leads_stats" defaultMessage="Leads (stats)" />
              </button>
            </NavLink>
          </li>
          }

        </ul>
      </div>
    </div>
  </div>)
}