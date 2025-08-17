# AI Prompt Library (Cursor)

## 1) Test Generator
> Write unit tests for <file>. Goals: cover branches, isolate IO, assert edge cases. Keep tests deterministic. Output: diff-ready code and a brief coverage note.

## 2) Refactor Plan
> Propose a refactor for <module>: goals (readability, SRP), risks, step plan, tests to adjust. Then produce small diffs.

## 3) ADR Writer
> Draft an ADR for decision "<topic>": Context, Decision, Consequences, Alternatives, Status=Proposed.

## 4) PR Review
> Review the diff for correctness, security pitfalls, performance, and clarity. Suggest minimal changes; cite lines.

## 5) Doc Sync
> Update SPEC.md and README sections affected by the new endpoints in <files>. Keep wording concise and actionable.