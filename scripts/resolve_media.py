"""Resolve canonical Steam screenshot media politely, with resumable progress."""
from pathlib import Path
from urllib.parse import urlparse
from html.parser import HTMLParser
import json
import time
import requests

ROOT = Path(__file__).resolve().parent.parent

class MediaParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.original = None
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'img' and attrs.get('id') == 'ActualMedia':
            self.original = attrs.get('src')

def save(path, data):
    temporary = path.with_suffix('.tmp')
    temporary.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf8')
    temporary.replace(path)

def run():
    path = ROOT / 'data/screenshots.json'
    data = json.loads(path.read_text(encoding='utf8'))
    session = requests.Session()
    changed = 0
    for item in data['items']:
        if item.get('original'):
            continue
        try:
            response = session.get('https://steamcommunity.com/sharedfiles/filedetails/', params={'id': item['id']}, timeout=20)
            if response.status_code == 429:
                print('Steam rate limit reached; progress saved. Resume on next scheduled run.', flush=True)
                break
            response.raise_for_status()
            parser = MediaParser()
            parser.feed(response.text)
            url = parser.original
            if url and urlparse(url).scheme == 'https' and urlparse(url).hostname == 'images.steamusercontent.com':
                item['original'] = url.split('?')[0] + '?imw=5000&imh=5000&ima=fit&impolicy=Letterbox&letterbox=false'
                changed += 1
                save(path, data)
                print(f"Resolved {item['id']} ({changed} new)", flush=True)
        except requests.RequestException:
            print(f"Deferred {item['id']}: Steam unavailable", flush=True)
        time.sleep(1.5)
    print('Original media:', sum(bool(x.get('original')) for x in data['items']), '/', len(data['items']), flush=True)

if __name__ == '__main__':
    run()
