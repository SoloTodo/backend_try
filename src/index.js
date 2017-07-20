import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter, Route, Switch } from 'react-router-dom'
import { createBrowserHistory } from 'history';
import { PrivateRoute } from './auth/PrivateRoute';

import { IntlProvider, addLocaleData } from 'react-intl';
import en from 'react-intl/locale-data/en';
import es from 'react-intl/locale-data/es';

// Containers
import Full from './containers/Full/'

// Views
import Login from './views/Pages/Login/';

/****************************************************************************
 * Start I18N Configuration
 */

// Our translated strings
import { localeData } from './translations/locales/index';

addLocaleData([...en, ...es]);

// Define user's language. Different browsers have the user locale defined
// on different fields on the `navigator` object, so we make sure to account
// for these different by checking all of them
const language = (navigator.languages && navigator.languages[0]) ||
    navigator.language ||
    navigator.userLanguage;

// Split locales with a region code
const languageWithoutRegionCode = language.toLowerCase().split(/[_-]+/)[0];

// Try full locale, try locale without region code, fallback to 'en'
const messages = localeData[languageWithoutRegionCode] || localeData[language] || localeData.en;

/*****************************************************************************
 * End I18N
 */


const history = createBrowserHistory();

ReactDOM.render((
    <IntlProvider locale={language} messages={messages}>
      <HashRouter history={history}>
        <Switch>
          <Route exact path="/login" name="Login Page" component={Login}/>
          <PrivateRoute path="/" name="Home" component={Full}/>
        </Switch>
      </HashRouter>
    </IntlProvider>
), document.getElementById('root'));
