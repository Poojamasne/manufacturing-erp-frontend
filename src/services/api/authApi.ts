export const authApi = {
  login: async (username: string, _password: string) => {
    return { success: true, token: 'mock-token', user: { id: '1', username, fullName: 'User' } };
  },
  logout: async () => { localStorage.removeItem('token'); },
  getCurrentUser: () => JSON.parse(localStorage.getItem('user') || 'null'),
};
