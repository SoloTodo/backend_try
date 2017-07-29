import React, { Component } from 'react';

import { createStore, combineReducers } from 'redux';
import { Provider } from 'react-redux';

import { createBrowserHistory } from 'history';
import { HashRouter, Route, Switch } from 'react-router-dom'
import 'fixed-data-table/dist/fixed-data-table.min.css';

import PrivateRoute from './auth/PrivateRoute';
import ConnectedIntlProvider from './ConnectedIntlProvider';
import Full from './containers/Full/'
import Login from './views/Pages/Login/';
import { settings } from './settings';
import { navigatorLanguage, fetchAuth } from './utils';
import {
  ApiResourceByStore,
  getResourcesByType
} from './ApiResource';


class App extends Component {
  constructor(props) {
    super(props);

    this.store = createStore(combineReducers({
      apiResources: this.apiResourcesReducer,
      authToken: this.authTokenReducer,
      user: this.userReducer
    }));

    this.store.subscribe(this.getUserData);
  }

  getUserData = () => {
    const state = this.store.getState();

    let languages = getResourcesByType(state, 'languages');
    let currencies = getResourcesByType(state, 'currencies');
    let countries = getResourcesByType(state, 'countries');

    if (state.authToken && languages.length && currencies.length && countries.length && !state.user.email) {
      fetchAuth(state.authToken, settings.ownUserApiPath).then(
          user => {
            this.store.dispatch({
              type: 'setUser',
              user
            });

            user = ApiResourceByStore(this.store.getState().user, this.store);

            // Set language
            let languagesDictByUrl = {};
            let languagesDictByCode = {};

            getResourcesByType(state, 'languages').map(x => {
              languagesDictByUrl[x.url] = x;
              languagesDictByCode[x.code] = x;
              return null;
            });

            let preferredLanguage = user.preferredLanguage;

            if (!preferredLanguage) {
              preferredLanguage = languagesDictByCode[navigatorLanguage()]
            }

            if (!preferredLanguage) {
              preferredLanguage = languagesDictByUrl[
                  settings.defaultLanguageUrl]
            }

            if (!user.preferredLanguage || (user.preferredLanguage.url !== preferredLanguage.url)) {
              user.preferredLanguage = preferredLanguage;
            }

            // Set currency
            let currenciesByUrl = {};

            getResourcesByType(state, 'currencies').map(x => {
              currenciesByUrl[x.url] = x;
              return null;
            });

            let preferredCurrency = user.preferredCurrency;

            if (!preferredCurrency) {
              preferredCurrency = currenciesByUrl[settings.defaultCurrencyUrl]
            }

            if (!user.preferredCurrency || user.preferredCurrency.url !== preferredCurrency.url) {
              user.preferredCurrency = preferredCurrency
            }

            // Set country
            let countriesByUrl = {};

            getResourcesByType(state, 'countries').map(x => {
              countriesByUrl[x.url] = x;
              return null;
            });

            let preferredCountry = user.preferredCountry;

            if (!preferredCountry) {
              preferredCountry = countriesByUrl[settings.defaultCountryUrl]
            }

            if (!user.preferredCountry || user.preferredCountry.url !== preferredCountry.url) {
              user.preferredCountry = preferredCountry;
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

    const resources = ['languages', 'currencies', 'countries', 'store_types'];

    for (let resource of resources) {
      fetch(`${ settings.endpoint }/${resource}/`).then(
          res => res.json()
      ).then(
          json => {
            this.store.dispatch({
              type: 'addApiResources',
              apiResources: json,
              resourceType: resource
            });
          }
      );
    }
  }

  apiResourcesReducer = (state={}, action) => {
    if (action.type === 'addApiResources') {
      let newApiResources = {};

      action.apiResources.map((newApiResource) => {
        newApiResources[newApiResource['url']] = {
          ...newApiResource,
          ...{resourceType: action.resourceType}
        };
        return null;
      });

      return {...state, ...newApiResources}
    }

    if (action.type === 'ApiResourceUpdate') {
      const previousValue = state[action.payload.url];
      const newValue = {...previousValue, ...action.payload};

      return {...state, ...{[action.payload.url]: newValue}}
    }

    if (action.type === 'setUser') {
      const newUser = {
        ...action.user,
        ...{resourceType: 'users'}
      };

      return {...state, ...{[action.user.url]: newUser}}
    }

    return state
  };

  userReducer = (state={}, action) => {
    if (action.type === 'setUser') {
      return action.user;
    }

    if (action.type === 'ApiResourceUpdate' && action.payload.url.includes(settings.ownUserApiPath)) {
      return action.payload;
    }

    return state;
  };

  authTokenReducer = (state = null, action) => {
    if (action.type === 'setAuthToken') {
      if (state !== action.authToken) {
        window.localStorage.setItem('authToken', action.authToken)
      }
      return action.authToken
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