# jurvia-social

Jurvia için otomatik Instagram ve LinkedIn gönderileri.

| Ne | Nerede | Ne zaman |
|---|---|---|
| Gönderi üretimi (metin + görsel) | Claude zamanlanmış görevi, talimatlar `CLAUDE.md` | Her Pazar 20:37 (TR), sonraki Salı ve Cuma için |
| Kural denetimi | `tools/lint.mjs` (+ GitHub Actions `check.yml`) | Her üretimde ve her push'ta |
| Yayın | GitHub Actions `publish.yml` → `tools/publish.mjs` | Salı ve Cuma 10:10 (TR), çalıştırma başına 1 gönderi |
| Instagram anahtarı yenileme | `refresh-instagram-token.yml` | Her Pazartesi |

İçeriğin tek kaynağı `content/urun-bilgileri.md`, kurallar `content/kurallar.md`. Ürüne yeni bir özellik geldiğinde ilgili konuyu bu dosyaya ekleyin; gönderiler yalnız buradaki bilgilerden üretilir.

## Klasörler

```
content/   ürün bilgileri ve içerik kuralları
queue/     <YYYY-MM-DD-slug>/post.json + slide-N.jpg (1080x1350)
state/     published.json: yayınlanan gönderiler ve platform kimlikleri (Actions yazar)
tools/     render.mjs, lint.mjs, publish.mjs, lib.mjs, fonts/
```

## Kurulum

Depo **herkese açık** olmalı: Instagram, görselleri herkese açık bir adresten (`raw.githubusercontent.com`) çeker. Depoda gizli bilgi yoktur; anahtarlar GitHub Secrets'ta durur.

### 1. Instagram (Instagram API with Instagram Login)

1. https://developers.facebook.com/apps → **Uygulama oluştur** → kullanım alanı olarak Instagram'da içerik yönetimini seçin, tür **İşletme**.
2. Uygulama panelinde **Instagram → API setup with Instagram login** → **Generate access tokens** → **Add account** ile `@jurvia.app` hesabına giriş yapın. İzinler: `instagram_business_basic`, `instagram_business_content_publish`.
3. Panelin gösterdiği **Instagram kullanıcı kimliği** ve **erişim anahtarını** GitHub'a gizli değer olarak ekleyin (adım 3).

Uygulama geliştirme modunda kalabilir; yalnız kendi hesabınıza gönderi atılır.

### 2. LinkedIn (kişisel profil)

Şirket sayfası için gereken Community Management API, aktif bir tüzel kişilik istiyor; şimdilik gönderiler **kişisel profilde** paylaşılır (`LINKEDIN_ORG_ID` boş bırakılır).

1. https://www.linkedin.com/developers/apps → **Jurvia** uygulaması → **Products**: "Share on LinkedIn" ve "Sign In with LinkedIn using OpenID Connect" ekli olmalı.
2. https://www.linkedin.com/developers/tools/oauth/token-generator → uygulama **Jurvia** → kapsamlar `openid`, `profile`, `w_member_social` → **Request access token** → izin ver → anahtarı kopyala.
3. Anahtar 60 gün geçerlidir. Haftalık "Check and refresh tokens" işi geçersiz olunca hata verir ve GitHub e-posta atar; aynı adımlarla yenisini üretip `LINKEDIN_ACCESS_TOKEN` değerini güncelleyin.
4. Şirket kurulduğunda: "Jurvia Social" uygulamasından Community Management API formunu doldurun, onaydan sonra `LINKEDIN_ORG_ID` ekleyin; gönderiler şirket sayfasına geçer.

### 3. GitHub gizli değerleri

Depo → **Settings → Secrets and variables → Actions → New repository secret**:

| Ad | Değer |
|---|---|
| `IG_USER_ID` | Instagram kullanıcı kimliği |
| `IG_ACCESS_TOKEN` | Instagram erişim anahtarı |
| `SECRETS_PAT` | (yalnız IG... ile başlayan Instagram anahtarları için) fine-grained token, izin: **Secrets: Read and write** |
| `LINKEDIN_ORG_ID` | (şimdilik boş) LinkedIn şirket kimliği; boşsa kişisel profile paylaşılır |
| `LINKEDIN_ACCESS_TOKEN` | (isteğe bağlı) LinkedIn erişim anahtarı |

### 4. Deneme

**Actions → Publish → Run workflow**: `check` anahtarları salt okuma çağrısıyla doğrular, `dry-run` sıradaki gönderiyi ve linkleri gösterir; ikisi de hiçbir şey paylaşmaz. `publish` gerçekten yayınlar. İlk gerçek yayından sonra Instagram ve LinkedIn'de gönderiyi bir kez kontrol edin (özellikle LinkedIn'de linkin tıklanabilir olduğunu).

## Yerel komutlar

```
node tools/render.mjs <klasör>     # görselleri çiz (Playwright + Chromium gerekir)
node tools/lint.mjs --images       # kuralları ve görselleri denetle
npm test
node tools/publish.mjs --dry-run   # sıradaki gönderiyi göster
```

## Bir gönderiyi durdurmak

Yayınlanmamış bir gönderiyi `queue/` içinden silmek yeterli. Yayını tamamen durdurmak için **Actions → Publish → Disable workflow**.
