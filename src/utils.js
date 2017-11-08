import { settings } from './settings';
import Big from 'big.js';
import moment from 'moment';
import locale_es from "moment/locale/es";
import messages from "./messages";

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

  return fetch(input, init).then(res => {
    if (!res.ok) {
      throw res
    }
    return res.json()
  })
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

export function defaultProperty(resource) {
  return `${settings.apiResourceEndpoints[resource]}${settings.defaults[resource]}/`;
}

export function formatDateStr(timestampStr) {
  const dateObj = moment(timestampStr);
  return dateObj.format('llll')
}

export function formatCurrency(value, valueCurrency, conversionCurrency, thousandsSeparator, decimalSeparator) {
  if (typeof value === 'undefined' || value === null || Number.isNaN(value)) {
    return ''
  }

  let formattingCurrency = valueCurrency;

  if (conversionCurrency && valueCurrency.url !== conversionCurrency.url) {
    value *= conversionCurrency.exchangeRate / valueCurrency.exchangeRate;
    formattingCurrency = conversionCurrency
  }

  const decimalPlaces = formattingCurrency.decimalPlaces;
  const prefix = formattingCurrency.prefix;
  const decimalValue = new Big(value);

  return prefix + ' ' + _formatCurrency(decimalValue, decimalPlaces, 3, thousandsSeparator, decimalSeparator);
}

export function convertToDecimal(value) {
  if (typeof value === 'undefined') {
    return undefined
  }

  if (value === null) {
    return null
  }

  return new Big(value)
}

export function setLocale(locale) {
  const localesDict = {
    'es': locale_es,
    'en': null
  };

  if (typeof localesDict[locale] === 'undefined') {
    console.warn('Using unsupported locale: ' + locale);
  }

  moment.locale(locale)
}

/**
 * @param value: Value to format
 * @param n: length of decimal
 * @param x: length of whole part
 * @param s: sections delimiter
 * @param c: decimal delimiter
 */
function _formatCurrency(value, n, x, s, c) {
  const re = '\\d(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\D' : '$') + ')',
      num = value.toFixed(Math.max(0, ~~n));

  return (c ? num.replace('.', c) : num).replace(new RegExp(re, 'g'), '$&' + (s || ','));
}

export function listToObject(list, key='id') {
  const result = {};

  for (const item of list) {
    result[item[key]] = item
  }

  return result
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

export function parseBig(value) {
  if (value === null) {
    return null
  }

  return new Big(value)
}

export function fillTimeLapse(dataset, startDate, endDate, dateField, valueField, emptyValue) {
  const valuesDict = {};

  for (const dataPoint of dataset) {
    valuesDict[dataPoint[dateField]] = dataPoint[valueField]
  }

  const result = [];

  const iterDate = moment(startDate);
  while (iterDate <= endDate) {
    let entryValue = valuesDict[iterDate];
    if (typeof(entryValue) === 'undefined') {
      entryValue = emptyValue
    }

    result.push({
      date: moment(iterDate),
      [valueField]: entryValue
    });

    iterDate.add(1, 'days')
  }

  return result;
}

const offset = moment().utcOffset();

export function parseDateToCurrentTz(dateStr) {
  /* Handle all the dates using the CURRENT timezone of the browser
  * This is different than just calling moment(dateStr) because moment()
  * handles DST, so if two dates are in different DST then they have a 1 hour
  * offset */
  return moment(dateStr).utcOffset(offset, true);
}