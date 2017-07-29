let endpoint = 'http://192.168.1.101:8000/api';

export const settings = {
  endpoint,
  resourceEndpoints: {},
  ownUserUrl: endpoint + '/users/me/',
  defaults: {
    languages: 1,
    currencies: 4,
    countries: 6
  },
  defaultLanguageCode: 'en',
};