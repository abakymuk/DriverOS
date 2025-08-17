# Observability

## What to Collect
- Logs: structured JSON, request-id correlation
- Metrics: request_count, request_duration, error_count
- Traces: API spans incl. DB calls

## Dashboards
- API latency (p50/p95/p99), error rate, top endpoints
- DB slow queries

## Alerts (examples)
- p95 latency > 500ms (5m)
- 5xx rate > 1% (5m)
- DB CPU > 80% (10m)

## Local Dev
- OTel SDK enabled in dev with console exporter or local collector