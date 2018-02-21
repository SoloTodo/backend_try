import React, { Component } from 'react';
import { createStore, combineReducers } from 'redux';
import { Provider } from 'react-redux';
import { createBrowserHistory } from 'history';
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import {ToastContainer} from "react-toastify";
import { polyfill } from 'smoothscroll-polyfill'
import GoogleAnalytics from 'react-ga';
import {
  createResponsiveStateReducer,
  responsiveStoreEnhancer
} from "redux-responsive";

import {
  ApiResourceObject,
  filterApiResourceObjectsByType
} from "./react-utils/ApiResource";

import {
  navigatorLanguage,
  setLocale,
} from './react-utils/utils';

import {
  apiResourceObjectsReducer,
  authTokenReducer, loadedResourcesReducer
} from "./react-utils/redux-utils";
import RequiredResources from "./react-utils/components/RequiredResources";
import UserLoader from "./react-utils/components/UserLoader";
import withTracker from "./react-utils/components/GoogleAnalyticsTracker";

import ConnectedIntlProvider from './ConnectedIntlProvider';
import Full from './containers/Full/Full';
import Login from './views/Pages/Login';
import { settings } from './settings';
import { defaultProperty } from './utils';
import UserPermissionFilter from "./auth/UserPermissionFilter";

import 'react-select/dist/react-select.css';
import 'react-toastify/dist/ReactToastify.min.css';
import 'react-image-gallery/styles/css/image-gallery.css';

class App extends Component {
  constructor(props) {
    super(props);

    this.store = createStore(combineReducers({
      authToken: authTokenReducer,
      apiResourceObjects: apiResourceObjectsReducer,
      loadedResources: loadedResourcesReducer,
      browser: createResponsiveStateReducer({
        extraSmall: 575,
        small: 767,
        medium: 991,
        large: 1199,
      })
    }), responsiveStoreEnhancer);

    polyfill();
    GoogleAnalytics.initialize(settings.googleAnalyticsId);
    this.TrackedUserLoader = withTracker(UserLoader);
  }

  handleUserLoad = rawUser => {
    const state = this.store.getState();
    const apiResourceObjects = state.apiResourceObjects;

    const languages = filterApiResourceObjectsByType(apiResourceObjects, 'languages');
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

            user.save(state.authToken, this.store.dispatch);
          })
    }

    setLocale(user.preferredLanguage.code);
  };

  render() {
    let history = createBrowserHistory();
    const TrackedUserLoader = this.TrackedUserLoader;

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
              <RequiredResources
                  resources={['languages', 'currencies', 'countries', 'store_types', 'number_formats']}
              >
                <BrowserRouter history={history}>
                  <Switch>
                    <Route exact path="/login" name="Login Page"
                           component={Login}/>
                    <Route path="/" render={props => (
                        <TrackedUserLoader callback={this.handleUserLoad} {...props}>
                          <UserPermissionFilter redirectPath="/login">
                            <Full location={props.location}/>
                          </UserPermissionFilter>
                        </TrackedUserLoader>
                    )} />
                  </Switch>
                </BrowserRouter>
              </RequiredResources>
            </div>
          </ConnectedIntlProvider>
        </Provider>
    )
  }
}

export default App;