import { settings } from './settings';
import Big from 'big.js';

// REF: https://stackoverflow.com/questions/6660977/convert-hyphens-to-camel-case-camelcase
export function camelize(str) {
  return str.replace(/_([a-z])/g, function (g) { return g[1].toUpperCase(); });
}

export function fetchAuth(authToken, input, init={}) {
  if (!input.includes(settings.endpoint)) {
    input = settings.endpoint + input
  }
  if (!init.headers) {
    init.headers = {}
  }
  init.headers.Authorization = `Token ${authToken}`;
  init.headers['Content-Type'] = 'application/json';
  init.headers['Accept'] = 'application/json';
  return fetch(input, init).then(res => res.json())
}

export function navigatorLanguage() {
  // Define user's language. Different browsers have the user locale defined
  // on different fields on the `navigator` object, so we make sure to account
  // for these different by checking all of them
  const language = (navigator.languages && navigator.languages[0]) ||
      navigator.language ||
      navigator.userLanguage;

  return language.toLowerCase().split(/[_-]+/)[0];
}

export function defaultProperty(property) {
  return `${settings.resourceEndpoints[property]}${settings.defaults[property]}/`;
}

export function formatCurrency(value, valueCurrency, conversionCurrency) {
  let formattingCurrency = valueCurrency;

  if (conversionCurrency && valueCurrency.url !== conversionCurrency.url) {
    value *= conversionCurrency.exchangeRate / valueCurrency.exchangeRate;
    formattingCurrency = conversionCurrency
  }

  const decimalPlaces = formattingCurrency.decimalPlaces;
  const decimalSeparator = formattingCurrency.decimalSeparator;
  const thousandsSeparator = formattingCurrency.thousandsSeparator;
  const prefix = formattingCurrency.prefix;

  const decimalValue = new Big(value);

  return prefix + " " + decimalValue.toFixed(decimalPlaces).replace(/./g, function(c, i, a) {
    return i > 0 && c !== decimalSeparator && (a.length - i) % 3 === 0 ? thousandsSeparator + c : c;
  });
}