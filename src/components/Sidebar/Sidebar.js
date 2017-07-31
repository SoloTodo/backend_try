import React, { Component } from 'react';
import { connect } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { sidebarLayout } from '../../TopLevelRoutes';
import {
  apiResourceForeignKey,
  filterApiResourcesByType
} from '../../ApiResource';
import './sidebar.css';
import ApiResource from "../../ApiResource";
import {settings} from "../../settings";


class Sidebar extends Component {
  handleClick = (e) => {
    e.preventDefault();
    e.target.parentElement.classList.toggle('open');
  };

  activeRoute(routeName) {
    return this.props.location.pathname.indexOf(routeName) > -1 ? 'nav-item nav-dropdown open' : 'nav-item nav-dropdown';
  }

  // secondLevelActive(routeName) {
  //   return this.props.location.pathname.indexOf(routeName) > -1 ? "nav nav-second-level collapse in" : "nav nav-second-level collapse";
  // }

  render() {
    const selectedLanguage = this.props.language;
    const selectedCurrency = this.props.currency;
    const selectedCountry = this.props.country;

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

              {layout.map(section => (
                  <li className="nav-item nav-dropdown" key={section.key}>
                    <a className="nav-link nav-dropdown-toggle" href="/" onClick={this.handleClick}><i className={section.icon}>&nbsp;</i>{ section.title }</a>
                    <ul className="nav-dropdown-items">
                      {section.entries.map(entry => (
                          <li className="nav-item" key={entry.key}>
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
                        <a className="nav-link" href="/" onClick={(e) => this.props.setUserProperty(e, this.props.user, 'preferredCurrency', currency, this.props.authToken)}><i className={currency === selectedCurrency && 'fa fa-check'}/>{ currency.name }</a>
                      </li>
                  ))}
                </ul>
              </li>

              <li className="nav-item nav-dropdown">
                <a className="nav-link nav-dropdown-toggle" href="/" onClick={this.handleClick}><i className="fa fa-globe">&nbsp;</i><FormattedMessage id="header_country_title" defaultMessage={`Country`} />: <strong>{ selectedCountry && selectedCountry.name }</strong></a>
                <ul className="nav-dropdown-items">
                  {this.props.countries.map(country => (
                      <li className="nav-item" key={country.url}>
                        <a className="nav-link" href="/" onClick={(e) => this.props.setUserProperty(e, this.props.user, 'preferredCountry', country, this.props.authToken)}><i className={country === selectedCountry && 'fa fa-check'}/> { country.name }</a>
                      </li>
                  ))}
                </ul>
              </li>

              <li className="nav-item nav-dropdown">
                <a className="nav-link nav-dropdown-toggle" href="/" onClick={this.handleClick}><i className="fa fa-language">&nbsp;</i><FormattedMessage id="header_language_title" defaultMessage={`Language`} />: <strong>{selectedLanguage && selectedLanguage.name}</strong></a>
                <ul className="nav-dropdown-items">
                  {this.props.languages.map(language => (
                      <li className="nav-item" key={language.url}>
                        <a className="nav-link" href="/" onClick={(e) => this.props.setUserProperty(e, this.props.user, 'preferredLanguage', language, this.props.authToken)}><i className={language === selectedLanguage && 'fa fa-check'}/>{ language.name }</a>
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
  const user = state.apiResources[settings.ownUserUrl] || {};
  return {
    languages: filterApiResourcesByType(state, 'languages'),
    language: apiResourceForeignKey(user, 'preferred_language', state),
    currencies: filterApiResourcesByType(state, 'currencies'),
    currency: apiResourceForeignKey(user, 'preferred_currency', state),
    countries: filterApiResourcesByType(state, 'countries'),
    country: apiResourceForeignKey(user, 'preferred_country', state),
    authToken: state.authToken,
    user: user
  };
};

let mapDispatchToProps = (dispatch) => {
  return {
    setUserProperty: (e, user, property, value, authToken) => {
      e.preventDefault();
      e.target.parentElement.parentElement.parentElement.classList.toggle('open');

      const apiResourceUser = new ApiResource(user, {});
      apiResourceUser[property] = value;
    }
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(Sidebar);