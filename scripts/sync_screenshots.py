"""Synchronize all public Steam screenshots; retain last successful archive on failure."""
import html
import json
import re
from datetime import datetime, timezone
from pathlib import Path
import requests

ROOT = Path(__file__).resolve().parent.parent
FAVORITES = {item['id'] for item in json.loads((ROOT / 'data/favorites.json').read_text(encoding='utf-8'))}

def sync():
    games = json.loads((ROOT / 'data/steam_stats.json').read_text(encoding='utf-8')).get('games', [])
    names = {str(g['appid']): g['name'] for g in games}
    items = {}
    session = requests.Session()
    for page in range(1, 501):
        response = session.get('https://steamcommunity.com/profiles/76561199760755154/screenshots/', params={'p': page, 'privacy': 8, 'sort': 'newestfirst', 'l': 'english'}, timeout=30)
        response.raise_for_status()
        response.encoding = 'utf-8'
        source = response.text
        for appid, name in re.findall(r"SelectSharedFilesContentFilter\(\{ 'appid': '(\d+)' \}\);\">([^<]+)", source):
            names[appid] = html.unescape(name).replace('\ufffd', '').strip()
        matches = re.findall(r'data-appid="(\d+)" data-publishedfileid="(\d+)">\s*<div style="background-image: url\(\x27([^\x27]+)', source)
        if not matches:
            if 'BatchScreenshotManagement' not in source:
                raise RuntimeError('Unexpected Steam response; existing archive preserved.')
            if page == 1:
                raise RuntimeError('Public screenshot listing unavailable; existing archive preserved.')
            break
        new = 0
        for appid, sid, image in matches:
            if sid in items:
                continue
            new += 1
            items[sid] = {'id': sid, 'appid': int(appid), 'game': names.get(appid, f'Steam {appid}'), 'image': html.unescape(image).split('?')[0], 'favorite': sid in FAVORITES}
        if not new:
            raise RuntimeError('Steam repeated a page; existing archive preserved.')
        print(f'Page {page}: {len(items)} screenshots')
    else:
        raise RuntimeError('Pagination limit reached; existing archive preserved.')
    if not items:
        raise RuntimeError('Empty archive; existing data preserved.')
    target = ROOT / 'data/screenshots.json'
    previous = json.loads(target.read_text(encoding='utf-8')).get('items', []) if target.exists() else []
    originals = {x['id']: x['original'] for x in previous if x.get('original')}
    for item in items.values():
        if item['id'] in originals: item['original'] = originals[item['id']]
    data = {'updated_at': datetime.now(timezone.utc).isoformat(), 'items': list(items.values())}
    if target.exists() and json.loads(target.read_text(encoding='utf-8')).get('items') == data['items']:
        return
    temporary = target.with_suffix('.tmp')
    temporary.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    temporary.replace(target)

if __name__ == '__main__':
    sync()
