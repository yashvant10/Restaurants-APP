import api from './api';

const authService = {
  login: async (email, password) => {
    const response = await api.post('/api/auth/login', { email, password });
    return response.data;
  },

  register: async (fullName, email, password, role) => {
    const response = await api.post('/api/auth/register', {
      full_name: fullName,
      email,
      password,
      role,
    });
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/api/auth/me');
    return response.data;
  },

  updateProfile: async (fullName, email, avatar, addresses = null) => {
    const response = await api.put('/api/auth/profile', {
      full_name: fullName,
      email,
      avatar,
      addresses,
    });
    return response.data;
  },

  changePassword: async (oldPassword, newPassword) => {
    const response = await api.put('/api/auth/change-password', {
      old_password: oldPassword,
      new_password: newPassword,
    });
    return response.data;
  },

  logoutAllDevices: async () => {
    const response = await api.post('/api/auth/logout-all');
    return response.data;
  }
};

export default authService;
