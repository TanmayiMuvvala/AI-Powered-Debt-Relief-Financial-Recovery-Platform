import api from "./api";

export const authService = {
  /**
   * Register a new user account.
   * @param {Object} userData - { full_name, email, password }
   */
  register: async (userData) => {
    const response = await api.post("/auth/register", userData);
    return response.data;
  },

  /**
   * Login and receive JWT token.
   * @param {Object} credentials - { email, password }
   * @returns {Object} { access_token, token_type, user }
   */
  login: async (credentials) => {
    const response = await api.post("/auth/login", credentials);
    return response.data;
  },

  /**
   * Get the current authenticated user's profile.
   */
  getMe: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },
};
