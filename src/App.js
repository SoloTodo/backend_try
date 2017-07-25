import React, { Component } from 'react';

import { createStore, combineReducers } from 'redux';
import { Provider } from 'react-redux';

import { addLocaleData } from 'react-intl';
import en from 'react-intl/locale-data/en';
import es from 'react-intl/locale-data/es';

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
      locales: this.localeReducer,
      languages: this.languagesReducer,
      authToken: this.authTokenReducer,
      user: this.userReducer
    }));

    this.store.subscribe(this.getUserData);
  }

  getUserData = () => {
    const state = this.store.getState();
    if (state.authToken && !state.user.email) {
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
                type: 'setLocaleLanguage',
                languageId: user.preferred_language_id
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

    fetch(`${ settings.endpoint }/languages/`).then(
        res => res.json()
    ).then(
        json => {
          this.store.dispatch({
            type: 'setLanguages',
            languages: json
          });
        }
    )
  }

  update_user_preferred_language = (language) => {
    const state = this.store.getState();
    fetchAuth(state.authToken, '/users/me/', {
      method: 'PATCH',
      body: JSON.stringify({'preferred_language': language.id})
    });
  };

  userReducer = (state={}, action) => {
    if (action.type === 'setUser') {
      const user = action.user;
      if (state.email !== user.email) {
        const state = this.store.getState();
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
            this.update_user_preferred_language(preferredLanguage);
          }

          user.preferredLanguage = preferredLanguage
        }


      }
      return user;
    }

    if (action.type === 'setUserLanguage') {
      const user = state;
      user.preferredLanguage = action.language;
      user.preferred_language_id = action.language.id;
      this.update_user_preferred_language(action.language);
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

  localeReducer = (state, action) => {
    if (typeof state === 'undefined') {
      addLocaleData([...en, ...es]);

      let languageWithoutRegionCode = navigatorLanguage();
      let messages = localeData[languageWithoutRegionCode] || localeData.en;

      return {
        language: languageWithoutRegionCode,
        messages: messages
      }
    }

    if (action.type === 'setLocaleLanguage') {
      const state = this.store.getState();

      const language = state.languages.filter(x => x.id === action.languageId)[0];

      return {
        language: language.code,
        messages: localeData[language.code] || localeData.en
      }

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