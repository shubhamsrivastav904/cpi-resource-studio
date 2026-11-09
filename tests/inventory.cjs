const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),zlib=require('node:zlib');
const {DOMParser:Parser}=require('@xmldom/xmldom');
class DOMParser {parseFromString(text,mime){return new Parser({onError:(level,msg)=>{if(level!=='warning')throw Error(msg)}}).parseFromString(text,mime)}}
const ctx={window:{},DOMParser,URL,URLSearchParams,atob,TextDecoder,Uint8Array,DataView,Blob,DecompressionStream,AbortController,setTimeout,clearTimeout,fetch};
vm.runInNewContext(fs.readFileSync('extension/inventory-core.js','utf8'),ctx);const api=ctx.window.CpiInventory;
const esc=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const assignment=(name,value,type='constant',action='Create')=>`<row><cell id="Name">${name}</cell><cell id="Value">${esc(value)}</cell><cell id="Type">${type}</cell><cell id="Action">${action}</cell></row>`;
const flow=rows=>`<bpmn2:definitions xmlns:bpmn2="http://www.omg.org/spec/BPMN/20100524/MODEL"><bpmn2:process><bpmn2:callActivity><bpmn2:extensionElements><property><key>headerTable</key><value>${esc(rows)}</value></property></bpmn2:extensionElements></bpmn2:callActivity></bpmn2:process></bpmn2:definitions>`;
const xml=flow(assignment('SAP_Sender','ERP')+assignment('SAP_Receiver','Warehouse')+assignment('apikey','DO-NOT-EXPORT'));
function crc(bytes){let v=-1;for(const b of bytes){v^=b;for(let i=0;i<8;i++)v=(v>>>1)^(0xedb88320&-(v&1));}return (v^-1)>>>0;}
function zip(text,method=8,manifest='Bundle-SymbolicName: Test\r\nBundle-Version: 1.2.3\r\n') {
 const locals=[],centrals=[];let offset=0;
 for(const [path,value] of [['src/main/resources/scenarioflows/integrationflow/Test.iflw',text],['META-INF/MANIFEST.MF',manifest]]) {
 const name=Buffer.from(path),data=Buffer.from(value),compressed=method===8?zlib.deflateRawSync(data):data,c=crc(data),local=Buffer.alloc(30),central=Buffer.alloc(46);
 local.writeUInt32LE(0x04034b50);local.writeUInt16LE(method,8);local.writeUInt32LE(c,14);local.writeUInt32LE(compressed.length,18);local.writeUInt32LE(data.length,22);local.writeUInt16LE(name.length,26);
 central.writeUInt32LE(0x02014b50);central.writeUInt16LE(method,10);central.writeUInt32LE(c,16);central.writeUInt32LE(compressed.length,20);central.writeUInt32LE(data.length,24);central.writeUInt16LE(name.length,28);central.writeUInt32LE(offset,42);
 locals.push(local,name,compressed);centrals.push(central,name);offset+=local.length+name.length+compressed.length;
 }
 const directory=Buffer.concat(centrals),end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50);end.writeUInt16LE(2,8);end.writeUInt16LE(2,10);end.writeUInt32LE(directory.length,12);end.writeUInt32LE(offset,16);return Buffer.concat([...locals,directory,end]);
}
const origin='https://tenant.example';
const list=(version='1.2.3')=>`<com.sap.it.op.tmn.commands.dashboard.webui.IntegrationComponentsListResponse><artifactInformations><id>uuid-test</id><tenantId>tenant</tenantId><taskId>task1</taskId><name>Test flow</name><symbolicName>Test</symbolicName><semanticState>STARTED</semanticState><deployedOn>2026-11-09T01:00:00Z</deployedOn><tags name="artifact.package.name" value="Sensors"/><tags name="artifact.package.id" value="sensors"/><tags name="SAP-BundleType" value="IntegrationFlow"/><tags name="Bundle-Version" value="${version}"/></artifactInformations></com.sap.it.op.tmn.commands.dashboard.webui.IntegrationComponentsListResponse>`;
const download=(bytes,id='uuid-test')=>`<com.sap.it.nm.commands.deploy.DownloadContentResponse><artifacts id="${id}" name="Test" type="BUNDLE"><content>${bytes.toString('base64')}</content></artifacts></com.sap.it.nm.commands.deploy.DownloadContentResponse>`;
function mock({mismatch=false,race=false,denied=false,wrongId=false}={}){let scans=0;const calls=[];return {calls,fetcher:async(url,options)=>{calls.push(url);assert.equal(options.method,'GET');assert.equal(options.credentials,'same-origin');assert.equal(new URL(url).origin,origin);if(denied)return new Response('',{status:403});if(url.includes('IntegrationComponentsListCommand')){scans++;return new Response(list(race&&scans>1?'2.0.0':'1.2.3'));}assert.match(url,/DownloadContentCommand/);assert.equal(new URL(url).searchParams.get('tenantId'),'tenant');return new Response(download(zip(xml,8,mismatch?'Bundle-SymbolicName: Test\r\nBundle-Version: 9.0.0\r\n':undefined),wrongId?'other':undefined));}};}
(async()=>{
 const h=api.headers(xml);assert.equal(h.sender,'ERP');assert.equal(h.receiver,'Warehouse');assert.equal(h.issues.length,0);assert(!JSON.stringify(h).includes('DO-NOT-EXPORT'));
 for(const source of ['SAP_Sender','Sender'])for(const target of ['SAP_Receiver','Receiver']) {
   const aliases=api.headers(flow(assignment(source,'ERP')+assignment(target,'Warehouse')));
   assert.equal(aliases.sender,'ERP');assert.equal(aliases.receiver,'Warehouse');assert.equal(aliases.issues.length,0);
 }
 const same=api.headers(flow(assignment('SAP_Sender','ERP')+assignment('Sender',' ERP ')+assignment('SAP_Receiver','Warehouse')+assignment('Receiver','Warehouse')));
 assert.equal(same.sender,'ERP');assert.equal(same.receiver,'Warehouse');assert.equal(same.issues.length,0);
 const conflicts=api.headers(flow(assignment('SAP_Sender','ERP')+assignment('Sender','Other ERP')+assignment('SAP_Receiver','Warehouse')+assignment('Receiver','Other warehouse')));
 assert.equal(conflicts.sender,'ERP | Other ERP');assert.equal(conflicts.receiver,'Warehouse | Other warehouse');assert.equal(conflicts.issues.filter(issue=>issue.includes('conflicting')).length,2);
 const mixed=api.headers(flow(assignment('SAP_Sender','ERP')+assignment('Sender','${header.source}','expression')+assignment('Receiver','Warehouse')));
 assert.equal(mixed.sender,'ERP');assert.match(mixed.issues.join(';'),/Sender dynamic/);
 const deleted=api.headers(flow(assignment('Sender','ERP')+assignment('SAP_Sender','','constant','Delete')+assignment('Receiver','Warehouse')));
 assert.match(deleted.issues.join(';'),/SAP_Sender deleted/);
 const missing=api.headers(flow(''));assert.equal(missing.issues.length,2);assert.match(missing.issues[0],/SAP_Sender or Sender/);
 const repeated=api.headers(flow(assignment('Sender','ERP')+assignment('Sender','ERP')+assignment('Receiver','Warehouse')));
 assert.equal(repeated.sender,'ERP');assert.match(repeated.issues.join(';'),/Sender assigned in multiple steps/);
 const wrongCase=api.headers(flow(assignment('sender','ERP')+assignment('receiver','Warehouse')));assert.equal(wrongCase.issues.length,2);
 const issues=api.headers(flow(assignment('SAP_Sender','A')+assignment('SAP_Sender','B')+assignment('SAP_Receiver','{{target}}')));assert.match(issues.issues.join(';'),/conflicting/);assert.match(issues.issues.join(';'),/externalized/);assert.equal(issues.receiver,'');
 assert.throws(()=>api.headers('<!DOCTYPE a><a/>'));assert.throws(()=>api.headers('<root/>'));assert.throws(()=>api.headers('<broken>'));
 for(const method of [0,8])assert.equal(await api.flowFromZip(zip(xml,method)),xml);
 const broken=zip(xml,0);broken[30+Buffer.byteLength('src/main/resources/scenarioflows/integrationflow/Test.iflw')+10]^=1;await assert.rejects(()=>api.flowFromZip(broken));await assert.rejects(()=>api.flowFromZip(new Uint8Array()));
 let m=mock(),r=await api.collect({origin,fetcher:m.fetcher});assert.equal(r.complete,true);assert.equal(r.rows[0].sender,'ERP');assert.equal(m.calls.length,3);assert.equal(r.rows[0].packageName,'Sensors');assert.equal(r.rows[0].packageId,'sensors');
 m=mock({mismatch:true});r=await api.collect({origin,fetcher:m.fetcher});assert.match(r.rows[0].review,/does not match/);assert.equal(r.rows[0].sender,'');
 m=mock({race:true});r=await api.collect({origin,fetcher:m.fetcher});assert.equal(r.rows[0].sender,'');assert.match(r.rows[0].review,/changed during/);
 await assert.rejects(()=>api.collect({origin,fetcher:mock({denied:true}).fetcher}),/403/);
 m=mock({wrongId:true});r=await api.collect({origin,fetcher:m.fetcher});assert.match(r.rows[0].review,/identity/);assert.equal(r.rows[0].sender,'');
 assert.throws(()=>api.deployedList('<html/>'),/Unsupported/);
 const controller=new AbortController();r=await api.collect({origin,fetcher:mock().fetcher,signal:controller.signal,update(){controller.abort()}});assert.equal(r.complete,false);assert.match(r.rows[0].review,/Cancelled/);
 const csv=api.csv([{...r.rows[0],name:'=SUM(A1)',sender:'A,"B"',apikey:'DO-NOT-EXPORT'}]);assert(csv.startsWith('\ufeff'));assert(csv.includes("'=SUM(A1)"));assert(csv.includes('A,""B""'));assert(!csv.includes('DO-NOT-EXPORT'));assert(!csv.split('\r\n')[0].includes('evidence'));
 console.log('PASS: inventory header extraction, dynamic/conflicting/missing guards, ZIP stored/deflate/integrity, read-only API, version guard, deployment race, permission failure, archive identity, cancel, CSV escaping and secret exclusion');
})();
