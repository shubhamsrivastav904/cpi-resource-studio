(() => {
 'use strict';
 if(window.__cpiStudioLauncher)return;window.__cpiStudioLauncher=true;
 const relevant=()=>/^\/shell\/(design|monitoring)(\/|$)/.test(location.pathname)&&document.querySelector('.sapUiBody')&&Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6,[role="heading"],.sapMTitle')).some(e=>e.textContent.trim()==='Integration Suite');
 let host,root,panel,prefs={right:22,top:180,collapsed:true};
 try{const saved=JSON.parse(localStorage.getItem('cpi-studio-launcher')||'null');if(saved&&Number.isFinite(saved.right)&&Number.isFinite(saved.top))prefs={right:saved.right,top:saved.top,collapsed:!!saved.collapsed};}catch{}
 function save(){try{localStorage.setItem('cpi-studio-launcher',JSON.stringify(prefs));}catch{}}
 function position(){if(!panel)return;prefs.right=Math.max(8,Math.min(prefs.right,Math.max(8,innerWidth-250)));prefs.top=Math.max(8,Math.min(prefs.top,Math.max(8,innerHeight-(prefs.collapsed?70:350))));panel.style.right=prefs.right+'px';panel.style.top=prefs.top+'px';}
 function check(){
  if(!relevant()){if(host)host.hidden=true;return;}
  if(host){host.hidden=false;const flow=/\/integrationflows\/[^/]+/.test(location.pathname);for(const name of ['resources','converter','naming'])root.getElementById(name).disabled=!flow;return;}
  host=document.createElement('div');host.id='cpi-studio-launcher';document.documentElement.append(host);root=host.attachShadow({mode:'open'});
  root.innerHTML=`<style>:host{font:14px system-ui;color:#15365e}*{box-sizing:border-box}[hidden]{display:none!important}section{position:fixed;width:236px;z-index:2147483645;border:1px solid #bed0ec;border-radius:16px;box-shadow:0 12px 35px #163b6833;background:#fff;overflow:hidden}header{background:linear-gradient(110deg,#1454c5,#2976e4);color:#fff;display:flex;align-items:center;padding:12px;gap:8px}#drag{font-size:18px;cursor:move;touch-action:none}strong{flex:1;font-size:13px}button{font:inherit;cursor:pointer;border:0;background:transparent;color:inherit}#toggle{font-size:20px}nav{padding:8px}nav button{display:block;text-align:left;width:100%;padding:11px;border-radius:9px;color:#194879}nav button:hover{background:#edf4ff}button:disabled{color:#8b9bb3;cursor:default}small{display:block;color:#627995;padding:0 13px 12px;font-size:11px}#status{padding:0 13px 10px;font-size:12px;color:#9e251c}</style><section aria-label="CPI Resource Studio launcher"><header><span id="drag" role="button" tabindex="0" aria-label="Move toolbar with arrow keys">⠿</span><strong>CPI Resource Studio</strong><button id="toggle" aria-label="Expand toolbar" aria-expanded="false">＋</button></header><div id="body" hidden><nav><button id="resources">▤ &nbsp; Resource Editor</button><button id="converter">⇄ &nbsp; XML → XSD</button><button id="inventory">▦ &nbsp; Flow Inventory</button><button id="naming">✓ &nbsp; Naming Review</button></nav><small>Tools for your current tenant</small></div><div id="status" role="status"></div></section>`;
  panel=root.querySelector('section');
  const draw=()=>{root.getElementById('body').hidden=prefs.collapsed;root.getElementById('toggle').textContent=prefs.collapsed?'＋':'−';root.getElementById('toggle').setAttribute('aria-expanded',String(!prefs.collapsed));root.getElementById('toggle').setAttribute('aria-label',prefs.collapsed?'Expand toolbar':'Collapse toolbar');position();save();};
  root.getElementById('toggle').onclick=()=>{prefs.collapsed=!prefs.collapsed;draw();};
  const drag=root.getElementById('drag');let start;
  drag.onpointerdown=e=>{start={x:e.clientX,y:e.clientY,right:prefs.right,top:prefs.top};drag.setPointerCapture(e.pointerId);};
  drag.onpointermove=e=>{if(!start)return;prefs.right=start.right-(e.clientX-start.x);prefs.top=start.top+(e.clientY-start.y);position();};
  drag.onpointerup=drag.onpointercancel=()=>{start=null;save();};
  drag.onkeydown=e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();prefs.right+=(e.key==='ArrowLeft'?10:e.key==='ArrowRight'?-10:0);prefs.top+=(e.key==='ArrowDown'?10:e.key==='ArrowUp'?-10:0);position();save();};
  for(const name of ['resources','converter','inventory','naming'])root.getElementById(name).onclick=async()=>{const status=root.getElementById('status');status.textContent='Opening…';try{const response=await chrome.runtime.sendMessage({kind:'openStudioTool',tool:name});if(response?.error)throw Error(response.error);status.textContent='';}catch(error){status.textContent=error.message;}};
  draw();check();
 }
 let queued=false;new MutationObserver(()=>{if(queued)return;queued=true;setTimeout(()=>{queued=false;check();},250);}).observe(document.documentElement,{childList:true,subtree:true});
 addEventListener('popstate',check);addEventListener('resize',position);check();
})();
