import * as Sentry from '@sentry/node';

export function initializeSentry() {
  if (!process.env.SENTRY_DSN) {
    console.log('📊 Sentry disabled - no SENTRY_DSN configured');
    return;
  }

  console.log('📊 Initializing Sentry...');

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    release: process.env.APP_VERSION || '1.0.0',
    
    // Performance monitoring
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    
    // Performance monitoring only for now
    integrations: [],

    // Error filtering
    beforeSend(event, hint) {
      // Don't send health check errors
      if (event.request?.url?.includes('/health')) {
        return null;
      }
      
      // Don't send validation errors to Sentry (they're expected)
      if (hint.originalException && 
          (hint.originalException as any)?.status === 400) {
        return null;
      }
      
      return event;
    },

    // Additional context
    initialScope: {
      tags: {
        service: 'driveros-backend',
        version: process.env.APP_VERSION || '1.0.0',
      },
    },
  });

  console.log('✅ Sentry initialized successfully');
}