"""Build localized poster galleries and search metadata from the site's own content."""
import json,html
from pathlib import Path
ROOT=Path(__file__).resolve().parent.parent
BASE='https://steam.haking.tr/'
NAMES=dict(zip(['tr','en','es','ru','de','fr','jp','cn','pt','it','kr','ar','hi','bn','nl','pl','sv','vi','el','th'],['Türkçe','English','Español','Русский','Deutsch','Français','日本語','简体中文','Português','Italiano','한국어','العربية','हिन्दी','বাংলা','Nederlands','Polski','Svenska','Tiếng Việt','Ελληνικά','ไทย']))
def build():
    locales=json.loads((ROOT/'data/locales.json').read_text(encoding='utf-8'))
    tags={'jp':'ja','cn':'zh-CN','kr':'ko'}
    for code,t in locales.items():
        folder=ROOT/'posters'/code;folder.mkdir(parents=True,exist_ok=True)
        title=html.escape(t['posters']);museum=html.escape(t['museum']);machine=html.escape(t['machine']);role=html.escape(t['role'])
        alternates=''.join(f'<link rel="alternate" hreflang="{tags.get(c,c)}" href="{BASE}posters/{c}/">' for c in locales)
        content=f'''<!doctype html><html lang="{tags.get(code,code)}" dir="{'rtl' if code=='ar' else 'ltr'}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>HaKING — {title} | {museum} · HP Victus</title><meta name="description" content="HaKING · Halit Güneş — {museum}, {machine}, Steam. HP Victus i7-14700HX / RTX 4070."><link rel="canonical" href="{BASE}posters/{code}/">{alternates}<link rel="stylesheet" href="../posters.css"><meta name="application-version" content="2.1.0"></head><body><nav><a href="../../?lang={tags.get(code,code)}">← HaKING</a><h1>{title}</h1><select aria-label="Language" onchange="location.href='../'+this.value+'/'">{''.join(f'<option value="{c}" {"selected" if c==code else ""}>{NAMES[c]}</option>' for c in locales)}</select></nav><main><article id="poster-setup" class="poster poster-setup"><div class="poster-copy"><span>HALIT GÜNEŞ / {code.upper()}</span><h2>HaKING</h2><p>{machine}</p><div class="spec">HP VICTUS 16-r1015nt<br>i7-14700HX · RTX 4070<br>16 GB RAM · 1 TB SSD · 144 Hz FHD</div><small>steam.haking.tr · v2.1.0</small></div><img src="../../docs/setup-768.png" alt="HaKING — HP Victus 3D · i7-14700HX · RTX 4070"></article><a download href="../../assets/posters/haking-{code}-setup.webp">↓ HaKING · {machine} (WebP)</a><article id="poster-museum" class="poster poster-museum"><header><span>STEAM / {role}</span><h2>HaKING</h2><p>{museum}</p></header><div class="captures"><img src="../../docs/home-768.png" alt="HaKING — Steam"><img src="../../docs/museum-768.png" alt="HaKING — {museum}"></div><footer>222 / {museum}<br>steam.haking.tr · v2.1.0</footer></article><a download href="../../assets/posters/haking-{code}-museum.webp">↓ HaKING · {museum} (WebP)</a></main></body></html>'''
        (folder/'index.html').write_text(content,encoding='utf-8')
    (ROOT/'robots.txt').write_text(f'User-agent: *\nAllow: /\nSitemap: {BASE}sitemap.xml\n')
    urls=[f'<url><loc>{BASE}</loc><changefreq>daily</changefreq></url>']
    for code,t in locales.items():
        images=''.join(f'<image:image><image:loc>{BASE}assets/posters/haking-{code}-{kind}.webp</image:loc><image:title>HaKING — {html.escape(t[key])}</image:title></image:image>' for kind,key in [('setup','machine'),('museum','museum')])
        urls.append(f'<url><loc>{BASE}posters/{code}/</loc>{images}</url>')
    (ROOT/'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">'+''.join(urls)+'</urlset>',encoding='utf-8')
if __name__=='__main__':build()
