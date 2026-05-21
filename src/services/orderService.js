import api from './api';

const orderService = {
  placeOrder: async (orderData) => {
    const response = await api.post('/api/orders/', orderData);
    return response.data;
  },

  getOrderTracking: async (orderId) => {
    const response = await api.get(`/api/orders/${orderId}`);
    return response.data;
  },

  getMyOrders: async () => {
    const response = await api.get('/api/orders/my');
    return response.data;
  },

  getRestaurantOrders: async () => {
    const response = await api.get('/api/restaurant/orders');
    return response.data;
  },

  acceptOrder: async (orderId) => {
    const response = await api.put(`/api/orders/${orderId}/accept`);
    return response.data;
  },

  rejectOrder: async (orderId) => {
    const response = await api.put(`/api/orders/${orderId}/reject`);
    return response.data;
  },

  dispatchOrder: async (orderId) => {
    const response = await api.put(`/api/orders/${orderId}/deliver`);
    return response.data;
  },

  completeOrder: async (orderId) => {
    const response = await api.put(`/api/orders/${orderId}/complete`);
    return response.data;
  }
};

export default orderService;
