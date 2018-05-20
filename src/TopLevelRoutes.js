import React from "react";
import { FormattedMessage } from "react-intl";

export const sidebarLayout = [
  {
    title: <FormattedMessage id="stores" defaultMessage="Stores" />,
    icon: "glyphicons glyphicons-shop",
    entries: [
      {
        label: <FormattedMessage id="show_list" defaultMessage="Show all" />,
        path: "/stores",
        requiredPermission: "solotodo.backend_list_stores",
      },
      {
        label: <FormattedMessage id="update" defaultMessage="Update" />,
        path: "/stores/update_pricing",
        requiredPermission: "solotodo.update_store_pricing",
      }
    ]
  },
  {
    title: <FormattedMessage id="categories" defaultMessage="Categories" />,
    icon: "glyphicons glyphicons-tv",
    entries: [
      {
        label: <FormattedMessage id="show_list" defaultMessage="Show all" />,
        path: "/categories",
        requiredPermission: "solotodo.backend_list_categories",
      }
    ]
  },
  {
    title: <FormattedMessage id="entities" defaultMessage="Entities" />,
    icon: "glyphicons glyphicons-inbox",
    entries: [
      {
        label: <FormattedMessage id="show_list_female" defaultMessage="Show all" />,
        path: "/entities",
        requiredPermission: "solotodo.backend_list_entities",
      },
      {
        label: <FormattedMessage id="pending_plural" defaultMessage="Pending" />,
        path: "/entities/pending",
        requiredPermission: "solotodo.backend_view_pending_entities",
      },
      {
        label: <FormattedMessage id="conflicts" defaultMessage="Conflicts" />,
        path: "/entities/conflicts",
        requiredPermission: "solotodo.backend_view_entity_conflicts",
      },
      {
        label: <FormattedMessage id="estimated_sales" defaultMessage="Estimated sales" />,
        path: "/entities/estimated_sales",
        requiredPermission: "solotodo.backend_view_entity_estimated_sales",
      }
    ]
  },
  {
    title: <FormattedMessage id="products" defaultMessage="Products" />,
    icon: "glyphicons glyphicons-tags",
    entries: [
      {
        label: <FormattedMessage id="show_list_male" defaultMessage="Show all" />,
        path: "/products",
        requiredPermission: "solotodo.backend_list_products",
      }
    ]
  },
  {
    title: <FormattedMessage id="visits" defaultMessage="Visits" />,
    icon: "fa fa-eye",
    entries: [
      {
        label: <FormattedMessage id="show_list_female" defaultMessage="Show all" />,
        path: "/visits",
        requiredPermission: "solotodo.backend_list_visits",
      },
      {
        label: <FormattedMessage id="stats" defaultMessage="Stats" />,
        path: "/visits/stats",
        requiredPermission: "solotodo.backend_list_visits",
      }
    ]
  },
  {
    title: <FormattedMessage id="leads" defaultMessage="Leads" />,
    icon: "fas fa-external-link-alt",
    entries: [
      {
        label: <FormattedMessage id="show_list_male" defaultMessage="Show all" />,
        path: "/leads",
        requiredPermission: "solotodo.backend_list_leads",
      },
      {
        label: <FormattedMessage id="stats" defaultMessage="Stats" />,
        path: "/leads/stats",
        requiredPermission: "solotodo.backend_list_leads",
      }
    ]
  },
  {
    title: <FormattedMessage id="ratings" defaultMessage="Ratings" />,
    icon: "fa fa-thumbs-up",
    entries: [
      {
        label: <FormattedMessage id="show_list_male" defaultMessage="Show all" />,
        path: "/ratings",
        requiredPermission: "solotodo.backend_list_ratings",
      },
      {
        label: <FormattedMessage id="pending_plural" defaultMessage="Pending" />,
        path: "/ratings/pending",
        requiredPermission: "solotodo.is_ratings_staff",
      }
    ]
  },
  {
    title: <FormattedMessage id="where_to_buy" defaultMessage="Where to Buy" />,
    icon: "fa fa-compass",
    entries: [
      {
        label: <FormattedMessage id="brands" defaultMessage="Brands" />,
        path: "/wtb/brands",
        requiredPermission: "wtb.backend_view_wtb",
      },
      {
        label: <FormattedMessage id="entities" defaultMessage="Entities" />,
        path: "/wtb/entities",
        requiredPermission: "wtb.backend_view_wtb",
      },
      {
        label: <FormattedMessage id="pending_entities" defaultMessage="Pending entities" />,
        path: "/wtb/entities/pending",
        requiredPermission: "wtb.backend_view_pending_wtb_entities",
      },
    ]
  },
  {
    title: <FormattedMessage id="reports" defaultMessage="Reports" />,
    icon: "fa fa-file-excel-o",
    entries: [
      {
        label: <FormattedMessage id="all_masculine" defaultMessage="All" />,
        path: "/reports",
        requiredPermission: "reports.backend_list_reports",
      }
    ]
  },
  {
    title: <FormattedMessage id="users" defaultMessage="Users" />,
    icon: "fa fa-users",
    entries: [
      {
        label: <FormattedMessage id="all_masculine" defaultMessage="All" />,
        path: "/users",
        requiredPermission: "solotodo.backend_list_users",
      },
      {
        label: <FormattedMessage id="my_user" defaultMessage="My user" />,
        path: "/users/me",
        requiredPermission: "solotodo.view_users_with_staff_actions",
      },

    ]
  },
];
