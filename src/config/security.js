// Government National Security Economic Risk Dashboard
// Security Configuration

export const SECURITY_CONFIG = {
  // Risk Thresholds for Automated Alerts
  riskThresholds: {
    critical: 8.5,
    high: 7.0,
    medium: 5.0,
    low: 3.0,
    acceptable: 2.0
  },

  // Classification Levels
  classification: {
    level: process.env.REACT_APP_CLASSIFICATION_LEVEL || 'TOP_SECRET',
    caveats: ['NOFORN', 'ORCON', 'REL TO USA, GBR, AUS, CAN'],
    releasability: 'NATO',
    specialAccess: ['SI', 'TK', 'HCS']
  },

  // Authentication & Authorization
  auth: {
    multiFactorRequired: true,
    sessionTimeout: 480, // minutes
    maxLoginAttempts: 3,
    lockoutDuration: 30, // minutes
    passwordPolicy: {
      minLength: 12,
      requireSpecialChars: true,
      requireNumbers: true,
      requireUppercase: true,
      requireLowercase: true,
      preventReuse: 10,
      expiryDays: 90
    }
  },

  // Data Handling
  dataHandling: {
    encryption: {
      algorithm: 'AES-256-GCM',
      keyRotation: 365, // days
      saltRounds: 12
    },
    masking: {
      enabled: true,
      sensitiveFields: ['personnel', 'sources', 'methods']
    },
    retention: {
      classified: '25 years',
      unclassified: '7 years',
      auditLogs: '10 years'
    }
  },

  // Network Security
  network: {
    allowedDomains: [
      'worldbank.org',
      'imf.org',
      'newsapi.org',
      'secure.gov',
      'satellite.gov'
    ],
    certificateValidation: true,
    tlsVersion: '1.3',
    hstsEnabled: true
  },

  // Audit & Compliance
  audit: {
    enabled: process.env.REACT_APP_ENABLE_AUDIT_LOG === 'true',
    logLevel: 'INFO',
    events: [
      'LOGIN',
      'LOGOUT',
      'DATA_ACCESS',
      'EXPORT',
      'SCENARIO_RUN',
      'THRESHOLD_CHANGE',
      'ALERT_TRIGGER'
    ],
    retention: '10 years',
    compliance: {
      standards: ['NIST SP 800-53', 'FISMA', 'FedRAMP'],
      reporting: 'monthly'
    }
  },

  // Incident Response
  incidentResponse: {
    alertThreshold: 'immediate',
    escalation: {
      critical: ['SOC', 'CISO', 'Director'],
      high: ['SOC', 'Team Lead'],
      medium: ['Team Lead'],
      low: ['Individual']
    },
    reporting: {
      internal: 'immediate',
      external: '24 hours',
      authorities: 'as required'
    }
  },

  // Access Control
  accessControl: {
    roles: {
      'SYSTEM_ADMIN': {
        permissions: ['ALL'],
        clearance: 'TOP_SECRET'
      },
      'GOVERNMENT_ANALYST': {
        permissions: ['READ', 'EXPORT', 'SCENARIO'],
        clearance: 'SECRET'
      },
      'POLICY_MAKER': {
        permissions: ['READ', 'EXPORT'],
        clearance: 'SECRET'
      },
      'SECURITY_OFFICER': {
        permissions: ['READ', 'ALERTS', 'MONITOR'],
        clearance: 'TOP_SECRET'
      }
    },
    principleOfLeastPrivilege: true,
    needToKnow: true
  },

  // Data Sanitization
  sanitization: {
    inputValidation: true,
    sqlInjection: 'prevented',
    xssProtection: 'enabled',
    csrfProtection: 'enabled',
    rateLimiting: {
      requestsPerMinute: 100,
      burstLimit: 200
    }
  },

  // Monitoring & Logging
  monitoring: {
    realTime: true,
    metrics: [
      'response_time',
      'error_rate',
      'data_accuracy',
      'user_activity',
      'security_events'
    ],
    alerts: {
      performance: '90th percentile > 2s',
      errors: 'rate > 5%',
      security: 'any critical event'
    },
    logging: {
      format: 'CEF',
      destination: 'SIEM',
      encryption: 'at rest'
    }
  },

  // Backup & Recovery
  backup: {
    frequency: 'daily',
    retention: '7 years',
    encryption: 'AES-256',
    offsite: true,
    testing: 'quarterly'
  },

  // Third-party Risk Management
  thirdParty: {
    assessment: 'annual',
    monitoring: 'continuous',
    contracts: 'required',
    rightToAudit: true
  }
};

// Security Validation Functions
export const validateAccess = (userRole, action, resource) => {
  const rolePermissions = SECURITY_CONFIG.accessControl.roles[userRole]?.permissions || [];
  return rolePermissions.includes('ALL') || rolePermissions.includes(action);
};

export const checkClassification = (userClearance, dataClassification) => {
  const clearanceLevels = {
    'UNCLASSIFIED': 0,
    'CONFIDENTIAL': 1,
    'SECRET': 2,
    'TOP_SECRET': 3
  };

  return clearanceLevels[userClearance] >= clearanceLevels[dataClassification];
};

export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;

  // Remove potentially dangerous characters
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
};

export const logSecurityEvent = (event, details) => {
  if (!SECURITY_CONFIG.audit.enabled) return;

  const logEntry = {
    timestamp: new Date().toISOString(),
    event: event,
    details: details,
    classification: SECURITY_CONFIG.classification.level,
    user: 'current_user', // Replace with actual user context
    sessionId: 'current_session' // Replace with actual session
  };

  // In production, send to SIEM system
  console.log('SECURITY EVENT:', logEntry);
};