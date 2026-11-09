'use strict';
const openButton=document.getElementById('open');
const status=document.getElementById('status');
const inventoryButton=document.getElementById('inventory');
let selectedTab;
const isFlow=url=>url.protocol==='https:'&&/\/integrationflows\/[^/]+/.test(url.pathname);
function fail(message){status.textContent=message;status.classList.add('error');}
async function initialize(){
  try{
    [selectedTab]=await chrome.tabs.query({active:true,currentWindow:true});
    if(!selectedTab?.url)throw Error('Select your signed-in CPI integration-flow tab, then open this extension again.');
    const url=new URL(selectedTab.url);
    document.getElementById('tenant').textContent=url.protocol==='https:'?url.hostname:'No CPI tenant selected';
    if(!isFlow(url) && !(url.protocol==='https:' && /^\/shell\/(design|monitoring)(\/|$)/.test(url.pathname)))throw Error('Open SAP Cloud Integration Design or Monitor, then open this extension again.');
    inventoryButton.disabled=false;
    if(!isFlow(url)){document.getElementById('flow').textContent='Tenant inventory';status.textContent='Scan deployed flows and export their source and target systems.';return;}
    const flow=url.pathname.match(/\/integrationflows\/([^/]+)/)[1];
    document.getElementById('flow').textContent=decodeURIComponent(flow);
    status.textContent='Opens inside this tenant tab. Saves use your existing CPI permissions.';
    openButton.disabled=false;
  }catch(error){fail(error.message);}
}
openButton.addEventListener('click',async()=>{
  openButton.disabled=true;status.classList.remove('error');status.textContent='Opening your workspace…';
  try{
    const [{result:ready}]=await chrome.scripting.executeScript({target:{tabId:selectedTab.id},world:'MAIN',func:()=>Boolean(window.sap?.ui?.getCore&&document.querySelector('.sapUiBody')&&/\/integrationflows\/[^/]+/.test(location.pathname))});
    if(!ready)throw Error('CPI is still loading or this page is unsupported. Wait for the flow designer to load and try again.');
    await chrome.scripting.executeScript({target:{tabId:selectedTab.id},world:'MAIN',files:['xml-to-xsd.js','collection.js','inventory-core.js','inventory-export.js','inventory.js']});
    const [{result:opened}]=await chrome.scripting.executeScript({target:{tabId:selectedTab.id},world:'MAIN',func:()=>{const launch=document.getElementById('cpi-resource-collection')?.shadowRoot?.getElementById('launch');if(!launch)return false;launch.click();return true;}});
    if(!opened)throw Error('The workspace could not open. Refresh the tenant page after saving any native CPI work, then try again.');
    status.textContent='Workspace opened in your tenant tab.';window.close();
  }catch(error){fail(error.message||'Chrome blocked access to this tab. Reopen the extension on the CPI tab and try again.');openButton.disabled=false;}
});
inventoryButton.addEventListener('click',async()=>{
  inventoryButton.disabled=true; status.classList.remove('error'); status.textContent='Opening deployed flow inventory…';
  try {
    const [{result:ready}]=await chrome.scripting.executeScript({target:{tabId:selectedTab.id},world:'MAIN',func:()=>Boolean(location.protocol==='https:' && window.sap?.ui?.getCore && document.querySelector('.sapUiBody'))});
    if(!ready)throw Error('Open a loaded SAP Cloud Integration tenant page and try again.');
    await chrome.scripting.executeScript({target:{tabId:selectedTab.id},world:'MAIN',files:['inventory-core.js','inventory-export.js','inventory.js']});
    const [{result:opened}]=await chrome.scripting.executeScript({target:{tabId:selectedTab.id},world:'MAIN',func:()=>{
      const panel=document.getElementById('cpi-flow-inventory')?.shadowRoot?.querySelector('section');
      if(!panel)return false;
      panel.hidden=false;return true;
    }});
    if(!opened)throw Error('The inventory workspace could not open.');
    window.close();
  }catch(error){fail(error.message);inventoryButton.disabled=false;}
});
initialize();
