import React, { Component } from 'react';
import { createStore, combineReducers } from 'redux';
import { Provider } from 'react-redux';
import { createBrowserHistory } from 'history';
import { Router, Route, Switch } from 'react-router-dom'
import {ToastContainer} from "react-toastify";
import { polyfill } from 'smoothscroll-polyfill'
import {
  createResponsiveStateReducer,
  responsiveStoreEnhancer
} from "redux-responsive";

import {
  apiResourceObjectsReducer,
  authTokenReducer, loadedBundleReducer, loadedResourcesReducer
} from "./react-utils/redux-utils";
import UserLoader from "./react-utils/components/UserLoader";

import ConnectedIntlProvider from './ConnectedIntlProvider';
import Full from './containers/Full/Full';
import Login from './views/Pages/Login';
import UserPermissionFilter from "./auth/UserPermissionFilter";

import 'react-select/dist/react-select.css';
import 'react-toastify/dist/ReactToastify.min.css';
import 'react-image-gallery/styles/css/image-gallery.css';
import RequiredBundle from "./react-utils/components/RequiredBundle";
import Loading from "./components/Loading";
import UserPreferences from "./UserPreferences";

class App extends Component {
  constructor(props) {
    super(props);

    this.store = createStore(combineReducers({
      authToken: authTokenReducer,
      apiResourceObjects: apiResourceObjectsReducer,
      loadedResources: loadedResourcesReducer,
      loadedBundle: loadedBundleReducer,
      browser: createResponsiveStateReducer({
        extraSmall: 575,
        small: 767,
        medium: 991,
        large: 1199,
      })
    }), responsiveStoreEnhancer);

    polyfill();
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
              <Router history={history}>
                <Switch>
                  <Route exact path="/login" name="Login Page"
                         component={Login}/>
                  <Route path="/" render={props => (
                      <UserLoader {...props}>
                        <UserPermissionFilter redirectPath="/login">
                          <RequiredBundle
                              resources={['languages', 'currencies', 'countries', 'store_types', 'number_formats']}
                              loading={<Loading />}
                          >
                            <UserPreferences>
                              <Full location={props.location}/>
                            </UserPreferences>
                          </RequiredBundle>
                        </UserPermissionFilter>
                      </UserLoader>
                  )} />
                </Switch>
              </Router>
            </div>
          </ConnectedIntlProvider>
        </Provider>
    )
  }
}

export default App;