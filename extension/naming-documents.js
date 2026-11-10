(() => {
 'use strict';
 const aliases=[['ContentModifier',/\bcontent\s*modifier\b/i],['ContentEnricher',/\bcontent\s*enricher\b/i],['GroovyScript',/\bgroovy(?:\s*script)?\b/i],['JavaScript',/\bjava\s*script\b/i],['MessageMapping',/\bmessage\s*mapping\b/i],['XSLTMapping',/\bxslt(?:\s*mapping)?\b/i],['Router',/\brouter\b/i],['Splitter',/\b(?:general\s*|iterating\s*)splitter\b/i],['Gather',/\bgather\b/i],['RequestReply',/\brequest\s*(?:reply|\/?\s*reply)\b/i],['XMLtoJSONConverter',/\bxml\s*(?:to|→|2)\s*json\b/i],['JSONtoXMLConverter',/\bjson\s*(?:to|→|2)\s*xml\b/i],['CSVtoXMLConverter',/\bcsv\s*(?:to|→|2)\s*xml\b/i],['XMLtoCSVConverter',/\bxml\s*(?:to|→|2)\s*csv\b/i],['Encryptor',/\bencryptor\b/i],['Decryptor',/\bdecryptor\b/i]];
 function draft(text,name){
  if(typeof text!=='string'||text.length>200000)throw Error('Guidelines exceed the document text limit.');
  const normalized=text.replace(/<(?:purpose|description|task|operation)>|\[(?:purpose|description|task|operation)\]/gi,'{purpose}').replace(/<(?:index|number|sequence)>|\[(?:index|number|sequence)\]/gi,'{index}').replace(/<(?:flow|interface)>|\[(?:flow|interface)\]/gi,'{flow}').replace(/<type>|\[type\]/gi,'{type}');
  const globalStyle=/\bPascalCase\b/i.test(text)?'PascalCase':/\bunchanged\b/i.test(text)?'unchanged':'camelCase';
  const overrides={},evidence=[],conflicts=new Set();
  for(const line of normalized.split(/\r?\n/).map(x=>x.trim()).filter(Boolean)){
   const types=aliases.filter(([,pattern])=>pattern.test(line));if(types.length!==1)continue;
   const type=types[0][0];
   const templates=line.match(/[A-Za-z][A-Za-z0-9_]*(?:\{(?:purpose|type|flow|index)\}[A-Za-z0-9_{}]*)+/g)||[];
   let template=templates.length===1?templates[0]:null;
   if(!template){const prefix=line.match(/(?:prefix(?:ed)?(?:\s+(?:with|by))?|start(?:s)?\s+with|begin(?:s)?\s+with|[:|=])\s*["'`]?([A-Za-z][A-Za-z0-9_]*_)(?=["'`\s.,;]|$)/i)?.[1];if(prefix)template=prefix+'{purpose}_{index}';}
   if(!template)continue;
   const style=/\bPascalCase\b/i.test(line)?'PascalCase':/\bcamelCase\b/i.test(line)?'camelCase':globalStyle;
   const rule={template,style};try{window.CpiNaming.profile({schemaVersion:1,name:'Draft',version:'1',prefix:'',overrides:{[type]:rule}});}catch{continue;}
   if(overrides[type]&&JSON.stringify(overrides[type])!==JSON.stringify(rule)){conflicts.add(type);delete overrides[type];continue;}
   if(conflicts.has(type))continue;overrides[type]=rule;evidence.push({type,line:line.slice(0,500)});
  }
  return {profile:{schemaVersion:1,name:String(name||'Project guidelines').replace(/\.[^.]+$/,'').slice(0,100)||'Project guidelines',version:'1',prefix:'',overrides},evidence,conflicts:[...conflicts],text};
 }
 async function extract(file){
  const format=file.name.split('.').pop().toLowerCase();
  if(format==='doc')throw Error('Legacy .doc files must first be saved as Word .docx.');
  if(!['pdf','docx'].includes(format))throw Error('Choose JSON rules, a PDF, or a Word .docx file.');
  if(file.size>10*1024*1024)throw Error('Documents must be 10 MB or smaller.');
  const bytes=new Uint8Array(await file.arrayBuffer());let binary='';for(let i=0;i<bytes.length;i+=32768)binary+=String.fromCharCode(...bytes.subarray(i,i+32768));
  const id=crypto.randomUUID();
  return new Promise((resolve,reject)=>{
   const timer=setTimeout(()=>{window.removeEventListener('message',receive);reject(Error('The local document reader did not respond. Reload this CPI tab after updating the extension.'));},35000);
   function receive(event){if(event.source!==window||event.origin!==location.origin||event.data?.channel!=='cpi-studio-doc-response'||event.data.id!==id)return;clearTimeout(timer);window.removeEventListener('message',receive);if(event.data.error)reject(Error(event.data.error));else if(typeof event.data.text==='string'&&event.data.text.length<=200000)resolve(draft(event.data.text,file.name));else reject(Error('Invalid response from the document reader.'));}
   window.addEventListener('message',receive);window.postMessage({channel:'cpi-studio-doc-request',id,format,data:btoa(binary)},location.origin);
  });
 }
 window.CpiNamingDocuments=Object.freeze({draft,extract,types:aliases.map(([type])=>type)});
})();
