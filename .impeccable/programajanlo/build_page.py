from pathlib import Path
import json, html
from urllib.parse import quote
root=Path(__file__).resolve().parents[2]
groups=json.loads((root/'.impeccable/programajanlo/content.json').read_text())
e=html.escape
mail='mailto:mullers106@gmail.com?subject='+quote('Osztálykirándulás – szállásajánlatkérés')+'&body='+quote('Kedves Müller’s Csapat!\n\nOsztálykiránduláshoz szeretnénk szállásajánlatot kérni.\n\nIskola neve:\nKapcsolattartó neve:\nTervezett időpont (vagy időszak):\nDiákok és kísérők létszáma:\nTelefonszám:\nÉtkezési igények:\nKiválasztott programötletek:\n\nKöszönjük!')
head='''<!doctype html>
<html lang="hu">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="description" content="Siófoki programajánló osztálykirándulóknak: hajózás, természet, közös kalandok és esőnapi ötletek. Hivatalos források, kétnapos mintaterv és letölthető PDF.">
  <meta name="theme-color" content="#f7efe3">
  <title>Siófoki programajánló osztálykirándulóknak | Müller's Panzió</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&family=Work+Sans:wght@400;500;600&display=swap" rel="stylesheet">
  <link rel="icon" href="../../assets/logo.ico">
  <link rel="stylesheet" href="../../style.css">
  <link rel="stylesheet" href="../../assets/consent.css">
  <link rel="stylesheet" href="programajanlo.css">
</head>
<body class="blog-post programajanlo-page">
'''
page=head+f'''  <header class="blog-top-bar">
    <div class="blog-top-bar-inner">
      <a class="blog-top-bar-title" href="../../index.html" aria-label="Müller's Panzió főoldal">Müller's</a>
      <nav class="blog-top-bar-actions" aria-label="Cikk navigáció">
        <a class="blog-top-btn" href="../index.html">← Blog</a>
        <a class="blog-top-btn blog-top-btn-primary" href="{e(mail)}">Ajánlatkérés</a>
      </nav>
    </div>
  </header>
  <main id="tartalom">
    <section class="blog-hero program-hero" aria-labelledby="program-title">
      <div class="program-hero-copy">
        <h1 id="program-title">Osztálykirándulás, amiről még sokáig meséltek. 🎒</h1>
        <p>Siófoki programajánló: balatoni hajózás, közös kalandok és esőnapi ötletek. Találjátok meg a ti osztályotok kedvenceit!</p>
        <div class="program-hero-actions">
          <a href="#programok">Programok ↓</a>
          <a href="../../assets/blog/programajanlo_2026.pdf" download>PDF letöltése</a>
        </div>
        <p class="blog-hero-meta">Frissítve: <time datetime="2026-10-02">2026. október 2.</time> · Müller's Panzió Siófok</p>
      </div>
      <figure class="program-hero-image">
        <img src="../../assets/blog/programajanlo/hajo.webp" width="1200" height="774" alt="Balatoni személyhajó a kikötőben, naplementében" fetchpriority="high">
      </figure>
    </section>
    <article class="blog-article program-article" aria-label="Siófoki programötletek osztálykirándulóknak">
      <nav class="program-contents" id="programok" aria-label="Programkategóriák">
        <strong>Milyen élményhez van kedvetek?</strong>
        <div class="program-contents-links">
'''
navlabels=['Városnézés','Balaton','Természet','Közös kaland','Esős idő']
for g,label in zip(groups,navlabels):page+=f'          <a href="#{g["id"]}"><span aria-hidden="true">{g["emoji"]}</span>&nbsp;{label}</a>\n'
page+='''          <a href="#mintaterv">Kétnapos mintaterv</a>
        </div>
      </nav>
      <p class="program-intro">Egy jó osztálykiránduláson jut idő felfedezésre, közös játékra és egyszerűen együtt lenni. Összegyűjtöttünk <strong>10 programötletet Siófokon és a környéken</strong>, hogy könnyebben összeálljon a terv. Válasszatok egy fő élményt, mellé egy lazább sétát, és máris megvan a nap ritmusa. 😊</p>
      <p class="program-update"><strong>🍂 Ősszel is tervezzetek bátran!</strong> A hajózás és több szabadtéri hely szezonális, a kalandpark csoportfogadása pedig jelenleg hétvégékre korlátozott. Az alábbi tudnivalók a 2026. október 2-án elérhető hivatalos tájékoztatók alapján készültek; a kirándulás napjára kérjetek visszaigazolást.</p>
'''
size={'viztorony':(846,635),'toreki':(1000,749),'kalandpark':(1000,666)}
for g in groups:
 page+=f'''      <section class="program-section" id="{g['id']}" aria-labelledby="{g['id']}-title">
        <h2 id="{g['id']}-title"><span aria-hidden="true">{g['emoji']}</span> {e(g['title'])}</h2>
        <p>{e(g['intro'])}</p>
'''
 if 'image' in g:
  w,h=size[g['image']];page+=f'        <figure class="program-photo"><img src="../../assets/blog/programajanlo/{g["image"]}.webp" width="{w}" height="{h}" alt="{e(g["alt"])}" loading="lazy" decoding="async"></figure>\n'
 for item in g['items']:
  page+=f'''        <div class="program-item">
          <h3><span aria-hidden="true">{item['emoji']}</span> {e(item['name'])}</h3>
          <p class="program-meta">{e(item['meta'])}</p>
          <p>{e(item['text'])}</p>
          <p class="program-note"><strong>Jó tudni:</strong> {e(item['note'])}</p>
          <a class="program-source" href="{e(item['url'])}">{e(item['link'])} →</a>
        </div>
'''
 page+='      </section>\n'
