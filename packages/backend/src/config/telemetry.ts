import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

export async function setupOpenTelemetry(): Promise<void> {
  const otelEndpoint = process.env.OTEL_ENDPOINT || 'http://localhost:4317';
  const serviceName = process.env.OTEL_SERVICE_NAME || 'driveros-backend';

  const sdk = new NodeSDK({
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
      [SemanticResourceAttributes.SERVICE_VERSION]: process.env.APP_VERSION || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    }),
    traceExporter: new OTLPTraceExporter({
      url: `${otelEndpoint}/v1/traces`,
    }),
    metricExporter: new OTLPMetricExporter({
      url: `${otelEndpoint}/v1/metrics`,
    }),
    instrumentations: [
      getNodeAutoInstrumentations({
        '@opentelemetry/instrumentation-http': {
          ignoreIncomingPaths: ['/health', '/metrics'],
        },
        '@opentelemetry/instrumentation-express': {
          ignoreLayers: ['/health', '/metrics'],
        },
      }),
    ],
  });

  // Initialize the SDK and register with the OpenTelemetry API
  await sdk.start();

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    await sdk.shutdown();
  });

  process.on('SIGINT', async () => {
    await sdk.shutdown();
  });
}
