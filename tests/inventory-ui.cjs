const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
class El {
 constructor(){this.hidden=false;this.disabled=false;this.value='';this.textContent='';this.children=[];this.className='';}
 append(...items){this.children.push(...items)}
 replaceChildren(...items){this.children=items.flatMap(x=>x.fragment?x.children:[x])}
 addEventListener(name,fn){this[name]=fn}
 click(){return this.clickHandler?.()}
 showModal(){this.open=true}
 close(){this.open=false}
}
const nodes=new Map(),get=id=>{if(!nodes.has(id))nodes.set(id,new El());return nodes.get(id)};
const panel=new El();panel.hidden=true;const root={innerHTML:'',getElementById:get,querySelector:()=>panel};
let host,download,blob;const document={getElementById:()=>host,documentElement:{append(el){host=el}},createDocumentFragment(){const e=new El();e.fragment=true;return e},createElement(tag){const e=new El();e.attachShadow=()=>root;if(tag==='a')e.clickHandler=()=>{download=e.download};return e}};
const sample={packageName:'Sensors',name:'Sensor sync',id:'sensor_sync',sender:'Sensors',receiver:'Archive',version:'1.0.0',status:'STARTED',deployedOn:'2026-11-09',review:'Headers found'};
const context={document,location:{protocol:'https:',origin:'https://tenant.example',hostname:'tenant.example'},window:{},AbortController,Blob,URL:{createObjectURL(value){blob=value;return 'blob:test'},revokeObjectURL(){}},setTimeout(fn){fn()}};
vm.runInNewContext(fs.readFileSync('extension/inventory-core.js','utf8'),context);
context.window.CpiInventory={...context.window.CpiInventory,async collect({update}){update([sample],1,1);return {rows:[sample],complete:true}}};
context.window.CpiInventoryExport={xlsx:(rows,fields)=>{assert(!fields.includes('status'));return 'xlsx-test'}};
vm.runInNewContext(fs.readFileSync('extension/inventory.js','utf8'),context);
(async()=>{assert(host);assert(!root.innerHTML.includes('Configuration evidence'));assert.equal(panel.hidden,true);assert.equal(get('tenant').textContent,'tenant.example');await get('scan').click();assert.match(get('message').textContent,/Scan complete/);assert.equal(get('export').disabled,false);assert.equal(get('rows').children.length,1);assert.match(get('summary').textContent,/1 flows/);get('filter').value='missing';get('filter').input();assert.equal(get('rows').children.length,0);get('export').click();assert.equal(get('export-dialog').open,true);get('select-none').click();assert.equal(get('export-download').disabled,true);get('export-fields').children[0].children[0].checked=true;get('export-fields').children[2].children[0].checked=true;get('export-fields').children[0].children[0].change();assert.equal(get('export-download').disabled,false);get('export-format').value='csv';get('export-format').change();get('export-download').click();assert.match(download,/\.csv$/);assert.match(await blob.text(),/Sensors/);assert(!(await blob.text()).includes('Runtime status'));assert.equal(get('export-dialog').open,false);get('export').click();get('export-format').value='xlsx';get('export-download').click();assert.match(download,/\.xlsx$/);assert.equal(await blob.text(),'xlsx-test');get('close').click();assert.equal(panel.hidden,true);console.log('PASS: inventory workspace starts hidden, scan rendering, search, all-row export and minimize');})();
