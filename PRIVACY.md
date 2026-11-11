# CPI Resource Studio Privacy Policy

Updated 11 November 2026. This policy covers the independent CPI Resource Studio Chrome extension, including versions 0.6.x and 1.1.x.

## What the extension accesses

Version 1.1 displays a launcher on supported SAP-hosted Cloud Integration Design and Monitor pages. It checks the page address and interface to determine whether the launcher should appear. Chrome grants access at the site level for the SAP host patterns in the extension. The launcher and document message listener are loaded on matching shell pages. The launcher appears only on supported Design and Monitor pages. Manual access also uses Chrome's active tab and scripting permissions.

When you open a tool, the extension uses the current tenant address and integration flow identifier. The resource editor reads resource names and contents for viewing, comparison and editing. Flow Inventory reads deployment records and downloads deployed flow archives from the current tenant to identify sender and receiver system assignments and build the inventory. Naming Review reads step names, types and selected configuration indicators to suggest names. Applying selected names edits the current CPI draft. Native CPI Save persists that draft.

## Local processing and storage

XML conversion, naming suggestions, document text extraction and inventory export run in your browser. Uploaded project rules, PDF and Word documents, extracted text, resources and draft edits are handled in memory. The extension uses a local browser document reader for PDF and Word text. The selected document and extracted text pass through messages in the current tenant tab between the review interface and the extension. Scripts on that page can observe these messages. Resource and naming tools also interact with the tenant page's own interface and scripts.

Launcher position and collapsed state are stored in local site storage for the tenant origin. These preferences persist until changed or the site's stored data is cleared. In-memory drafts are cleared when the tab is reloaded or closed. Files you download, content you copy to your clipboard and resources you save are retained by the browser, device or tenant you use.

## Where data goes

The extension uses your existing signed-in SAP session for tenant requests. Resource uploads, saves and native flow edits send the relevant changes to your SAP tenant. Your organization's policies and SAP's terms apply to data held in that tenant. The extension does not deploy integration flows.

The extension does not send tenant content, uploaded documents, extracted rules or usage analytics to the developer or an external processing service. The developer does not sell extension data or use it for advertising or lending. The extension does not request passwords, API keys, browsing history or access to all websites.

## Your choices and feedback

You can restrict automatic access in Chrome's site access settings, clear the tenant site's stored preferences, or disable or remove the extension. Manage saved tenant changes and exported files through your tenant and device.

If you choose to send feedback by email, post a Web Store review or open a GitHub issue, the service you choose processes the information you provide. The developer uses emailed contact details and messages to respond. Remove confidential tenant details and credentials from feedback.

For privacy questions, contact shubhamsrivastav.904@gmail.com.
