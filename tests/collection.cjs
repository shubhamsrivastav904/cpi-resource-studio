const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('extension/collection.js','utf8');
function fixture(lazy=false,menuKind="unified"){
 let referencesReady=!lazy,menuVisible=false,dialogVisible=false;
 let callbacks=[],alerts=[],path=null,editing=false,saveCalls=0,okCalls=0,readonly=false,failSave=false,confirmSave=true;
 const data={'xsd/one.xsd':'<schema name="one"/>','xsd/two.xsd':'<schema name="two"/>'};let value='',modelValue='',wrapperValue='';
 class El{constructor(tag='div',text=''){this.tagName=tag;this.textContent=text;this.children=[];this.value='';this.classList={toggle(){}};this.className='';this.disabled=false;}append(...e){this.children.push(...e)}replaceChildren(...e){this.children=e}setAttribute(){}getAttribute(){return null}getClientRects(){return [1]}closest(){return null}addEventListener(){}click(){this.onclick?.()}attachShadow(){return root}}
 const ids=new Map();const get=id=>{if(!ids.has(id))ids.set(id,new El());return ids.get(id)};
 const root={innerHTML:'',getElementById:get,querySelector:()=>get('panes')};
 const ed={getValue:()=>value,setValue:v=>{value=v},getReadOnly:()=>readonly||!editing};
 const ace=new El();ace.id='test-editor';ace.env={editor:ed};
 const loc={protocol:'https:',hostname:'tenant.example.invalid',pathname:'/shell/design/contentpackage/Test/integrationflows/TestFlow'};const base=loc.pathname;
 const go=p=>{path=p;loc.pathname=base+(p?'/resources/'+p:'');if(p){value=data[p];modelValue=value;wrapperValue=value;}};
 const mkButton=(name,fn)=>{const e=new El('button',name+name);e.innerText=name;e.title=name;e.onclick=fn;return e};
 const links=()=>Object.keys(data).map(p=>{const e=new El('a',p);e.title='Access path is '+p;e.onclick=()=>go(p);return e});
 const fileInput={files:[],dispatchEvent(){}};
 const dialog=new El();dialog.getClientRects=()=>dialogVisible?[1]:[];dialog.querySelector=()=>fileInput;dialog.querySelectorAll=sel=>sel==='input[type="file"]'?[fileInput]:sel==='button'?[mkButton('Upload',()=>{const f=fileInput.files[0];data['xsd/'+f.name]=f.content;dialogVisible=false})]:[];
 const menuEl=new El();menuEl.id='menu';
 const xsdItem={getText:()=>'XSD',fireSelect(){},firePress(){}};
 const subMenu={getItems:()=>[xsdItem]};
 const schemaItem={getText:()=>'Schema',getSubmenu:()=>menuKind==='mobile'?null:subMenu,getItems:()=>menuKind==='mobile'?[xsdItem]:[]};
 const select=({item})=>{assert.equal(item,xsdItem);menuVisible=false;dialogVisible=true};
 const menu={getItems:()=>[schemaItem],...(menuKind==='mobile'?{fireItemSelected:select}:{fireItemSelect:select}),close(){menuVisible=false}};
 const doc={documentElement:new El(),body:new El(),createElement:t=>new El(t),getElementById:()=>null,
 querySelectorAll(sel){
 if(sel==='button'&&!path&&editing)return [mkButton('Save',()=>{saveCalls++;alerts=[new El('div',failSave?'Failed to save integration flow':'Integration flow saved successfully')];callbacks.forEach(f=>f())}),mkButton('Add',()=>{menuVisible=true})];
 if(sel==='button')return path?editing?[mkButton('OK',()=>{okCalls++;data[path]=modelValue;go(null)}),mkButton('Cancel',()=>go(null))]:[]:[mkButton(editing?'Save':'Edit',()=>{if(!editing){editing=true;return;}saveCalls++;alerts=[new El('div',failSave?'Failed to save integration flow':'Integration flow saved successfully')];callbacks.forEach(f=>f())})];
 if(sel==='[role="menu"]')return menuVisible?[menuEl]:[];
 if(sel==='[role="dialog"]')return dialogVisible?[dialog]:[];
 if(sel==='a[title]')return referencesReady?links():[];if(sel==='a')return [Object.assign(new El('a','TestFlow'),{onclick:()=>go(null)})];
 if(sel==='[role="tab"]')return [Object.assign(new El('div','References'),{onclick(){referencesReady=true;}})];
 if(sel==='.ace_editor')return path?[ace]:[];
 if(sel==='[role="alert"],[role="status"],.sapMMessageToast,.sapMMsgStrip,[id$="InfoBar"]')return alerts;return [];
 }};
 const wrapper={setValue:v=>{wrapperValue=v;setTimeout(()=>{value=v},40)},getValue:()=>wrapperValue,fireLiveChange:()=>{},fireChange:()=>{modelValue=wrapperValue}};
 const win={sap:{ui:{getCore:()=>({byId:id=>id==='test'?wrapper:id==='menu'?menu:null})}},confirm:()=>confirmSave,addEventListener(){}};
 const context={document:doc,window:win,location:loc,getComputedStyle:()=>({visibility:'visible'}),MutationObserver:class{constructor(fn){this.fn=fn}observe(){callbacks.push(this.fn)}disconnect(){callbacks=callbacks.filter(f=>f!==this.fn)}},DOMParser:class{parseFromString(){return {querySelector:()=>null}}},Event:class{},File:class{constructor(parts,name){this.content=parts.join('');this.name=name}},DataTransfer:class{constructor(){this.files=[];this.items={add:f=>this.files.push(f)}}},console,setTimeout,Date};
 const split=source.lastIndexOf('  for(let i=0;i<2;i++)');
 const tested=source.slice(0,split).replace('timeout=18000','timeout=500')+' window.test={state,scan,save,loadPane,enableEditing,discover,createSchema};\n})();';
 vm.runInNewContext(tested,context);return {api:win.test,data,ids,get saveCalls(){return saveCalls},get okCalls(){return okCalls},set readonly(v){readonly=v},set failSave(v){failSave=v},set confirmSave(v){confirmSave=v}};
}
(async()=>{
 let auto=fixture(true);await auto.api.discover();assert.equal(auto.api.state.records.size,2);assert.equal(auto.api.state.panes[0],'xsd/one.xsd');assert.equal(auto.api.state.panes[1],null);auto.api.state.compare=true;await auto.api.discover();assert.equal(auto.api.state.panes[1],'xsd/two.xsd');assert.equal(auto.saveCalls,0);assert.equal(auto.okCalls,0);assert.equal(auto.api.state.records.get('xsd/two.xsd').text,'<schema name="two"/>');console.log('PASS: starting outside References automatically discovers resources and reads both schemas without writes');
 let f=fixture();f.api.scan();await f.api.loadPane(0,'xsd/one.xsd');await f.api.loadPane(1,'xsd/two.xsd');assert.equal(f.api.state.panes[0],'xsd/one.xsd');assert.equal(f.api.state.panes[1],'xsd/two.xsd');
 f.api.state.records.get('xsd/one.xsd').text='<schema name="edited one"/>';f.api.state.records.get('xsd/two.xsd').text='<schema name="edited two"/>';await f.api.save();assert.equal(f.saveCalls,1);assert.equal(f.okCalls,2);assert.equal(f.data['xsd/one.xsd'],'<schema name="edited one"/>');assert.equal(f.api.state.records.get('xsd/two.xsd').staged,false);console.log('PASS: asynchronous UI5 render, model change notification, apply-and-reopen check, and flow save for two resources');
 f=fixture();f.api.scan();await f.api.loadPane(0,'xsd/one.xsd');f.api.state.records.get('xsd/one.xsd').text='<draft/>';f.data['xsd/one.xsd']='<someone-else/>';await assert.rejects(f.api.save(),/changed in CPI/);assert.equal(f.okCalls,0);assert.equal(f.saveCalls,0);assert.equal(f.api.state.records.get('xsd/one.xsd').text,'<draft/>');console.log('PASS: concurrent modification blocks overwrite and retains draft');
 f=fixture();f.api.scan();await f.api.loadPane(0,'xsd/one.xsd');f.api.state.records.get('xsd/one.xsd').text='<draft/>';f.readonly=true;await assert.rejects(f.api.save(),/editable CPI/);assert.equal(f.okCalls,0);assert.equal(f.saveCalls,0);console.log('PASS: read-only editor blocks apply/save');
 f=fixture();f.api.scan();await f.api.loadPane(0,'xsd/one.xsd');f.api.state.records.get('xsd/one.xsd').text='<draft/>';f.failSave=true;await assert.rejects(f.api.save(),/Failed to save/);assert.equal(f.api.state.records.get('xsd/one.xsd').staged,true);assert.equal(f.api.state.records.get('xsd/one.xsd').original,'<schema name="one"/>');console.log('PASS: server save failure preserves original baseline and staged draft');
 f=fixture();f.api.scan();await f.api.loadPane(0,'xsd/one.xsd');f.api.state.records.get('xsd/one.xsd').text='<draft/>';f.confirmSave=false;await f.api.save();assert.equal(f.okCalls,0);assert.equal(f.saveCalls,0);console.log('PASS: cancelling save does not change CPI');
 f=fixture();f.api.scan();await f.api.loadPane(0,'xsd/one.xsd');f.api.state.records.get('xsd/one.xsd').text='<unrelated-draft/>';await f.api.createSchema('generated.xsd','<schema name="generated"/>');assert.equal(f.saveCalls,1);assert.equal(f.data['xsd/generated.xsd'],'<schema name="generated"/>');assert.equal(f.api.state.panes[0],'xsd/generated.xsd');assert.equal(f.api.state.mode,'resources');assert.equal(f.api.state.records.size,3);assert.equal(f.data['xsd/one.xsd'],'<schema name="one"/>');assert.equal(f.api.state.records.get('xsd/one.xsd').text,'<unrelated-draft/>');await assert.rejects(f.api.createSchema('generated.xsd','<replacement/>'),/already exists/);assert.equal(f.saveCalls,1);let mobile=fixture(false,'mobile');mobile.api.scan();await mobile.api.createSchema('mobile.xsd','<schema/>');assert.equal(mobile.saveCalls,1);assert.equal(mobile.data['xsd/mobile.xsd'],'<schema/>');console.log('PASS: both public UI5 menu variants without selectItem; named schema upload, flow save, automatic collection refresh, collision protection, and unrelated draft preservation');
})().catch(e=>{console.error(e);process.exit(1)});
