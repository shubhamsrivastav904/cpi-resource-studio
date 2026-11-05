# CPI Resource Studio · 0.5.1 Public Beta

An independent Chrome extension for SAP Cloud Integration. Browse local flow resources in one workspace, edit them, compare two files side by side, and generate named XSD resources from sample XML.

## Install and share
1. Download and extract the release ZIP into a permanent folder.
2. Open chrome://extensions and turn on Developer mode.
3. Choose Load unpacked and select the folder containing manifest.json.
4. Disable older CPI Resource Collection / Navigator builds to avoid duplicate workspaces, then refresh CPI after saving native work.
5. Pin CPI Resource Studio from Chrome's Extensions menu.
6. Open a signed-in integration flow. Click the extension icon and Open workspace.

The ZIP is shareable for manual installation. It is not a Chrome Web Store listing and cannot be installed by clicking the ZIP. Managed browsers may require administrator approval. No developer mode is required once a store-reviewed version becomes available.

## Tenant access
No tenant hostname is hard-coded. Activation requires HTTPS, an integration-flow route and a loaded SAPUI5 page. Access is granted temporarily to the active tab when you invoke the extension. There are no permanent host permissions, all-sites background scripts, account setup or API keys. After a full refresh, click the extension icon again. In-app navigation within the same tenant retains the workspace.

## Resource Editor
Opens native References → Local and reads supported XSD, WSDL, Groovy, JavaScript, XML and XSL/XSLT resource links. Select a resource in the sidebar or use previous/next. Single editor is the default; Compare side by side adds another pane. This is visual side-by-side comparison, not a highlighted diff.

Edits remain drafts in that tab. Save checks for external changes, verifies well-formed XML where applicable, stages each edit through CPI's native editor and saves the integration flow. A green banner requires CPI's save acknowledgement. A missing acknowledgement is shown as unconfirmed. No deployment is performed.

## XML → XSD
Paste or open a sample XML file, name the schema and optionally choose string-only types or optional child fields. Preview XSD, then Generate & save to CPI. The extension uses Add → Schema → XSD, saves the flow, refreshes the collection and selects the new schema. Existing filenames are rejected rather than overwritten. Copy and Download are also available.

The converter infers structure from samples. Review types, occurrence constraints and business requirements. Mixed foreign namespaces, DTDs, XML over 2 MB and excessive depth are rejected. XSD → XML and full XML-against-XSD validation are not included. XML well-formedness checks are not semantic schema validation.

## Save and draft behavior
Save also persists other pending flow changes, as CPI's native Save does. Resources are processed sequentially, not transactionally. A later failure may leave earlier resources staged or saved. Keep the tab open and inspect CPI before retrying. Do not operate native CPI controls while the workspace is working. Minimize retains drafts. Refresh/close loses them; the extension requests a browser leave warning for resource drafts or entered converter XML, subject to Chrome's normal dialog rules. Draft recovery is not included.

The workspace executes in the tenant page environment to interact with SAPUI5 and Ace. The tenant and other code running there can access its in-memory data; this is not a security isolation boundary. Only activate it on tenant pages you trust.

## Compatibility and validation
Chrome 111+; desktop English SAP Cloud Integration designer, top-level HTTPS iFlow pages. Shell routes, SAPUI5 controls and native Ace editing must match the supported interface. Other tenant domains are enabled by design, not certified as universally compatible. Custom navigation, framed designers, localized UI, legacy environments and future SAP UI changes may need updates. Read-only roles remain read-only.

The v0.4.1 editing/upload core was live-verified on one tenant and a copied flow: generated test.xsd appeared in the collection with a green acknowledgement, then a fresh signed-in view opened its persisted contents. The public build changes activation and branding; its activation tests use a simulated Chrome API. Full multi-tenant and real Chrome popup activation checks remain release validation tasks. Converter and adapter regression tests are included separately in the launch kit.

## Privacy and feedback
See privacy.html. No telemetry, analytics, external AI service or publisher backend is bundled. Conversion is local. Saving sends resource content to your current SAP tenant; Copy uses the clipboard and Download/Open use local files. Support: shubhamsrivastav.904@gmail.com. For a published version, general feedback can also be left in its store reviews/comments. Do not post tenant URLs, credentials, customer schemas or confidential payloads.

SAP and SAP Integration Suite are trademarks of SAP SE. This independent extension is not affiliated with or endorsed by SAP. No SAP logos are included.
