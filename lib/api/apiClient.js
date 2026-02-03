// lib/api/apiClient.js
import apiConfig from '../../config/api.config';
import { API_HEADERS, HTTP_STATUS_CODES, RESPONSE_STATUS } from '../../constants/api.constants';

class ApiClient {
  constructor(baseURL = apiConfig.baseURL, timeout = apiConfig.timeout) {
    this.baseURL = baseURL;
    this.timeout = timeout;
    this.sessionToken = null;
    this.language = 'en';
  }

  /**
   * Set session token for authenticated requests
   */
  setSessionToken(token) {
    this.sessionToken = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('sessionToken', token);
    }
  }

  /**
   * Get session token
   */
  getSessionToken() {
    if (this.sessionToken) return this.sessionToken;
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sessionToken');
    }
    return null;
  }

  /**
   * Clear session token
   */
  clearSessionToken() {
    this.sessionToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('sessionToken');
    }
  }

  /**
   * Set language
   */
  setLanguage(lang) {
    this.language = lang;
  }

  /**
   * Build request headers
   */
  buildHeaders(customHeaders = {}) {
    const headers = {
      [API_HEADERS.CONTENT_TYPE]: 'application/json',
      [API_HEADERS.ACCEPT_LANGUAGE]: this.language,
      ...customHeaders,
    };

    const sessionToken = this.getSessionToken();
    if (sessionToken) {
      headers[API_HEADERS.X_SESSION] = sessionToken;
    }

    return headers;
  }

  /**
   * Make HTTP request
   */
  async request(method, endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = this.buildHeaders(options.headers);

    // Stringify body based on content type
    let body = options.body;
    if (body && typeof body === 'object') {
      if (headers['Content-Type'] === 'application/x-www-form-urlencoded') {
        // Convert to form-urlencoded format
        const params = new URLSearchParams();
        Object.keys(body).forEach(key => {
          params.append(key, body[key]);
        });
        body = params.toString();
      } else {
        // Default to JSON
        body = JSON.stringify(body);
      }
    }

    const config = {
      method,
      headers,
      ...options,
      body, // Explicitly set body AFTER spreading to ensure it's not overwritten
    };

    // During build (server-side), allow self-signed certificates and handle SSL issues
    if (typeof window === 'undefined') {
      // Node.js environment - add HTTPS agent that allows self-signed certs
      const https = require('https');
      config.agent = new https.Agent({
        rejectUnauthorized: false,
      });
    }

    // console.log(`[ApiClient] ${method} ${endpoint}`, {
    //   url,
    //   method,
    //   body: config.body,
    //   headers,
    //   fullConfig: JSON.stringify(config, null, 2)
    // });

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        return this.handleError(response.status, data);
      }

      return {
        status: RESPONSE_STATUS.SUCCESS,
        code: response.status,
        data,
      };
    } catch (error) {
      console.error(`API Error: ${method} ${endpoint}`, error);
      return {
        status: RESPONSE_STATUS.ERROR,
        code: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
        error: error.message,
      };
    }
  }

  /**
   * Handle API error
   */
  handleError(statusCode, errorData) {
    let status = RESPONSE_STATUS.ERROR;

    switch (statusCode) {
      case HTTP_STATUS_CODES.BAD_REQUEST:
        status = RESPONSE_STATUS.VALIDATION_ERROR;
        break;
      case HTTP_STATUS_CODES.UNAUTHORIZED:
        status = RESPONSE_STATUS.UNAUTHORIZED;
        this.clearSessionToken();
        break;
      case HTTP_STATUS_CODES.FORBIDDEN:
        status = RESPONSE_STATUS.FORBIDDEN;
        break;
      case HTTP_STATUS_CODES.NOT_FOUND:
        status = RESPONSE_STATUS.NOT_FOUND;
        break;
    }

    return {
      status,
      code: statusCode,
      error: errorData.message || 'An error occurred',
      data: errorData,
    };
  }

  /**
   * GET request
   */
  get(endpoint, options = {}) {
    return this.request('GET', endpoint, options);
  }

  /**
   * POST request
   */
  post(endpoint, body, options = {}) {
    return this.request('POST', endpoint, { ...options, body });
  }

  /**
   * PUT request
   */
  put(endpoint, body, options = {}) {
    return this.request('PUT', endpoint, { ...options, body });
  }

  /**
   * PATCH request
   */
  patch(endpoint, body, options = {}) {
    return this.request('PATCH', endpoint, { ...options, body });
  }

  /**
   * DELETE request
   */
  delete(endpoint, options = {}) {
    return this.request('DELETE', endpoint, options);
  }
}

export default ApiClient;
