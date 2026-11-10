(() => {
 'use strict';
 const path=()=>location.pathname.match(/^(.*\/integrationflows\/[^/]+)/)?.[1];
 function context(){
  if(location.protocol!=='https:'||!path())throw Error('Open a CPI integration flow first.');
  const all=Object.values(window.sap?.ui?.core?.Element?.registry?.all?.()||{});
  const editors=all.filter(x=>x.getMetadata?.().getName()==='sap.bpm.BPMNDiagramEditor'&&x.getDomRef?.()?.getClientRects().length);
  const views=all.filter(x=>x.getViewName?.()==='com.sap.it.spc.myproj.views.iflowProperty'&&x.getDomRef?.()?.getClientRects().length);
  if(editors.length!==1||views.length!==1)throw Error('This CPI designer version is unsupported or still loading.');
  const editor=editors[0],controller=views[0].getController(),model=controller.iflowModel?.propertyViewModel;
  if(!editor._runtimeModel?.contents||!model?.listOfDefaultFlowElementModel||!editor._editor?.resource)throw Error('Current flow model is unavailable.');
  return {editor,controller,model,path:path(),all};
 }
 const editing=c=>{const buttons=Array.from(document.querySelectorAll('button')).filter(e=>e.getClientRects().length&&!e.disabled);const label=e=>(e.querySelector('.sapMBtnContent')?.textContent||e.textContent||'').trim();return buttons.filter(e=>label(e)==='Save').length===1&&!buttons.some(e=>label(e)==='Edit');};
 const value=x=>x?.value;
 function snapshot(){
  const c=context(),contents=c.editor._runtimeModel.contents;
  const doc=new DOMParser().parseFromString('<b:definitions xmlns:b="http://www.omg.org/spec/BPMN/20100524/MODEL"><b:process/></b:definitions>','application/xml'),process=doc.documentElement.firstChild;
  const records=[];
  for(const item of c.model.listOfDefaultFlowElementModel){
   const runtime=contents[item.id];if(!runtime)continue;const native=c.editor._editor.resource.getObject(item.id);if(!native)throw Error('Step identity could not be verified.');const currentName=typeof native.name==='string'?native.name:runtime.name||item.name||'';
   const flavor=runtime.customData?.flavor||item.activityType;
   if(!flavor||/(?:StartEvent|EndEvent|BoundaryEvent|IntermediateCatchEvent|IntermediateThrowEvent)$/.test(runtime.classDefinition||'')||/^(Start|End|Error|Timer|Message).*Event$/i.test(flavor))continue;
   const node=doc.createElementNS(doc.documentElement.namespaceURI,/router|gateway/i.test(flavor)?'b:exclusiveGateway':'b:callActivity');node.setAttribute('id',item.id);node.setAttribute('name',currentName);
   const ext=doc.createElementNS(doc.documentElement.namespaceURI,'b:extensionElements');node.append(ext);
   const props={activityType:flavor};
   for(const key of ['headerTable','propertyTable']){const v=value(item.allTableAttributes?.[key]);if(Array.isArray(v)?v.length:typeof v==='string'&&/<row[\s>]/.test(v))props[key]='configured';}
   const body=value(item.allAttributes?.wrapContent);if(typeof body==='string'&&body.trim())props.bodyContent='configured';
   for(const [key,val] of Object.entries(props)){const prop=doc.createElement('property'),k=doc.createElement('key'),v=doc.createElement('value');k.textContent=key;v.textContent=val;prop.append(k,v);ext.append(prop);}
   process.append(node);records.push({id:item.id,name:currentName,flavor});
  }
  if(!records.length)throw Error('No reviewable steps found in the current flow.');
  return {path:c.path,records,xml:new XMLSerializer().serializeToString(doc),editable:editing(c)};
 }
 const visible=e=>e&&e.getClientRects().length&&getComputedStyle(e).visibility!=='hidden';
 async function waitFor(fn,message='CPI did not expose the selected step name field. No further names were applied.'){const end=Date.now()+7000;while(Date.now()<end){const found=fn();if(found)return found;await new Promise(r=>setTimeout(r,100));}throw Error(message);}
 function field(c,text){
  const native=text==='Name'?c.all.filter(x=>x.getId?.().endsWith('--flowstepNameText')&&x.getMetadata?.().getName()==='sap.m.Input'&&visible(x.getDomRef?.())):[];if(native.length===1)return native[0];
  const candidates=c.all.filter(x=>x.getLabelFor&&x.getText?.()===text&&visible(x.getDomRef?.())).map(x=>window.sap.ui.getCore().byId(x.getLabelFor?.())).filter(x=>x?.getValue&&visible(x.getDomRef?.()));
  return candidates.length===1?candidates[0]:null;
 }
 async function enterEdit(baseline,update){
  let c=context();if(editing(c))return;
  const buttons=Array.from(document.querySelectorAll('button')).filter(e=>visible(e)&&(e.querySelector('.sapMBtnContent')?.textContent||e.textContent||'').trim()==='Edit');
  if(buttons.length!==1||buttons[0].disabled||buttons[0].getAttribute?.('aria-disabled')==='true')throw Error('CPI editing is unavailable. Check your edit permission or the flow lock. Your selections are retained.');
  update('Entering CPI Edit mode. Your selected names are retained…');
  const control=window.sap.ui.getCore().byId(buttons[0].id);
  if(control?.getEnabled?.()===false)throw Error('CPI editing is disabled. Check your edit permission or the flow lock.');
  if(control?.firePress)control.firePress();else buttons[0].click();
  const end=Date.now()+18000;
  while(Date.now()<end){
   if(path()!==baseline.path)throw Error('The flow changed while entering Edit mode. Return to the reviewed flow.');
   try{c=context();if(editing(c))return;}catch(error){if(path()!==baseline.path)throw error;}
   await new Promise(resolve=>setTimeout(resolve,150));
  }
  throw Error('CPI could not enter Edit mode. Check permissions, flow locks or a CPI dialog, then retry. Your selections are retained.');
 }
 async function apply(baseline,changes,{update=()=>{}}={}){
  let c=context();if(c.path!==baseline.path)throw Error('The flow changed. Review the current flow again.');
  const fresh=snapshot();const structure=records=>JSON.stringify(records.map(({id,flavor})=>({id,flavor})).sort((a,b)=>a.id.localeCompare(b.id)));if(structure(fresh.records)!==structure(baseline.records))throw Error('Flow steps were added, removed or changed type. Refresh suggestions before applying.');
  for(const change of changes){const before=baseline.records.find(x=>x.id===change.id),current=fresh.records.find(x=>x.id===change.id);if(before&&current&&before.name!==current.name&&current.name!==change.name)throw Error('The selected step was renamed in CPI. Refresh suggestions before replacing its current name.');}
  baseline=fresh;
  const ids=new Set(),names=new Map(fresh.records.map(x=>[x.id,x.name]));
  for(const change of changes){if(ids.has(change.id)||!names.has(change.id))throw Error('Invalid or duplicate step selection.');ids.add(change.id);if(typeof change.name!=='string'||!/^[A-Za-z][A-Za-z0-9_]{0,119}$/.test(change.name))throw Error('Use a name beginning with a letter, up to 120 letters, numbers or underscores.');names.set(change.id,change.name);}
  const unique=new Set();for(const name of names.values()){if(unique.has(name))throw Error('Duplicate step names: add a distinct purpose before applying.');unique.add(name);}
  await enterEdit(baseline,update);
  const after=snapshot();if(after.path!==baseline.path||JSON.stringify(after.records)!==JSON.stringify(baseline.records)||after.xml!==fresh.xml)throw Error('The flow changed while opening Edit mode. Review it again before applying. Your selections are retained.');
  update('Applying selected names through CPI’s native fields…');
  const applied=[];
  for(const change of changes){
   if(namesBefore(change.id)===change.name)continue;
   c=context();if(c.path!==baseline.path||!editing(c))throw Error('CPI context changed. Applied '+applied.length+' names; no further changes made.');
   c.editor.unselectAllSymbols();c.editor.selectShape(change.id,false);
   let retried=false;const selectedAt=Date.now();
   const input=await waitFor(()=>{const now=context();if(now.path!==baseline.path||!editing(now))throw Error('CPI context changed. No further names were applied.');const name=field(now,'Name');const selection=now.editor.getSelectedSymbols();const selected=selection?.toArray?.()||(Number.isInteger(selection?.length)?Array.from(selection):[]);const expected=now.editor._editor.resource.getObject(change.id)?.relatedSymbols?.get(0);if(name&&expected&&selected.includes(expected)&&name.getValue()===namesBefore(change.id))return name;
    // CPI can replace the property panel after entering Edit, dropping its first selection event.
    // Retry selection once, before any value is written, while preserving the same verified step.
    if(!retried&&Date.now()-selectedAt>=1000){retried=true;now.editor.unselectAllSymbols();now.editor.selectShape(change.id,false);}return null;
   });
   if(input.getEditable?.()===false||input.getEnabled?.()===false)throw Error('The selected step is read-only.');
   if(typeof input.fireLiveChange!=='function'||!input.mEventRegistry?.liveChange?.length)throw Error('Unsupported native step-name event. No name was applied.');
   input.setValue(change.name);input.fireLiveChange({value:change.name,newValue:change.name});
   await waitFor(()=>{const now=context();return now.editor._editor.resource.getObject(change.id)?.name===change.name&&field(now,'Name')?.getValue()===change.name;},'CPI did not confirm the renamed step. Check the CPI draft before retrying.');
   applied.push(change.id);
  }
  return applied.length;
  function namesBefore(id){return baseline.records.find(x=>x.id===id)?.name;}
 }
 window.CpiNamingLive=Object.freeze({snapshot,apply});
})();