page+='''      <section class="program-section program-plan" id="mintaterv" aria-labelledby="mintaterv-title">
        <h2 id="mintaterv-title">🗓️ Két nap, jó ritmusban</h2>
        <p>Nem kell minden élményt egy napba sűríteni. Ez a saját mintatervünk kiindulópont: alakítsátok az osztály korához, a választott dátumhoz és a költségkerethez!</p>
        <h3>1. nap · Megérkezünk Siófokra</h3>
        <ol>
          <li><strong>Érkezés után:</strong> csomagok és szállás egyeztetett rendben, majd ebéd.</li>
          <li><strong>Délután:</strong> Víztorony, Rózsakert és egy közös parti séta.</li>
          <li><strong>Ha indul hajó:</strong> sétahajózás; esős időre előre foglalt Emlékház-látogatás.</li>
          <li><strong>Este:</strong> vacsora, aztán saját csapatjáték vagy közös kvíz. 🎲</li>
        </ol>
        <h3>2. nap · Jöhet a közös kaland</h3>
        <ol>
          <li><strong>Délelőtt:</strong> Bella Állatpark vagy az osztályhoz igazított töreki túra.</li>
          <li><strong>Hétvégi alternatíva:</strong> előre egyeztetett Zamárdi Kalandpark.</li>
          <li><strong>Esős alternatíva:</strong> Ásványmúzeum vagy külön utazással Balatonföldvár.</li>
          <li><strong>Ebéd után:</strong> még egy csoportkép, és indulhat a hazautazás. 📸</li>
        </ol>
        <p class="program-note">Ez tervezési ötlet, nem foglalható programcsomag. A szállást, étkezést, közlekedést és a külső programokat külön kell egyeztetni; a felsorolt élmények nem részei automatikusan a szállás árának.</p>
      </section>
      <section class="program-section" id="szervezes" aria-labelledby="szervezes-title">
        <h2 id="szervezes-title">✅ Ettől lesz könnyebb a szervezés</h2>
        <ul class="program-checklist">
          <li><strong>Először a dátum és a létszám.</strong> A hétköznapi és hétvégi lehetőségek eltérhetnek; a külső programoknál kérjetek csoportos visszaigazolást.</li>
          <li><strong>Napi egy nagy élmény is elég.</strong> Hagyjatok időt utazásra, ebédre, mosdószünetre és kötetlen együttlétre.</li>
          <li><strong>Étkezés előre egyeztetve.</strong> Küldjétek el a diákok és kísérők létszámát, valamint az allergiákat és az egyéb étrendi igényeket.</li>
          <li><strong>Legyen esőnapi időpont is.</strong> A múzeumok csoportkapacitását ugyanúgy érdemes előre tisztázni.</li>
        </ul>
        <p>🏡 A szállás legyen a biztos kiindulópont. Írjátok meg nekünk, mikor érkeznétek és hányan vagytok, és kérjetek a csoportotokra szóló szállásajánlatot!</p>
      </section>
      <p class="program-research-note">Forrásaink a programok mellett található hivatalos oldalak. A saját játékötleteket és a mintatervet külön jelöltük. A nyitvatartás, az árak és a csoportfogadási feltételek változhatnak; az aktuális részleteket mindig a program szolgáltatójával egyeztessétek. Az aktuális cikk <a href="../../assets/blog/programajanlo_2026.pdf" download>PDF-ben is letölthető</a>.</p>
    </article>
    <section class="blog-cta" aria-labelledby="ajanlat-title">
      <h2 id="ajanlat-title">A programötlet megvan. Legyen hozzá szállás is! 🎒</h2>
      <p>Küldjétek el a tervezett dátumot, a diákok és kísérők létszámát, valamint az étkezési igényeiteket. Innen már könnyebb elindulni.</p>
      <div class="blog-cta-actions">
'''
page+=f'        <a class="btn btn-primary" href="{e(mail)}">📩 Szállásajánlatot kérek</a>\n'
page+='''        <a class="btn btn-outline" href="../hamarosan.html" data-booking-url="https://ibe.sabeeapp.com/v3/a/152WSU?lang=Hu">Szabad helyek keresése</a>
      </div>
      <p>Telefonon is elértek: <a class="program-contact-link" href="tel:+36204131146">+36 20 413 1146</a></p>
    </section>
  </main>
'''
# Preserve the site's established footer and contact/legal destinations.
neighbor=(root/'blog/visszatero-iskola-ajanlat/index.html').read_text()
footer=neighbor[neighbor.index('    <footer'):neighbor.index('    <div class="mobile-cta">')].replace(' data-animate','')
page+=footer+'''  <script src="../../assets/consent.js" defer></script>
  <script src="../../script.js" defer></script>
</body>
</html>
'''
(root/'blog/programajanlo/index.html').write_text(page)
