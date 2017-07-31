import React, { Component } from 'react';

import { createStore, combineReducers } from 'redux';
import { Provider } from 'react-redux';

import { createBrowserHistory } from 'history';
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import 'fixed-data-table/dist/fixed-data-table.min.css';

import PrivateRoute from './auth/PrivateRoute';
import ConnectedIntlProvider from './ConnectedIntlProvider';
import Full from './containers/Full/'
import Login from './views/Pages/Login/';
import { settings } from './settings';
import {navigatorLanguage, fetchAuth, defaultProperty} from './utils';
import {
  fetchApiResource, filterApiResourcesByType
} from './ApiResource';
import ApiResource from "./ApiResource";

export function initialUserLoad(authToken, languages, countries, currencies, dispatch) {
  if (!authToken || !languages.length || !countries.length || !currencies.length) {
    return;
  }

  fetchAuth(authToken, settings.ownUserUrl).then(
      user => {
        dispatch({
          type: 'updateApiResource',
          payload: user
        });

        let apiResources = {};

        for (let resource of [languages, countries, currencies]) {
          for (let obj of resource) {
            apiResources[obj.url] = obj;
          }
        }

        user = new ApiResource(user, apiResources);

        // Set language
        let preferredLanguage = user.preferredLanguage;

        if (!preferredLanguage) {
          preferredLanguage = languages.filter(x => x.code === navigatorLanguage())[0]
        }

        if (!preferredLanguage) {
          preferredLanguage = languages.filter(x => x.url === defaultProperty('languages'))[0]
        }

        if (!user.preferredLanguage || (user.preferredLanguage.url !== preferredLanguage.url)) {
          user.preferredLanguage = preferredLanguage;
        }

        // Set country and currency

        if (user.preferredCountry) {
          if (!user.preferredCurrency) {
            user.preferredCurrency = user.preferredCountry.currency;
            user.save(authToken, dispatch);
          }
        } else {
          let countryByIpUrl = `${settings.endpoint}/countries/by_ip/`;
          if (settings.customIp) {
            countryByIpUrl += `?ip=${settings.customIp}`;
          }

          fetch(countryByIpUrl)
              .then(res => res.json())
              .then(json => {
                let preferredCountry = json['url'] ?
                    json : countries.filter(x => x.url === defaultProperty('countries'))[0];

                if (!user.preferredCountry || user.preferredCountry.url !== preferredCountry.url) {
                  user.preferredCountry = preferredCountry;
                }

                if (!user.preferredCurrency) {
                  user.preferredCurrency = user.preferredCountry.currency
                }

                user.save(authToken, dispatch);
              })
        }
      }
  )
}


class App extends Component {
  constructor(props) {
    super(props);

    this.store = createStore(combineReducers({
      authToken: this.authTokenReducer,
      resourceEndpoints: this.resourceEndpointsReducer,
      apiResources: this.apiResourcesReducer,
    }));
  }

  componentDidMount() {
    fetch(settings.endpoint)
        .then(res => res.json())
        .then(json => {
          this.store.dispatch({
            type: 'setResourceEndpoints',
            resourceEndpoints: json
          });
        })
        .then(() => {
          const userRequiredResources = ['languages', 'currencies', 'countries'];
          const resourceEndpoints = this.store.getState().resourceEndpoints;

          for (let resource of userRequiredResources.concat(['store_types'])) {
            fetchApiResource(resourceEndpoints, resource, this.store.dispatch)
                .then(() => {
                  if (!userRequiredResources.includes(resource)) {
                    return;
                  }
                  const state = this.store.getState();
                  const apiResources = state.apiResources;
                  const languages = filterApiResourcesByType(apiResources, 'languages');
                  const countries = filterApiResourcesByType(apiResources, 'countries');
                  const currencies = filterApiResourcesByType(apiResources, 'currencies');
                  initialUserLoad(state.authToken, languages, countries, currencies, this.store.dispatch)
                })
          }
        });
  }

  resourceEndpointsReducer = (state = {}, action) => {
    if (action.type === 'setResourceEndpoints') {
      return action.resourceEndpoints
    }

    return state
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
      // User changed, delete all API resources that include permissions,
      // this includes the user itself
      let filteredResources = {...state};
      Object.values(state)
          .filter(x => Boolean(x.permissions))
          .map(x => delete filteredResources[x.url]);
      return filteredResources
    }

    return state
  };

  authTokenReducer = (state, action) => {
    if (typeof state === 'undefined') {
      return window.localStorage.getItem('authToken');
    }

    if (action.type === 'setAuthToken') {
      if (state !== action.authToken) {
        if (action.authToken) {
          window.localStorage.setItem('authToken', action.authToken)
        } else {
          window.localStorage.removeItem('authToken')
        }
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
            <BrowserRouter history={history}>
              <Switch>
                <Route exact path="/login" name="Login Page" component={Login}/>
                <PrivateRoute path="/" name="Home" component={Full}/>
              </Switch>
            </BrowserRouter>
          </ConnectedIntlProvider>
        </Provider>
    )
  }
}

export default App;