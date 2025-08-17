# Deployment

## CI
- Actions pipeline: lint → typecheck → tests → build → artifact
- Required checks block merge

## CD
- Staging: on push to `dev`
- Prod: protected, require approvals

## Config
- `.env.example` kept in repo; real env in secrets manager
- Feature flags via <tool>