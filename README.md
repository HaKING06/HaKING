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

## 2.0.0 — yeni özellikler

Makine sayfası yerel Three.js ile etkileşimli Victus görselleştirmesi sunar. Döndürmek için sürükleyin veya odaklanıp ok tuşlarını kullanın; tekerlekle yakınlaştırın. Model HP CAD dosyası değildir. Tam SKU, kasa rengi ve fotoğraf verilmediğinden üreticiyle birebir fiziksel eşleşme iddiası yoktur. Teknik özellikler kullanıcı tarafından verilen yapılandırmadır.

Müze, `data/screenshots.json` içindeki herkese açık arşivi kullanır. Bu teslimde 222 görsel ve altı favori bulunur. Favorileri `data/favorites.json` dosyasındaki Steam görsel kimlikleri belirler; yalnızca halen herkese açık listede olanlar gösterilir. Oyun filtresi, arama, daha fazla yükleme ve Escape/ok tuşlarıyla çalışan görsel penceresi vardır.

### Güncelleme ve kurulum

Siteyi çalıştırmak için npm veya derleme kurulumu gerekmez. Python 3.12 önerilir:

```powershell
python -m pip install -r requirements.txt
python -m http.server 8000
```

Arşivi elle yenilemek için ayrı terminalde `python scripts/sync_screenshots.py` çalıştırın. API anahtarı gerekmez; yalnızca herkese açık Steam ekran görüntüleri alınır. Hatalı yanıtlarda son başarılı dosya korunur. `Sync public screenshots` GitHub Actions iş akışı altı saatte bir arşivi yeniler; GitHub Actions yazma izninin açık olması gerekir. Steam oyun istatistikleri için mevcut `STEAM_API_KEY` secret gereklidir. Secrets dosyalarını commit etmeyin.

### Afişler ve görünürlük

`posters/tr/` dahil 20 dil sayfasında toplam 40 indirilebilir WebP afiş bulunur; hepsi `assets/posters/` dizinindedir. Kaynak ekran görüntüleri `docs/` içindedir. Yeni ekran görüntülerinden afiş üretmek için `node scripts/export_locales.mjs` ve `python scripts/build_posters.py` sayfaları oluşturur; sayfalardaki `#poster-setup` ve `#poster-museum` elemanlarını 768 px görünümde tarayıcıyla yakalayıp WebP olarak kaydedin. Siteyi yeniledikten sonra afişleri otomatik olarak güncellediği iddia edilmez.

Yayımdan sonra Google Search Console'da `https://steam.haking.tr/sitemap.xml` adresini gönderin. Afişlerin çokluğu sıralama garantisi değildir; gerçek görseller, açıklamalar, kalıcı URL'ler ve ilgili içerik birlikte kullanılır. Canlı ortamda canonical alan adını doğrulayın. Kod yerelde hazırlandı; bu teslimde push veya dağıtım yapılmadı.

Lisans `LICENSE` (MIT); oyun görselleri, marka ve üçüncü taraf bağımlılıklarının hakları için `THIRD_PARTY_NOTICES.md` geçerlidir. Sürüm: `VERSION`, HTML metadata ve `CHANGELOG.md` içinde 2.0.0.

## Ana GitHub çalışma klasörü

Push için kullanılan ana depo `C:\Users\halit\OneDrive\Belgeler\GitHub\HaKING` klasörüdür. 2.0.0 geliştirmeleri bu klasöre aktarıldı; daha güncel Steam verisi korundu. GitHub Desktop üzerinden bu depoyu seçip değişiklikleri commit edin, ardından **Push origin** kullanın.
