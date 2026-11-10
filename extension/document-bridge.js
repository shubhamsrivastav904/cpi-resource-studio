(() => {
 'use strict';if(window.__cpiDocumentBridge)return;window.__cpiDocumentBridge=true;
 window.addEventListener('message',async event=>{
  const msg=event.data;
  if(event.source!==window||event.origin!==location.origin||msg?.channel!=='cpi-studio-doc-request'||typeof msg.id!=='string'||msg.id.length>80)return;
  if(!['pdf','docx'].includes(msg.format)||typeof msg.data!=='string'||msg.data.length>14*1024*1024)return;
  let response;try{response=await chrome.runtime.sendMessage({kind:'readRulesDocument',format:msg.format,data:msg.data});}catch(error){response={error:error.message};}
  window.postMessage({channel:'cpi-studio-doc-response',id:msg.id,...response},location.origin);
 });
})();
