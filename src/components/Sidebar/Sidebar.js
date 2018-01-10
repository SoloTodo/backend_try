import React, { Component } from 'react';
import { connect } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { sidebarLayout } from '../../TopLevelRoutes';
import {
  addApiResourceStateToPropsUtils,
  apiResourceObjectForeignKey,
  filterApiResourceObjectsByType
} from '../../react-utils/ApiResource';
import './sidebar.css';
import {settings} from "../../settings";
import {setLocale} from "../../react-utils/utils";


class Sidebar extends Component {
  handleClick = (e) => {
    e.preventDefault();
    e.target.parentElement.classList.toggle('open');
  };

  render() {
    const selectedLanguage = this.props.language;
    const selectedCurrency = this.props.currency;
    const selectedNumberFormat = this.props.numberFormat;

    const user = this.props.ApiResourceObject(this.props.user);

    let layout = [];

    if (this.props.user.permissions) {
      sidebarLayout.map(section => {
        const entries = section.entries.filter(entry => this.props.user.permissions.includes(entry.requiredPermission));
        if (entries.length) {
          layout.push({...section, entries})
        }
        return null;
      });
    }

    return (
        <div className="sidebar">
          <nav className="sidebar-nav">
            <ul className="nav">
              <li className="nav-title text-center"><span><FormattedMessage id="menu" defaultMessage={`Menu`} /></span></li>

              <li className="nav-item">
                <NavLink to={'/dashboard'} className="nav-link"><i className="icon icon-speedometer">&nbsp;</i> Dashboard</NavLink>
              </li>

              {layout.map((section, idx) => (
                  <li className="nav-item nav-dropdown" key={idx}>
                    <a className="nav-link nav-dropdown-toggle" href="/" onClick={this.handleClick}><i className={section.icon}>&nbsp;</i>{ section.title }</a>
                    <ul className="nav-dropdown-items">
                      {section.entries.map(entry => (
                          <li className="nav-item" key={entry.path}>
                            <NavLink to={entry.path} className="nav-link" activeClassName="active"><i className='false' />{entry.label}</NavLink>
                          </li>
                      ))}
                    </ul>
                  </li>
              ))}

              <li className="nav-title text-center"><span><FormattedMessage id="configuration" defaultMessage={`Configuration`} /></span></li>

              <li className="nav-item nav-dropdown">
                <a className="nav-link nav-dropdown-toggle" href="/" onClick={this.handleClick}><i className="fa fa-usd">&nbsp;</i><FormattedMessage id="header_currency_title" defaultMessage={`Currency`} />: <strong>{selectedCurrency && selectedCurrency.iso_code}</strong></a>
                <ul className="nav-dropdown-items">
                  {this.props.currencies.map(currency => (
                      <li className="nav-item" key={currency.url}>
                        <a className="nav-link" href="/" onClick={(e) => this.props.setUserProperty(e, user, 'preferredCurrency', currency, this.props.authToken)}><i className={currency === selectedCurrency && 'fa fa-check'}/>{ currency.name }</a>
                      </li>
                  ))}
                </ul>
              </li>

              <li className="nav-item nav-dropdown">
                <a className="nav-link nav-dropdown-toggle" href="/" onClick={this.handleClick}><i className="fa fa-globe">&nbsp;</i><FormattedMessage id="header_number_format_title" defaultMessage={`Number format`} />: <strong>{ selectedNumberFormat && selectedNumberFormat.name }</strong></a>
                <ul className="nav-dropdown-items">
                  {this.props.numberFormats.map(numberFormat => (
                      <li className="nav-item" key={numberFormat.url}>
                        <a className="nav-link" href="/" onClick={(e) => this.props.setUserProperty(e, user, 'preferredNumberFormat', numberFormat, this.props.authToken)}><i className={numberFormat === selectedNumberFormat && 'fa fa-check'}/> { numberFormat.name }</a>
                      </li>
                  ))}
                </ul>
              </li>

              <li className="nav-item nav-dropdown">
                <a className="nav-link nav-dropdown-toggle" href="/" onClick={this.handleClick}><i className="fa fa-language">&nbsp;</i><FormattedMessage id="header_language_title" defaultMessage={`Language`} />: <strong>{selectedLanguage && selectedLanguage.name}</strong></a>
                <ul className="nav-dropdown-items">
                  {this.props.languages.map(language => (
                      <li className="nav-item" key={language.url}>
                        <a className="nav-link" href="/" onClick={(e) => this.props.setUserProperty(e, user, 'preferredLanguage', language, this.props.authToken)}><i className={language === selectedLanguage && 'fa fa-check'}/>{ language.name }</a>
                      </li>
                  ))}
                </ul>
              </li>
            </ul>
          </nav>
        </div>
    )
  }
}

let mapStateToProps = (state) => {
  const user = state.apiResourceObjects[settings.ownUserUrl] || {};
  const apiResourceObjects = state.apiResourceObjects;
  return {
    languages: filterApiResourceObjectsByType(apiResourceObjects, 'languages'),
    language: apiResourceObjectForeignKey(user, 'preferred_language', state),
    currencies: filterApiResourceObjectsByType(apiResourceObjects, 'currencies'),
    currency: apiResourceObjectForeignKey(user, 'preferred_currency', state),
    numberFormats: filterApiResourceObjectsByType(apiResourceObjects, 'number_formats'),
    numberFormat: apiResourceObjectForeignKey(user, 'preferred_number_format', state),
    authToken: state.authToken,
    user: user
  };
};

let mapDispatchToProps = (dispatch) => {
  return {
    setUserProperty: (e, user, property, value, authToken) => {
      e.preventDefault();
      e.target.parentElement.parentElement.parentElement.classList.toggle('open');

      user[property] = value;
      user.save(authToken, dispatch);

      if (property === 'preferredLanguage') {
        setLocale(value.code);
      }
    }
  }
};

export default connect(addApiResourceStateToPropsUtils(mapStateToProps), mapDispatchToProps)(Sidebar);