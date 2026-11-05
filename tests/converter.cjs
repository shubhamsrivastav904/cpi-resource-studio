const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const {DOMParser:Parser}=require('@xmldom/xmldom');
class DOMParser{parseFromString(xml,mime){return new Parser({onError:(level,msg)=>{if(level!=='warning')throw Error(msg)}}).parseFromString(xml,mime)}}
const ctx={window:{},DOMParser,Date,console};vm.runInNewContext(fs.readFileSync('extension/xml-to-xsd.js','utf8'),ctx);
const api=ctx.window.CpiXmlSchema;fs.mkdirSync('test-output/converter-cases',{recursive:true});
const cases=[
 ['basic','<sensor code="001"><name>A &amp; B</name><active>true</active><balance>12.50</balance><date>2024-02-29</date></sensor>'],
 ['repeat','<root><record><id>1</id><amount>12</amount><note>x</note></record><record><id>2</id><amount>12.25</amount></record></root>'],
 ['namespace','<a:root xmlns:a="urn:example"><a:item a:code="A">2</a:item><a:item>3</a:item></a:root>'],
 ['unqualified','<r:root xmlns:r="urn:test"><item><r:name>A</r:name></item></r:root>'],
 ['mixed','<root><p>Hello <b>world</b>!</p><p>Only text</p></root>'],
 ['orders','<root><r><a>1</a><b>2</b></r><r><b>3</b><a>4</a></r></root>'],
 ['interleaved','<root><a>1</a><b>2</b><a>3</a></root>'],
 ['nil','<root xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><value xsi:nil="true"/><value>12</value></root>'],
 ['attributes','<root><item code="a" when="2025-12-01T10:15:00Z">1</item><item code="b">2</item></root>'],
 ['types','<root><leading>00123</leading><invalid>2025-02-30</invalid><exponent>1.5e3</exponent><large>99999999999999999999999</large></root>'],
 ['allstrings','<root><code>123</code><flag>true</flag></root>',{strings:true}],
 ['optional','<root><a>1</a><b value="123"/></root>',{optional:true}]
];
for(const [name,xml,opts] of cases){const result=api.generate(xml,opts);fs.writeFileSync(`test-output/converter-cases/${name}.xml`,xml);fs.writeFileSync(`test-output/converter-cases/${name}.xsd`,result.xsd);assert(result.xsd.includes('<xs:schema'));}
assert.equal(api.filename(' observations '),'observations.xsd');assert.equal(api.filename('sensor.xsd'),'sensor.xsd');
for(const name of ['../secret','', 'folder/file','my file'])assert.throws(()=>api.filename(name));
for(const xml of ['', '<root>', '<!DOCTYPE r><r/>','<a xmlns="urn:a"><b xmlns="urn:b"/></a>','<r xml:lang="en"/>'])assert.throws(()=>api.generate(xml));
assert.throws(()=>api.generate('<a>'.repeat(50)+'</a>'.repeat(50)));
console.log('PASS: converter cases, filename validation, malformed XML, namespace/DTD and depth limits');
