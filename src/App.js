import React, { Component } from 'react';
import { createStore, combineReducers } from 'redux';
import { Provider } from 'react-redux';
import { createBrowserHistory } from 'history';
import { BrowserRouter, Route, Switch } from 'react-router-dom'
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
import Page404 from "./views/Pages/Page404/Page404";

import 'react-select/dist/react-select.css';

export function initialUserLoad(authToken, languages, countries, currencies, numberFormats, dispatch) {
  return fetchAuth(authToken, settings.ownUserUrl).then(
      rawUser => {
        // Check if the token was valid
        if (rawUser.detail) {
          dispatch({
            type: 'setAuthToken',
            authToken: null
          });
        }

        dispatch({
          type: 'updateApiResource',
          payload: rawUser
        });

        let apiResources = {};

        for (let resource of [languages, countries, currencies, numberFormats]) {
          for (let obj of resource) {
            apiResources[obj.url] = obj;
          }
        }

        const user = new ApiResource(rawUser, apiResources);

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

        // Set currency and number format

        if (!user.preferredCurrency || !user.preferredNumberFormat) {
          let countryByIpUrl = `${settings.endpoint}countries/by_ip/`;
          if (settings.customIp) {
            countryByIpUrl += `?ip=${settings.customIp}`;
          }

          fetch(countryByIpUrl)
              .then(res => res.json())
              .then(json => {
                let userCountry = json['url'] ?
                    json : apiResources[defaultProperty('countries')];

                if (!user.preferredCurrency) {
                  user.preferredCurrency = new ApiResource(apiResources[userCountry.currency])
                }

                if (!user.preferredNumberFormat) {
                  user.preferredNumberFormat = new ApiResource(apiResources[userCountry.number_format]);
                }

                user.save(authToken, dispatch);
              })
        }

        return rawUser;
      }
  )
}


class App extends Component {
  constructor(props) {
    super(props);

    this.store = createStore(combineReducers({
      authToken: this.authTokenReducer,
      apiResources: this.apiResourcesReducer,
      loadedResources: this.loadedResourcesReducer
    }));
  }

  componentDidMount() {
    const requiredResources = ['languages', 'currencies', 'countries', 'store_types', 'number_formats'];

    for (let resource of requiredResources) {
      fetchApiResource(resource, this.store.dispatch)
          .then(() => {
            const state = this.store.getState();
            const apiResources = state.apiResources;

            const groupedApiResources = requiredResources.reduce((ongoing, resource) => {
              ongoing[resource] = filterApiResourcesByType(apiResources, resource);
              return ongoing
            }, {});

            if (state.authToken && requiredResources.every(resource => groupedApiResources[resource].length > 0)) {
              initialUserLoad(
                  state.authToken,
                  groupedApiResources.languages,
                  groupedApiResources.countries,
                  groupedApiResources.currencies,
                  groupedApiResources.number_formats,
                  this.store.dispatch)
            }
          })
    }

  }

  apiResourcesReducer = (state={}, action) => {
    if (action.type === 'addApiResources') {
      let newApiResources = {};
      for (let newApiResource of action.apiResources) {
        newApiResources[newApiResource.url] = {
          ...newApiResource,
          resourceType: action.resourceType
        };
      }

      return {...state, ...newApiResources}
    }

    if (action.type === 'addApiResource') {
      return {
        ...state,
        [action.apiResource.url]: {
          ...action.apiResource,
          resourceType: action.resourceType
        }
      }
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

  loadedResourcesReducer = (state=[], action) => {
    if (action.type === 'addApiResources') {
      return [...state, action.resourceType]
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
                <Route exact path="/login" name="Login Page"
                       component={Login}/>
                <Route exact path="/404" name="404" component={Page404}/>
                <PrivateRoute path="/" name="Home" component={Full}/>
              </Switch>
            </BrowserRouter>
          </ConnectedIntlProvider>
        </Provider>
    )
  }
}

export default App;