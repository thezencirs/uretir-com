# TeşvikAI Trust and Data Contract

## Product boundary

TeşvikAI is a source-backed research and preparation assistant. It may identify a **potential match**, explain missing information, and send the user to the responsible institution. It must never claim that a person or company is eligible, approved, guaranteed to receive support, or able to apply after a deadline.

The competent institution owns current conditions and the final decision.

## Coverage model

The architecture supports agriculture, livestock, investment, regional, export, technology, SME, energy, education, employment, European Union, development-agency, and municipality programmes. Coverage means the data model can represent the domain; it does not mean current programme records have been ingested.

## Record provenance

Every programme record requires:

- stable internal ID and, when available, official record ID;
- responsible authority and exact official record URL;
- retrieval, human-verification, and next-review timestamps;
- content fingerprint;
- domain classification;
- claim-linked eligibility rules;
- claim-linked application window and amount when present;
- status: under review, verified, stale, or archived;
- successor link when a programme is replaced.

A portal-level registry entry is not sufficient evidence for an amount, deadline, eligible expense, region, sector, or applicant type. Those claims need their own source references.

## Assessment semantics

`assessIncentiveProgramme` fails closed:

- `potential_match`: every represented rule matches, the record is verified, and it is still inside its review window;
- `not_enough_information`: required profile fields are absent;
- `not_a_match`: at least one represented rule fails;
- `source_not_usable`: the record is stale, under review, archived, or otherwise outside its verification window.

There is deliberately no `eligible` result.

## Change and verification workflow

1. A connector discovers a changed official record and stores its source checkpoint.
2. The system fingerprints the source and compares it with the last verified snapshot.
3. Any material change downgrades the record from verified to under review.
4. A trained editor checks the exact official document, dates, rules, and amendments.
5. A second reviewer is required for deadlines, amounts, eligibility, and legal interpretations.
6. Approved records receive a new fingerprint, verification time, and next-review time.
7. Expired review windows automatically remove records from matching.
8. Withdrawn or superseded programmes remain archived for audit but never appear as open opportunities.

## Initial pilot

Do not ingest every institution at once. Select one narrow programme family with stable official pages, a named editor and backup reviewer, clear amendment behavior, a small evaluation set, and monitoring for source failure. Only after the pilot passes freshness, contradiction, accessibility, and incident tests should a second source family be connected.

## Privacy

Pre-assessment requests the minimum business information needed for represented rules. Sensitive personal identifiers, credentials, tax records, and private application documents must not be requested until identity, consent, encryption, access control, retention, export, and deletion are implemented and reviewed.
