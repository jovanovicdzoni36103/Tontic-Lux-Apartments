# -*- coding: utf-8 -*-
"""Zajednicki delovi svih stranica. Odavde se sklapaju HTML fajlovi."""

DOMEN = "https://tonticlux.rs"
NAZIV = "Tontić Lux"

NAV = [
    ("/apartmani/", "Apartmani"),
    ("/sadrzaji/", "Sadržaji"),
    ("/galerija/", "Galerija"),
    ("/lokacija/", "Lokacija"),
    ("/faq/", "Pitanja"),
]

IKONE = {
    "garaza": '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><path d="M3 13.5L16 5l13 8.5V28H3z"/><path d="M8 28v-7h16v7"/><path d="M8 24.5h16"/></svg>',
    "spa": '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><path d="M16 27c5.5 0 10-4.2 10-9.3C26 12 16 4 16 4S6 12 6 17.7C6 22.8 10.5 27 16 27z"/><path d="M16 27V14"/></svg>',
    "grejanje": '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><path d="M4 22c3-3 5-3 8 0s5 3 8 0 5-3 8 0"/><path d="M4 15c3-3 5-3 8 0s5 3 8 0 5-3 8 0"/><path d="M4 8c3-3 5-3 8 0s5 3 8 0 5-3 8 0"/></svg>',
    "kvaka": '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M4 10.5l4 4 8-9"/></svg>',
    "strelica": '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M2 8h12M9 3l5 5-5 5"/></svg>',
    "whatsapp": '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 00-8.6 15L2 22l5.2-1.4A10 10 0 1012 2zm0 18.2a8.2 8.2 0 01-4.2-1.2l-.3-.2-3.1.8.8-3-.2-.3A8.2 8.2 0 1112 20.2zm4.6-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 01-3.3-2.9c-.1-.2 0-.4.1-.5l.4-.5c.1-.2.2-.3.3-.5 0-.2 0-.3-.1-.5l-.8-1.8c-.2-.4-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.7.7-1 1.6-1 2.5.1 1.5 1.1 2.9 1.2 3.1.2.2 2.1 3.2 5.1 4.4 1.9.7 2.6.8 3.5.7.6-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.2-.3-.3-.5-.4z"/></svg>',
    "telefon": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M6 3h3l2 5-2.5 1.5a11 11 0 006 6L16 13l5 2v3a2 2 0 01-2.2 2A16 16 0 014 5.2 2 2 0 016 3z"/></svg>',
    "pismo": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="2.5" y="5" width="19" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>',
    "kalendar": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
}


def glava(naslov, opis, putanja, og_slika="og-cover.jpg", schema="", dodatno=""):
    kanonska = DOMEN + putanja
    return f"""<!DOCTYPE html>
<html lang="sr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{naslov}</title>
<meta name="description" content="{opis}">
<link rel="canonical" href="{kanonska}">
<meta name="theme-color" content="#1A1714">
<meta name="robots" content="index, follow">
<meta property="og:type" content="website">
<meta property="og:site_name" content="{NAZIV}">
<meta property="og:locale" content="sr_RS">
<meta property="og:title" content="{naslov}">
<meta property="og:description" content="{opis}">
<meta property="og:url" content="{kanonska}">
<meta property="og:image" content="{DOMEN}/assets/img/{og_slika}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/assets/ikona-180.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300&family=Inter:wght@400;500&display=swap">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300&family=Inter:wght@400;500&display=swap">
<link rel="stylesheet" href="/css/main.css">
{schema}{dodatno}
</head>
<body>
<a class="preskoci" href="#sadrzaj">Preskoči na sadržaj</a>
<div class="napredak" data-napredak aria-hidden="true"></div>
"""


