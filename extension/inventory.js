(() => {
  'use strict';
  if (document.getElementById('cpi-flow-inventory')) return;
  if (location.protocol !== 'https:' || !window.CpiInventory) return;
  const host = document.createElement('div');
  host.id = 'cpi-flow-inventory';
  document.documentElement.append(host);
  const root = host.attachShadow({mode:'open'});
  root.innerHTML = `<style>
    :host{all:initial;font:14px system-ui;color:#20334b}*{box-sizing:border-box}button,input{font:inherit}button{padding:10px 15px;border:1px solid #d4dfed;border-radius:8px;background:white;color:#244263;cursor:pointer}button:disabled{opacity:.45;cursor:default}button:focus-visible,input:focus-visible{outline:3px solid #94bcf4;outline-offset:2px}.primary{background:#1765d7;color:white;border-color:#1765d7}section{position:fixed;inset:64px 20px 20px;z-index:2147483010;background:#f6f8fc;border:1px solid #d8e2ef;border-radius:16px;box-shadow:0 20px 70px #112b4a35;display:flex;flex-direction:column;overflow:hidden}section[hidden]{display:none}header{display:flex;align-items:center;gap:12px;padding:20px 24px;background:white;border-bottom:1px solid #dce5f0}header div{flex:1}h2{margin:3px 0;font-size:23px}small{color:#71839b}main{padding:20px;display:flex;flex-direction:column;gap:16px;flex:1;min-height:0}.intro{margin:0;color:#526b87;line-height:1.6}.toolbar{display:flex;gap:12px;align-items:center;flex-wrap:wrap}input{padding:11px 13px;border:1px solid #d5e0ed;border-radius:8px;min-width:260px}#summary{margin-left:auto;color:#526b87}.table{overflow:auto;flex:1;background:white;border:1px solid #dbe5f0;border-radius:10px}table{border-collapse:collapse;min-width:1300px;width:100%;font-size:12px}th,td{text-align:left;padding:13px;border-bottom:1px solid #e5ebf3;vertical-align:top;white-space:pre-wrap;overflow-wrap:anywhere;max-width:320px}th{position:sticky;top:0;background:#edf3fb;color:#456386}td:nth-child(2){color:#75869b}#message{padding:13px 16px;border-radius:8px;background:#edf3fb;color:#365575;white-space:pre-wrap}#message.error{background:#ffeded;color:#9a2525}footer{padding:12px 20px;color:#71839b;border-top:1px solid #dbe5f0;background:white;font-size:11px;line-height:1.6}h3{font-size:14px;margin:0}.empty{padding:60px;text-align:center;color:#71839b}@media(max-width:900px){header{flex-wrap:wrap}section{inset:20px}.toolbar input{min-width:0;width:100%}}
  .export-dialog{position:fixed;inset:0;margin:auto;width:min(560px,calc(100vw - 40px));max-height:85vh;overflow:auto;padding:26px;border:1px solid #d8e2ef;border-radius:16px;color:#20334b;background:#fff;box-shadow:0 20px 70px #112b4a45}.export-dialog::backdrop{background:#102d4d70}.export-dialog h3{font-size:21px;margin-bottom:10px}.export-dialog p{color:#526b87;line-height:1.6}.export-dialog label{display:flex;align-items:center;gap:10px;padding:9px 0}.export-dialog input[type=checkbox]{min-width:0;width:17px;height:17px}.export-dialog fieldset{border:1px solid #dce5f0;border-radius:10px;padding:12px 16px;margin:18px 0}.export-fields{display:grid;grid-template-columns:1fr 1fr;gap:0 16px}.export-dialog select{font:inherit;padding:9px;border:1px solid #d5e0ed;border-radius:7px;background:#fff}.export-actions{display:flex;justify-content:flex-end;gap:10px;margin-top:20px}.export-tools{display:flex;gap:8px;margin-top:10px}.export-tools button{padding:6px 10px;font-size:12px}#export-error{color:#9a2525;font-size:13px}
  </style><section hidden aria-label="Deployed flow inventory"><header><div><small>CPI RESOURCE STUDIO</small><h2>Deployed flow inventory</h2><small id="tenant"></small></div><button id="scan" class="primary">Scan deployed flows</button><button id="cancel" disabled>Cancel scan</button><button id="export" disabled>Export…</button><button id="close">Minimize</button></header><main><p class="intro">Build a system inventory from <strong>SAP_Sender</strong> and <strong>SAP_Receiver</strong> headers. Each row represents one deployed integration flow.</p><div id="message" role="status" aria-live="polite">Ready. The scan reads the deployed flow archives, checks their identity and version, and extracts the two system headers.</div><div class="toolbar"><input id="filter" aria-label="Search inventory" placeholder="Find a flow or system…"><span id="summary">No scan yet</span></div><div class="table"><table><thead><tr><th>Package</th><th>Flow</th><th>Flow ID</th><th>Source system</th><th>Target system</th><th>Deployed version</th><th>Runtime status</th><th>Deployed on</th><th>Review</th></tr></thead><tbody id="rows"></tbody></table><div id="empty" class="empty">Scan your tenant to build the inventory.</div></div></main><footer>Exports include every flow from the scan, including failed and cancelled rows. Multiple assignments, dynamic values and missing headers are flagged. The scan checks the deployment again before completing. Data stays in this tab until exported. The scan uses your tenant’s existing monitoring read permissions.</footer></section><dialog id="export-dialog" class="export-dialog" aria-labelledby="export-title"><h3 id="export-title">Export interface inventory</h3><p id="export-description"></p><label for="export-format">File format <select id="export-format"><option value="xlsx">Excel workbook (.xlsx)</option><option value="csv">CSV (.csv)</option></select></label><fieldset><legend>Fields to include</legend><div id="export-fields" class="export-fields"></div><div class="export-tools"><button id="select-all" type="button">Select all</button><button id="select-none" type="button">Clear selection</button></div></fieldset><div id="export-error" role="alert"></div><div class="export-actions"><button id="export-cancel" type="button">Cancel</button><button id="export-download" type="button" class="primary">Download Excel</button></div></dialog>`;
  const $ = id => root.getElementById(id);
  $('tenant').textContent = location.hostname;
  let rows = [];
  let controller = null;
  const fields = ['packageName','name','id','sender','receiver','version','status','deployedOn','review'];
  function render() {
    const query = $('filter').value.toLowerCase();
    const shown = window.CpiInventory.sortedRows(rows).filter(row=>fields.some(field=>String(row[field]).toLowerCase().includes(query)));
    const fragment = document.createDocumentFragment();
    for (const row of shown) {
      const tr = document.createElement('tr');
      for (const field of fields) { const td = document.createElement('td'); td.textContent = row[field] || (field==='packageName' ? row.packageId || 'Package unavailable' : '—'); tr.append(td); }
      fragment.append(tr);
    }
    $('rows').replaceChildren(fragment);
    $('empty').hidden = shown.length > 0;
    $('empty').textContent = rows.length ? 'No matching flows.' : 'No deployed integration flows found.';
    $('summary').textContent = rows.length + ' flows · ' + rows.filter(row=>row.review==='Headers found').length + ' with both headers · ' + shown.length + ' shown';
  }
  $('filter').addEventListener('input',render);
  $('close').addEventListener('click',()=>{root.querySelector('section').hidden=true;});
  $('cancel').addEventListener('click',()=>controller?.abort());
  $('scan').addEventListener('click',async()=>{
    if (controller) return;
    controller = new AbortController(); rows = []; render();
    $('scan').disabled=true; $('cancel').disabled=false; $('export').disabled=true;
    $('message').className=''; $('message').textContent='Loading deployed integration flows…';
    try {
      const result = await window.CpiInventory.collect({origin:location.origin,signal:controller.signal,update:(data,done,total)=>{
        rows=data; render(); $('message').textContent=`Reading flow definitions · ${done} of ${total} inspected`;
      }});
      rows=result.rows; render();
      $('message').textContent=result.complete ? `Scan complete. ${rows.length} deployed flows listed.` : 'Partial scan. Review cancelled or unverified rows before using this inventory.';
    } catch (error) {
      $('message').className='error'; $('message').textContent=controller.signal.aborted?'Scan cancelled.':error.message;
    } finally { controller=null; $('scan').disabled=false; $('cancel').disabled=true; $('export').disabled=rows.length===0; }
  });
  const selectedFields=new Set(window.CpiInventory.defaultFields);
  const checkboxes=new Map();
  function exportSelection() {
    selectedFields.clear();
    for(const [key,input] of checkboxes) if(input.checked)selectedFields.add(key);
    $('export-download').disabled=selectedFields.size===0;
    $('export-error').textContent=selectedFields.size?'':'Select at least one field.';
  }
  for(const field of window.CpiInventory.exportFields) {
    const label=document.createElement('label'),input=document.createElement('input'),text=document.createElement('span');
    input.type='checkbox';input.checked=selectedFields.has(field.key);input.addEventListener('change',exportSelection);text.textContent=field.label;
    label.append(input,text);$('export-fields').append(label);checkboxes.set(field.key,input);
  }
  $('select-all').addEventListener('click',()=>{for(const input of checkboxes.values())input.checked=true;exportSelection();});
  $('select-none').addEventListener('click',()=>{for(const input of checkboxes.values())input.checked=false;exportSelection();});
  $('export-format').addEventListener('change',()=>{$('export-download').textContent=$('export-format').value==='csv'?'Download CSV':'Download Excel';});
  $('export').addEventListener('click',()=>{
    $('export-description').textContent=`Export all ${rows.length} interfaces, sorted by package and interface name. Choose only the fields you need. Dates in Excel use UTC.`;
    exportSelection();$('export-dialog').showModal();
  });
  $('export-cancel').addEventListener('click',()=>{$('export-dialog').close();});
  $('export-download').addEventListener('click',()=>{
    if(!selectedFields.size)return;
    try {
      const format=$('export-format').value;
      const data=format==='csv'?window.CpiInventory.csv(rows,[...selectedFields]):window.CpiInventoryExport.xlsx(rows,[...selectedFields]);
      const mime=format==='csv'?'text/csv;charset=utf-8':'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      const url=URL.createObjectURL(new Blob([data],{type:mime})),anchor=document.createElement('a');
      anchor.href=url;anchor.download='cpi-flow-inventory-'+new Date().toISOString().slice(0,10)+'.'+format;
      anchor.click();setTimeout(()=>URL.revokeObjectURL(url),1000);$('export-dialog').close();
    } catch(error) {$('export-error').textContent=error.message;}
  });
})();
