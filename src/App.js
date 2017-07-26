import React, { Component } from 'react';

import { createStore, combineReducers } from 'redux';
import { Provider } from 'react-redux';

import { createBrowserHistory } from 'history';
import { HashRouter, Route, Switch } from 'react-router-dom'

import PrivateRoute from './auth/PrivateRoute';
import ConnectedIntlProvider from './ConnectedIntlProvider';
import Full from './containers/Full/'
import Login from './views/Pages/Login/';
import { localeData } from './translations/locales/index';
import { settings } from './settings';
import { navigatorLanguage, fetchAuth } from './utils';


class App extends Component {


  constructor(props) {
    super(props);

    this.store = createStore(combineReducers({
      languages: this.languagesReducer,
      language: this.languageReducer,
      currencies: this.currenciesReducer,
      currency: this.currencyReducer,
      countries: this.countriesReducer,
      country: this.countryReducer,
      authToken: this.authTokenReducer,
      user: this.userReducer
    }));

    this.store.subscribe(this.getUserData);
  }

  getUserData = () => {
    const state = this.store.getState();
    if (state.authToken && state.languages.length && state.currencies.length && state.countries.length && !state.user.email) {
      fetchAuth(state.authToken, '/users/me/').then(
          res => res.json()
      ).then(
          user => {
            this.store.dispatch({
              type: 'setUser',
              user
            });

            if (user.preferred_language_id) {
              this.store.dispatch({
                type: 'setLanguage',
                languageId: user.preferred_language_id
              });
            }

            if (user.preferred_currency_id) {
              this.store.dispatch({
                type: 'setCurrency',
                currencyId: user.preferred_currency_id
              });
            }

            if (user.preferred_country_id) {
              this.store.dispatch({
                type: 'setCountry',
                countryId: user.preferred_country_id
              });
            }
          }
      )
    }
  };

  componentDidMount() {
    // Check if the user already logged in
    let authToken = window.localStorage.getItem('authToken');
    if (authToken) {
      this.store.dispatch({
        type: 'setAuthToken',
        authToken
      })
    }

    // Fetch available languages
    fetch(`${ settings.endpoint }/languages/`).then(
        res => res.json()
    ).then(
        json => {
          this.store.dispatch({
            type: 'setLanguages',
            languages: json
          });
        }
    );

    // Fetch available currencies
    fetch(`${ settings.endpoint }/currencies/`).then(
        res => res.json()
    ).then(
        json => {
          this.store.dispatch({
            type: 'setCurrencies',
            currencies: json
          });
        }
    );

    // Fetch available countries
    fetch(`${ settings.endpoint }/countries/`).then(
        res => res.json()
    ).then(
        json => {
          this.store.dispatch({
            type: 'setCountries',
            countries: json
          });
        }
    );
  }

  updateUserPreferredLanguage = (language) => {
    const state = this.store.getState();
    fetchAuth(state.authToken, '/users/me/', {
      method: 'PATCH',
      body: JSON.stringify({'preferred_language': language.id})
    });
  };

  updateUserPreferredCurrency = currency => {
    const state = this.store.getState();
    fetchAuth(state.authToken, '/users/me/', {
      method: 'PATCH',
      body: JSON.stringify({'preferred_currency': currency.id})
    });
  };

  updateUserPreferredCountry = country => {
    const state = this.store.getState();
    fetchAuth(state.authToken, '/users/me/', {
      method: 'PATCH',
      body: JSON.stringify({'preferred_country': country.id})
    });
  };

