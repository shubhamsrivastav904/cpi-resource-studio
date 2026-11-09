(() => {
  'use strict';
  const LIMIT = 32 * 1024 * 1024;
  const BPMN = 'http://www.omg.org/spec/BPMN/20100524/MODEL';
  const names = ['SAP_Sender', 'SAP_Receiver'];
  function xml(text) {
    if (/<!DOCTYPE|<!ENTITY/i.test(text)) throw Error('Unsupported XML declaration.');
    const doc = new DOMParser().parseFromString(text, 'application/xml');
    if (doc.getElementsByTagName('parsererror').length) throw Error('Invalid flow XML.');
    return doc;
  }
  const elements = (node, name) => Array.from(node.getElementsByTagNameNS('*', name));
  const child = (node, name) => Array.from(node.childNodes).find(n => n.nodeType === 1 && n.localName === name);
  function headers(text) {
    const doc = xml(text);
    if (doc.documentElement.localName !== 'definitions' || doc.documentElement.namespaceURI !== BPMN) throw Error('Unsupported flow definition.');
    const found = Object.fromEntries(names.map(name => [name, []]));
    for (const activity of elements(doc, 'callActivity')) {
      if (activity.namespaceURI !== BPMN) continue;
      const extensions = child(activity, 'extensionElements');
      if (!extensions) continue;
      for (const property of elements(extensions, 'property')) {
        if (child(property, 'key')?.textContent !== 'headerTable') continue;
        const table = xml('<table>' + (child(property, 'value')?.textContent || '') + '</table>');
        for (const row of elements(table, 'row')) {
          const cells = Object.fromEntries(elements(row, 'cell').map(cell => [cell.getAttribute('id'), cell.textContent]));
          if (!names.includes(cells.Name)) continue;
          found[cells.Name].push({action: cells.Action || '', type: cells.Type || '', value: cells.Value || ''});
        }
      }
    }
    const result = {sender: '', receiver: '', issues: []};
    for (const [index, name] of names.entries()) {
      const assignments = found[name];
      const values = [...new Set(assignments.filter(a => /^create$/i.test(a.action) && /^constant$/i.test(a.type) && a.value.trim() && !/\{\{|\$\{/.test(a.value)).map(a => a.value.trim()))];
      result[index === 0 ? 'sender' : 'receiver'] = values.join(' | ');
      if (!assignments.length) result.issues.push(name + ' missing');
      if (assignments.some(a => !/^create$/i.test(a.action))) result.issues.push(name + ' deleted or unsupported action');
      if (assignments.some(a => !/^constant$/i.test(a.type) || /\{\{|\$\{/.test(a.value))) result.issues.push(name + ' dynamic or externalized');
      if (assignments.some(a => !a.value.trim())) result.issues.push(name + ' empty');
      if (values.length > 1) result.issues.push(name + ' has conflicting values');
      if (assignments.length > 1) result.issues.push(name + ' assigned in multiple steps');
    }
    return result;
  }
  async function bounded(stream, max = LIMIT) {
    const reader = stream.getReader();
    const chunks = []; let total = 0;
    try {
      for (;;) {
        const {done, value} = await reader.read();
        if (done) break;
        total += value.length;
        if (total > max) throw Error('Flow download exceeds the 32 MB limit.');
        chunks.push(value);
      }
    } finally { await reader.cancel().catch(() => {}); }
    const bytes = new Uint8Array(total); let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
    return bytes;
  }
  function crc32(bytes) {
    let crc = -1;
    for (const byte of bytes) {
      crc ^= byte;
      for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
    return (crc ^ -1) >>> 0;
  }
  async function zipText(bytes, pattern) {
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    let end = bytes.length - 22;
    for (; end >= Math.max(0, bytes.length - 65557); end--) {
      if (view.getUint32(end, true) === 0x06054b50 && end + 22 + view.getUint16(end + 20, true) === bytes.length) break;
    }
    if (end < Math.max(0, bytes.length - 65557)) throw Error('CPI did not return a valid flow ZIP.');
    if (view.getUint32(end + 4, true) !== 0 || view.getUint16(end + 8, true) !== view.getUint16(end + 10, true)) throw Error('Unsupported multipart ZIP.');
    let cursor = view.getUint32(end + 16, true);
    const count = view.getUint16(end + 10, true); const matches = [];
    if (count === 65535 || cursor === 0xffffffff) throw Error('ZIP64 archives are unsupported.');
    for (let index = 0; index < count; index++) {
      if (cursor + 46 > end || view.getUint32(cursor, true) !== 0x02014b50) throw Error('Invalid ZIP directory.');
      const nameLength = view.getUint16(cursor + 28, true);
      const name = new TextDecoder().decode(bytes.subarray(cursor + 46, cursor + 46 + nameLength));
      if (pattern.test(name)) {
        matches.push({flags:view.getUint16(cursor + 8,true), method:view.getUint16(cursor + 10,true), crc:view.getUint32(cursor + 16,true), compressed:view.getUint32(cursor + 20,true), size:view.getUint32(cursor + 24,true), offset:view.getUint32(cursor + 42,true)});
      }
      cursor += 46 + nameLength + view.getUint16(cursor + 30, true) + view.getUint16(cursor + 32, true);
    }
    if (matches.length !== 1) throw Error('Expected exactly one matching entry in the deployed archive.');
    const entry = matches[0];
    if (entry.flags & 1 || entry.size > LIMIT || ![0,8].includes(entry.method)) throw Error('Unsupported or oversized flow archive.');
    if (entry.offset + 30 > bytes.length || view.getUint32(entry.offset,true) !== 0x04034b50) throw Error('Invalid ZIP entry.');
    const start = entry.offset + 30 + view.getUint16(entry.offset + 26,true) + view.getUint16(entry.offset + 28,true);
    if (start + entry.compressed > bytes.length) throw Error('Incomplete ZIP entry.');
    let output = bytes.subarray(start,start + entry.compressed);
    if (entry.method === 8) {
      let inflater;
      try { inflater = new DecompressionStream('deflate-raw'); } catch { throw Error('Update Chrome to read compressed flow archives.'); }
      output = await bounded(new Blob([output]).stream().pipeThrough(inflater));
    }
    if (output.length !== entry.size || crc32(output) !== entry.crc) throw Error('Flow archive integrity check failed.');
    return new TextDecoder('utf-8',{fatal:true}).decode(output);
  }
  const flowFromZip = bytes => zipText(bytes,/^src\/main\/resources\/scenarioflows\/integrationflow\/[^/]+\.iflw$/i);
  function deployedList(text) {
    const doc=xml(text);
    if(doc.documentElement.localName!=='com.sap.it.op.tmn.commands.dashboard.webui.IntegrationComponentsListResponse') throw Error('Unsupported deployed-flow list response.');
    const flows=[];
    for(const entry of elements(doc,'artifactInformations')) {
      const tags=Object.fromEntries(elements(entry,'tags').map(tag=>[tag.getAttribute('name'),tag.getAttribute('value')]));
      if(tags['SAP-BundleType']!=='IntegrationFlow') continue;
      const read=name=>child(entry,name)?.textContent || '';
      const flow={Id:read('symbolicName'),Name:read('name'),PackageName:tags['artifact.package.name'] || '',PackageId:tags['artifact.package.id'] || '',Version:tags['Bundle-Version'] || '',Status:read('semanticState'),DeployedOn:read('deployedOn'),artifactId:read('id'),tenantId:read('tenantId'),taskId:read('taskId')};
      if(!flow.Id || !flow.artifactId || !flow.tenantId) throw Error('Incomplete deployed flow identity.');
      flows.push(flow);
    }
    if(new Set(flows.map(flow=>flow.Id)).size!==flows.length) throw Error('Duplicate runtime entries. Refresh and try again.');
    return flows.sort((a,b)=>compareRows({packageName:a.PackageName,packageId:a.PackageId,name:a.Name,id:a.Id},{packageName:b.PackageName,packageId:b.PackageId,name:b.Name,id:b.Id}));
  }
  function downloadBytes(text,flow) {
    const doc=xml(text);
    if(doc.documentElement.localName!=='com.sap.it.nm.commands.deploy.DownloadContentResponse') throw Error('Unsupported deployed download response.');
    const artifacts=elements(doc,'artifacts');
    if(artifacts.length!==1 || artifacts[0].getAttribute('id')!==flow.artifactId || artifacts[0].getAttribute('name')!==flow.Id) throw Error('Downloaded artifact identity does not match the selected deployment.');
    const content=child(artifacts[0],'content')?.textContent.replace(/\s/g,'') || '';
    if(!content || !/^[A-Za-z0-9+/]*={0,2}$/.test(content) || content.length>Math.ceil(LIMIT/3)*4) throw Error('Invalid or oversized deployed archive.');
    let decoded; try {decoded=atob(content);} catch {throw Error('Invalid deployed archive encoding.');}
    return Uint8Array.from(decoded,c=>c.charCodeAt(0));
  }
  async function deployedHeaders(bytes,flow) {
    const manifest=(await zipText(bytes,/^META-INF\/MANIFEST\.MF$/i)).replace(/\r?\n /g,'');
    const fields=Object.fromEntries(manifest.split(/\r?\n/).filter(line=>line.includes(': ')).map(line=>{const at=line.indexOf(': ');return [line.slice(0,at),line.slice(at+2)];}));
    if(fields['Bundle-SymbolicName']?.split(';')[0]!==flow.Id || fields['Bundle-Version']!==flow.Version) throw Error('Downloaded archive version does not match the deployment.');
    return headers(await flowFromZip(bytes));
  }
  function fingerprint(flow) {return [flow.Id,flow.Version,flow.DeployedOn,flow.artifactId,flow.taskId,flow.PackageName,flow.PackageId].join('|');}
  async function collect({origin, signal, update=()=>{}, fetcher=fetch}) {
    const rows=[];
    async function request(path) {
      signal?.throwIfAborted();
      const url=new URL(path,origin);
      const allowed=['/Operations/com.sap.it.op.tmn.commands.dashboard.webui.IntegrationComponentsListCommand','/Operations/com.sap.it.nm.commands.deploy.DownloadContentCommand'];
      if(url.origin!==origin || !allowed.includes(url.pathname)) throw Error('Unsupported tenant operation.');
      const controller=new AbortController();
      const abort=()=>controller.abort();signal?.addEventListener('abort',abort,{once:true});
      const timeout=setTimeout(()=>controller.abort(),30000);
      try {
        const response=await fetcher(url.href,{method:'GET',credentials:'same-origin',redirect:'error',cache:'no-store',headers:{Accept:'application/xml'},signal:controller.signal});
        if(!response.ok) {
          if([401,403].includes(response.status)) throw Error('Tenant read access denied ('+response.status+'). Sign in and check your CPI monitoring permissions.');
          throw Error('CPI request failed (HTTP '+response.status+').');
        }
        return new TextDecoder().decode(await bounded(response.body));
      } catch(error) {
        if(controller.signal.aborted && !signal?.aborted) throw Error('CPI request timed out after 30 seconds.');
        throw error;
      } finally {clearTimeout(timeout);signal?.removeEventListener('abort',abort);}
    }
    const runtime=async()=>deployedList(await request('/Operations/com.sap.it.op.tmn.commands.dashboard.webui.IntegrationComponentsListCommand'));
    const flows=await runtime();const snapshot=new Date().toISOString();
    for(const flow of flows) rows.push({packageName:flow.PackageName,packageId:flow.PackageId,id:flow.Id,name:flow.Name||flow.Id,version:flow.Version,status:flow.Status,deployedOn:flow.DeployedOn,sender:'',receiver:'',review:'Pending',snapshot});
    update(rows,0,rows.length);
    for(let index=0;index<rows.length;index++) {
      const row=rows[index],flow=flows[index];
      if(signal?.aborted) {
        for(const pending of rows.slice(index)) pending.review='Cancelled — not inspected';
        update(rows,index,rows.length);return {rows,complete:false};
      }
      try {
        if(!flow.Version) throw Error('Deployed version unavailable.');
        const params=new URLSearchParams({artifactIds:flow.artifactId,tenantId:flow.tenantId});
        const bytes=downloadBytes(await request('/Operations/com.sap.it.nm.commands.deploy.DownloadContentCommand?'+params),flow);
        const data=await deployedHeaders(bytes,flow);
        row.sender=data.sender;row.receiver=data.receiver;
        row.review=data.issues.length?data.issues.join('; '):'Headers found';
      } catch(error) {row.review=signal?.aborted?'Cancelled — not inspected':error.message;}
      update(rows,index+1,rows.length);
    }
    try {
      const latest=new Map((await runtime()).map(flow=>[flow.Id,fingerprint(flow)]));
      for(let index=0;index<rows.length;index++) {
        if(latest.get(rows[index].id)!==fingerprint(flows[index])) {
          rows[index].sender='';rows[index].receiver='';rows[index].review='Deployment changed during scan — rescan required';
        }
      }
    } catch {
      for(const row of rows) row.review+='; final deployment check unavailable';
      update(rows,rows.length,rows.length);return {rows,complete:false};
    }
    update(rows,rows.length,rows.length);return {rows,complete:true};
  }
  const exportFields=Object.freeze([
    ['packageName','Package'],['packageId','Package ID'],['name','Interface'],['id','Interface ID'],['sender','Source system'],['receiver','Target system'],['version','Deployed version'],['status','Runtime status'],['deployedOn','Deployed on'],['review','Review'],['snapshot','Scanned on']
  ].map(([key,label])=>Object.freeze({key,label})));
  const defaultFields=Object.freeze(exportFields.filter(field=>!['packageId','snapshot'].includes(field.key)).map(field=>field.key));
  const collator=new Intl.Collator('en',{numeric:true,sensitivity:'base'});
  function compareRows(a,b) {
    const ap=a.packageName||a.packageId||'',bp=b.packageName||b.packageId||'';
    if(!ap!==!bp)return ap?-1:1;
    return collator.compare(ap,bp)||collator.compare(a.packageId||'',b.packageId||'')||collator.compare(a.name||a.id||'',b.name||b.id||'')||collator.compare(a.id||'',b.id||'');
  }
  const sortedRows=rows=>Array.from(rows).sort(compareRows);
  function chosenFields(selected=defaultFields) {
    const keys=new Set(selected);
    if(!keys.size || [...keys].some(key=>!exportFields.some(field=>field.key===key))) throw Error('Select at least one valid field to export.');
    return exportFields.filter(field=>keys.has(field.key));
  }
  function csv(rows,selected) {
    const fields=chosenFields(selected);
    const escape=value=>{
      let text=String(value??'');
      if(/^[\s]*[=+@-]/.test(text))text="'"+text;
      return '"'+text.replace(/"/g,'""')+'"';
    };
    return '\ufeff'+[fields.map(field=>escape(field.label)).join(','),...sortedRows(rows).map(row=>fields.map(field=>escape(row[field.key])).join(','))].join('\r\n');
  }
  window.CpiInventory=Object.freeze({headers,flowFromZip,deployedList,downloadBytes,deployedHeaders,collect,csv,exportFields,defaultFields,sortedRows,chosenFields});
})();
