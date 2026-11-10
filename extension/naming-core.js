(() => {
  'use strict';
  const BPMN='http://www.omg.org/spec/BPMN/20100524/MODEL';
  const source='https://help.sap.com/docs/cloud-integration/sap-cloud-integration/naming-conventions';
  const defaults=Object.freeze({schemaVersion:1,name:'SAP naming defaults',version:'1',prefix:'',overrides:{}});
  const camel=value=>{const words=String(value).replace(/([a-z0-9])([A-Z])/g,'$1 $2').match(/[A-Za-z0-9]+/g)||[];return words.map((w,i)=>i?w[0].toUpperCase()+w.slice(1):w[0].toLowerCase()+w.slice(1)).join('');};
  function profile(input=defaults){
    if(!input||input.schemaVersion!==1||typeof input.name!=='string'||!input.name.trim()||input.name.length>100||typeof input.version!=='string'||input.version.length>40)throw Error('Invalid rules profile. Include schemaVersion 1, name and version.');
    if(typeof input.prefix!=='string'||!/^[A-Za-z0-9_]{0,30}$/.test(input.prefix))throw Error('Prefix must contain only letters, numbers or underscores (up to 30 characters).');
    const overrides=input.overrides;
    if(!overrides||typeof overrides!=='object'||Array.isArray(overrides))throw Error('Rules must contain an overrides object.');
    const safe={};
    const types=['ContentModifier','ContentEnricher','MessageMapping','XSLTMapping','GroovyScript','JavaScript','XMLtoJSONConverter','JSONtoXMLConverter','CSVtoXMLConverter','XMLtoCSVConverter','Splitter','Gather','RequestReply','Decryptor','Encryptor','Router','Other'];
    for(const [key,value] of Object.entries(overrides)){
      if(!types.includes(key))throw Error('Unknown palette type in rules: '+key);
      if(typeof value==='string'){
        if(!/^[A-Za-z][A-Za-z0-9_]{0,89}$/.test(value))throw Error('Naming stems must contain letters, numbers or underscores.');
        Object.defineProperty(safe,key,{value,enumerable:true});
      }else{
        if(!value||typeof value!=='object'||Array.isArray(value)||typeof value.template!=='string'||value.template.length>120)throw Error('A project rule needs a valid template.');
        const remainder=value.template.replace(/\{(purpose|type|index|flow)\}/g,'X');
        if(!/^[A-Za-z][A-Za-z0-9_]*$/.test(remainder))throw Error('Templates support only letters, numbers, underscores and {purpose}, {type}, {index}, {flow}.');
        const style=value.style||'camelCase';if(!['camelCase','PascalCase','unchanged'].includes(style))throw Error('Rule style must be camelCase, PascalCase or unchanged.');
        Object.defineProperty(safe,key,{value:{template:value.template,style},enumerable:true});
      }
    }
    return {schemaVersion:1,name:input.name.trim(),version:input.version,prefix:input.prefix,overrides:safe};
  }
  function parse(text){
    if(typeof text!=='string'||text.length>8*1024*1024)throw Error('Flow XML exceeds the 8 MB review limit.');
    if(/<!DOCTYPE|<!ENTITY/i.test(text))throw Error('DTD and entity declarations are unsupported.');
    const doc=new DOMParser().parseFromString(text,'application/xml');
    if(doc.getElementsByTagName('parsererror').length||doc.documentElement.localName!=='definitions'||doc.documentElement.namespaceURI!==BPMN)throw Error('Open a valid CPI .iflw definition.');
    return doc;
  }
  const child=(node,name)=>Array.from(node.childNodes).find(n=>n.nodeType===1&&n.localName===name);
  function properties(node){
    const ext=child(node,'extensionElements'); const values={};
    if(ext)for(const prop of Array.from(ext.getElementsByTagNameNS('*','property'))){const key=child(prop,'key')?.textContent;const value=child(prop,'value')?.textContent||'';if(key)Object.defineProperty(values,key,{value,enumerable:true,configurable:true});}
    return values;
  }
  function classify(node,p){
    const raw=p.activityType||p.componentType||p.subActivityType||node.localName;
    const type=String(raw).toLowerCase().replace(/[^a-z0-9]/g,'');
    if(/contentmodifier|^enricher$/.test(type))return 'ContentModifier';
    if(/contentenricher/.test(type))return 'ContentEnricher';
    if(/messagemapping/.test(type))return 'MessageMapping';
    if(/xslt/.test(type))return 'XSLTMapping';
    if(/groovy|script/.test(type))return /javascript/.test(type)?'JavaScript':'GroovyScript';
    if(/xmltojson/.test(type))return 'XMLtoJSONConverter';
    if(/jsontoxml/.test(type))return 'JSONtoXMLConverter';
    if(/csvtoxml/.test(type))return 'CSVtoXMLConverter';
    if(/xmltocsv/.test(type))return 'XMLtoCSVConverter';
    if(/splitter/.test(type))return 'Splitter';
    if(/gather/.test(type))return 'Gather';
    if(/requestreply|externalcall/.test(type))return 'RequestReply';
    if(/decrypt/.test(type))return 'Decryptor';
    if(/encrypt/.test(type))return 'Encryptor';
    if(node.localName==='exclusiveGateway'||/router/.test(type))return 'Router';
    return 'Other';
  }
  function suggest(type,p){
    if(type==='ContentModifier'){
      const tasks=[];if(p.headerTable?.trim())tasks.push('Headers');if(p.propertyTable?.trim())tasks.push('Properties');if(p.bodyContent?.trim()||p.body?.trim())tasks.push('Body');
      return {stem:tasks.length?'set'+tasks.join('And'):'setMessageContent',reason:tasks.length?'Configured to modify '+tasks.join(', ').toLowerCase()+'.':'Describe which headers, properties or body this step changes.',context:!tasks.length};
    }
    const known={XMLtoJSONConverter:['convertXMLToJSON','Converts XML to JSON.'],JSONtoXMLConverter:['convertJSONToXML','Converts JSON to XML.'],CSVtoXMLConverter:['convertCSVToXML','Converts CSV to XML.'],XMLtoCSVConverter:['convertXMLToCSV','Converts XML to CSV.'],Decryptor:['decryptMessage','Decrypts the message.'],Encryptor:['encryptMessage','Encrypts the message.']};
    if(known[type])return {stem:known[type][0],reason:known[type][1],context:false};
    const contextual={ContentEnricher:['enrichMessage','Add the source and business data used to enrich the message.'],Router:['routeMessage','Add the field or decision used for routing.'],Splitter:['splitMessage','Add the business object being split.'],Gather:['gatherMessages','Add the messages being combined.'],RequestReply:['callReceiver','Add the receiver and business operation.'],MessageMapping:['MM_Source_to_Target','Replace Source and Target with message names.'],XSLTMapping:['XSL_Source_to_Target','Replace Source and Target with message names.'],GroovyScript:['groovy_processMessage','Confirm the script purpose; code is not executed or interpreted.'],JavaScript:['jscript_processMessage','Confirm the script purpose; code is not executed or interpreted.'],Other:['describeStepPurpose','This step needs a developer-provided purpose.']};
    const [stem,reason]=contextual[type];return {stem,reason,context:true};
  }
  function review(text,input=defaults,context={}){
    const rules=profile(input),doc=parse(text),rows=[],ids=new Set();
    for(const node of Array.from(doc.getElementsByTagNameNS(BPMN,'*'))){
      if(!['callActivity','serviceTask','scriptTask','exclusiveGateway'].includes(node.localName))continue;
      const id=node.getAttribute('id');if(!id||ids.has(id))throw Error('Flow contains missing or duplicate step IDs.');ids.add(id);
      const p=properties(node),type=classify(node,p),s=suggest(type,p),override=Object.hasOwn(rules.overrides,type)?rules.overrides[type]:null;
      const current=node.getAttribute('name')||'';
      const format=value=>{const c=camel(value);return override?.style==='PascalCase'?c.charAt(0).toUpperCase()+c.slice(1):override?.style==='unchanged'?String(value).replace(/[^A-Za-z0-9_]/g,''):c;};
      const tokens={purpose:format(s.stem),type:format(type),index:String(rows.length+1),flow:format(context.flowName||'')};
      const needsFlow=override&&typeof override==='object'&&override.template.includes('{flow}')&&!tokens.flow;
      const stem=override&&typeof override==='object'?override.template.replace(/\{(purpose|type|index|flow)\}/g,(_,key)=>tokens[key]||'FlowContextRequired'):override||s.stem;
      const suggested=rules.prefix+stem;
      const specific=['MessageMapping','XSLTMapping','GroovyScript','JavaScript'].includes(type);
      const defaultName=!current.trim()||/^(Content Modifier|Router|Request Reply|Groovy Script|JavaScript|Message Mapping|XSLT Mapping|.* Converter|.* Splitter|Gather|Encryptor|Decryptor)\s*\d*$/i.test(current);
      rows.push({id,type,current,suggested,reason:override?s.reason+' Project rule applied'+(needsFlow?'; interface name is required.':'.'):s.reason,basis:override||rules.prefix?'Project rule':specific?'SAP specific pattern':'SAP general guidance',status:s.context||needsFlow||typeof override==='string'?'Needs context':current===suggested?'Matches suggestion':defaultName?'Suggestion available':'Review existing name',source});
    }
    const counts=new Map();for(const row of rows)counts.set(row.suggested,(counts.get(row.suggested)||0)+1);
    for(const row of rows)if(counts.get(row.suggested)>1){row.status='Needs context';row.reason+=' Multiple steps share this suggestion; add a distinct purpose.';}
    return {profile:{name:rules.name,version:rules.version},rows};
  }
  window.CpiNaming=Object.freeze({defaults,profile,review,source,camel});
})();
