(() => {
  'use strict';
  if (document.getElementById('cpi-resource-collection')) return;
  if(location.protocol!=='https:'||!location.pathname.includes('/integrationflows/'))return;
  const host = document.createElement('div');
  host.id = 'cpi-resource-collection';
  document.documentElement.append(host);
  const root = host.attachShadow({mode:'open'});
  root.innerHTML = `<style>
  :host{all:initial;font:14px system-ui;color:#182b40}*{box-sizing:border-box}button,select,input,textarea{font:inherit}button{cursor:pointer;border:1px solid #abbaca;border-radius:5px;background:white;color:#16324e;padding:8px 12px}button:disabled{opacity:.45;cursor:default}button.primary{background:#0867cc;color:white;border-color:#0867cc}#launch{position:fixed;right:24px;bottom:24px;z-index:2147483000;background:#0867cc;color:white;padding:13px 18px;box-shadow:0 3px 15px #0003}#panel{position:fixed;inset:70px 16px 16px;z-index:2147483001;background:#f5f8fc;border:1px solid #9fb2c6;border-radius:10px;box-shadow:0 10px 50px #0005;display:flex;flex-direction:column;overflow:hidden}#panel[hidden]{display:none}header{padding:14px 18px;display:flex;align-items:center;gap:12px;background:white;border-bottom:1px solid #cdd8e3}h2{font-size:24px;margin:0;flex:1}.body{display:flex;min-height:0;flex:1}aside{width:300px;background:white;padding:12px;border-right:1px solid #cdd8e3;overflow:auto}#filter{width:100%;padding:8px;margin-bottom:12px;border:1px solid #abbaca;border-radius:4px}#resources button{display:flex;gap:12px;justify-content:space-between;width:100%;text-align:left;margin:0;border:0;border-bottom:1px solid #ddd;border-radius:0;padding:14px 8px;color:#0064d9;overflow-wrap:anywhere}.tablehead{display:flex;justify-content:space-between;padding:10px 8px;border-bottom:1px solid #a8b6c4;font-weight:600}h3{font-size:17px}#resources small{display:block;color:#61768c;margin-top:4px}.panes{display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:12px;flex:1;min-width:0}.pane{display:flex;flex-direction:column;min-width:0;border:1px solid #c3d0df;border-radius:5px;background:white;overflow:hidden}.pane.active{outline:2px solid #0875e1}.bar{padding:8px;background:#eaf2fa;display:flex;gap:6px;align-items:center;flex-wrap:wrap}.bar select{flex:1;min-width:100px;width:100%;padding:6px}.caption{font-size:12px;padding:7px 10px;color:#536b81;min-height:32px}textarea{border:0;border-top:1px solid #e1e7ef;flex:1;min-height:120px;resize:none;white-space:pre;overflow:auto;font:13px/1.55 ui-monospace,Menlo,monospace;tab-size:2;padding:12px;outline:none}footer{padding:10px 16px;background:white;border-top:1px solid #cdd8e3;line-height:1.5}#status{font-weight:600}small{font-size:12px}#error{display:flex;align-items:center;gap:14px;padding:14px 18px;background:#ffe7e7;color:#8b1111;border-bottom:2px solid #cf3030;flex-shrink:0;font-weight:600;outline:none}#error[hidden]{display:none}#error-text{flex:1;white-space:pre-wrap;overflow-wrap:anywhere}#error button{border-color:#c65b5b;color:#8b1111}#error.attention{animation:error-attention .7s ease-out}@keyframes error-attention{from{background:#ffbaba}to{background:#ffe7e7}}@media(prefers-reduced-motion:reduce){#error.attention{animation:none}}#working{background:#fff2cd;padding:8px 16px}#working[hidden]{display:none}@media(max-width:900px){aside{width:170px}.panes{gap:6px;padding:6px}header{flex-wrap:wrap}}

  :host{font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#1e293b}
  #panel{inset:64px 20px 20px;border-radius:16px;background:#f6f8fc;border:1px solid #d8e2ef;box-shadow:0 20px 70px #112b4a35}
  header{min-height:88px;gap:10px;padding:16px 22px;border-bottom:1px solid #e2e8f0;flex-shrink:0}
  .brand{display:flex;gap:12px;align-items:center;flex:1;min-width:240px}.brand-icon{display:grid;place-items:center;background:#e8f1ff;color:#1263d7;border:1px solid #d0e3ff;border-radius:12px;width:44px;height:44px;font:700 17px ui-monospace,monospace}
  .eyebrow{font-size:10px;font-weight:750;letter-spacing:1.4px;color:#71849d}h2{font-size:21px;letter-spacing:-.5px;line-height:1.4}
  button{transition:background .15s,border-color .15s,box-shadow .15s;border-color:#d8e2ef;border-radius:8px;font-size:13px;font-weight:600;padding:10px 14px}button:hover:not(:disabled){background:#edf4ff;border-color:#a9c6ef}button.primary{background:#1263d7;border-color:#1263d7;box-shadow:0 2px 4px #1263d720}button.primary:hover:not(:disabled){background:#0c51b7;border-color:#0c51b7}button:focus-visible,select:focus-visible,input:focus-visible{outline:3px solid #8bb9ff;outline-offset:2px}
  button[hidden]{display:none}#compare[aria-pressed="true"]{background:#e8f1ff;color:#1255b0;border-color:#a9c6ef}#close{background:transparent;border-color:transparent;color:#64748b}
  aside{width:275px;padding:18px 14px;border-color:#e2e8f0;background:#fff}aside>small{display:block;line-height:1.6;color:#74849b;margin:2px 5px 20px}#filter{padding:11px 12px;background:#f6f8fc;border:1px solid #e2e8f0;border-radius:8px;font-size:13px}h3{font-size:13px;margin:20px 6px 10px}.tablehead{font-size:11px;letter-spacing:.5px;text-transform:uppercase;color:#8a99ac;border:0;padding:8px 10px}
  #resources button{border:1px solid transparent;border-radius:8px;margin-bottom:5px;padding:12px 10px;align-items:center;gap:10px;font-size:13px;color:#243b56;line-height:1.45}#resources button:hover:not(:disabled){background:#eef5ff;border-color:#d6e6ff}#resources small{font-size:9px;letter-spacing:.5px;padding:3px 6px;border-radius:4px;background:#edf2f8;color:#64748b;flex-shrink:0;margin:0}
  .panes{grid-template-columns:minmax(0,1fr);gap:16px;padding:18px;min-height:0}.panes.compare{grid-template-columns:repeat(2,minmax(0,1fr))}.pane{border:1px solid #dce5ef;border-radius:10px;box-shadow:0 2px 6px #16324e04}.pane[hidden]{display:none}.pane.active{outline:0;border-color:#9abfee;box-shadow:0 0 0 2px #deebfd}.bar{padding:11px 12px;background:#fff;border-bottom:1px solid #edf1f7;gap:8px}.bar strong{font-size:11px;text-transform:uppercase;letter-spacing:.7px;color:#7889a0}.bar button{padding:6px 10px;min-width:34px}.bar select{background:#f6f8fc;color:#233b57;border:1px solid #dfe7f1;border-radius:7px;font-size:13px;padding:8px 10px}.caption{padding:9px 14px;background:#fafbfd;color:#7a8ba1;font-size:11px;border-bottom:1px solid #edf1f7}
  textarea{padding:22px;font:13px/1.75 ui-monospace,SFMono-Regular,Menlo,monospace;color:#24364b;border:0;background:#fff}textarea:disabled{background:#fafbfd}footer{padding:12px 20px;border-color:#e2e8f0;color:#8492a6;font-size:11px;flex-shrink:0}#status{font-size:12px;color:#405d7d;font-weight:600;margin-bottom:3px}footer small{font-size:10px}#launch{border-radius:12px;background:#1263d7;box-shadow:0 4px 20px #1263d730}#error{font-size:13px}
  @media(max-width:1000px){header{flex-wrap:wrap}.brand{flex-basis:100%}aside{width:215px}.panes{padding:10px;gap:10px}}
  #success{display:flex;align-items:center;gap:12px;padding:14px 20px;background:#e9f8ee;color:#17653b;border-bottom:2px solid #43a56c;font-size:13px;font-weight:650;flex-shrink:0}#success[hidden]{display:none}#success-text{flex:1}#success button{background:transparent;color:#17653b;border-color:#b9dfc7}

  .workspace-nav{display:flex;flex-wrap:wrap;align-items:center;gap:8px;padding:12px 22px;background:#fff;border-bottom:1px solid #e2e8f0;flex-shrink:0}.workspace-nav button{border-color:transparent;background:transparent;color:#70839c}.workspace-nav button[aria-selected="true"]{background:#e9f1ff;color:#125cc5;border-color:#cdddff}.workspace-nav small{margin-left:auto;color:#8594a8;font-size:11px}.body[hidden],.converter[hidden]{display:none}.converter{display:flex;flex-direction:column;flex:1;min-height:0;padding:20px;gap:16px}.conversion-settings{display:flex;align-items:center;gap:20px;background:#fff;border:1px solid #dee7f1;border-radius:12px;padding:16px 20px;flex-shrink:0;flex-wrap:wrap}.conversion-settings label{font-size:12px;color:#526b88;display:flex;align-items:center;gap:8px}.conversion-settings .filename{display:block;font-weight:650}.filename input{display:block;margin-top:7px;padding:10px 12px;width:280px;border:1px solid #d9e3ef;border-radius:7px;color:#21364f;background:#f8fafd}.conversion-settings small{display:block;font-size:10px;color:#8b98a9;margin-top:5px}.conversion-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;min-height:0;flex:1}.conversion-card{background:#fff;border:1px solid #dce5ef;border-radius:12px;display:flex;flex-direction:column;overflow:hidden;min-height:0;min-width:0}.conversion-card .conversion-heading{display:flex;align-items:center;gap:10px;padding:13px 16px;border-bottom:1px solid #e9eef5}.conversion-heading strong{font-size:13px;flex:1}.conversion-heading small{font-size:10px;background:#edf3fb;color:#537094;border-radius:4px;padding:4px 7px}.conversion-heading button{font-size:11px;padding:6px 10px}.conversion-card textarea{min-height:140px;resize:none;white-space:pre;overflow:auto;flex:1;outline:none}.conversion-card textarea:focus{box-shadow:inset 0 0 0 2px #a7c7f5}.conversion-note{padding:12px 16px;background:#f8fafc;border-top:1px solid #e9eef5;font-size:11px;line-height:1.6;color:#74849a;flex-shrink:0}.conversion-note strong{color:#4d6480}#converter-summary{color:#426b98;font-size:11px}#conversion-warnings{padding:10px 16px;color:#8b6727;background:#fff9eb;font-size:11px;line-height:1.5}#conversion-warnings[hidden]{display:none}.button-file{font-size:11px;cursor:pointer;border:1px solid #d8e2ef;border-radius:7px;padding:7px 9px;color:#526c8d}#xml-file{display:none}@media(max-width:900px){.conversion-grid{grid-template-columns:1fr}.converter{overflow:auto}.conversion-card{min-height:300px}.workspace-nav small{display:none}}
  </style><button id="launch">Resource Collection</button><section id="panel" hidden aria-label="CPI Resource Studio"><header><div class="brand"><span class="brand-icon" aria-hidden="true">&lt;/&gt;</span><div><small class="eyebrow">CPI RESOURCE STUDIO</small><h2>CPI Resource Studio</h2></div></div><button id="scan">Refresh list</button><button id="edit" hidden>Enable CPI editing</button><button id="compare" aria-pressed="false">Compare side by side</button><button id="save" class="primary">Save changes</button><button id="generate-save" class="primary" hidden>Generate &amp; save to CPI</button><button id="close" aria-label="Minimize collection">Minimize</button></header><nav class="workspace-nav" role="tablist" aria-label="Workspace"><button id="mode-resources" role="tab" aria-selected="true" aria-controls="resource-workspace">Resource Editor</button><button id="mode-converter" role="tab" aria-selected="false" aria-controls="converter">XML → XSD</button><button id="open-inventory">Flow inventory</button><button id="open-naming">Naming Review</button><small id="tenant-context"></small></nav><div id="error" role="alert" aria-live="assertive" aria-atomic="true" tabindex="-1" hidden><span aria-hidden="true">⚠</span><span id="error-text"></span><button id="dismiss-error" aria-label="Dismiss error">Dismiss</button></div><div id="success" role="status" aria-live="polite" aria-atomic="true" hidden><span aria-hidden="true">✓</span><span id="success-text"></span><button id="dismiss-success" aria-label="Dismiss save confirmation">Dismiss</button></div><div id="working" hidden>Working through CPI’s native editor. Please leave the tenant page untouched until this completes.</div><div id="resource-workspace" class="body" role="tabpanel"><aside><input id="filter" aria-label="Filter resources" placeholder="Find a resource…"><small>Your flow’s resources, in one place. Select a file to start editing.</small><h3 id="refcount">References</h3><div class="tablehead"><span>Name</span><span>Type</span></div><div id="resources"></div></aside><div class="panes"></div></div><section id="converter" class="converter" role="tabpanel" aria-label="XML to XSD conversion" hidden><div class="conversion-settings"><label class="filename" for="xsd-name">Schema filename<input id="xsd-name" placeholder="observations.xsd" autocomplete="off" maxlength="104"><small>Saved to this integration flow’s Schemas collection.</small></label><label><input id="infer-strings" type="checkbox">Use string types for all values</label><label><input id="infer-optional" type="checkbox">Make child fields optional</label><button id="preview-schema">Preview XSD</button><span id="converter-summary" role="status">Paste XML to get started.</span></div><div class="conversion-grid"><section class="conversion-card"><div class="conversion-heading"><strong>Sample XML</strong><small>INPUT</small><button id="load-example">Example</button><label class="button-file" for="xml-file">Open XML<input type="file" id="xml-file" accept=".xml,text/xml,application/xml"></label></div><textarea id="xml-source" aria-label="Sample XML" spellcheck="false" placeholder="Paste your XML message here…"></textarea><div class="conversion-note">Conversion runs locally. Nothing is sent to CPI until you select <strong>Generate &amp; save to CPI</strong>.</div></section><section class="conversion-card"><div class="conversion-heading"><strong>Generated schema</strong><small>XSD 1.0</small><button id="copy-schema" disabled>Copy</button><button id="download-schema" disabled>Download</button></div><textarea id="xsd-preview" aria-label="Generated XSD" readonly spellcheck="false" placeholder="Your generated schema will appear here."></textarea><div id="conversion-warnings" hidden></div><div class="conversion-note">Inferred from your sample: review types, required fields and business rules. A sample cannot describe every valid message.</div></section></div></section><footer><div id="status" role="status">Open the collection to load resources directly from this flow.</div><small>Save applies resource edits and saves the integration flow, including other pending flow changes. Nothing is deployed. Minimize keeps drafts; reloading or closing the tab loses them.</small></footer></section>`;
  const $ = id => root.getElementById(id);
  const state = {flow:null, records:new Map(), panes:[null,null], active:0, busy:false, compare:false, mode:'resources', generated:null};
  const paneUI = [];
  $('open-inventory').addEventListener('click',()=>{
    const panel=document.getElementById('cpi-flow-inventory')?.shadowRoot?.querySelector('section');
    if(panel){panel.hidden=false;return;}
    message('Open the extension toolbar and select Deployed flow inventory.');
  });
  $('open-naming').addEventListener('click',()=>{if(state.busy)return;const panel=document.getElementById('cpi-naming-review')?.shadowRoot?.querySelector('section');if(panel){panel.hidden=false;return;}showError('Reopen CPI Resource Studio from the extension toolbar to load Naming Review.');});
  function flowPath(path=location.pathname){return path.match(/^(.*\/integrationflows\/[^/]+)/)?.[1] || null;}
  function resourcePath(){const flow=flowPath();if(!flow)return null;const tail=location.pathname.slice(flow.length);if(!tail.startsWith('/resources/'))return null;try{return tail.slice(11).split('/').map(decodeURIComponent).join('/');}catch{return null;}}
  function visible(el){return !!el && el.getClientRects().length>0 && getComputedStyle(el).visibility!=='hidden' && !el.closest('[aria-hidden="true"]');}
  function busy(){return Array.from(document.querySelectorAll('[role="dialog"],.sapUiBlockLayer')).some(e=>visible(e)&&/please wait|busy/i.test(e.textContent+' '+e.id));}
  function controlText(el){return (el.querySelector?.('.sapMBtnContent,.sapMITBText,.sapMLnkText')?.textContent || el.innerText || el.getAttribute('aria-label') || el.title || el.textContent || '').trim();}
  function activate(el){
    const control=window.sap?.ui?.getCore?.().byId(el.id);
    if(el.getAttribute('role')==='tab'&&control?.getKey){
      let parent=control.getParent();
      while(parent&&!parent.isA?.('sap.m.IconTabBar'))parent=parent.getParent?.();
      if(parent){const key=control.getKey()||control.getId();parent.setSelectedKey(key);parent.fireSelect({key,selectedKey:key,item:control,selectedItem:control});return;}
    }
    if(control?.firePress){control.firePress();return;}
    el.click();
  }
  function buttons(label){return Array.from(document.querySelectorAll('button')).filter(e=>visible(e)&&controlText(e)===label&&!e.disabled&&e.getAttribute('aria-disabled')!=='true');}
  function button(label){const found=buttons(label);if(found.length!==1)throw Error(`Expected one CPI “${label}” button; found ${found.length}. Minimize and check CPI.`);return found[0];}
  async function waitFor(fn,label,timeout=18000){const end=Date.now()+timeout;while(Date.now()<end){const result=fn();if(result)return result;await new Promise(r=>setTimeout(r,140));}throw Error(`CPI did not finish ${label}. Drafts are retained. Minimize to inspect the page.`);}
  function editor(){const els=Array.from(document.querySelectorAll('.ace_editor')).filter(visible);if(els.length!==1)throw Error('Could not identify a single CPI Ace resource editor.');const el=els[0];const ed=el.env?.editor || (window.ace?.edit ? window.ace.edit(el):null);if(!ed?.getValue||!ed?.setValue)throw Error('This CPI editor is unsupported. No changes were applied.');return ed;}
  function assertContext(){if(!state.flow||flowPath()!==state.flow)throw Error('The integration flow changed. Return to the original flow before continuing.');}
  function dirty(r){return r.text!==r.original;}
  function pending(){return [...state.records.values()].filter(r=>dirty(r)||r.staged);}
  function message(text){$('status').textContent=text;}
  function showError(text){
    message(text);
    $('error-text').textContent='Action stopped: '+text;
    const banner=$('error');banner.hidden=false;banner.classList.remove('attention');
    void banner.offsetWidth;banner.classList.add('attention');banner.focus();
  }
  function showSuccess(count){$('error').hidden=true;$('success-text').textContent=`Successfully saved to CPI — ${count} resource${count===1?'':'s'} saved.`;$('success').hidden=false;message('Successfully saved to CPI. Nothing deployed.');}
  function clearSuccess(){$('success').hidden=true;$('success-text').textContent='';}
  function clearError(){$('error').hidden=true;$('error-text').textContent='';}

  function setContext(){
    const flow=flowPath();if(!flow)throw Error('Open an integration flow first.');
    if(state.flow&&state.flow!==flow){if(pending().length)throw Error('Unsaved drafts belong to another integration flow. Return there and save first.');state.records.clear();state.panes=[null,null];}
    state.flow=flow;
  }
  function scan(){
    setContext();
    for(const el of document.querySelectorAll('a[title]')){
      const path=el.title.match(/^Access path is\s+(.+)$/)?.[1];
      if(!path||!(/\.(xsd|wsdl|groovy|js|xml|xsl|xslt)$/i.test(path)))continue;
      if(!state.records.has(path))state.records.set(path,{path,name:controlText(el),text:null,original:null,staged:false});
    }
    render();message(`${state.records.size} resources found. Select one for each pane.`);
    if(!state.records.size)throw Error('CPI returned no supported local resources. Check that this flow contains XSD/WSDL resources and that References has finished loading.');
  }
  function setMode(mode){
    state.mode=mode;
    $('resource-workspace').hidden=mode!=='resources';$('converter').hidden=mode!=='converter';
    $('mode-resources').setAttribute('aria-selected',String(mode==='resources'));$('mode-converter').setAttribute('aria-selected',String(mode==='converter'));
    for(const id of ['scan','compare','save'])$(id).hidden=mode!=='resources';
    $('generate-save').hidden=mode!=='converter';
    clearError();clearSuccess();message(mode==='converter'?'Generate an XSD, name it, and save it directly to this flow.':'Select a resource to edit.');
  }
  function render(){
    const rows=$('resources');rows.replaceChildren();$('refcount').textContent=`References (${state.records.size})`;
    for(const r of state.records.values()){
      if(!r.path.toLowerCase().includes($('filter').value.toLowerCase()))continue;
      const b=document.createElement('button');b.disabled=state.busy;b.textContent=r.name+((dirty(r)||r.staged)?' *':'');
      const small=document.createElement('small');small.textContent=r.path.split('.').pop().toUpperCase();b.append(small);b.onclick=()=>run(()=>loadPane(state.active,r.path));rows.append(b);
    }
    paneUI.forEach((ui,i)=>{
      const path=state.panes[i], r=state.records.get(path);ui.label.textContent=state.compare?(i===0?'Left':'Right'):'Editor';ui.box.hidden=i===1&&!state.compare;ui.box.classList.toggle('active',i===state.active);
      const value=ui.select.value;ui.select.replaceChildren();const empty=document.createElement('option');empty.value='';empty.textContent='Choose a resource';ui.select.append(empty);
      for(const x of state.records.values()){const o=document.createElement('option');o.value=x.path;o.textContent=x.path+((dirty(x)||x.staged)?' *':'');ui.select.append(o);}ui.select.value=path||value||'';
      ui.select.disabled=state.busy;ui.prev.disabled=state.busy||[...state.records.keys()].indexOf(path)<=0;ui.next.disabled=state.busy||[...state.records.keys()].indexOf(path)>=[...state.records.keys()].length-1||!state.records.size;
      ui.text.disabled=state.busy||!r||r.text===null;
      if(ui.text.value!==(r?.text??''))ui.text.value=r?.text??'';
      ui.caption.textContent=r?`${r.path}${r.staged?' • Applied to flow; save pending':dirty(r)?' • Edited draft':' • Loaded'}`:'Choose a resource from the list.';
    });
    root.querySelector('.panes').classList.toggle('compare',state.compare);
    $('compare').setAttribute('aria-pressed',String(state.compare));$('compare').textContent=state.compare?'Single editor':'Compare side by side';
    $('save').textContent=pending().length?`Save changes (${pending().length})`:'Save changes';
    for(const id of ['scan','edit','save','compare','mode-resources','mode-converter','open-inventory','open-naming','preview-schema','generate-save','load-example'])$(id).disabled=state.busy;
    $('working').hidden=!state.busy;
  }
  async function run(action){if(state.busy)return;state.busy=true;clearError();clearSuccess();render();try{await action();}catch(e){showError(e.message);}finally{state.busy=false;render();}}
  function currentHeading(){return Array.from(document.querySelectorAll('h1,h2,h3')).filter(visible).map(e=>e.textContent.trim());}
  async function backToFlow(){
    assertContext();
    if(resourcePath()){
      // Never accept a native editor on navigation: draft edits live in our two panes.
      const cancel=buttons('Cancel');
      if(cancel.length===1)activate(cancel[0]);
      else {
        const name=decodeURIComponent(state.flow.split('/').pop());
        const links=Array.from(document.querySelectorAll('a')).filter(e=>visible(e)&&controlText(e)===name);
        if(links.length!==1)throw Error('Cannot locate the CPI breadcrumb back to the flow. Minimize and return to References.');activate(links[0]);
      }
      await waitFor(()=>!resourcePath()&&!busy(),'returning to the flow');
    }
    await waitFor(()=>buttons('Save').length===1||buttons('Edit').length===1,'loading flow controls');
  }
  async function references(){
    await backToFlow();
    let lastActivation=0;
    await waitFor(()=>{
      if(busy())return false;
      const tabs=Array.from(document.querySelectorAll('[role="tab"]')).filter(e=>visible(e)&&controlText(e)==='References');
      if(tabs.length!==1)return false;
      if(tabs[0].getAttribute('aria-selected')!=='true'&&Date.now()-lastActivation>600){activate(tabs[0]);lastActivation=Date.now();}

      const local=Array.from(document.querySelectorAll('[role="tab"]')).find(e=>visible(e)&&/^Local\s*\(/.test(controlText(e)));
      if(local&&local.getAttribute('aria-selected')!=='true'){activate(local);return false;}
      const collapsed=Array.from(document.querySelectorAll('[aria-expanded="false"]')).filter(e=>{
        if(!visible(e))return false;
        const row=e.closest('[role="row"],tr');
        return row&&/Schemas|Scripts|WSDL|XSD|Resources/i.test(row.textContent);
      });
      const toggle=collapsed.find(e=>e.tagName==='BUTTON')||collapsed[0];
      if(toggle){activate(toggle);return false;}
      return Array.from(document.querySelectorAll('a[title]')).some(e=>e.title.startsWith('Access path is '));
    },'loading local resources from CPI');
  }
  async function discover(){
    setContext();message('Pulling local resources from CPI…');
    await references();scan();
    const paths=[...state.records.keys()].sort((a,b)=>Number(!/\.(xsd|wsdl)$/i.test(a))-Number(!/\.(xsd|wsdl)$/i.test(b)));
    for(let i=0;i<(state.compare?2:1);i++)if(!state.panes[i]&&paths[i])await loadPane(i,paths[i]);
    message(`${state.records.size} resources pulled from CPI. Edits in both panes are retained until saved.`);
  }
  async function openNative(path,editable=false){
    assertContext();
    const ready=()=>{
      if(resourcePath()!==path||busy())return false;
      try{const ed=editor();return (!editable||(!ed.getReadOnly()&&buttons('OK').length===1))?ed:false;}catch{return false;}
    };
    if(resourcePath()===path){
      const current=ready();if(current)return current;
      if(!editable)return await waitFor(ready,'loading '+path);
      // A cached viewer may still be read-only. Re-enter through the editable flow.
    }
    await backToFlow();
    if(editable)await enableEditing();
    await references();
    if(editable)await waitFor(()=>!busy()&&buttons('Save').length===1&&buttons('Add').length>=1,'loading editable References');
    const links=Array.from(document.querySelectorAll('a[title]')).filter(e=>visible(e)&&e.title===`Access path is ${path}`);
    if(links.length!==1)throw Error(`Resource ${path} is missing or ambiguous in References.`);
    activate(links[0]);
    return await waitFor(ready,editable?'waiting for the editable CPI resource editor for '+path:'opening '+path);
  }
  async function writeNative(text){
    const el=Array.from(document.querySelectorAll('.ace_editor')).find(visible);
    const control=window.sap?.ui?.getCore?.().byId(el?.id.replace(/-editor$/,''));
    if(!control?.setValue||!control?.getValue)throw Error('Cannot synchronize this editor with CPI. No resource text was applied.');
    if(control.getEditable?.()===false||editor().getReadOnly())throw Error('CPI resource editor is read-only. Draft retained.');
    const same=(a,b)=>a.replace(/\r\n?/g,'\n')===b.replace(/\r\n?/g,'\n');
    // UI5 setValue schedules a render; Ace is updated by that render, not synchronously.
    const oldValue=control.getValue();
    control.setValue(text);
    await waitFor(()=>same(control.getValue(),text)&&same(editor().getValue(),text),'synchronizing the CPI editor');
    control.fireLiveChange?.({value:control.getValue()});
    control.fireChange?.({value:control.getValue(),oldValue});
    editor().blur?.();
    await waitFor(()=>same(control.getValue(),text)&&same(editor().getValue(),text),'checking the synchronized CPI editor');

  }
  async function loadPane(index,path){
    if(!path)return;
    if(!state.flow)scan();assertContext();const r=state.records.get(path);if(!r)throw Error('Unknown resource. Refresh the list.');
    if(r.text===null){message('Reading '+path+' from CPI…');const ed=await openNative(path);r.text=ed.getValue();r.original=r.text;}
    state.panes[index]=path;state.active=index;message('Loaded. Compare and edit both panes; Save changes applies edits to CPI.');
  }
  async function enableEditing(){await backToFlow();if(buttons('Save').length===1){message('CPI editing is enabled.');return;}activate(button('Edit'));await waitFor(()=>!busy()&&buttons('Save').length===1,'enabling editing');await waitFor(()=>!busy()&&buttons('Edit').length===0&&buttons('Save').length===1,'finishing CPI edit mode');message('CPI editing is enabled.');}
  async function save(options={}){
    assertContext();const changed=options.records||pending();if(!changed.length){message('No resource changes to save.');return;}
    for(const r of changed){if(/\.(xsd|wsdl|xml|xsl|xslt)$/i.test(r.path)){const xml=new DOMParser().parseFromString(r.text,'application/xml');if(xml.querySelector('parsererror'))throw Error(`${r.path}: invalid XML. Nothing was saved by this attempt. Check closing tags (for example, </xs:schema> needs its final >), correct the XML, then save again.`);}}
    if(!options.skipConfirm&&!window.confirm(`Apply ${changed.length} edited resource(s) and save this CPI integration flow?\n\nThis also saves any other pending flow changes. It does not deploy.\n\n${changed.map(r=>r.path).join('\n')}`)){message('Save cancelled. Drafts retained.');return;}
    await enableEditing();
    // Preflight all baselines before changing any native editor.
    for(const r of changed){const ed=await openNative(r.path,true);const baseline=ed.getValue();if(ed.getReadOnly())throw Error(`${r.path} is read-only. No further resources were applied.`);if(baseline!==(r.staged?r.applied:r.original))throw Error(`${r.path} changed in CPI since it was loaded. Save stopped to avoid overwriting it. Draft retained; compare with the native editor.`);}
    for(const r of changed){
      message('Applying '+r.path+'…');const ed=await openNative(r.path,true);
      if(ed.getValue()!==(r.staged?r.applied:r.original))throw Error(`Concurrent edit detected in ${r.path}. Save stopped.`);
      await writeNative(r.text);
      activate(button('OK'));await waitFor(()=>!resourcePath()&&!busy()&&buttons('Save').length===1,'applying '+r.path);
      r.staged=true;r.applied=r.text;
      const verified=await openNative(r.path,true);
      if(verified.getValue().replace(/\r\n?/g,'\n')!==r.text.replace(/\r\n?/g,'\n'))throw Error(`${r.path}: CPI did not retain the applied edit. The flow has not been saved by this attempt. Draft retained.`);
      await backToFlow();
    }
    const notices=()=>Array.from(document.querySelectorAll('[role="alert"],[role="status"],.sapMMessageToast,.sapMMsgStrip,[id$="InfoBar"]')).filter(visible).map(e=>e.textContent.trim()).join('\n');
    const old=notices();let confirmed=false;let failure='';
    const observer=new MutationObserver(()=>{const msg=notices();if(msg&&msg!==old){if(/\bsaved\b/i.test(msg)&&!/(?:not saved|not be saved|failed|error)/i.test(msg))confirmed=true;if(/(?:save failed|failed to save|could not save|error while saving)/i.test(msg))failure=msg;}});
    observer.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['class','style']});
    try{
      activate(button('Save'));
      await waitFor(()=>{if(failure)throw Error(failure);return confirmed&&!busy();},'confirming the CPI save',15000);
      for(const r of changed){r.original=r.text;r.staged=false;delete r.applied;}
      showSuccess(changed.length);
    }catch(e){
      if(!failure){message('Save submitted to CPI. Its confirmation was not detected; the save may have completed. Drafts are retained until verified. Minimize and reopen the resource before retrying.');return;}
      throw Error(e.message+' Some resources may already be applied or saved. Drafts are retained; minimize and check CPI before retrying.');
    }
    finally{observer.disconnect();}
  }
  function nativeControl(el){return window.sap?.ui?.getCore?.().byId(el?.id);}
  function nativeMenuEntries(){
    const entries=[],seen=new Set();
    function visit(menu,owner=menu){
      if(!menu||seen.has(menu))return;seen.add(menu);
      for(const item of menu.getItems?.()||[]){
        entries.push({item,menu,owner,text:(item.getText?.()||'').trim()});
        const submenu=item.getSubmenu?.();
        if(submenu)visit(submenu,owner);
        if(item.getItems?.().length)visit(item,owner);
      }
    }
    for(const el of document.querySelectorAll('[role="menu"]'))if(visible(el))visit(nativeControl(el));
    return entries;
  }
  async function selectSchemaMenu(){
    const schema=await waitFor(()=>nativeMenuEntries().find(e=>/^Schema$/i.test(e.text)),'opening the Schema menu');
    const findXsd=()=>nativeMenuEntries().find(e=>/^XSD$/i.test(e.text)&&e.owner===schema.owner);
    // Submenu items are already part of UI5's public aggregation; opening it is unnecessary.
    let xsd=findXsd();
    if(!xsd){const el=schema.item.getDomRef?.();if(el)el.click();xsd=await waitFor(findXsd,'locating XSD in the Schema menu');}
    if(xsd.item.getEnabled?.()===false)throw Error('CPI has disabled XSD upload. No file was uploaded.');
    if(xsd.owner.fireItemSelect){
      xsd.item.fireSelect?.();xsd.owner.fireItemSelect({item:xsd.item});xsd.owner.close?.();
    }else if(xsd.owner.fireItemSelected){
      xsd.item.firePress?.();xsd.owner.fireItemSelected({item:xsd.item});xsd.owner.close?.();
    }else if(xsd.menu.selectItem){xsd.menu.selectItem(xsd.item,false,false);}
    else{const el=xsd.item.getDomRef?.();if(!el)throw Error('Cannot activate the CPI XSD upload option. No file was uploaded.');el.click();}
  }
  function uploadDialog(){return Array.from(document.querySelectorAll('[role="dialog"]')).find(el=>visible(el)&&el.querySelector('input[type="file"]'));}
  async function createSchema(name,xsd){
    setContext();const path='xsd/'+name;
    await enableEditing();await references();scan();
    if([...state.records.keys()].some(p=>p.toLowerCase()===path.toLowerCase()))throw Error(name+' already exists. Choose a different filename; no existing resource was replaced.');
    message('Adding '+name+' to CPI…');activate(button('Add'));await selectSchemaMenu();
    const dialog=await waitFor(uploadDialog,'opening the XSD upload dialog');
    const inputs=Array.from(dialog.querySelectorAll('input[type="file"]'));
    if(inputs.length!==1)throw Error('Cannot identify the CPI XSD file selector. No file was uploaded.');
    const transfer=new DataTransfer();transfer.items.add(new File([xsd],name,{type:'application/xml'}));
    inputs[0].files=transfer.files;inputs[0].dispatchEvent(new Event('change',{bubbles:true}));
    const submit=await waitFor(()=>{
      const controls=Array.from(dialog.querySelectorAll('button')).filter(e=>visible(e)&&!e.disabled&&e.getAttribute('aria-disabled')!=='true'&&/^(Add|Upload|OK)$/i.test(controlText(e)));
      return controls.length===1?controls[0]:false;
    },'selecting '+name);activate(submit);
    await waitFor(()=>!visible(dialog)&&!busy(),'uploading '+name);
    await references();
    await waitFor(()=>{scan();return state.records.has(path);},'refreshing the new schema in References');
    const record=state.records.get(path);
    if(!record)throw Error('CPI did not list '+name+' after upload. Check the native upload message before retrying.');
    record.text=xsd;record.original=xsd;record.applied=xsd;record.staged=true;
    await save({records:[record],skipConfirm:true});
    state.panes[0]=path;state.active=0;state.compare=false;setMode('resources');render();
    if(record.staged)message(name+' is now in Resource Collection. Save was submitted to CPI; its confirmation was not detected.');
    else{$('success-text').textContent='Successfully saved '+name+' to CPI.';$('success').hidden=false;message(name+' is now available in Resource Collection.');}
  }
  function previewSchema(){
    const result=window.CpiXmlSchema.generate($('xml-source').value,{strings:$('infer-strings').checked,optional:$('infer-optional').checked});
    state.generated=result;$('xsd-preview').value=result.xsd;
    $('converter-summary').textContent=`${result.elements} sample elements · Root: ${result.rootName}${result.namespace?' · '+result.namespace:''}`;
    $('conversion-warnings').textContent=result.warnings.join(' ');$('conversion-warnings').hidden=!result.warnings.length;
    $('copy-schema').disabled=false;$('download-schema').disabled=false;
    return result;
  }
  function invalidatePreview(){state.generated=null;$('xsd-preview').value='';$('converter-summary').textContent='Sample changed. Generate a fresh preview.';$('copy-schema').disabled=true;$('download-schema').disabled=true;$('conversion-warnings').hidden=true;clearSuccess();}
  $('mode-resources').onclick=()=>setMode('resources');$('mode-converter').onclick=()=>setMode('converter');
  $('preview-schema').onclick=()=>run(async()=>{previewSchema();message('Schema preview generated. Name it and choose Generate & save to CPI.');});
  $('xml-source').oninput=invalidatePreview;$('infer-strings').onchange=invalidatePreview;$('infer-optional').onchange=invalidatePreview;
  $('load-example').onclick=()=>{if($('xml-source').value.trim()&&!window.confirm('Replace the current XML sample with the example?'))return;$('xml-source').value="<observations>\n  <reading station=\"NIMBUS-42\">\n    <temperature>18.6</temperature>\n    <active>true</active>\n  </reading>\n  <reading station=\"ORBIT-7\">\n    <temperature>-3.2</temperature>\n    <active>false</active>\n  </reading>\n</observations>";if(!$('xsd-name').value)$('xsd-name').value='observations.xsd';invalidatePreview();};
  $('xml-file').onchange=()=>run(async()=>{const f=$('xml-file').files[0];if(!f)return;if(f.size>2*1024*1024)throw Error('Use an XML file smaller than 2 MB.');$('xml-source').value=await f.text();if(!$('xsd-name').value)$('xsd-name').value=f.name.replace(/\.xml$/i,'')+'.xsd';$('xml-file').value='';invalidatePreview();});
  $('copy-schema').onclick=()=>run(async()=>{if(!state.generated)throw Error('Generate a preview first.');await navigator.clipboard.writeText(state.generated.xsd);message('XSD copied to clipboard.');});
  $('download-schema').onclick=()=>run(async()=>{if(!state.generated)throw Error('Generate a preview first.');const name=window.CpiXmlSchema.filename($('xsd-name').value);const url=URL.createObjectURL(new Blob([state.generated.xsd],{type:'application/xml'}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),60000);message('Download requested: '+name);});
  $('generate-save').onclick=()=>run(async()=>{const name=window.CpiXmlSchema.filename($('xsd-name').value);const result=previewSchema();await createSchema(name,result.xsd);});
  for(let i=0;i<2;i++){
    const box=document.createElement('section');box.className='pane';const bar=document.createElement('div');bar.className='bar';
    const label=document.createElement('strong');label.textContent=i===0?'Left':'Right';
    const prev=document.createElement('button');prev.textContent='←';prev.setAttribute('aria-label',`Previous resource in ${label.textContent} pane`);
    const next=document.createElement('button');next.textContent='→';next.setAttribute('aria-label',`Next resource in ${label.textContent} pane`);
    const select=document.createElement('select');select.setAttribute('aria-label',`${label.textContent} resource`);
    const caption=document.createElement('div');caption.className='caption';const text=document.createElement('textarea');text.spellcheck=false;text.setAttribute('aria-label',`${label.textContent} resource editor`);
    bar.append(label,prev,next,select);box.append(bar,caption,text);root.querySelector('.panes').append(box);paneUI.push({box,select,caption,text,prev,next,label});
    box.addEventListener('pointerdown',()=>{state.active=i;paneUI.forEach((p,j)=>p.box.classList.toggle('active',i===j));});
    select.onchange=()=>run(()=>loadPane(i,select.value));
    const move=d=>{const keys=[...state.records.keys()];const at=keys.indexOf(state.panes[i]);const path=keys[at+d];if(path)run(()=>loadPane(i,path));};prev.onclick=()=>move(-1);next.onclick=()=>move(1);
    text.oninput=()=>{clearSuccess();const r=state.records.get(state.panes[i]);if(r){r.text=text.value;render();message(`${pending().length} resource(s) have pending changes.`);}};
    text.onkeydown=e=>{if(e.key==='Tab'){e.preventDefault();const start=text.selectionStart,end=text.selectionEnd;text.setRangeText('  ',start,end,'end');text.dispatchEvent(new Event('input'));}};
  }
  $('launch').onclick=()=>{$('panel').hidden=false;run(discover);};
  $('compare').onclick=()=>run(async()=>{
    state.compare=!state.compare;
    if(!state.compare){state.active=0;message('Single editor. Any drafts in the second pane are retained.');return;}
    render();
    if(!state.panes[1]){const path=[...state.records.keys()].find(p=>p!==state.panes[0])||state.panes[0];if(path)await loadPane(1,path);}
    message('Compare side by side. Select a resource independently in each pane.');
  });
  $('dismiss-success').onclick=clearSuccess;
  $('dismiss-error').onclick=clearError;
  $('close').onclick=()=>{$('panel').hidden=true;};
  $('scan').onclick=()=>run(discover);$('filter').oninput=render;
  $('edit').onclick=()=>run(enableEditing);$('save').onclick=()=>run(()=>save());
  window.addEventListener('beforeunload',e=>{if(pending().length||$('xml-source').value.trim()){e.preventDefault();e.returnValue='';}});
  $('tenant-context').textContent=location.hostname;
  $('tenant-context').title='Current tenant — saves apply here';
  render();
})();
