import {apiSettings} from "./react-utils/settings";

export const settings = {
  ...apiSettings,
  // customIp: '190.215.123.220',  // Chile
  // customIp: '45.79.7.141',  // USA
  defaults: {
    languages: 1,
    countries: 6
  },
  defaultLanguageCode: 'en',
  usdCurrencyUrl: apiSettings.endpoint + 'currencies/4/',
  clpCurrencyUrl: apiSettings.endpoint + 'currencies/1/',
  categoryTemplateDetailPurposeId: 1,
  categoryBrowsePurposeId: 1,
  categoryProductsPurposeId: 2,
  ownWebsiteId: 1,
  ownWebsiteUrl: apiSettings.endpoint + 'websites/1/',
  solotodoUrl: 'https://www.solotodo.com/',
  googleAnalyticsId: 'UA-11970222-3',
  mobileNetworkOperatorId: 3
};