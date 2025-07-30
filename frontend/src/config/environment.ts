/**
 * Frontend Environment Configuration
 * Centralized configuration management for React app
 */

export interface EnvironmentConfig {
  // API Configuration
  apiUrl: string;
  apiTimeout: number;
  
  // App Configuration
  appName: string;
  appVersion: string;
  environment: 'development' | 'production' | 'test';
  
  // Feature Flags
  enableAnalytics: boolean;
  enableErrorReporting: boolean;
  
  // Development Settings
  enableDebugMode: boolean;
  enableMockData: boolean;
}

// Get environment variables with fallbacks
const getEnvironmentConfig = (): EnvironmentConfig => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isProduction = process.env.NODE_ENV === 'production';
  const isTest = process.env.NODE_ENV === 'test';

  return {
    // API Configuration
    apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:8000',
    apiTimeout: parseInt(process.env.REACT_APP_API_TIMEOUT || '10000'),
    
    // App Configuration
    appName: 'Cura',
    appVersion: process.env.REACT_APP_VERSION || '1.0.0',
    environment: isProduction ? 'production' : isTest ? 'test' : 'development',
    
    // Feature Flags
    enableAnalytics: isProduction && !!process.env.REACT_APP_ANALYTICS_ID,
    enableErrorReporting: isProduction && !!process.env.REACT_APP_SENTRY_DSN,
    
    // Development Settings
    enableDebugMode: isDevelopment || process.env.REACT_APP_DEBUG_MODE === 'true',
    enableMockData: process.env.REACT_APP_USE_MOCK_DATA === 'true',
  };
};

// Export singleton configuration
export const config = getEnvironmentConfig();

// API Endpoints
export const API_ENDPOINTS = {
  // Three-layer analysis endpoint
  analyze: `${config.apiUrl}/api/v1/analyze`,
  
  // Individual component endpoints
  similarCases: `${config.apiUrl}/api/v1/similar-cases`,
  classify: `${config.apiUrl}/api/v1/classify`,
  generateAdvice: `${config.apiUrl}/api/v1/generate-advice`,
  
  // Health and status
  health: `${config.apiUrl}/health`,
  status: `${config.apiUrl}/api/v1/health`,
} as const;

// Validation function to check required environment variables
export const validateEnvironment = (): void => {
  const requiredEnvVars = [
    'REACT_APP_API_URL',
  ];

  const missingVars = requiredEnvVars.filter(
    varName => !process.env[varName]
  );

  if (missingVars.length > 0) {
    console.warn(
      `Missing environment variables: ${missingVars.join(', ')}\n` +
      'Using default values for development.'
    );
  }

  // Log configuration in development
  if (config.enableDebugMode) {
    console.log('Cura Frontend Configuration:', {
      environment: config.environment,
      apiUrl: config.apiUrl,
      enableDebugMode: config.enableDebugMode,
      enableMockData: config.enableMockData,
    });
  }
};

// Export individual values for convenience
export const {
  apiUrl,
  environment,
  enableDebugMode,
  enableMockData,
} = config; 