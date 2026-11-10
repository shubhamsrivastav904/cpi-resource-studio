# Live step naming review preview

Not merged into the published release or submitted to the Store. The installed local preview includes this feature alongside the resource editor, converter and inventory.

Open the extension on a loaded English CPI flow designer and select **Review step names · Preview**, then **Review current flow**. Suggestions use current native diagram names and step configuration categories. Exported .iflw / ZIP review remains available as an offline, read-only alternative.

Reference: https://help.sap.com/docs/cloud-integration/sap-cloud-integration/naming-conventions

SAP-specific script/mapping patterns are distinguished from suggestions based on SAP's general meaningful camelCase guidance. Content Modifiers and Content Enrichers are separate types. Unknown business intent requests context rather than pretending to understand scripts or routing logic. Events, participants and channels are not renamed in this first release.

In CPI Edit mode, edit the suggested text, select the relevant checkboxes and click **Apply selected names**. The extension verifies the selected native symbol and uses the native name field's liveChange event. It checks the active diagram model after each change, retaining IDs. Stale reviews, changed flow context, invalid names and name collisions block changes. If a later item fails, earlier successful items remain in the native draft; the error does not imply rollback. Save through CPI's own Save control to persist draft changes. Save can include other pending native edits. Nothing is deployed by this feature.

Project rules are a small JSON file with schemaVersion 1, name, version, prefix and overrides. Overrides map recognized palette types to simple naming stems. Import/export requires no accounts, backend or tenant details. Rules and local review state remain in the tab until it is closed/reloaded. Reports intentionally include step names and IDs, but exclude header/property values.

Example:

```json
{"schemaVersion":1,"name":"Example project","version":"1","prefix":"","overrides":{"Router":"routeByRegion"}}
```

Validation: automated regression tests, native-model fixtures (including stale runtime caches, array-like selections and liveChange), rules round-trip, secret exclusion, read-only/stale-context/collision checks. Live review covered 14 processing steps on a user-selected copied flow in one English tenant. Two step renames were saved through CPI; both persisted names were verified after full page reloads. Client identifiers and screenshots are excluded from public examples.

Compatibility depends on the native CPI designer version. Unsupported or ambiguous model/field interfaces fail closed. No claim is made of universal tenant or palette coverage. Other tenants and bulk rename failure/recovery still need live validation before a public release.


## Optional project rules upload

The visible Naming rules card offers Upload project rules (.json), Download rules template and Use SAP defaults. Upload validates the entire file before replacing the active profile. A valid upload automatically refreshes an existing live review from the current interface; invalid uploads retain the previous profile and suggestions. Active project/version appears above the review. Unspecified palette types use SAP guidance.

Rules accept legacy plain stems or objects with template and style. Supported placeholders are {purpose}, {type}, {index} (review order, not a permanent step ID) and {flow} (interface ID from the current designer). Styles: camelCase, PascalCase, unchanged. Example: ContentModifier template CM_{purpose}_{index} with PascalCase gives CM_SetHeaders_1 for a header modifier, and CM_SetProperties_2 for a property modifier. Unknown business purpose still requires developer context. Arbitrary scripts, expressions and unknown placeholder/type names are rejected. Files are limited to 32 KB. Word, PDF and Excel documents are not interpreted; transfer those guidelines into the JSON template first.

Rules remain in the open tab and can be exported/shared manually; there is no tenant registration, database or remote rules service. Project templates, automatic suggestion refresh, invalid-upload retention and resetting to SAP defaults are covered by automated tests. The new upload interaction itself has not yet had a live tenant UI test.


## PDF and Word import (1.1 preview update)

The visible upload accepts PDF and Word .docx, in addition to JSON. A local offscreen browser page extracts text using bundled PDF.js or the Word document XML. A proposed per-palette pattern table and extracted guideline text are shown before activation. The user must select Use reviewed rules. Conflicting patterns are left unset. Unrecognized instructions are not automatically enforced. Existing JSON export lets teammates share the confirmed interpretation. No external AI is used. Scans, encrypted PDFs and old .doc binary files require conversion. Automatic launch uses SAP-hosted site permissions and runtime CPI route checks.


Live validation on 11 November 2026: the toolbar appeared automatically on the user-selected copied flow after a page reload, expanded and opened Naming Review. A fictional PDF produced one explicit naming pattern; a fictional Word .docx produced two patterns. Both were presented for review before activation. After confirming the Word-derived rules, live flow suggestions reflected the project ContentModifier and GroovyScript templates. No additional flow names were applied or saved during document testing, and nothing was deployed. No client screenshots or data were used in fixtures.


## Simplified workflow and Open mode fix

The main view now offers just SAP suggestions or Upload business rules (JSON/PDF/Word), a current-flow suggestion table, Refresh suggestions and Apply selected names. Exported-flow inputs and profile setup are hidden from the main screen. Current-flow suggestions load on opening. Document-derived rules still require confirmation, showing only extracted/conflicting types (or editable types when no patterns were found). Duplicate suggested-name display text was removed.

Apply now validates selections first, enters native CPI Edit mode automatically when necessary, waits for the native flow model and rechecks step identity/names/configuration categories before applying. It cannot override missing permissions or locks. Errors retain the existing review, selected checkboxes and edited suggestion text. Save remains in CPI and no deployment is performed. Automated tests cover starting in Open/Edit mode, blocked edit access, changes during edit transition, no lock acquisition for invalid input, and retention after errors. This latest mode-transition/simplified-layout update awaits user live validation; browser control was unavailable in the current full-screen window.
