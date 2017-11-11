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
  '/entities/estimated_sales': 'estimated_sales',
  '/entities/conflicts': 'conflicts',
  '/entities/:id': params => ({apiResource: 'entities', apiResourceObjectId: params.id}),
  '/entities/:id/events': 'events',
  '/entities/:id/pricing_history': 'pricing_history',
  '/products': 'products',
  '/products/:id': params => ({apiResource: 'products', apiResourceObjectId: params.id}),
  '/categories': 'categories',
  '/categories/:id': params => ({apiResource: 'categories', apiResourceObjectId: params.id}),
  '/categories/:id/products': 'products',
  '/leads': 'leads',
  '/leads/stats': 'stats'
};
export default routes;
