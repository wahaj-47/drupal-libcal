import client from "./client";

const proxy = {
  get: (_api_proxy_uri, config) =>
    client.get('/api-proxy/libcal', {
      ...config,
      params: {
        ...config?.params,
        _api_proxy_uri,
      },
    }),
  post: (_api_proxy_uri, data, config) =>
    client.post('/api-proxy/libcal', data, {
      ...config,
      params: {
        ...config.params,
        _api_proxy_uri
      }
    })
}

const libcal = {
  getPolicies: () => client.get(`/api/libcal/statements`),
  getFooters: () => client.get(`/api/libcal/footers`),
  getCsrfToken: async () => client.get(`/session/token`),

  // Proxy endpoints
  getLocations: () => proxy.get(`/space/locations?details=1`),
  getCategory: (cid) => proxy.get(`/space/category/${cid}?details=1`),
  getCategories: (lid) => proxy.get(`/space/categories/${lid}?details=1`),
  getZones: (lid) => proxy.get(`/space/zones/${lid}`),
  getItems: (lid) => proxy.get(`/space/items/${lid}?availability=next&pageSize=100`),
  getSpace: (sid, availability = 'next') => proxy.get(`/space/item/${sid}?availability=${availability}`),
  getForm: (fid) => proxy.get(`/space/form/${fid}`),
  reserve: async (payload) => {
    const csrfToken = await libcal.getCsrfToken()
    return proxy.post(`/space/reserve`, payload, { headers: { "X-CSRF-Token": csrfToken } });
  }
};

export default libcal;
