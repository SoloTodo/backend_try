import React from 'react';
import {FormattedMessage} from "react-intl";

const routes = {
  '/': <FormattedMessage id="home" defaultMessage={`Home`} />,
  '/dashboard': 'Dashboard',
  '/stores': <FormattedMessage id="stores" defaultMessage={`Stores`} />,
  '/stores/:id': params => ({resourceType: 'stores', resourceId: params.id}),
  '/stores/:id/update': <FormattedMessage id="update" defaultMessage={`Update`} />,
  '/stores/:id/update_logs': <FormattedMessage id="update_logs" defaultMessage={`Update logs`} />,
};
export default routes;
