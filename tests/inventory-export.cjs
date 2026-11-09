const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),cp=require('node:child_process');
const ctx={window:{},TextEncoder,Uint8Array,DataView};
for(const name of ['inventory-core.js','inventory-export.js'])vm.runInNewContext(fs.readFileSync('extension/'+name,'utf8'),ctx);
const api=ctx.window.CpiInventory;
const rows=[{packageName:'Zebra',packageId:'z',name:'Flow 2',sender:'private omitted',status:'STARTED',deployedOn:'2026-11-09T10:00:00Z'},{packageName:'Alpha',packageId:'a',name:'Flow 10'},{packageName:'Alpha',packageId:'a',name:'Flow 2'},{packageName:'',name:'No package'},{packageName:'Alpha',packageId:'a',name:'=SUM(A1)',sender:'<A & B> _x0001_'}];
assert.deepEqual(Array.from(api.sortedRows(rows),r=>r.name),['=SUM(A1)','Flow 2','Flow 10','Flow 2','No package']);
assert.throws(()=>api.csv(rows,[]),/Select/);assert.throws(()=>api.csv(rows,['apikey']),/Select/);
const chosen=['packageName','name'];const csv=api.csv(rows,chosen);assert(!csv.includes('STARTED'));assert(!csv.includes('private omitted'));assert.match(csv.split('\r\n')[0],/Package.*Interface/);
fs.mkdirSync('test-output',{recursive:true});fs.writeFileSync('test-output/inventory-selected.xlsx',ctx.window.CpiInventoryExport.xlsx(rows,chosen));
fs.writeFileSync('test-output/inventory-dates.xlsx',ctx.window.CpiInventoryExport.xlsx(rows,['name','sender','deployedOn']));
assert.throws(()=>ctx.window.CpiInventoryExport.xlsx([{name:'x'.repeat(32768)}],['name']),/32,767/);
const result=cp.spawnSync('python3',['-c',`
from zipfile import ZipFile
from xml.etree import ElementTree as E
ns={'s':'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
for path in ['test-output/inventory-selected.xlsx','test-output/inventory-dates.xlsx']:
 with ZipFile(path) as z:
  assert z.testzip() is None
  for name in z.namelist(): E.fromstring(z.read(name))
  sheet=E.fromstring(z.read('xl/worksheets/sheet1.xml'))
  assert not sheet.findall('.//s:f',ns)
  assert sheet.find('s:sheetViews/s:sheetView/s:pane',ns).attrib['state']=='frozen'
  assert sheet.find('s:autoFilter',ns) is not None
  data=sheet.find('s:sheetData',ns)
  assert len(data)==6
  if 'selected' in path:
   assert len(data[0])==2
   assert [c.find('s:is/s:t',ns).text for c in data[0]]==['Package','Interface']
   assert data[1][1].find('s:is/s:t',ns).text=='=SUM(A1)'
   assert b'Runtime status' not in z.read('xl/worksheets/sheet1.xml')
   assert b'private omitted' not in z.read('xl/worksheets/sheet1.xml')
  else:
   assert any(c.find('s:v',ns) is not None for row in data for c in row)
   assert b'&lt;A &amp; B&gt; _x005F_x0001_' in z.read('xl/worksheets/sheet1.xml')
print('XLSX package XML, selected columns, literal formulas, dates, ordering, filters and frozen header verified.')
`],{encoding:'utf8'});assert.equal(result.status,0,result.stderr);console.log('PASS: package sorting, field selection, excluded columns/data, XLSX structure and cell limits; '+result.stdout.trim());
