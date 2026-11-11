'use strict';
let opening;
const isTenant=url=>{try{const u=new URL(url);return u.protocol==='https:'&&/(?:^|\.)(?:hana\.ondemand\.com|hana\.ondemand\.cloud|platform\.sapcloud\.cn)$/.test(u.hostname)&&/^\/shell\/(design|monitoring)(\/|$)/.test(u.pathname);}catch{return false;}};
async function reader(){
 if(await chrome.offscreen.hasDocument())return;
 if(!opening)opening=chrome.offscreen.createDocument({url:'document-reader.html',reasons:['DOM_PARSER'],justification:'Extract naming guidelines from a user-selected PDF or Word document locally.'}).finally(()=>{opening=null;});
 await opening;
}
chrome.runtime.onMessage.addListener((msg,sender,reply)=>{
 if(msg?.kind!=='readRulesDocument')return;
 if(sender.id!==chrome.runtime.id||sender.frameId!==0||!isTenant(sender.url)||!['pdf','docx'].includes(msg.format)||typeof msg.data!=='string'||msg.data.length>14*1024*1024){reply({error:'Unsupported document request.'});return;}
 (async()=>{await reader();const result=await chrome.runtime.sendMessage({kind:'extractRulesDocument',format:msg.format,data:msg.data});if(!result||typeof result.text!=='string'&&typeof result.error!=='string')throw Error('Document reader did not respond.');return result;})().then(reply,error=>reply({error:error.message}));return true;
});
chrome.runtime.onMessage.addListener((msg,sender,reply)=>{
 if(msg?.kind!=='openStudioTool')return;
 if(sender.id!==chrome.runtime.id||sender.frameId!==0||!sender.tab?.id||!isTenant(sender.url)||!['resources','converter','inventory','naming','help'].includes(msg.tool)){reply({error:'Open a supported CPI tenant page.'});return;}
 (async()=>{
  if(msg.tool==='help'){await chrome.tabs.create({url:chrome.runtime.getURL('help.html')});return {ok:true};}
  const target={tabId:sender.tab.id};
  const [{result:ready}]=await chrome.scripting.executeScript({target,world:'MAIN',func:()=>Boolean(window.sap?.ui?.getCore&&document.querySelector('.sapUiBody')&&/^\/shell\/(design|monitoring)(\/|$)/.test(location.pathname))});
  if(!ready)throw Error('CPI is still loading. Try again when the designer is ready.');
  if(msg.tool!=='inventory'&&!/\/integrationflows\/[^/]+/.test(new URL(sender.url).pathname))throw Error('Open an integration flow first.');
  const files=msg.tool==='naming'?['inventory-core.js','naming-core.js','naming-documents.js','naming-live.js','naming.js']:msg.tool==='inventory'?['inventory-core.js','inventory-export.js','inventory.js']:['xml-to-xsd.js','collection.js','inventory-core.js','inventory-export.js','inventory.js','naming-core.js','naming-documents.js','naming-live.js','naming.js'];
  await chrome.scripting.executeScript({target,world:'MAIN',files});
  const [{result:opened}]=await chrome.scripting.executeScript({target,world:'MAIN',args:[msg.tool],func:tool=>{
   if(tool==='inventory'||tool==='naming'){const panel=document.getElementById(tool==='inventory'?'cpi-flow-inventory':'cpi-naming-review')?.shadowRoot?.querySelector('section');if(!panel)return false;panel.hidden=false;return true;}
   const root=document.getElementById('cpi-resource-collection')?.shadowRoot;if(!root)return false;root.getElementById('launch').style.display='none';root.getElementById('launch').click();root.getElementById(tool==='converter'?'mode-converter':'mode-resources').click();return true;
  }});
  if(!opened)throw Error('The workspace could not open.');return {ok:true};
 })().then(reply,error=>reply({error:error.message}));return true;
});
