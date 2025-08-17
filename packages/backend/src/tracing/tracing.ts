import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

// Initialize tracing only if OTEL_ENDPOINT is provided
export function initializeTracing() {
  if (!process.env.OTEL_ENDPOINT && process.env.NODE_ENV !== 'development') {
    console.log('🔍 OpenTelemetry disabled - no OTEL_ENDPOINT configured');
    return null;
  }

  const serviceName = process.env.OTEL_SERVICE_NAME || 'driveros-backend';
  const serviceVersion = process.env.APP_VERSION || '1.0.0';

  console.log(`🔍 Initializing OpenTelemetry for ${serviceName}@${serviceVersion}`);

  const jaegerExporter = new JaegerExporter({
    endpoint: process.env.OTEL_ENDPOINT || 'http://localhost:14268/api/traces',
  });

  // Remove Prometheus exporter for now due to compatibility issues
  // const prometheusExporter = new PrometheusExporter({
  //   port: 9464,
  // });

  const sdk = new NodeSDK({
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
      [SemanticResourceAttributes.SERVICE_VERSION]: serviceVersion,
      [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || 'development',
    }),
    traceExporter: jaegerExporter,
    // metricReader: prometheusExporter,
    instrumentations: [
      getNodeAutoInstrumentations({
        // Disable some instrumentations that might be noisy
        '@opentelemetry/instrumentation-fs': {
          enabled: false,
        },
        '@opentelemetry/instrumentation-dns': {
          enabled: false,
        },
      }),
    ],
  });

  try {
    sdk.start();
    console.log('✅ OpenTelemetry initialized successfully');

    // Graceful shutdown
    process.on('SIGTERM', () => {
      sdk.shutdown()
        .then(() => console.log('🔍 OpenTelemetry terminated'))
        .catch((error) => console.log('❌ Error terminating OpenTelemetry', error))
        .finally(() => process.exit(0));
    });

    return sdk;
  } catch (error) {
    console.error('❌ Failed to initialize OpenTelemetry:', error);
    return null;
  }
}