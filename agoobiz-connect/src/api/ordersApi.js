import api from './api';

export const placeOrder = (orderData) => api.post('/orders', orderData);
export const getOrders = (params) => api.get('/orders', { params });
export const getOrder = (id) => api.get(`/orders/${id}`);
export const updateOrder = (id, orderData) => api.put(`/orders/${id}`, orderData);
export const deleteOrder = (id) => api.delete(`/orders/${id}`);