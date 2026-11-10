# Release validation

Version 1.0.0 includes the resource editor, XML-to-XSD converter and deployed interface inventory with package ordering, selected-field Excel/CSV export and sender/receiver header aliases.

## Verified behavior

Automated checks cover page access gating, asynchronous resource discovery, edit/apply/reopen verification, native flow saves, concurrent changes, read-only handling, server failures, cancellation, schema upload and collision prevention, XML converter edge cases, archive integrity and identity/version checks, deployment changes, package ordering, four header-name combinations, alias conflicts, selected export fields, formula-safe output, workbook structure and export limits.

Live validation on one English-language tenant verified native resource edits and schema uploads on a copied flow, a complete inventory scan, package ordering, search and selected-field Excel downloads. The four alias combinations and conflicts additionally have automated fixture coverage.

## Supported scope

Desktop Chrome 111+; supported English SAP Cloud Integration Design and Monitor interfaces over HTTPS, with the user's existing permissions. Other tenants, localized/legacy UI variants and future SAP changes require compatibility testing. No broader tenant certification is claimed.

Drafts are in memory only. Native flow Save can also save other pending changes. Inventory reads deployed archives; dynamic/script-based system assignments are not evaluated. Multiple or conflicting assignments are flagged. No telemetry or publisher backend is included.

Release validation does not establish universal compatibility or replace organizational testing before use on sensitive flows. Public examples and screenshots must use fictional data.
