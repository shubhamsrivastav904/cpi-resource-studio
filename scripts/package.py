from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import hashlib
import json
import subprocess

root = Path(__file__).resolve().parents[1]
source = root / 'extension'
manifest = json.loads((source / 'manifest.json').read_text())
assert manifest['permissions'] == ['activeTab', 'scripting']
assert 'host_permissions' not in manifest
for name in ['collection.js', 'xml-to-xsd.js', 'popup.js']:
    subprocess.run(['node', '--check', str(source / name)], check=True)
output = root / 'dist'
output.mkdir(exist_ok=True)
archive = output / f"cpi-resource-studio-v{manifest['version']}.zip"
with ZipFile(archive, 'w', ZIP_DEFLATED) as handle:
    for path in sorted(source.rglob('*')):
        if path.is_file() and path.name != '.DS_Store':
            handle.write(path, path.relative_to(source))
    handle.write(root / 'LICENSE', 'LICENSE')
    handle.write(root / 'README.md', 'README.md')
with ZipFile(archive) as handle:
    assert handle.testzip() is None
    assert 'manifest.json' in handle.namelist()
checksum = hashlib.sha256(archive.read_bytes()).hexdigest()
(archive.with_suffix('.zip.sha256')).write_text(f'{checksum}  {archive.name}\n')
print(archive)
