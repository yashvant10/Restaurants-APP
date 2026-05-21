import api from './api';

const restaurantService = {
  getRestaurants: async () => {
    const response = await api.get('/api/restaurants');
    return response.data;
  },

  getRestaurantById: async (id) => {
    const response = await api.get(`/api/restaurants/${id}`);
    return response.data;
  },

  getRestaurantMenu: async (restaurantId) => {
    const response = await api.get(`/api/restaurants/${restaurantId}/menu`);
    return response.data;
  },

  getMyRestaurant: async () => {
    const response = await api.get('/api/restaurant/me');
    return response.data;
  },

  getRestaurantAnalytics: async () => {
    const response = await api.get('/api/restaurant/analytics');
    return response.data;
  },

  createMenuItem: async (itemData) => {
    const response = await api.post('/api/menu-items/', itemData);
    return response.data;
  },

  updateMenuItem: async (id, itemData) => {
    const response = await api.put(`/api/menu-items/${id}`, itemData);
    return response.data;
  },

  deleteMenuItem: async (id) => {
    const response = await api.delete(`/api/menu-items/${id}`);
    return response.data;
  },

  toggleMenuItemAvailability: async (id, isAvailable) => {
    const response = await api.put(`/api/menu-items/${id}/toggle-availability`, { is_available: isAvailable });
    return response.data;
  }
};

export default restaurantService;
