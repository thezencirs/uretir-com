# Contributing

## Contribution contract

Contributors improve Uretir by leaving the codebase, product behavior, and documentation clearer than they found them. Small changes are welcome when they are scoped, reviewable, and aligned with the product principles.

## Before coding

1. Read [vision.md](./vision.md), [seo-constitution.md](./seo-constitution.md), [product-principles.md](./product-principles.md), and the relevant domain document.
2. Search for existing patterns before introducing a new component, route, data model, or dependency.
3. Write down the user problem, scope, non-goals, acceptance criteria, and primary outcome from the [growth strategy](./growth-strategy.md) for non-trivial work.
4. Create or update a decision-log entry if the change is hard to reverse.

## Branch strategy

- `main` is always releasable.
- Use short-lived branches prefixed by work type: `feature/`, `fix/`, `docs/`, `chore/`, or `experiment/`.
- Rebase or merge the current base before review according to team policy; do not force-push a shared branch without agreement.
- Keep one focused concern per pull request whenever practical.

## Commit standard

Use concise, imperative Conventional Commit-style messages:

```text
feat(identity): add profile visibility controls
fix(seo): preserve canonical URL on category filters
docs(architecture): define notification service boundary
chore(deps): update Next.js patch release
```

The subject explains the user or system outcome. A commit body is required when the change needs migration notes, a risk explanation, or a rollback procedure.

## Coding standards

- TypeScript strictness is a feature; do not bypass types with broad casts.
- Prefer small, composable modules with a single clear responsibility.
- Use semantic HTML before ARIA. Add ARIA only when native semantics are insufficient.
- Keep client-side JavaScript narrow and intentional.
- Avoid duplicated domain constants and route strings; centralize them when they become shared contracts.
- Do not commit secrets, generated credentials, personal test data, or unlicensed assets.
- Add or update documentation when a change affects a public contract or team workflow.

## Review process

A pull request should include:

- What changed and why.
- User-facing impact and non-goals.
- Validation performed.
- Accessibility, performance, SEO, security, and data implications when relevant.
- Screenshots or recordings for visual behavior changes.
- Migration and rollback details for persistent-data or deployment changes.

Reviewers assess correctness, product fit, readability, operational risk, and maintainability. Approval means the reviewer understands the change well enough to support it in production; it is not a rubber stamp.

## Documentation changes

Documentation is reviewed like code. Keep links valid, distinguish current behavior from future state, and remove stale guidance rather than layering exceptions on top of it.