def zaglavlje(aktivno=""):
    stavke = "".join(
        f'<a href="{u}"{" aria-current=\"page\"" if u == aktivno else ""}>{n}</a>'
        for u, n in NAV
    )
    meni_stavke = "".join(
        f'<li><a href="{u}">{n}</a></li>' for u, n in NAV
    )
    return f"""<header class="zaglavlje" data-zaglavlje>
  <div class="omot zaglavlje__red">
    <a class="logo" href="/" aria-label="{NAZIV}, početna strana">Tontić Lux <span>Kopaonik</span></a>
    <nav class="nav-glavna" aria-label="Glavna navigacija">{stavke}</nav>
    <a class="dugme dugme--glavno" href="/rezervacija/" data-magnet>Proverite termin</a>
    <button class="dugme-meni" type="button" data-meni-dugme aria-expanded="false" aria-controls="meni" aria-label="Otvori meni">
      <span>Meni</span><i aria-hidden="true"></i>
    </button>
  </div>
</header>

<nav class="meni" id="meni" data-meni aria-label="Meni" hidden>
  <ul class="meni__stavke">
    <li><a href="/">Početna</a></li>
    {meni_stavke}
    <li><a href="/rezervacija/">Upit</a></li>
  </ul>
  <div class="meni__dno">
    <div class="meni__kontakt sitno">
      <a data-veza="telefon1" data-upisi href="#">063 877 3363</a>
      <a data-veza="email" data-upisi href="#">tonticlux@gmail.com</a>
    </div>
    <div class="sitno tih">
      Residence Hill, jedinice 53 i 54<br>
      Milmari Resort, N Lux 68<br>
      Kopaonik
    </div>
  </div>
</nav>
"""


def podnozje():
    return f"""<footer class="podnozje" data-tema="noc">
  <div class="omot">
    <div class="podnozje__mreza">
      <div>
        <h2>Slobodan termin? Pitajte, javljamo se isti dan.</h2>
        <p class="sitno tih" style="max-width:38ch">Upit ne obavezuje ni na šta. Odgovaramo za 1 do 4 sata, sa cenom za vaš termin i onim što je slobodno.</p>
        <div style="display:flex;gap:.6rem;flex-wrap:wrap;margin-top:1.75rem">
          <a class="dugme" href="/rezervacija/">Pošaljite upit</a>
          <a class="dugme dugme--prazno" data-veza="whatsapp" href="#" target="_blank" rel="noopener">WhatsApp</a>
        </div>
      </div>
      <div>
        <h3>Kontakt</h3>
        <ul>
          <li><a data-veza="telefon1" data-upisi href="#">063 877 3363</a></li>
          <li><a data-veza="telefon2" data-upisi href="#">065 802 2270</a></li>
          <li><a data-veza="email" data-upisi href="#">tonticlux@gmail.com</a></li>
          <li><a data-veza="whatsapp" href="#" target="_blank" rel="noopener">WhatsApp</a></li>
          <li><a data-veza="viber" href="#">Viber</a></li>
          <li><a data-veza="instagram" href="#" target="_blank" rel="noopener">Instagram</a></li>
        </ul>
      </div>
      <div>
        <h3>Sajt</h3>
        <ul>
          <li><a href="/apartmani/">Apartmani</a></li>
          <li><a href="/sadrzaji/">Sadržaji</a></li>
          <li><a href="/galerija/">Galerija</a></li>
          <li><a href="/lokacija/">Lokacija</a></li>
          <li><a href="/faq/">Pitanja i odgovori</a></li>
          <li><a href="/rezervacija/">Upit za boravak</a></li>
        </ul>
      </div>
    </div>
    <div class="podnozje__dno">
      <span>Residence Hill 53 i 54, Milmari Resort N Lux 68, Kopaonik</span>
      <span>&copy; <span data-godina>2026</span> {NAZIV}</span>
    </div>
  </div>
</footer>

<div class="traka-akcija" aria-label="Brze akcije">
  <a data-veza="whatsapp" href="#" target="_blank" rel="noopener">{IKONE['whatsapp']}<span>WhatsApp</span></a>
  <a class="istaknuto" href="/rezervacija/">{IKONE['kalendar']}<span>Upit</span></a>
  <a data-veza="telefon1" href="#">{IKONE['telefon']}<span>Pozovite</span></a>
</div>
"""


def noga(booking=False):
    b = '<script src="/js/booking.js" defer></script>' if booking else ""
    return f"""<script src="/js/config.js"></script>
<script src="/js/app.js" defer></script>
{b}
</body>
</html>
"""


def stranica(putanja, naslov, opis, telo, aktivno="", schema="", booking=False, og_slika="og-cover.jpg", dodatno=""):
    return (
        glava(naslov, opis, putanja, og_slika, schema, dodatno)
        + zaglavlje(aktivno)
        + '<main id="sadrzaj">\n'
        + telo
        + "\n</main>\n"
        + podnozje()
        + noga(booking)
    )


# ---------------------------------------------------------------- blokovi

def naslov_strane(putanja_ime, naslov, uvod="", tema="noc"):
    uvod_html = f'<p class="vodeci">{uvod}</p>' if uvod else ""
    return f"""<section class="naslov-strane" data-tema="{tema}">
  <div class="omot">
    <p class="putanja"><a href="/">Početna</a> / {putanja_ime}</p>
    <h1>{naslov}</h1>
    {uvod_html}
  </div>
</section>"""


