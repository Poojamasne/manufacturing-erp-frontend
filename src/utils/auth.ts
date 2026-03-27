// Simple auth utility without Redux
export const auth = {
  login: (user: any) => {
    localStorage.setItem('token', 'mock-token');
    localStorage.setItem('user', JSON.stringify(user));
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  }
};
