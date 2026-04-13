// Government National Security Economic Risk Dashboard
// API Configuration for Data Sources

export const API_CONFIG = {
  // World Bank API for Economic Indicators
  worldBank: {
    baseURL: 'https://api.worldbank.org/v2',
    endpoints: {
      indicators: '/country/all/indicator',
      countries: '/country',
      topics: '/topic'
    },
    apiKey: process.env.REACT_APP_WORLDBANK_API_KEY,
    timeout: 10000
  },

  // International Monetary Fund API
  imf: {
    baseURL: 'https://www.imf.org/external/datamapper/api/v1',
    endpoints: {
      indicators: '/indicators',
      countries: '/countries',
      datasets: '/datasets'
    },
    apiKey: process.env.REACT_APP_IMF_API_KEY,
    timeout: 15000
  },

  // News API for Geopolitical Events
  news: {
    baseURL: 'https://newsapi.org/v2',
    endpoints: {
      everything: '/everything',
      topHeadlines: '/top-headlines',
      sources: '/sources'
    },
    apiKey: process.env.REACT_APP_NEWS_API_KEY,
    timeout: 8000
  },

  // Security Intelligence Database (Mock - Replace with real secure API)
  security: {
    baseURL: process.env.REACT_APP_API_BASE_URL || 'https://secure.gov/api/v1',
    endpoints: {
      threats: '/threats',
      incidents: '/incidents',
      alerts: '/alerts',
      intelligence: '/intelligence'
    },
    token: process.env.REACT_APP_SECURITY_DB_TOKEN,
    timeout: 12000
  },

  // Satellite Imagery API (Mock - Replace with real satellite data)
  satellite: {
    baseURL: 'https://api.satellite.gov/v1',
    endpoints: {
      imagery: '/imagery',
      analysis: '/analysis',
      alerts: '/alerts'
    },
    apiKey: process.env.REACT_APP_SATELLITE_API_KEY,
    timeout: 20000
  },

  // Social Media Sentiment Analysis
  socialMedia: {
    baseURL: 'https://api.socialsentiment.com/v1',
    endpoints: {
      sentiment: '/sentiment',
      trends: '/trends',
      alerts: '/alerts'
    },
    apiKey: process.env.REACT_APP_SOCIAL_API_KEY,
    timeout: 10000
  }
};

// API Request Configuration
export const REQUEST_CONFIG = {
  retries: 3,
  retryDelay: 1000,
  headers: {
    'Content-Type': 'application/json',
    'X-Government-Classification': process.env.REACT_APP_CLASSIFICATION_LEVEL || 'UNCLASSIFIED',
    'X-Audit-Enabled': process.env.REACT_APP_ENABLE_AUDIT_LOG || 'true'
  }
};

// Data Refresh Intervals (in milliseconds)
export const REFRESH_INTERVALS = {
  economicData: process.env.REACT_APP_DATA_REFRESH_INTERVAL || 300000, // 5 minutes
  securityData: 180000, // 3 minutes
  geopoliticalData: 600000, // 10 minutes
  alerts: process.env.REACT_APP_ALERT_CHECK_INTERVAL || 60000, // 1 minute
  satelliteData: 3600000 // 1 hour
};

// Error Handling Configuration
export const ERROR_CONFIG = {
  maxRetries: 3,
  fallbackData: true,
  errorReporting: {
    enabled: true,
    endpoint: '/api/errors',
    classification: 'SECRET'
  }
};

// Security Configuration
export const SECURITY_CONFIG = {
  encryption: {
    enabled: true,
    algorithm: 'AES-256-GCM'
  },
  audit: {
    enabled: process.env.REACT_APP_ENABLE_AUDIT_LOG === 'true',
    logLevel: 'INFO',
    retention: '7 years'
  },
  classification: {
    level: process.env.REACT_APP_CLASSIFICATION_LEVEL || 'TOP_SECRET',
    caveats: ['NOFORN', 'ORCON']
  }
};

// Feature Flags
export const FEATURES = {
  scenarioAnalysis: process.env.REACT_APP_ENABLE_SCENARIO_ANALYSIS === 'true',
  realTimeAlerts: process.env.REACT_APP_ENABLE_REAL_TIME_ALERTS === 'true',
  exportFeatures: process.env.REACT_APP_ENABLE_EXPORT_FEATURES === 'true',
  debugMode: process.env.REACT_APP_DEBUG_MODE === 'true',
  satelliteImagery: true,
  socialSentiment: true,
  predictiveAnalytics: true
};

// Export Formats Configuration
export const EXPORT_CONFIG = {
  pdf: {
    template: process.env.REACT_APP_PDF_REPORT_TEMPLATE || 'government_template',
    classification: 'TOP_SECRET',
    watermark: true,
    maxPages: 100
  },
  excel: {
    format: process.env.REACT_APP_EXCEL_EXPORT_FORMAT || 'xlsx',
    maxRows: process.env.REACT_APP_MAX_EXPORT_ROWS || 10000,
    includeMetadata: true
  },
  json: {
    prettyPrint: true,
    includeTimestamps: true
  }
};