def slika(fajl, opis, klase="", lazy=True, sirina=1600, visina=1100):
    l = ' loading="lazy" decoding="async"' if lazy else ' fetchpriority="high" decoding="async"'
    k = f' class="{klase}"' if klase else ""
    return f'<img{k} src="/assets/img/{fajl}" alt="{opis}" width="{sirina}" height="{visina}"{l}>'


def kartica_jedinice(a):
    return f"""<article class="jedinica otkrij">
  <a class="jedinica__slika" href="/apartmani/{a['slug']}/" aria-label="{a['naziv']}, detalji">
    {slika(a['slike'][0][0], a['slike'][0][1], sirina=1600, visina=1200)}
    <span class="plocica">{a['zgrada']}</span>
  </a>
  <div class="jedinica__telo">
    <h3><a href="/apartmani/{a['slug']}/">{a['naziv']}</a></h3>
    <p>{a['kratko']}</p>
    <ul class="podaci">
      <li><span>Površina</span> <b class="broj">{a['kvadratura']} m²</b></li>
      <li><span>Gosti</span> <b class="broj">do {a['max_gostiju']}</b></li>
      <li><span>Ležajevi</span> <b>{a['lezajevi_kratko']}</b></li>
      <li><span>Sprat</span> <b>{a['sprat_kratko']}</b></li>
    </ul>
    <div class="jedinica__akcije">
      <a class="dugme" href="/rezervacija/?apartman={a['slug']}">Proverite termin</a>
      <a class="veza" href="/apartmani/{a['slug']}/">Detalji {IKONE['strelica']}</a>
    </div>
  </div>
</article>"""


def pitanja_blok(spisak, otvoreno_prvo=False):
    redovi = []
    for i, (p, o) in enumerate(spisak):
        otv = "true" if (otvoreno_prvo and i == 0) else "false"
        stanje = "1" if (otvoreno_prvo and i == 0) else "0"
        redovi.append(f"""<div class="pitanje">
  <button class="pitanje__glava" type="button" data-pitanje aria-expanded="{otv}">
    <span>{p}</span><span class="pitanje__znak" aria-hidden="true"></span>
  </button>
  <div class="pitanje__telo" data-otvoreno="{stanje}"><div><p>{o}</p></div></div>
</div>""")
    return '<div class="pitanja">' + "".join(redovi) + "</div>"


def traka_slika(slike, grupa="galerija"):
    figure = []
    for i, (fajl, opis) in enumerate(slike):
        siroka = " siroka" if i % 3 == 0 else ""
        figure.append(
            f'<figure class="{siroka.strip()}">'
            f'<button type="button" data-svetlo="{grupa}" data-opis="{opis}" data-puna="/assets/img/{fajl}" '
            f'style="all:unset;cursor:zoom-in;display:block">{slika(fajl, opis)}</button>'
            f"<figcaption>{opis}</figcaption></figure>"
        )
    return f"""<div data-traka-grupa>
  <div class="traka" data-traka>{''.join(figure)}</div>
  <div class="traka-kontrole">
    <button class="krug" type="button" data-traka-nazad aria-label="Prethodne fotografije"><svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M10 2L4 8l6 6"/></svg></button>
    <button class="krug" type="button" data-traka-napred aria-label="Sledeće fotografije"><svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M6 2l6 6-6 6"/></svg></button>
  </div>
</div>"""


def upitnik_sekcija(naslov="Slobodan termin? Pitajte.", uvod="", tema="sneg", predizbor=""):
    skripta = f'<script>window.PREDIZBOR="{predizbor}";</script>' if predizbor else ""
    uvod_html = f'<p class="vodeci">{uvod}</p>' if uvod else ""
    return f"""{skripta}
<section class="sekcija" id="upit" data-tema="{tema}">
  <div class="omot">
    <div class="zaglavlje-sekcije otkrij">
      <h2>{naslov}</h2>
      <div class="zaglavlje-sporedno">{uvod_html}</div>
    </div>
    <div data-upitnik>
      <noscript>
        <p class="nagovestaj">Za slanje upita sa sajta potreban je JavaScript. Pišite nam na
        <a data-veza="email" href="mailto:tonticlux@gmail.com">tonticlux@gmail.com</a> ili pozovite 063 877 3363.</p>
      </noscript>
    </div>
  </div>
</section>"""
