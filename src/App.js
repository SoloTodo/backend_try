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
import {navigatorLanguage, fetchAuth, defaultProperty} from './utils';
import {
  ApiResourceByStore, fetchApiResource, filterApiResourcesByType
} from './ApiResource';


class App extends Component {
  constructor(props) {
    super(props);

    this.store = createStore(combineReducers({
      apiResources: this.apiResourcesReducer,
      authToken: this.authTokenReducer,
    }));

    this.store.subscribe(this.getUserData);
  }

  componentDidMount() {
    fetch(settings.endpoint)
        .then(res => res.json())
        .then(json => settings.resourceEndpoints = json)
        .then(() => {
          const resources = ['languages', 'currencies', 'countries', 'store_types'];

          for (let resource of resources) {
            fetchApiResource(resource, this.store.dispatch)
          }
        });
  }

  getUserData = () => {
    const state = this.store.getState();

    let languages = filterApiResourcesByType(state, 'languages');
    let currencies = filterApiResourcesByType(state, 'currencies');
    let countries = filterApiResourcesByType(state, 'countries');
    let user = state.apiResources[settings.ownUserUrl];

    if (state.authToken && languages.length && currencies.length && countries.length && !user) {
      fetchAuth(state.authToken, settings.ownUserUrl).then(
          user => {
            this.store.dispatch({
              type: 'updateApiResource',
              payload: user
            });

            user = ApiResourceByStore(user, this.store);

            // Set language
            let languagesDictByUrl = {};
            let languagesDictByCode = {};

            filterApiResourcesByType(state, 'languages').map(x => {
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
                  defaultProperty('languages')]
            }

            if (!user.preferredLanguage || (user.preferredLanguage.url !== preferredLanguage.url)) {
              user.preferredLanguage = preferredLanguage;
            }

            // Set currency
            let currenciesByUrl = {};

            filterApiResourcesByType(state, 'currencies').map(x => {
              currenciesByUrl[x.url] = x;
              return null;
            });

            let preferredCurrency = user.preferredCurrency;

            if (!preferredCurrency) {
              preferredCurrency = currenciesByUrl[defaultProperty('currencies')]
            }

            if (!user.preferredCurrency || user.preferredCurrency.url !== preferredCurrency.url) {
              user.preferredCurrency = preferredCurrency
            }

            // Set country
            let countriesByUrl = {};

            filterApiResourcesByType(state, 'countries').map(x => {
              countriesByUrl[x.url] = x;
              return null;
            });

            let preferredCountry = user.preferredCountry;

            if (!preferredCountry) {
              preferredCountry = countriesByUrl[defaultProperty('countries')]
            }

            if (!user.preferredCountry || user.preferredCountry.url !== preferredCountry.url) {
              user.preferredCountry = preferredCountry;
            }
          }
      )
    }
  };

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

    if (action.type === 'updateApiResource') {
      const previousValue = state[action.payload.url];
      const newValue = {...previousValue, ...action.payload};

      return {...state, ...{[action.payload.url]: newValue}}
    }

    if (action.type === 'setAuthToken') {
      let newApiResources = {...state};
      delete newApiResources[settings.ownUserUrl];
      return newApiResources
    }

    return state
  };

  authTokenReducer = (state, action) => {
    if (typeof state === 'undefined') {
      return window.localStorage.getItem('authToken');
    }

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