import { settings } from './settings';
import messages from "./messages";
import {apiSettings} from "./react-utils/settings";
import {formatCurrency} from "./react-utils/utils";

export function defaultProperty(resource) {
  return `${settings.apiResourceEndpoints[resource]}${settings.defaults[resource]}/`;
}

export const booleanChoices = [
  {
    id: '1',
    name: messages.yes,
  },
  {
    id: '0',
    name: messages.no,
  }
];

export function backendStateToPropsUtils(state, ownProps) {
  const user = state.apiResourceObjects[apiSettings.ownUserUrl];
  const preferredNumberFormat = state.apiResourceObjects[user.preferred_number_format];
  const preferredCurrency = state.apiResourceObjects[user.preferred_currency];

  return {
    user,
    preferredCurrency,
    preferredNumberFormat,
    preferredCountry: state.apiResourceObjects[user.preferred_country],
    formatCurrency: (value, currency=null, convertToPreferredCurrency=false) => {
      if (!currency) {
        currency = preferredCurrency
      }

      return formatCurrency(
          value,
          currency,
          convertToPreferredCurrency ? preferredCurrency : null,
          preferredNumberFormat.thousands_separator,
          preferredNumberFormat.decimal_separator)
    },
    convertToPreferredCurrency: (value, currency) => {
      if (value === null) {
        return null;
      }

      const originalCurrencyExchangeRate = currency.exchange_rate;
      const exchangeRate = preferredCurrency.exchange_rate / originalCurrencyExchangeRate;

      return value * exchangeRate;
    },
  };
}