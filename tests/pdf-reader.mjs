import fs from 'node:fs';import assert from 'node:assert/strict';
// Text extraction does not use canvas. Node lacks the browser's DOMMatrix;
// this constructor only allows the browser build to initialize in this fixture.
globalThis.DOMMatrix=class DOMMatrix {};
const pdfjs=await import('../extension/vendor/pdfjs/pdf.mjs');pdfjs.GlobalWorkerOptions.workerSrc=new URL('../extension/vendor/pdfjs/pdf.worker.mjs',import.meta.url).href;
const task=pdfjs.getDocument({data:new Uint8Array(fs.readFileSync('tests/fixtures/naming-guidelines.pdf')),isEvalSupported:false,disableFontFace:true,useSystemFonts:false,useWorkerFetch:false});
try{const pdf=await task.promise;assert.equal(pdf.numPages,1);const content=await (await pdf.getPage(1)).getTextContent();assert.match(content.items.map(x=>x.str||'').join(' '),/Content Modifier: CM_\{purpose\}_\{index\}/);console.log('PASS: bundled PDF.js extracts naming text from a real PDF fixture');}finally{await task.destroy();}
