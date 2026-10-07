import api from "./api";

// Centralizes every product-related API call so pages don't repeat fetch logic.
export const productsApi = {
  getAll: async (params = {}) => {
    const res = await api.get("/products", { params });
    return res.data.data; // backend wraps responses as { success, data }
  },

  getMine: async (sellerId) => {
    try {
      return (await api.get("/products/mine")).data.data;
    } catch (err) {
      if (![404, 500].includes(err.response?.status)) throw err;

      // Older running servers may not have the authenticated seller-list route yet.
      const products = (await api.get("/products")).data.data;
      return products.filter((product) =>
        String(product.sellerId ?? product.seller?.id) === String(sellerId)
      );
    }
  },

  getById: async (id) => {
    const res = await api.get(`/products/${id}`);
    return res.data.data;
  },

  create: async (productData) => {
    const res = await api.post("/products", productData);
    return res.data;
  },

  update: async (id, productData) => {
    const res = await api.put(`/products/${id}`, productData);
    return res.data;
  },

  remove: async (id) => {
    const res = await api.delete(`/products/${id}`);
    return res.data;
  },
};