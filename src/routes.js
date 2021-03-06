const routes = {
  '/': 'home',
  '/dashboard': 'Dashboard',
  '/stores': 'stores',
  '/stores/update_pricing': 'update_pricing',
  '/stores/:id': params => ({apiResource: 'stores', apiResourceObjectId: params.id}),
  '/stores/:id/update_pricing': 'update_pricing',
  '/stores/:id/update_logs': 'update_logs',
  '/stores/:id/visits': 'visits',
  '/entities': 'entities',
  '/entities/pending': 'pending_plural',
  '/entities/estimated_sales': 'estimated_sales',
  '/entities/conflicts': 'conflicts',
  '/entities/:id': params => ({apiResource: 'entities', apiResourceObjectId: params.id}),
  '/entities/:id/events': 'events',
  '/entities/:id/pricing_history': 'pricing_history',
  '/entities/:id/associate': 'associate',
  '/products': 'products',
  '/products/:id': params => ({apiResource: 'products', apiResourceObjectId: params.id}),
  '/products/:id/pricing_history': 'pricing_history',
  '/categories': 'categories',
  '/categories/:id': params => ({apiResource: 'categories', apiResourceObjectId: params.id}),
  '/categories/:id/products': 'products',
  '/categories/:id/browse': 'browse',
  '/leads': 'leads',
  '/leads/stats': 'stats',
  '/visits': 'visits',
  '/visits/stats': 'stats',
  '/wtb': 'where_to_buy',
  '/wtb/brands': 'brands',
  '/wtb/brands/:id': params => ({apiResource: 'wtb_brands', apiResourceObjectId: params.id}),
  '/wtb/brands/:id/update_logs': 'update_logs',
  '/wtb/entities': 'entities',
  '/wtb/entities/pending': 'pending_plural',
  '/wtb/entities/:id/associate': 'associate',
  '/wtb/entities/:id': params => ({apiResource: 'wtb_entities', apiResourceObjectId: params.id}),
  '/reports': 'reports',
  '/reports/current_prices': 'current_prices',
  '/reports/store_analysis': 'store_analysis',
  '/users': 'users',
  '/users/:id': params => ({apiResource: 'users', apiResourceObjectId: params.id}),
  '/users/:id/staff_summary': 'staff_summary',
  '/users/:id/staff_actions': 'staff_actions',
  '/ratings': 'ratings',
  '/ratings/pending': 'pending_plural',
  '/ratings/:id': params => ({apiResource: 'ratings', apiResourceObjectId: params.id}),
};
export default routes;
