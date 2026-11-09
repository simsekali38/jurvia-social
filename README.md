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

### 2. LinkedIn (isteğe bağlı, onay gerektirir)

1. https://www.linkedin.com/developers/apps → **Create app** → şirket sayfası olarak **Jurvia** seçin, sayfa yöneticisi doğrulamasını tamamlayın.
2. **Products** → **Community Management API** için başvurun. LinkedIn bu ürünü şirket doğrulamasıyla açıyor; onay gelmezse LinkedIn adımı atlanır, Instagram yayını etkilenmez.
3. Onaydan sonra **Auth → OAuth 2.0 tools** ile `w_organization_social` kapsamlı anahtar üretin. Şirket kimliği, sayfa yönetici adresindeki sayıdır (`linkedin.com/company/<kimlik>/admin`).
4. LinkedIn anahtarı 60 gün geçerlidir; süresi dolunca yayın adımı hata verir ve GitHub size e-posta atar. Yeni anahtarı aynı yerden üretip gizli değeri güncelleyin.

### 3. GitHub gizli değerleri

Depo → **Settings → Secrets and variables → Actions → New repository secret**:

| Ad | Değer |
|---|---|
| `IG_USER_ID` | Instagram kullanıcı kimliği |
| `IG_ACCESS_TOKEN` | Instagram erişim anahtarı |
| `SECRETS_PAT` | Bu depo için fine-grained token, izin: **Secrets: Read and write** (Instagram anahtarını haftalık yenilemek için) |
| `LINKEDIN_ORG_ID` | (isteğe bağlı) LinkedIn şirket kimliği |
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
