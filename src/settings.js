// let endpoint = 'http://192.168.90.111:8000/api/';
// let endpoint = 'http://192.168.1.101:8000/api/';
let endpoint = 'http://localhost:8000/api/';

export const settings = {
  endpoint,
  resourceEndpoints: {
    stores: endpoint + 'stores/',
    languages: endpoint + 'languages/',
    store_types: endpoint + 'store_types/',
    number_formats: endpoint + 'number_formats/',
    currencies: endpoint + 'currencies/',
    entity_states: endpoint + 'entity_states/',
    countries: endpoint + 'countries/',
    categories: endpoint + 'categories/',
    store_update_logs: endpoint + 'store_update_logs/',
    entities: endpoint + 'entities/',
    entity_histories: endpoint + 'entity_histories/'
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