import React, { Component } from 'react';
import { connect } from 'react-redux';
import { IntlProvider } from 'react-intl';

import { localeData } from './translations/locales/index';

// REF https://github.com/yahoo/react-intl/issues/243

// This function will map the current redux state to the props for the component that it is "connected" to.
// When the state of the redux store changes, this function will be called, if the props that come out of
// this function are different, then the component that is wrapped is re-rendered.

class ConnectedIntlProvider extends Component {
  render() {
    return <IntlProvider locale={this.props.locale} messages={this.props.messages} key={this.props.locale}>{this.props.children}</IntlProvider>
  }
}

function mapStateToProps(state) {
  let languageCode = state.language.code;
  let messages = localeData[languageCode];

  if (!messages) {
    languageCode = 'en';
    messages = localeData[languageCode]
  }

  return {
    locale: languageCode,
    messages
  };
}

export default connect(mapStateToProps)(ConnectedIntlProvider);
