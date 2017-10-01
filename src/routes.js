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
  '/entities/:id': params => ({apiResource: 'entities', apiResourceObjectId: params.id}),
  '/entities/:id/events': 'events',
  '/entities/:id/pricing_history': 'pricing_history',
  '/products': 'products',
  '/products/:id': params => ({apiResource: 'products', apiResourceObjectId: params.id}),
  '/leads': 'leads',
  '/leads/stats': 'stats'
};
export default routes;
