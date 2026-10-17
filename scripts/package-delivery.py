from pathlib import Path
import zipfile

ROOT=Path(__file__).resolve().parents[1]
OUTPUT=ROOT.parent/'CSST106-Lab06-Website.zip'
EXCLUDED={'node_modules','.npm-cache','.export-deps','.venv','artifacts','dist','test-results','__pycache__','.git'}

def main():
    with zipfile.ZipFile(OUTPUT,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as archive:
        for path in sorted(ROOT.rglob('*')):
            relative=path.relative_to(ROOT)
            if path.is_file() and not any(part in EXCLUDED for part in relative.parts) and path.suffix not in ('.pyc','.map'):
                archive.write(path,relative.as_posix())
    with zipfile.ZipFile(OUTPUT) as archive:
        assert archive.testzip() is None
        assert 'index.html' in archive.namelist()
        assert '.github/workflows/pages.yml' in archive.namelist()
    print(OUTPUT)
    print(f'Archive verified: {OUTPUT.stat().st_size/1024/1024:.1f} MiB')

if __name__=='__main__':main()
