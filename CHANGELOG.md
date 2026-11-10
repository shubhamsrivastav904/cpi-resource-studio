# 1.1.0 Naming Preview

- Added automatic, draggable tenant launcher with local collapse/position preferences.
- Added local PDF/Word .docx guideline extraction and mandatory review of proposed naming patterns.
- Added SAP-hosted site permissions and a local offscreen document reader; no remote document service.
- Verified automatic launch and PDF/Word-derived suggestions on the copied flow.

- Added live naming review for recognized processing steps using SAP guidance and project rules.
- Added shared rules import/export and offline flow review.
- Added selected native draft renames with identity, context and collision checks. Save remains in CPI.
- Verified live review and two persisted renames on a user-selected copied flow. Other tenant versions still need validation.

# 1.0.0

- Removed Public Beta branding from the extension and current release documentation.
- Consolidated the tested editor, converter, inventory and selectable export features into the first numbered release.
- Documented verified behavior and supported compatibility scope.
- No new permissions or changes to tenant write behavior.

# 0.6.2 — Sender and receiver header aliases

- Source accepts SAP_Sender or Sender; target accepts SAP_Receiver or Receiver.
- Matching alias values are shown once; different values are flagged as conflicts.
- Dynamic, empty, deleted and repeated assignments remain flagged.

# 0.6.1 — Package ordering and configurable export

- Added package names and grouped interface ordering by package, then interface name.
- Added an export dialog with individual field selection and select-all/clear controls.
- Added native Excel (.xlsx) downloads with frozen headers, column filters and UTC dates.
- CSV remains available; excluded fields are omitted from both formats.

# 0.6.0 — Inventory preview

- Added deployed flow inventory with search, CSV export, progress and cancellation.
- Reads native deployed archives and maps SAP_Sender and SAP_Receiver constants.
- Checks archive identity/version and detects deployment changes during scans.
- Flags missing, dynamic, conflicting and repeated header assignments.
- Same activeTab and scripting permissions; no tenant writes from inventory.

# Changelog

## 0.5.1 — Public beta
- Fictional weather/sensor samples and sanitized listing screenshots.
- Per-tab activation across tenant domains using activeTab and scripting.
- Resource navigation, draft editing and optional side-by-side view.
- XML-to-XSD generation, named native CPI upload and collection refresh.
- Persistent save/error banners and concurrent-edit protection.
- Public privacy policy and support contact.

Chrome Web Store submission is pending review. No deployment to SAP is performed.
