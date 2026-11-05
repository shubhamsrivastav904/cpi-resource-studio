(() => {
  'use strict';
  const XS='http://www.w3.org/2001/XMLSchema', XSI='http://www.w3.org/2001/XMLSchema-instance', XMLNS='http://www.w3.org/2000/xmlns/';
  const esc=s=>String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\r/g,'&#13;').replace(/\n/g,'&#10;').replace(/\t/g,'&#9;');
  const children=e=>Array.from(e.childNodes).filter(n=>n.nodeType===1);
  const key=e=>JSON.stringify([e.namespaceURI||'',e.localName||e.nodeName]);
  function datePart(s){const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(s);if(!m)return false;const y=+m[1],mo=+m[2],d=+m[3];return y>0&&mo>=1&&mo<=12&&d>=1&&d<=new Date(Date.UTC(y,mo,0)).getUTCDate();}
  function type(s){
    s=s.trim();if(!s)return 'string';
    if(/^(true|false)$/.test(s))return 'boolean';
    if(/^[+-]?(0|[1-9]\d*)$/.test(s))return 'integer';
    if(/^[+-]?(0|[1-9]\d*)\.\d+$/.test(s))return 'decimal';
    if(/^[+-]?(0|[1-9]\d*)(\.\d+)?[eE][+-]?\d+$/.test(s)&&Number.isFinite(Number(s)))return 'double';
    const zone='(?:Z|[+-](?:0\\d|1[0-3]):[0-5]\\d|[+-]14:00)?';
    const dt=new RegExp('^(\\d{4}-\\d{2}-\\d{2})T(?:[01]\\d|2[0-3]):[0-5]\\d:[0-5]\\d(?:\\.\\d+)?'+zone+'$').exec(s);
    if(dt&&datePart(dt[1]))return 'dateTime';
    const d=new RegExp('^(\\d{4}-\\d{2}-\\d{2})'+zone+'$').exec(s);if(d&&datePart(d[1]))return 'date';
    return 'string';
  }
  function infer(values,strings){if(strings)return 'string';const types=new Set(values.map(type));if(types.size===1)return [...types][0];if([...types].every(t=>['integer','decimal','double'].includes(t)))return types.has('double')?'double':'decimal';return 'string';}
  function filename(name){name=name.trim();if(/\.xsd$/i.test(name))name=name.slice(0,-4);if(!name||name.length>100||! /^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(name)||name.includes('..'))throw Error('Enter a filename using letters, numbers, hyphens or underscores, for example observations.xsd.');return name+'.xsd';}
  function generate(xml,options={}){
    if(!xml.trim())throw Error('Paste a sample XML message first.');
    if(xml.length>2*1024*1024)throw Error('Use an XML sample smaller than 2 MB.');
    if(/<!DOCTYPE|<!ENTITY/i.test(xml))throw Error('DTD and entity declarations are not supported. Remove them from the sample.');
    const doc=new DOMParser().parseFromString(xml,'application/xml');
    if(!doc.documentElement||doc.getElementsByTagName('parsererror').length)throw Error('The XML is not well formed. Check opening and closing tags.');
    const root=doc.documentElement, ns=root.namespaceURI||'';if(ns===XS)throw Error('This is already an XML Schema. Paste an XML instance message instead.');
    let nodes=0;const warnings=[];
    const warn=s=>{if(!warnings.includes(s))warnings.push(s)};
    const tree=(e,depth=0)=>{if(depth>45)throw Error('XML nesting is too deep (maximum 45 levels).');if(++nodes>20000)throw Error('Use a smaller sample (maximum 20,000 elements).');if((e.namespaceURI||'')&&e.namespaceURI!==ns)throw Error('The XML contains multiple element namespaces. This converter currently creates one schema namespace at a time.');for(const c of children(e))tree(c,depth+1)};tree(root);
    function build(samples,depth=0){
      if(depth>45)throw Error('XML nesting is too deep (maximum 45 levels).');
      const first=samples[0], model={name:first.localName||first.nodeName,ns:first.namespaceURI||'',attrs:[],kids:[],mixed:false,nillable:false,type:'string',choice:false};
      let hasChildren=false;const groups=new Map(),perSample=[],orders=[];
      for(const e of samples){
        const list=children(e);hasChildren ||=list.length>0;
        model.nillable ||= ['true','1'].includes(e.getAttributeNS(XSI,'nil'));
        model.mixed ||=list.length>0&&Array.from(e.childNodes).some(n=>[3,4].includes(n.nodeType)&&n.nodeValue.trim());
        const counts=new Map(),order=[];
        for(const c of list){const k=key(c);if(!groups.has(k))groups.set(k,[]);groups.get(k).push(c);counts.set(k,(counts.get(k)||0)+1);if(order[order.length-1]!==k)order.push(k);}
        perSample.push(counts);orders.push(order);
      }
      if(hasChildren)model.mixed ||=samples.some(e=>Array.from(e.childNodes).some(n=>[3,4].includes(n.nodeType)&&n.nodeValue.trim()));
      // Preserve sequence order when the sample orders are compatible. Otherwise use
      // one declaration per name in an unbounded choice, which avoids ambiguous XSD particles.
      const edges=new Map([...groups.keys()].map(k=>[k,new Set()])),indegree=new Map([...groups.keys()].map(k=>[k,0]));
      for(const order of orders){if(new Set(order).size!==order.length)model.choice=true;for(let i=1;i<order.length;i++){const a=order[i-1],b=order[i];if(a!==b&&!edges.get(a).has(b)){edges.get(a).add(b);indegree.set(b,indegree.get(b)+1);}}}
      const queue=[...groups.keys()].filter(k=>indegree.get(k)===0),sorted=[];
      while(queue.length){const k=queue.shift();sorted.push(k);for(const b of edges.get(k)){indegree.set(b,indegree.get(b)-1);if(!indegree.get(b))queue.push(b);}}
      if(sorted.length!==groups.size)model.choice=true;
      if(model.choice)warn('Some child elements appear in different or interleaved orders. A flexible repeating choice was used for those parents.');
      for(const k of model.choice?groups.keys():sorted){const child=build(groups.get(k),depth+1),counts=perSample.map(m=>m.get(k)||0);child.min=options.optional||Math.min(...counts)===0?0:1;child.max=Math.max(...counts)>1?'unbounded':'1';model.kids.push(child);}
      const attributes=new Map();
      samples.forEach((e,i)=>Array.from(e.attributes).forEach(a=>{
        if(a.namespaceURI===XMLNS||a.nodeName==='xmlns')return;
        if(a.namespaceURI===XSI){if(a.localName==='type')warn('xsi:type hints were ignored; types were inferred from sample values.');return;}
        if(a.namespaceURI&&a.namespaceURI!==ns)throw Error('Foreign namespaced attributes (including xml:lang) require a separate imported schema and are not supported yet.');
        const k=key(a);if(!attributes.has(k))attributes.set(k,{name:a.localName||a.nodeName,ns:a.namespaceURI||'',values:[],seen:new Set()});const attr=attributes.get(k);attr.values.push(a.value);attr.seen.add(i);
      }));
      for(const a of attributes.values())model.attrs.push({...a,type:infer(a.values,options.strings),required:!options.optional&&a.seen.size===samples.length});
      if(!hasChildren){const values=samples.filter(e=>!['true','1'].includes(e.getAttributeNS(XSI,'nil'))).map(e=>e.textContent);model.type=values.length?infer(values,options.strings):'string';}
      return model;
    }
    const model=build([root]);let lines=['<?xml version="1.0" encoding="UTF-8"?>',`<xs:schema xmlns:xs="${XS}"${ns?` xmlns:tns="${esc(ns)}" targetNamespace="${esc(ns)}"`:''} elementFormDefault="${ns?'qualified':'unqualified'}" attributeFormDefault="unqualified">`];
    const add=(d,text)=>lines.push('  '.repeat(d)+text);
    function attr(a,d){add(d,`<xs:attribute name="${esc(a.name)}" type="xs:${a.type}"${a.ns?' form="qualified"':''}${a.required?' use="required"':''}/>`)}
    function emit(m,d,global=false,inChoice=false){
      let props=`name="${esc(m.name)}"`;
      if(!global&&ns&&m.ns==='')props+=' form="unqualified"';
      if(!global&&!inChoice){if(m.min===0)props+=' minOccurs="0"';if(m.max==='unbounded')props+=' maxOccurs="unbounded"';}
      if(m.nillable)props+=' nillable="true"';
      if(!m.kids.length&&!m.attrs.length){add(d,`<xs:element ${props} type="xs:${m.type}"/>`);return;}
      add(d,`<xs:element ${props}>`);add(d+1,`<xs:complexType${m.mixed?' mixed="true"':''}>`);
      if(m.kids.length){const tag=m.choice?'choice':'sequence';add(d+2,`<xs:${tag}${m.choice?' minOccurs="0" maxOccurs="unbounded"':''}>`);m.kids.forEach(c=>emit(c,d+3,false,m.choice));add(d+2,`</xs:${tag}>`);m.attrs.forEach(a=>attr(a,d+2));}
      else{add(d+2,'<xs:simpleContent>');add(d+3,`<xs:extension base="xs:${m.type}">`);m.attrs.forEach(a=>attr(a,d+4));add(d+3,'</xs:extension>');add(d+2,'</xs:simpleContent>');}
      add(d+1,'</xs:complexType>');add(d,'</xs:element>');
    }
    emit(model,1,true);lines.push('</xs:schema>');
    warn('Inferred from this sample only. Review field types, optionality and business rules before using the schema.');
    return {xsd:lines.join('\n')+'\n',rootName:model.name,namespace:ns,elements:nodes,warnings};
  }
  window.CpiXmlSchema=Object.freeze({generate,filename});
})();
