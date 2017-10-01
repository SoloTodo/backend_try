import React from 'react';
import { FormattedMessage } from 'react-intl';

export const sidebarLayout = [
  {
    title: <FormattedMessage id={'stores'} defaultMessage={'Stores'} />,
    icon: 'glyphicons glyphicons-shop',
    entries: [
      {
        label: <FormattedMessage id='show_list' defaultMessage='Show all' />,
        path: '/stores',
        requiredPermission: 'solotodo.backend_list_stores',
      },
      {
        label: <FormattedMessage id='update' defaultMessage='Update' />,
        path: '/stores/update',
        requiredPermission: 'solotodo.update_store_pricing',
      }
    ]
  },
  {
    title: <FormattedMessage id={'entities'} defaultMessage={'Entities'} />,
    icon: 'glyphicons glyphicons-inbox',
    entries: [
      {
        label: <FormattedMessage id='show_list_female' defaultMessage='Show all' />,
        path: '/entities',
        requiredPermission: 'solotodo.backend_list_entities',
      },
      {
        label: <FormattedMessage id='conflicts' defaultMessage='Conflicts' />,
        path: '/entities/conflicts',
        requiredPermission: 'solotodo.backend_view_entity_conflicts',
      }
    ]
  },
  {
    title: <FormattedMessage id={'products'} defaultMessage='Products' />,
    icon: 'glyphicons glyphicons-tags',
    entries: [
      {
        label: <FormattedMessage id='show_list_male' defaultMessage='Show all' />,
        path: '/products',
        requiredPermission: 'solotodo.backend_list_products',
      }
    ]
  }
];