  userReducer = (state={}, action) => {
    if (action.type === 'setUser') {
      const user = action.user;
      if (state.email !== user.email) {
        const state = this.store.getState();

        // Set language
        let languagesDictById = {};
        let languagesDictByCode = {};

        state.languages.map(x => {
          languagesDictById[x.id] = x;
          languagesDictByCode[x.code] = x;
          return null;
        });

        let preferredLanguage = languagesDictById[user.preferred_language_id];

        if (!preferredLanguage) {
          preferredLanguage = languagesDictByCode[navigatorLanguage()]
        }

        if (!preferredLanguage) {
          preferredLanguage = languagesDictById[settings.defaultLanguageId]
        }

        if (preferredLanguage) {
          if (user.preferred_language_id !== preferredLanguage.id) {
            user.preferred_language_id = preferredLanguage.id;
            this.updateUserPreferredLanguage(preferredLanguage);
          }
        }

        // Set currency
        let currenciesById = {};

        state.currencies.map(x => {
          currenciesById[x.id] = x;
          return null;
        });

        let preferredCurrency = currenciesById[user.preferred_currency_id];

        if (!preferredCurrency) {
          preferredCurrency = currenciesById[settings.defaultCurrencyId]
        }

        if (preferredCurrency && user.preferred_currency_id !== preferredCurrency.id) {
          user.preferred_currency_id = preferredCurrency.id;
          this.updateUserPreferredCurrency(preferredCurrency);
        }

        // Set country
        let countriesById = {};

        state.countries.map(x => {
          countriesById[x.id] = x;
          return null;
        });

        let preferredCountry = countriesById[user.preferred_country_id];

        if (!preferredCountry) {
          preferredCountry = countriesById[settings.defaultCountryId]
        }

        if (preferredCountry && user.preferred_country_id !== preferredCountry.id) {
          user.preferred_country_id = preferredCountry.id;
          this.updateUserPreferredCountry(preferredCountry);
        }
      }
      return user;
    }

    if (action.type === 'setUserLanguage') {
      if (state.preferred_language_id !== action.language.id) {
        this.updateUserPreferredLanguage(action.language);
        return {...state, preferred_language_id: action.language.id}
      }
    }

    if (action.type === 'setUserCurrency') {
      if (state.preferred_currency_id !== action.currency.id) {
        this.updateUserPreferredCurrency(action.currency);
        return {...state, preferred_currency_id: action.currency.id}
      }
    }

    if (action.type === 'setUserCountry') {
      if (state.preferred_country_id !== action.country.id) {
        this.updateUserPreferredCountry(action.country);
        return {...state, preferred_country_id: action.country.id}
      }
    }

    return state;
  };

  authTokenReducer(state = null, action) {
    if (action.type === 'setAuthToken') {
      if (state !== action.authToken) {
        window.localStorage.setItem('authToken', action.authToken)
      }
      return action.authToken
    }

    return state
  }

  languagesReducer(state = [], action) {
    if (action.type === 'setLanguages') {
      return action.languages
    }
    return state
  }

  currenciesReducer(state = [], action) {
    if (action.type === 'setCurrencies') {
      return action.currencies
    }
    return state
  }

  countriesReducer(state = [], action) {
    if (action.type === 'setCountries') {
      return action.countries
    }
    return state
  }

  languageReducer = (state, action) => {
    if (typeof state === 'undefined') {
      let languageWithoutRegionCode = navigatorLanguage();

      if (!localeData[languageWithoutRegionCode]) {
        languageWithoutRegionCode = 'en'
      }

      return languageWithoutRegionCode
    }

    if (action.type === 'setLanguage') {
      const state = this.store.getState();
      const language = state.languages.filter(x => x.id === action.languageId)[0];
      return language
    }

    return state
  };

  currencyReducer = (state=null, action) => {
    if (action.type === 'setCurrency') {
      const state = this.store.getState();
      return state.currencies.filter(x => x.id === action.currencyId)[0];
    }

    return state
  };

  countryReducer = (state=null, action) => {
    if (action.type === 'setCountry') {
      const state = this.store.getState();
      return state.countries.filter(x => x.id === action.countryId)[0];
    }

    return state
  };

  render() {
    let history = createBrowserHistory();

    return (
        <Provider store={this.store}>
          <ConnectedIntlProvider>
            <HashRouter history={history}>
              <Switch>
                <Route exact path="/login" name="Login Page" component={Login}/>
                <PrivateRoute path="/" name="Home" component={Full}/>
              </Switch>
            </HashRouter>
          </ConnectedIntlProvider>
        </Provider>
    )
  }
}

export default App;