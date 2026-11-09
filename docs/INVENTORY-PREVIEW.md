# Inventory preview validation

This build is a local preview, not a store release.

## Completed checks

- All existing popup, editor, converter and upload simulations pass.
- Inventory tests cover constant header extraction, dynamic and conflicting values, malformed XML, stored/deflated ZIPs, CRC checks, archive identity/version mismatch, deployment changes, denied access, cancellation, CSV escaping and exclusion of unrelated header values.
- Live tenant: deployed metadata list was readable through the signed-in browser session.
- Live tenant: native monitoring list and Download operations were observed returning XML and a deployed archive.
- Live tenant: downloaded sample archive identity/version passed, and both agreed system header values were extracted. A second archive without these headers correctly produced missing-header review notes.

## Live extension result

- Installed the isolated 0.6.0 preview alongside the published extension with user approval.
- Full live scan completed: 37 deployed integration flows, all 37 archive identities and versions checked.
- One sample flow contained both agreed headers; the other 36 rows were correctly flagged as missing them.
- Search reduced the table to the sample row.
- CSV download was read back: 37 rows, fixed expected columns, correct sample mapping, no pending rows.
- Tenant/customer data and downloaded archives are excluded from this source and release ZIP.

## Remaining compatibility work

Validate additional tenants and permissions before public release. The published store version has not been updated.

## Behavior and limits

The scan uses two same-origin, read-only native CPI monitoring operations. It has no publisher backend, persistence, telemetry, new host permissions, tenant writes or deployment actions. SAP can change these internal routes; unsupported responses fail visibly.

The configured constants are an inventory aid. Runtime expressions, externalized parameters and Groovy assignments are not resolved. Multiple assignments are flagged because branch order and runtime paths are not evaluated. CSV files may contain confidential system/flow names; the user controls their local export.

## 0.6.1 package and export validation

- Automated tests passed for package metadata extraction, natural interface ordering, selected-field CSV/XLSX exports, empty selection, literal formula-like text, XML escaping, cell length limits, frozen header, filters and date cells.
- Reloaded the installed preview to 0.6.1 and completed a full live scan.
- Live result: 37 deployed interfaces across 6 packages, grouped by package and ordered by interface name.
- Downloaded Excel with Runtime status and Deployed on unchecked. Read back the workbook ZIP/XML and verified 37 data rows, 7 selected columns, contiguous package groups, correct sample mapping and absence of unchecked columns.
- Inspected the live export dialog layout. No tenant edits or deployments were performed.
