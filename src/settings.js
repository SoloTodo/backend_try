let endpoint = 'http://localhost:8000/api/';

export const settings = {
  endpoint,
  resourceEndpoints: {
    stores: endpoint + 'stores/',
    languages: endpoint + 'languages/',
    store_types: endpoint + 'store_types/',
    currencies: endpoint + 'currencies/',
    countries: endpoint + 'countries/'
  },
  customIp: '190.215.123.220',  // Chile
  // customIp: '45.79.7.141',  // USA
  ownUserUrl: endpoint + 'users/me/',
  defaults: {
    languages: 1,
    countries: 6
  },
  defaultLanguageCode: 'en',
};