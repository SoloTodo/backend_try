// let endpoint = 'http://192.168.90.111:8000/api/';
// let endpoint = 'http://192.168.1.100:8000/api/';
// let endpoint = 'https://api.solotodo.com/';
let endpoint = 'http://local.solotodo.com:8000/';
// let endpoint = 'http://api.solotodo.com:8000/';

export const settings = {
  endpoint,
  websiteId: 1,
  apiResourceEndpoints: {
    stores: endpoint + 'stores/',
    languages: endpoint + 'languages/',
    store_types: endpoint + 'store_types/',
    number_formats: endpoint + 'number_formats/',
    currencies: endpoint + 'currencies/',
    countries: endpoint + 'countries/',
    categories: endpoint + 'categories/',
    store_update_logs: endpoint + 'store_update_logs/',
    entities: endpoint + 'entities/',
    entity_histories: endpoint + 'entity_histories/',
    users_with_staff_actions: endpoint + 'users/with_staff_actions/',
    products: endpoint + 'products/',
    category_templates: endpoint + 'category_templates/',
    leads: endpoint + 'leads/',
    visits: endpoint + 'visits/',
    reports: endpoint + 'reports/',
    websites: endpoint + 'websites/',
    category_specs_form_layouts: endpoint + 'category_specs_form_layouts/',
  },
  customIp: '190.215.123.220',  // Chile
  // customIp: '45.79.7.141',  // USA
  ownUserUrl: endpoint + 'users/me/',
  defaults: {
    languages: 1,
    countries: 6
  },
  defaultLanguageCode: 'en',
  usdCurrencyUrl: endpoint + 'currencies/4/',
  categoryTemplateDetailPurposeId: 1,
  ownWebsiteId: 1
};