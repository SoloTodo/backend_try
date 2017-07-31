import React from 'react';
import { FormattedMessage } from 'react-intl';
import StoreList from './views/Store/StoreList';

export const sidebarLayout = [
  {
    key: 1,
    title: <FormattedMessage id={'stores'} defaultMessage={'Stores'} />,
    icon: 'glyphicons glyphicons-shop',
    entries: [
      {
        key: 1,
        label: <FormattedMessage id='show_list' defaultMessage='Show all' />,
        icon: 'glyphicons glyphicons-list',
        path: '/stores',
        requiredPermission: 'solotodo.backend_list_stores',
        name: 'Stores',
        component: StoreList
      }
    ]
  }
];

export const routes = sidebarLayout.reduce((ongoing, section) => {
  return ongoing.concat(section.entries);
}, []);
