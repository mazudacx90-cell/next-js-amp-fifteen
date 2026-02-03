// config/api.config.js
const API_CONFIG = {
  development: {
    baseURL: process.env.NEXT_PUBLIC_API_DEV_URL || 'http://localhost:3001/api',
    timeout: 30000,
  },
  production: {
    baseURL: process.env.NEXT_PUBLIC_API_PROD_URL || 'https://api.example.com/api',
    timeout: 30000,
  },
};

const currentEnv = process.env.NODE_ENV === 'production' ? 'production' : 'development';
const config = API_CONFIG[currentEnv];

export default config;
