# HaKING

HaKING, Halit Güneş'in oyun profili ve dijital arşivini sunan statik bir web sitesidir. HTML, CSS, çeviriler ve arayüz mantığı ayrı dosyalarda tutulur. Derleme adımı veya JavaScript paket yöneticisi gerektirmez.

## Proje yapısı

```text
.
├── index.html
├── assets/
│   ├── css/main.css
│   ├── images/
│   │   ├── HaKING2.png
│   │   └── HICON.png
│   └── js/
│       ├── main.js
│       └── translations.js
├── data/
│   └── steam_stats.json
├── add/                    # Tanıtım görseli
├── update_stats.py         # Steam Web API ile istatistik güncelleme
├── robots.txt
├── sitemap.xml
└── .github/workflows/
    └── update_steam.yml    # İstatistikleri 30 dakikada bir yeniler
```

## Yerelde görüntüleme

Depo kök dizininde basit bir statik HTTP sunucusu çalıştırın. Örneğin Python kuruluysa:

```powershell
python -m http.server 8000
```

Sonra `http://localhost:8000` adresini açın. JSON verisini `fetch()` ile yüklediğimiz için sayfayı `file://` üzerinden açmayın.

## Steam istatistikleri

`update_stats.py`, Steam Web API'den tam oyun listesini, toplam süreyi ve oynama süresine göre sıralanmış ilk altı oyunu alır. Ana sayfada öne çıkan oyun ilk sıradaki oyundur; Cephanelik bölümü API'nin döndürdüğü tüm oyunları arama ve sıralama ile gösterir. `data/steam_stats.json` güncellendiğinde tam oyun arşivi, ana sayfadaki öne çıkan oyun ve oynama saatleri de otomatik yenilenir. Yeni veri biçimi kapak görseli için Steam ikon hash'ini de saklar; ilk altı oyun için güncel mağaza kapağını alır. Diğer kartlarda alternatif Steam görselleri ve oyun baş harfleri kullanılır. Kartlardaki oyun adları Steam mağazasına bağlanır.

GitHub Actions iş akışı kod güncellemesinde ve her 30 dakikada bir veriyi kontrol eder. Veriler değiştiyse JSON dosyasını depoya gönderir; Git bağlantılı Cloudflare Pages dağıtımı bu commit'i yayımlar. Hiçbir değer değişmediyse gereksiz commit ve dağıtım oluşmaz. İlk çalıştırmayı GitHub Actions içinden `Update Steam Stats` iş akışını elle çalıştırarak başlatabilirsiniz.

İş akışının çalışması için GitHub deposunda **Settings → Secrets and variables → Actions** bölümüne `STEAM_API_KEY` adlı bir repository secret ekleyin. Steam profilinde oyun ayrıntıları da API'nin görebileceği şekilde açık olmalıdır. API anahtarı yalnızca GitHub Actions ortamında kullanılır; siteye gönderilen JSON dosyasına veya tarayıcıya yazılmaz. Steam verisi alınamazsa script son başarılı JSON'u korur.

## Dağıtım

Site statik dosyalardan oluşur. Cloudflare Pages Git entegrasyonunda derleme komutu gerekmez; dağıtım dizini depo köküdür. CSS, JavaScript, görseller ve JSON dosyaları HTML ile aynı kökten sunulmalıdır.
