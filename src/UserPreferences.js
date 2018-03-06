import React, {Component} from 'react'
import {connect} from "react-redux";
import {settings} from "./settings";
import {
  ApiResourceObject, filterApiResourceObjectsByType
} from "./react-utils/ApiResource";
import {
  navigatorLanguage, setLocale
} from "./react-utils/utils";
import {backendStateToPropsUtils, defaultProperty} from "./utils";
import Loading from "./components/Loading";

class UserPreferences extends Component {
  componentDidMount() {
    const apiResourceObjects = this.props.apiResourceObjects;

    const languages = this.props.languages;
    const user = new ApiResourceObject(this.props.user, apiResourceObjects);

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

            user.save(this.props.authToken, this.props.dispatch);
          })
    }

    setLocale(user.preferredLanguage.code);
  }

  render() {
    if (!this.props.preferredNumberFormat || !this.props.preferredCurrency || !this.props.preferredLanguage) {
      return <Loading />
    }

    return <div>
      {this.props.children}
    </div>
  }
}

function mapStateToProps(state) {
  const languages = filterApiResourceObjectsByType(state.apiResourceObjects, 'languages');
  const {user, preferredNumberFormat, preferredCurrency, preferredLanguage} = backendStateToPropsUtils(state);

  return {
    languages,
    user,
    preferredNumberFormat,
    preferredCurrency,
    preferredLanguage,
    apiResourceObjects: state.apiResourceObjects,
    authToken: state.authToken,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch
  }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(UserPreferences);
