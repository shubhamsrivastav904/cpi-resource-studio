import * as pdfjs from './vendor/pdfjs/pdf.mjs';
pdfjs.GlobalWorkerOptions.workerSrc=new URL('./vendor/pdfjs/pdf.worker.mjs',import.meta.url).href;
let busy=false;
chrome.runtime.onMessage.addListener((msg,sender,reply)=>{
 if(msg?.kind!=='extractRulesDocument'||sender.id!==chrome.runtime.id||sender.tab)return;
 if(busy){reply({error:'Another document is being read. Please try again when it finishes.'});return;}
 if(!['pdf','docx'].includes(msg.format)||typeof msg.data!=='string'||msg.data.length>14*1024*1024){reply({error:'Invalid document request.'});return;}
 busy=true;
 (async()=>{
  const decoded=atob(msg.data);if(decoded.length>10*1024*1024)throw Error('Document exceeds 10 MB.');const bytes=Uint8Array.from(decoded,c=>c.charCodeAt(0));let text='';
  if(msg.format==='docx')text=window.CpiDocumentText.wordText(await window.CpiInventory.zipText(bytes,/^word\/document\.xml$/));
  else {
   if(new TextDecoder().decode(bytes.subarray(0,5))!=='%PDF-')throw Error('This file is not a PDF.');
   const task=pdfjs.getDocument({data:bytes,isEvalSupported:false,disableFontFace:true,useSystemFonts:false,useWorkerFetch:false,stopAtErrors:true});
   const timer=setTimeout(()=>task.destroy(),25000);
   try{
    task.onPassword=()=>task.destroy();const pdf=await task.promise;
    if(pdf.numPages>100)throw Error('Use a guideline document of 100 pages or fewer.');
    for(let number=1;number<=pdf.numPages;number++){
     const page=await pdf.getPage(number),content=await page.getTextContent();let line='';
     for(const item of content.items){if(typeof item.str!=='string')continue;line+=item.str+' ';if(item.hasEOL){text+=line+'\n';line='';}}
     text+=line+'\n';if(text.length>200000)throw Error('Extracted guidelines exceed 200,000 characters.');page.cleanup();
    }
   }finally{clearTimeout(timer);await task.destroy();}
  }
  if(text.length>200000)throw Error('Extracted guidelines exceed 200,000 characters.');
  if(!text.trim())throw Error('No readable text found. Scanned PDFs need OCR first.');return {text};
 })().then(reply,error=>reply({error:/password/i.test(error.message)?'Password-protected documents are unsupported.':error.message||'Unable to read this document.'})).finally(()=>{busy=false;});return true;
});
