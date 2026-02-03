// constants/api.constants.js
export const API_ENDPOINTS = {
  // Article endpoints
  ARTICLES: {
    LIST: '/article/list',
    DETAIL: '/article/:articleKey',
    CATEGORIES: '/article/categories/list',
    BY_CATEGORY: '/article/categories/:categoryKey',
  },
  
  // Comments endpoints
  COMMENTS: {
    LIST: '/article/:articleKey/comment',
    CREATE: '/article/:articleKey/comment',
    DETAIL: '/article/:articleKey/comment/:commentId',
    UPDATE: '/article/:articleKey/comment/:commentId',
  },
  
  // Comment replies endpoints
  REPLIES: {
    LIST: '/article/:articleKey/comment',
    CREATE: '/article/:articleKey/comment/:commentId/replies',
  },
  
  // Comment reactions endpoints
  REACTIONS: {
    CREATE: '/article/comment/:commentId/reactions',
  },

  // User/Auth endpoints
  AUTH: {
    LOGIN_NODE: '/auth/login/node',
    LOGIN_USERNAME: '/auth/login/username',
    LOGOUT: '/auth/logout',
    VALIDATE_SESSION: '/auth/validate-session',
    REFRESH_TOKEN: '/auth/refresh-token',
    PROFILE: '/auth/profile',
  },

  // SITE
  SITE: {
    LOAD: '/site/loadData'
  },

};

// Local API routes (Next.js API handlers)
export const LOCAL_API_ROUTES = {
  COMMENTS: (canonical) => `/api/articles/${canonical}/comments`,
};

export const API_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  //DELETE: 'DELETE',
};

export const API_HEADERS = {
  CONTENT_TYPE: 'Content-Type',
  AUTHORIZATION: 'Authorization',
  X_SESSION: 'x-session',
  ACCEPT_LANGUAGE: 'Accept-Language',
};

export const RESPONSE_STATUS = {
  SUCCESS: 'success',
  ERROR: 'error',
  VALIDATION_ERROR: 'validation_error',
  UNAUTHORIZED: 'unauthorized',
  FORBIDDEN: 'forbidden',
  NOT_FOUND: 'not_found',
};

export const HTTP_STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};