# Data Guide

## Schema Rules
- Singular table names, snake_case columns
- Referential integrity via FK, cascade rules documented

## Migrations
- Each migration: intent, rollback plan
- PR must include migration summary

## Analytics
- Event naming: `domain.action.performed`
- PII handling: hashing/redaction strategy