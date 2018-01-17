import React, { Component } from 'react';
import { createStore, combineReducers } from 'redux';
import { Provider } from 'react-redux';
import { createBrowserHistory } from 'history';
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import { polyfill } from 'smoothscroll-polyfill'
import ConnectedIntlProvider from './ConnectedIntlProvider';
import Full from './containers/Full/'
import Login from './views/Pages/Login/';
import { settings } from './settings';
import { defaultProperty } from './utils';

import {
  navigatorLanguage,
  fetchAuth,
  setLocale
} from './react-utils/utils';

import {
  ApiResourceObject,
  fetchApiResource,
  filterApiResourceObjectsByType,
} from "./react-utils/ApiResource";


import Page404 from "./views/Pages/Page404/Page404";

import 'react-select/dist/react-select.css';
import 'react-toastify/dist/ReactToastify.min.css';
import 'react-image-gallery/styles/css/image-gallery.css';
import syncBreakpointWithStore, {breakpointReducer} from "redux-breakpoint";
import UserPermissionFilter from "./auth/UserPermissionFilter";
import {ToastContainer} from "react-toastify";
import {
  apiResourceObjectsReducer,
  authTokenReducer, loadedResourcesReducer
} from "./react-utils/redux-utils";


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
          type: 'updateApiResourceObject',
          apiResourceObject: rawUser
        });

        let apiResourceObjects = {};

        for (let resource of [languages, countries, currencies, numberFormats]) {
          for (let obj of resource) {
            apiResourceObjects[obj.url] = obj;
          }
        }

        const user = new ApiResourceObject(rawUser, apiResourceObjects);

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
                    json : apiResourceObjects[defaultProperty('countries')];

                if (!user.preferredCurrency) {
                  user.preferredCurrency = new ApiResourceObject(apiResourceObjects[userCountry.currency])
                }

                if (!user.preferredNumberFormat) {
                  user.preferredNumberFormat = new ApiResourceObject(apiResourceObjects[userCountry.number_format]);
                }

                user.save(authToken, dispatch);
              })
        }

        setLocale(user.preferredLanguage.code);

        return rawUser;
      }
  ).catch(err => {
    dispatch({
      type: 'setAuthToken',
      authToken: null
    });
  })
}


class App extends Component {
  constructor(props) {
    super(props);

    this.store = createStore(combineReducers({
      authToken: authTokenReducer,
      apiResourceObjects: apiResourceObjectsReducer,
      loadedResources: loadedResourcesReducer,
      breakpoint: breakpointReducer
    }));

    syncBreakpointWithStore(this.store);
    polyfill();
  }

  componentDidMount() {
    const requiredResources = ['languages', 'currencies', 'countries', 'store_types', 'number_formats'];

    for (let resource of requiredResources) {
      fetchApiResource(resource, this.store.dispatch)
          .then(() => {
            const state = this.store.getState();
            const apiResourceObjects = state.apiResourceObjects;

            const groupedApiResources = requiredResources.reduce((ongoing, resource) => ({
              ...ongoing,
              [resource]: filterApiResourceObjectsByType(apiResourceObjects, resource)
            }), {});

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

  render() {
    let history = createBrowserHistory();
    return (
        <Provider store={this.store}>
          <ConnectedIntlProvider>
            <div>
              <ToastContainer
                  position="top-right"
                  type="default"
                  autoClose={5000}
                  hideProgressBar={false}
                  newestOnTop={false}
                  closeOnClick
                  pauseOnHover
              />
              <BrowserRouter history={history}>
                <Switch>
                  <Route exact path="/login" name="Login Page"
                         component={Login}/>
                  <Route exact path="/404" name="404" component={Page404}/>
                  <Route path="/" render={props => (
                      <UserPermissionFilter redirectPath="/login">
                        <Full location={props.location}/>
                      </UserPermissionFilter>
                  )} />
                </Switch>
              </BrowserRouter>
            </div>
          </ConnectedIntlProvider>
        </Provider>
    )
  }
}

export default App;