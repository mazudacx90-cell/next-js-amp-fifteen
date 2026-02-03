// lib/services/authService.js
import ApiClient from '../api/apiClient';
import { API_ENDPOINTS } from '../../constants/api.constants';

const apiClient = new ApiClient();

class AuthService {
  /**
   * Login user with credentials
   */
  static async login(credentials) {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, {
      email: credentials.email,
      password: credentials.password,
    });

    if (response.status === 'success' && response.data.sessionToken) {
      apiClient.setSessionToken(response.data.sessionToken);
    }

    return response;
  }

  /**
   * Logout user
   */
  static async logout() {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT, {});
    apiClient.clearSessionToken();
    return response;
  }

  /**
   * Validate current session
   */
  static async validateSession() {
    return apiClient.get(API_ENDPOINTS.AUTH.VALIDATE_SESSION);
  }

  /**
   * Refresh token
   */
  static async refreshToken() {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.REFRESH_TOKEN, {});
    
    if (response.status === 'success' && response.data.sessionToken) {
      apiClient.setSessionToken(response.data.sessionToken);
    }

    return response;
  }

  /**
   * Get user profile
   */
  static async getProfile() {
    return apiClient.get(API_ENDPOINTS.AUTH.PROFILE);
  }

  /**
   * Set session token manually
   */
  static setSessionToken(token) {
    apiClient.setSessionToken(token);
  }

  /**
   * Get current session token
   */
  static getSessionToken() {
    return apiClient.getSessionToken();
  }

  /**
   * Clear session token
   */
  static clearSessionToken() {
    apiClient.clearSessionToken();
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated() {
    return !!apiClient.getSessionToken();
  }

  /**
   * Set language
   */
  static setLanguage(lang) {
    apiClient.setLanguage(lang);
  }
}

export default AuthService;
