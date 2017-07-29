let endpoint = 'http://192.168.1.101:8000/api';

export const settings = {
  endpoint,
  ownUserApiPath: '/users/me/',
  defaultLanguageUrl: endpoint + '/languages/1/',
  defaultCurrencyUrl: endpoint + '/currencies/4/',
  defaultCountryUrl: endpoint + '/countries/6/',
  defaultLanguageCode: 'en'
};
