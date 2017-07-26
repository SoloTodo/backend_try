import React, { Component } from 'react';
import { connect } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';

class Sidebar extends Component {

  handleClick(e) {
    e.preventDefault();
    e.target.parentElement.classList.toggle('open');
  }

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

    return (

        <div className="sidebar">
          <nav className="sidebar-nav">
            <ul className="nav">
              <li className="nav-title text-center"><span><FormattedMessage id="menu" defaultMessage={`Menu`} /></span></li>
              <li className="nav-item">
                <NavLink to={'/dashboard'} className="nav-link" activeClassName="active"><i className="icon-speedometer"></i> <FormattedMessage id="dashboard" defaultMessage={`Dashboard`} /></NavLink>
              </li>

              <li className="nav-title text-center"><span><FormattedMessage id="configuration" defaultMessage={`Configuration`} /></span></li>

              <li className="nav-item nav-dropdown">
                <a className="nav-link nav-dropdown-toggle" href="#" onClick={this.handleClick.bind(this)}><i className="fa fa-usd">&nbsp;</i><FormattedMessage id="header_currency_title" defaultMessage={`Currency`} />: {selectedCurrency && selectedCurrency.iso_code}</a>
                <ul className="nav-dropdown-items">
                  {this.props.currencies.map(currency => (
                      <li className="nav-item" key={currency.id}>
                        <a className="nav-link" href="#" onClick={() => this.props.setUserCurrency(currency)}><i className={currency === selectedCurrency && 'fa fa-check'}/>{ currency.name }</a>
                      </li>
                  ))}
                </ul>
              </li>

              <li className="nav-item nav-dropdown">
                <a className="nav-link nav-dropdown-toggle" href="#" onClick={this.handleClick.bind(this)}><i className="fa fa-globe">&nbsp;</i><FormattedMessage id="header_country_title" defaultMessage={`Country`} />: { selectedCountry && selectedCountry.name }</a>
                <ul className="nav-dropdown-items">
                  {this.props.countries.map(country => (
                      <li className="nav-item" key={country.id}>
                        <a className="nav-link" href="#" onClick={() => this.props.setUserCountry(country)}><i className={country === selectedCountry && 'fa fa-check'}/> { country.name }</a>
                      </li>
                  ))}
                </ul>
              </li>

              <li className="nav-item nav-dropdown">
                <a className="nav-link nav-dropdown-toggle" href="#" onClick={this.handleClick.bind(this)}><i className="fa fa-language">&nbsp;</i><FormattedMessage id="header_language_title" defaultMessage={`Language`} />: {selectedLanguage && selectedLanguage.name}</a>
                <ul className="nav-dropdown-items">
                  {this.props.languages.map(language => (
                      <li className="nav-item" key={language.id}>
                        <a className="nav-link" href="#" onClick={() => this.props.setUserLanguage(language)}><i className={language === selectedLanguage && 'fa fa-check'}/>{ language.name }</a>
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
  return {
    languages: state.languages,
    language: state.language,
    currencies: state.currencies,
    currency: state.currency,
    countries: state.countries,
    country: state.country,
    user: state.user
  };
};

let mapDispatchToProps = (dispatch) => {
  return {
    signOut: () => {
      dispatch({
        type: 'setAuthToken',
        authToken: null
      })
    },
    setUserLanguage: (language) => {
      dispatch({
        type: 'setUserLanguage',
        language
      });

      dispatch({
        type: 'setLanguage',
        languageId: language.id
      })
    }, setUserCurrency: (currency) => {
      dispatch({
        type: 'setUserCurrency',
        currency
      });

      dispatch({
        type: 'setCurrency',
        currencyId: currency.id
      })
    }, setUserCountry: (country) => {
      dispatch({
        type: 'setUserCountry',
        country
      });

      dispatch({
        type: 'setCountry',
        countryId: country.id
      })
    }
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(Sidebar);