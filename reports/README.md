# Generated editorial reports

Files in this directory are deterministic editorial-operations artifacts. They describe repository coverage, not real-world market demand.

`ecosystem-completion-report.json` and its Markdown companion contain the persona audit, evidence-backed repository scores, Top 100 missing capabilities, Top 50 official-source entry points, Top 25 AI capabilities, and 7/30/90-day roadmap. Regenerate them with `pnpm report:ecosystem`.

`content-gap-report.json` and its human-readable `content-gap-report.md` companion rank:

- the first 100 authority opportunities found by comparing current graph neighborhoods with governed topic-cluster blueprints;
- the first 100 missing entity-kind requirements found in those same repository records.

Every opportunity is marked `demandStatus: not_validated`. The ranking must not be represented as keyword volume, traffic potential, or proof that a real-world entity does not exist.

Regenerate with:

```bash
pnpm report:gaps
```

The repository quality gate runs both report drift checks and fails when committed output no longer matches domain data or ranking logic. Do not edit generated reports manually.
