(() => {
 'use strict';
 function wordText(xml){
  if(xml.length>8*1024*1024||/<!DOCTYPE|<!ENTITY/i.test(xml))throw Error('Unsupported or oversized Word document XML.');
  const doc=new DOMParser().parseFromString(xml,'application/xml'),ns='http://schemas.openxmlformats.org/wordprocessingml/2006/main';
  if(doc.getElementsByTagName('parsererror').length||doc.documentElement.namespaceURI!==ns)throw Error('Invalid Word document.');
  const body=doc.getElementsByTagNameNS(ns,'body')[0];if(!body)throw Error('The Word document has no body text.');
  const text=node=>Array.from(node.getElementsByTagNameNS(ns,'t')).map(n=>n.textContent).join('');
  const lines=[];
  for(const node of Array.from(body.childNodes)){
   if(node.nodeType!==1)continue;
   if(node.localName==='tbl')for(const row of Array.from(node.getElementsByTagNameNS(ns,'tr')))lines.push(Array.from(row.childNodes).filter(n=>n.nodeType===1&&n.localName==='tc').map(text).join(' | '));
   else lines.push(text(node));
  }
  return lines.join('\n');
 }
 window.CpiDocumentText=Object.freeze({wordText});
})();
