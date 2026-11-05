const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
const source=fs.readFileSync('extension/popup.js','utf8');
async function fixture(url,ready=true,blocked=false){
 const nodes=new Map();const get=id=>{if(!nodes.has(id))nodes.set(id,{textContent:'',disabled:true,classList:{add(){},remove(){}},addEventListener(event,fn){this[event]=fn}});return nodes.get(id)};
 const calls=[];let closed=false;
 const chrome={tabs:{query:async()=>[{id:7,url}]},scripting:{executeScript:async args=>{calls.push(args);if(blocked)throw Error('Access denied');if(args.files)return [];return [{result:calls.length===1?ready:true}]}}};
 vm.runInNewContext(source,{document:{getElementById:get},chrome,URL,window:{close(){closed=true}}});
 await new Promise(setImmediate);
 return {get,calls,click:()=>get('open').click(),closed:()=>closed};
}
(async()=>{
 for(const url of ['chrome://extensions/','https://example.com/','http://tenant.example/shell/design/integrationflows/Flow']){const f=await fixture(url);assert.equal(f.get('open').disabled,true);assert.equal(f.calls.length,0)}
 for(const host of ['tenant-one.example','tenant-two.custom-domain.com']){const f=await fixture(`https://${host}/shell/design/contentpackage/Demo/integrationflows/DemoFlow`);assert.equal(f.get('tenant').textContent,host);assert.equal(f.get('open').disabled,false);await f.click();assert.equal(f.calls.length,3);assert.deepEqual(Array.from(f.calls[1].files),['xml-to-xsd.js','collection.js']);assert(f.calls.every(x=>x.target.tabId===7&&x.world==='MAIN'));assert.equal(f.closed(),true)}
 let f=await fixture('https://tenant.example/integrationflows/Test',false);await f.click();assert.equal(f.calls.length,1);assert.equal(f.closed(),false);assert.match(f.get('status').textContent,/unsupported/);
 f=await fixture('https://tenant.example/integrationflows/Test',true,true);await f.click();assert.equal(f.closed(),false);assert.equal(f.get('open').disabled,false);assert.match(f.get('status').textContent,/Access denied/);
 console.log('PASS: unsupported/restricted pages blocked, HTTPS enforced, two tenant domains, scoped injection, unsupported designer rejection and access failure recovery');
})();
