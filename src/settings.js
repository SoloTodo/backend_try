let endpoint = 'http://192.168.1.101:8000/api';

export const settings = {
  endpoint,
  // customIp: '190.215.123.220',  // Chile
  customIp: '45.79.7.141',  // USA
  resourceEndpoints: {},
  ownUserUrl: endpoint + '/users/me/',
  defaults: {
    languages: 1,
    currencies: 4,
    countries: 6
  },
  defaultLanguageCode: 'en',
};