"""Resolve full-size Steam image URLs; store metadata only, never image files.

Only unresolved items require a Community request. Atomic checkpoints make the
job resumable. Honor Retry-After and stop at a bounded runtime for scheduled CI.
"""
from pathlib import Path
from urllib.parse import urlparse
from html.parser import HTMLParser
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
import argparse
import json
import time
import requests

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / 'data/screenshots.json'
ALLOWED_HOST = 'images.steamusercontent.com'

class MediaParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.original = None
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'img' and attrs.get('id') == 'ActualMedia':
            self.original = attrs.get('src')

def save(data):
    temporary = DATA.with_suffix('.tmp')
    temporary.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf8')
    temporary.replace(DATA)

def retry_delay(response, attempt):
    value = response.headers.get('Retry-After', '')
    try:
        return max(90, float(value))
    except ValueError:
        try:
            return max(90, (parsedate_to_datetime(value) - datetime.now(timezone.utc)).total_seconds())
        except (ValueError, TypeError):
            return min(900, 90 * 2 ** attempt)

def validated_url(url):
    parsed = urlparse(url or '')
    if parsed.scheme != 'https' or parsed.hostname != ALLOWED_HOST or not parsed.path.startswith('/ugc/') or parsed.username or parsed.password:
        raise ValueError('Unexpected media URL')
    return parsed._replace(query='', fragment='').geturl() + '?imw=5000&imh=5000&ima=fit&impolicy=Letterbox&letterbox=false'

def run(interval=8, max_minutes=40):
    data = json.loads(DATA.read_text(encoding='utf8'))
    # Migration from the abandoned local-cache experiment. Images are not read.
    migrated = False
    for item in data['items']:
        if 'media' in item:
            item.pop('media'); migrated = True
    if migrated: save(data)
    session = requests.Session()
    deadline = time.monotonic() + max_minutes * 60
    resolved = 0
    for item in data['items']:
        if item.get('original'):
            continue
        attempt = 0
        while time.monotonic() < deadline:
            try:
                response = session.get('https://steamcommunity.com/sharedfiles/filedetails/', params={'id': item['id']}, timeout=(10, 25))
                if response.status_code == 429:
                    delay = retry_delay(response, attempt)
                    attempt += 1
                    if time.monotonic() + delay >= deadline:
                        print('Rate limit exceeds this run budget; progress retained.', flush=True)
                        return False
                    print(f'Steam rate limit: waiting {delay:.0f}s as requested.', flush=True)
                    time.sleep(delay)
                    continue
                response.raise_for_status()
                parser = MediaParser(); parser.feed(response.text)
                item['original'] = validated_url(parser.original)
                save(data)
                resolved += 1
                print(f'Resolved {item["id"]}: {sum(bool(x.get("original")) for x in data["items"])}/{len(data["items"])}', flush=True)
                break
            except (requests.RequestException, ValueError) as error:
                print(f'Deferred {item["id"]}: {type(error).__name__}', flush=True)
                break
        if time.monotonic() >= deadline:
            break
        time.sleep(max(2, interval))
    ready = sum(bool(x.get('original')) for x in data['items'])
    print(f'Original URLs: {ready}/{len(data["items"])}; {resolved} new. No images downloaded.', flush=True)
    return ready == len(data['items'])

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--interval', type=float, default=8)
    parser.add_argument('--max-minutes', type=float, default=40)
    args = parser.parse_args()
    run(max(2, args.interval), max(1, args.max_minutes))
