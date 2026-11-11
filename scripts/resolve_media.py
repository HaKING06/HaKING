"""Resolve full-resolution Steam media from detail pages, not listing thumbnails."""
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from urllib.parse import urlparse
import json,re,html,requests
from threading import Event
RATE_LIMITED=Event()
ROOT=Path(__file__).resolve().parent.parent

def resolve(item):
 if item.get('original') or RATE_LIMITED.is_set():return item
 try:
  r=requests.get(f"https://steamcommunity.com/sharedfiles/filedetails/?id={item['id']}",timeout=12)
  if r.status_code==429:
   RATE_LIMITED.set();return item
  r.raise_for_status()
  match=re.search(r'<a href="(https://images\.steamusercontent\.com/ugc/[^"]+)"[^>]*><img id="ActualMedia"',r.text)
  if match:
   url=html.unescape(match[1]);assert urlparse(url).hostname=='images.steamusercontent.com'
   item['original']=url
 except (requests.RequestException,ValueError,AssertionError):pass
 return item

def run():
 p=ROOT/'data/screenshots.json';d=json.loads(p.read_text(encoding='utf8'));byid={}
 with ThreadPoolExecutor(max_workers=2) as pool:
  for f in as_completed([pool.submit(resolve,x) for x in d['items']]):
   x=f.result();byid[x['id']]=x
 d['items']=[byid[x['id']] for x in d['items']]
 p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
 print('Full resolution:',sum(bool(x.get('original')) for x in d['items']),'/',len(d['items']))
if __name__=='__main__':run()
