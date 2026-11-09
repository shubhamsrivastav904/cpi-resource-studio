(() => {
  'use strict';
  // Small, local-only XLSX writer for the inventory's fixed text/date columns.
  const encoder=new TextEncoder();
  const ns='http://schemas.openxmlformats.org/spreadsheetml/2006/main';
  const relation='http://schemas.openxmlformats.org/officeDocument/2006/relationships';
  const xml=text=>String(text).replace(/_x[0-9a-f]{4}_/gi,match=>'_x005F_'+match.slice(1)).replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g,ch=>'_x'+ch.charCodeAt(0).toString(16).padStart(4,'0')+'_').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  function crc32(bytes){let crc=-1;for(const byte of bytes){crc^=byte;for(let bit=0;bit<8;bit++)crc=(crc>>>1)^(0xedb88320&-(crc&1));}return (crc^-1)>>>0;}
  function zip(entries){
    const local=[],central=[];let offset=0;
    for(const [path,text] of entries){
      const name=encoder.encode(path),data=encoder.encode(text),crc=crc32(data);
      const header=new Uint8Array(30),h=new DataView(header.buffer);h.setUint32(0,0x04034b50,true);h.setUint16(4,20,true);h.setUint16(6,0x800,true);h.setUint16(12,0x21,true);h.setUint32(14,crc,true);h.setUint32(18,data.length,true);h.setUint32(22,data.length,true);h.setUint16(26,name.length,true);
      const directory=new Uint8Array(46),d=new DataView(directory.buffer);d.setUint32(0,0x02014b50,true);d.setUint16(4,20,true);d.setUint16(6,20,true);d.setUint16(8,0x800,true);d.setUint16(14,0x21,true);d.setUint32(16,crc,true);d.setUint32(20,data.length,true);d.setUint32(24,data.length,true);d.setUint16(28,name.length,true);d.setUint32(42,offset,true);
      local.push(header,name,data);central.push(directory,name);offset+=header.length+name.length+data.length;
    }
    const length=central.reduce((sum,part)=>sum+part.length,0),end=new Uint8Array(22),e=new DataView(end.buffer);e.setUint32(0,0x06054b50,true);e.setUint16(8,entries.length,true);e.setUint16(10,entries.length,true);e.setUint32(12,length,true);e.setUint32(16,offset,true);
    const result=new Uint8Array(offset+length+22);let cursor=0;for(const part of [...local,...central,end]){result.set(part,cursor);cursor+=part.length;}return result;
  }
  const column=index=>{let value=index+1,text='';while(value){text=String.fromCharCode(65+(value-1)%26)+text;value=Math.floor((value-1)/26);}return text;};
  function xlsx(rows,selected){
    const api=window.CpiInventory,fields=api.chosenFields(selected),ordered=api.sortedRows(rows);
    if(ordered.length>1048575)throw Error('Too many interfaces for one Excel worksheet.');
    const textCell=(value,reference,style)=>{const text=String(value??'');if(text.length>32767)throw Error('A field exceeds Excel’s 32,767-character limit. Export CSV instead.');return `<c r="${reference}" s="${style}" t="inlineStr"><is><t xml:space="preserve">${xml(text)}</t></is></c>`;};
    const sheetRows=[`<row r="1" ht="32" customHeight="1">${fields.map((field,index)=>textCell(field.label,column(index)+'1',1)).join('')}</row>`];
    ordered.forEach((row,index)=>{
      const number=index+2;
      const cells=fields.map((field,cell)=>{
        const reference=column(cell)+number,value=row[field.key];
        if(['deployedOn','snapshot'].includes(field.key)&&value){const time=Date.parse(value);if(Number.isFinite(time))return `<c r="${reference}" s="3"><v>${time/86400000+25569}</v></c>`;}
        return textCell(value,reference,2);
      }).join('');
      sheetRows.push(`<row r="${number}" ht="45" customHeight="1">${cells}</row>`);
    });
    const last=column(fields.length-1)+(ordered.length+1);
    const widths=fields.map((field,index)=>`<col min="${index+1}" max="${index+1}" width="${['name','id','review'].includes(field.key)?48:field.key==='packageName'?32:24}" customWidth="1"/>`).join('');
    const sheet=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="${ns}"><dimension ref="A1:${last}"/><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/><selection pane="bottomLeft" activeCell="A2" sqref="A2"/></sheetView></sheetViews><sheetFormatPr defaultRowHeight="18"/><cols>${widths}</cols><sheetData>${sheetRows.join('')}</sheetData><autoFilter ref="A1:${last}"/></worksheet>`;
    const styles=`<?xml version="1.0" encoding="UTF-8"?><styleSheet xmlns="${ns}"><numFmts count="1"><numFmt numFmtId="164" formatCode="yyyy-mm-dd hh:mm:ss&quot; UTC&quot;"/></numFmts><fonts count="2"><font><sz val="11"/><color rgb="FF20334B"/><name val="Calibri"/></font><font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF1765D7"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="4"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf><xf numFmtId="49" fontId="0" fillId="0" borderId="0" xfId="0" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf><xf numFmtId="164" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1" applyAlignment="1"><alignment vertical="top"/></xf></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`;
    return zip([
      ['[Content_Types].xml','<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>'],
      ['_rels/.rels',`<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="${relation}/officeDocument" Target="xl/workbook.xml"/></Relationships>`],
      ['xl/workbook.xml',`<?xml version="1.0" encoding="UTF-8"?><workbook xmlns="${ns}" xmlns:r="${relation}"><bookViews><workbookView/></bookViews><sheets><sheet name="Interface inventory" sheetId="1" r:id="rId1"/></sheets></workbook>`],
      ['xl/_rels/workbook.xml.rels',`<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="${relation}/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="${relation}/styles" Target="styles.xml"/></Relationships>`],
      ['xl/styles.xml',styles],['xl/worksheets/sheet1.xml',sheet]
    ]);
  }
  window.CpiInventoryExport=Object.freeze({xlsx});
})();
