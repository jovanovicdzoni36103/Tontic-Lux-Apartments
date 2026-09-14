# -*- coding: utf-8 -*-
"""Sklapa sve HTML stranice sajta. Pokretanje: python3 build/build.py"""
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from delovi import (DOMEN, IKONE, NAZIV, kartica_jedinice, naslov_strane,
                    pitanja_blok, slika, stranica, traka_slika, upitnik_sekcija)

KOREN = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# ---------------------------------------------------------------- podaci
APARTMANI = [
    {
        "slug": "tonticlux-53",
        "naziv": "TonticLux 53",
        "zgrada": "Residence Hill",
        "sprat": "Treći sprat",
        "sprat_kratko": "Treći",
        "kvadratura": 30,
        "max_gostiju": 4,
        "lezajevi": "Dva bračna kreveta",
        "lezajevi_kratko": "2 bračna",
        "kratko": "Trideset kvadrata sa dva pokretna pregradna zida, pa se prostor deli onako kako vam odgovara te večeri.",
        "razlika": "Pokretni pregradni zidovi",
        "opis": [
            "Trideset kvadrata na trećem spratu Residence Hilla, sa dva pokretna pregradna zida. Preko dana se otvore i dobijete jedan prostor. Uveče se zatvore i imate dve odvojene celine, pa deca mogu da legnu ranije dok vi ostajete budni.",
            "Dva bračna kreveta primaju četiri odrasle osobe. Kuhinja je puna, sa rernom i mašinom za sudove, tako da ne morate da izlazite na večeru ako ne želite. Sa francuskog balkona se gleda u prirodu.",
        ],
        "slike": [
            ("ap53-01.jpg", "Dnevni deo apartmana TonticLux 53"),
            ("ap53-02.jpg", "Bračni krevet u apartmanu TonticLux 53"),
            ("ap53-03.jpg", "Kuhinja sa rernom i mašinom za sudove"),
            ("ap53-04.jpg", "Kupatilo apartmana TonticLux 53"),
            ("ap53-05.jpg", "Francuski balkon i pogled na prirodu"),
            ("ap53-06.jpg", "Detalj enterijera apartmana TonticLux 53"),
        ],
    },
    {
        "slug": "tonticlux-54",
        "naziv": "TonticLux 54",
        "zgrada": "Residence Hill",
        "sprat": "Treći sprat",
        "sprat_kratko": "Treći",
        "kvadratura": 30,
        "max_gostiju": 4,
        "lezajevi": "Dva bračna kreveta",
        "lezajevi_kratko": "2 bračna",
        "kratko": "Isti raspored kao broj 53, na istom spratu. Kada se uzmu zajedno, dva apartmana primaju osam osoba.",
        "razlika": "Vrata do broja 53",
        "opis": [
            "Isti raspored i ista oprema kao apartman 53, na istom spratu i sa istim pogledom. Dva pokretna pregradna zida, dva bračna kreveta, puna kuhinja i francuski balkon.",
            "Pošto su vrata do vrata, dve jedinice se često uzimaju zajedno. Tako grupa od osam osoba spava na istom spratu, a svaka porodica ima svoje kupatilo i svoju kuhinju. Cena je zbir cena dva apartmana.",
        ],
        "slike": [
            ("ap54-01.jpg", "Dnevni deo apartmana TonticLux 54"),
            ("ap54-02.jpg", "Bračni krevet u apartmanu TonticLux 54"),
            ("ap54-03.jpg", "Kuhinja apartmana TonticLux 54"),
            ("ap54-04.jpg", "Kupatilo apartmana TonticLux 54"),
            ("ap54-05.jpg", "Francuski balkon i pogled na prirodu"),
            ("ap54-06.jpg", "Detalj enterijera apartmana TonticLux 54"),
        ],
    },
    {
        "slug": "tonticlux-milmari",
        "naziv": "TonticLux Milmari",
        "zgrada": "Milmari Resort, N Lux 68",
        "sprat": "Prvi sprat",
        "sprat_kratko": "Prvi",
        "kvadratura": 35,
        "max_gostiju": 4,
        "lezajevi": "Bračni krevet i ležaj na razvlačenje",
        "lezajevi_kratko": "Bračni i razvlačenje",
        "kratko": "Dve odvojene sobe i pet kvadrata više. Do prvog sprata se stiže bez lifta, a spa centar je u istom kompleksu.",
        "razlika": "Dve odvojene sobe",
        "opis": [
            "Trideset pet kvadrata u Milmari Resortu, u zgradi N Lux. Dve odvojene sobe umesto pregradnih zidova, pa je podela prostora stalna. Bračni krevet u spavaćoj sobi, ležaj na razvlačenje u dnevnoj.",
            "Prvi sprat, do njega se ide stepenicama. Za nekoga je to mana, za nekoga prednost, jer se ne čeka lift kada se nosi oprema. Spa centar je u istom kompleksu i do njega se stiže iz zgrade, bez izlaska napolje.",
        ],
        "slike": [
            ("milmari-01.jpg", "Dnevna soba apartmana TonticLux Milmari"),
            ("milmari-02.jpg", "Spavaća soba sa bračnim krevetom"),
            ("milmari-03.jpg", "Kuhinja apartmana TonticLux Milmari"),
            ("milmari-04.jpg", "Kupatilo apartmana TonticLux Milmari"),
            ("milmari-05.jpg", "Balkon sa pogledom na planinu"),
            ("milmari-06.jpg", "Ležaj na razvlačenje u dnevnoj sobi"),
        ],
    },
]

OPREMA = [
    ("Podno grejanje", "Toplota ide od poda, bez klime koja duva u vrat."),
    ("Puna kuhinja", "Rerna, mašina za sudove, pribor za kuvanje i posuđe za četiri osobe."),
    ("Zatvorena garaža", "Jedno parking mesto u garaži kompleksa, uračunato u cenu."),
    ("Francuski balkon", "Pogled na prirodu i planinu, u sve tri jedinice."),
    ("Bežični internet", "Besplatan, u celom apartmanu."),
    ("Televizor", "U dnevnom delu."),
    ("Sef", "Za dokumenta i sitnice koje ne nosite na stazu."),
    ("Posteljina i peškiri", "Spremni pre dolaska, uračunati u cenu."),
]

PITANJA_KRATKO = [
    ("Da li je parking uključen u cenu?",
     "Jeste. Uz svaki apartman ide jedno mesto u zatvorenoj garaži kompleksa i ne plaća se posebno."),
    ("Koliko ima do žičare?",
     "Oko tri kilometra, otprilike pet minuta vožnje. Do centra Kopaonika je pet kilometara, oko deset minuta."),
    ("Postoji li prevoz do staze?",
     "Ski bus staje kod svakog kompleksa i vozi na otprilike pola sata. Karta se plaća u busu, nije uračunata u cenu smeštaja."),
    ("Da li ima spa?",
     "Ima, u Milmari Resortu. Koriste ga gosti sva tri apartmana, plaća se na licu mesta i ne zakazuje se unapred."),
    ("Mogu li da dovedem psa?",
     "Ne. Kućni ljubimci nisu dozvoljeni ni u jednoj jedinici."),
]

PITANJA_SVE = PITANJA_KRATKO + [
    ("Zašto cene ne pišu na sajtu?",
     "Zato što se menjaju po sezoni i po praznicima, pa bi broj na sajtu često bio pogrešan. Pošaljite upit sa datumima i dobijate tačnu cenu za taj termin, obično za 1 do 4 sata."),
    ("Kako se plaća?",
     "Bankovnim transferom ili gotovinom. Kartica radi samo na recepciji N Lux zgrade u Milmari Resortu i recepcija na to naplaćuje svoju uslugu. Residence Hill nema recepciju, pa tu kartica nije opcija."),
    ("Da li se traži depozit?",
     "Ne traži se."),
    ("Kada mogu da se prijavim i odjavim?",
     "Prijava je od 15 do 20 časova, odjava do 10 časova. Ako kasnite ili stižete ranije, javite na vreme pa se dogovorimo."),
    ("Kako se otkazuje?",
     "Besplatno do 14 dana pre dolaska. Posle toga se naplaćuje pun iznos rezervacije."),
    ("Da li je cena po osobi ili po apartmanu?",
     "Po apartmanu. Boravišna taksa je uračunata u cenu. Deca se računaju u broj gostiju i ulaze u cenu kao i odrasli."),
    ("Koliko osoba stvarno može da spava u apartmanu?",
     "Četiri. Broj gostiju ne može da se prekorači na licu mesta. Ako vas je više, uzmite apartmane 53 i 54 zajedno, oni su vrata do vrata i primaju osam osoba."),
    ("Kada je rezervacija potvrđena?",
     "Kada vam mi pošaljemo potvrdu, mejlom ili porukom. Poslat upit sam po sebi ne blokira termin."),
    ("Ima li nešto u blizini kompleksa?",
     "Prodavnica, apoteka i restoran su u blizini, a spa centar je u samom kompleksu."),
    ("Postoji li kućni red?",
     "Postoji i kratak je. Bez žurki i proslava, tišina od 21 do 8 časova. Zbog toga su ovo apartmani u koje se ljudi vraćaju sa decom."),
]


def schema_json(podaci):
    return '<script type="application/ld+json">' + json.dumps(podaci, ensure_ascii=False) + "</script>\n"


def mrvice(stavke):
    return schema_json({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": i + 1, "name": n, "item": DOMEN + u}
            for i, (u, n) in enumerate(stavke)
        ],
    })


SCHEMA_OBJEKAT = schema_json({
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    "name": "Apartmani Tontić Lux",
    "url": DOMEN + "/",
    "image": DOMEN + "/assets/img/og-cover.jpg",
    "description": "Tri apartmana na Kopaoniku sa zatvorenom garažom, podnim grejanjem i punom kuhinjom. Residence Hill i Milmari Resort.",
    "telephone": "+381638773363",
    "email": "tonticlux@gmail.com",
    "address": {
        "@type": "PostalAddress",
        "streetAddress": "Residence Hill 53 i 54, Milmari Resort N Lux 68",
        "addressLocality": "Kopaonik",
        "addressCountry": "RS",
    },
    "checkinTime": "15:00",
    "checkoutTime": "10:00",
    "petsAllowed": False,
    "numberOfRooms": 3,
    "sameAs": ["https://www.instagram.com/tonticluxmilmari/"],
    "amenityFeature": [
        {"@type": "LocationFeatureSpecification", "name": "Zatvorena garaža", "value": True},
        {"@type": "LocationFeatureSpecification", "name": "Spa centar u kompleksu", "value": True},
        {"@type": "LocationFeatureSpecification", "name": "Podno grejanje", "value": True},
        {"@type": "LocationFeatureSpecification", "name": "Besplatan bežični internet", "value": True},
        {"@type": "LocationFeatureSpecification", "name": "Kuhinja", "value": True},
    ],
})


# ---------------------------------------------------------------- POČETNA
def pocetna():
    razlozi = [
        ("garaza", "Zatvorena garaža",
         "Jedno mesto u garaži kompleksa ide uz svaki apartman i uračunato je u cenu. Ujutru ne kopate auto ispod snega."),
        ("spa", "Spa u kompleksu",
         "Spa centar u Milmari Resortu koriste gosti sva tri apartmana. Plaća se na licu mesta, bez zakazivanja unapred."),
        ("grejanje", "Podno grejanje",
         "Nema klime koja duva. Toplota ide od poda naviše, pa deca mogu bosa po stanu."),
    ]
    razlozi_html = "".join(
        f'<article class="razlog otkrij" data-kasni="{i}">'
        f'<span class="razlog__znak">{IKONE[k]}</span>'
        f"<h3>{n}</h3><p>{t}</p></article>"
        for i, (k, n, t) in enumerate(razlozi)
    )

    koraci = [
        ("Pošaljete upit", "Termin, broj gostiju i jedinica. Traje minut, ne obavezuje vas ni na šta."),
        ("Javljamo se", "Za 1 do 4 sata dobijate odgovor da li je slobodno i koliko košta baš taj termin."),
        ("Potvrda", "Kada se dogovorimo, termin je vaš. Bez depozita. Otkazivanje je besplatno do 14 dana pre dolaska."),
    ]
    koraci_html = "".join(
        f'<li class="otkrij" data-kasni="{i}"><b class="broj">{i+1}</b><div><h3>{n}</h3><p class="tih sitno">{t}</p></div></li>'
        for i, (n, t) in enumerate(koraci)
    )

    telo = f"""
<section class="hero" data-hero data-tema="noc">
  <div class="hero__slika">{slika('hero.jpg', 'Pogled na Kopaonik sa francuskog balkona apartmana Tontić Lux', lazy=False, sirina=2000, visina=1250)}</div>
  <div class="omot hero__sadrzaj">
    <h1>
      <span class="hero__nadnaslov">Apartmani Tontić Lux, Kopaonik</span>
      <span class="hero__linija">Sneg ostaje</span>
      <span class="hero__linija">napolju.</span>
    </h1>
    <div class="hero__dno">
      <div>
        <p class="vodeci">Tri apartmana, zatvorena garaža uz svaki, podno grejanje i kuhinja u kojoj stvarno možete da kuvate. Do žičare tri kilometra.</p>
        <p class="hero__potvrda"><span class="tacka" aria-hidden="true"></span> Na upit odgovaramo za <b>1 do 4 sata</b></p>
      </div>
      <div class="hero__akcije">
        <a class="dugme" href="/rezervacija/" data-magnet>Proverite termin</a>
        <a class="dugme dugme--prazno" href="/apartmani/">Pogledajte apartmane</a>
      </div>
    </div>
  </div>
  <div class="skrol" aria-hidden="true"><span>Dole</span><i></i></div>
</section>

<section class="sekcija" data-tema="sneg">
  <div class="omot">
    <div class="mreza" style="align-items:start">
      <div class="otkrij k-puna">
        <h2 style="max-width:16ch">Kopaonik bez onog dela koji zamara</h2>
      </div>
      <div class="otkrij telo-usko k-levo" data-kasni="1">
        <p>Zimi na planini najviše vremena odnese ono što niko ne planira. Traženje parkinga u snegu, čišćenje auta ujutru, čekanje da se prostor zagreje, pa onda potraga za mestom gde ćete da jedete.</p>
        <p>Tontić Lux je tri apartmana u kojima je taj deo rešen unapred. Auto ide u zatvorenu garažu ispod kompleksa, pod je topao pre nego što uđete, a kuhinja je opremljena kao kod kuće, sa rernom i mašinom za sudove.</p>
      </div>
      <div class="otkrij k-desno" data-kasni="2">
        <ul class="spisak-kvaka">
          <li>{IKONE['kvaka']}<span>Cena je po apartmanu, ne po osobi. Boravišna taksa je uračunata.</span></li>
          <li>{IKONE['kvaka']}<span>Bez depozita i bez avansa pre dogovora.</span></li>
          <li>{IKONE['kvaka']}<span>Otkazivanje besplatno do 14 dana pre dolaska.</span></li>
          <li>{IKONE['kvaka']}<span>Najkraći boravak je dva noćenja.</span></li>
        </ul>
      </div>
    </div>
  </div>
</section>

<section class="sekcija sekcija--tanja" data-tema="papir">
  <div class="omot">
    <div class="razlozi">{razlozi_html}</div>
  </div>
</section>

<section class="sekcija" id="apartmani" data-tema="sneg">
  <div class="omot">
    <div class="zaglavlje-sekcije otkrij">
      <h2>Tri jedinice,<br>dve zgrade</h2>
      <div class="zaglavlje-sporedno">
        <p class="tih sitno">Pedeset trojka i pedeset četvorka su vrata do vrata na trećem spratu Residence Hilla. Milmari je pet kvadrata veći i ima dve odvojene sobe. Sve tri primaju do četiri osobe.</p>
      </div>
    </div>
    <div class="jedinice">
      {''.join(kartica_jedinice(a) for a in APARTMANI)}
    </div>
    <p class="nagovestaj" style="margin-top:2.5rem">Grupa od osam osoba? Apartmani 53 i 54 se uzimaju zajedno, cena je zbir cena dve jedinice.
    <a class="veza" href="/rezervacija/?apartman=tonticlux-53-54" style="margin-left:.5rem">Pitajte za oba {IKONE['strelica']}</a></p>
  </div>
</section>

<section class="sekcija" data-tema="led">
  <div class="omot">
    <div class="par">
      <div class="par__slika otkrij">{slika('okolina-02.jpg', 'Staza i žičara na Kopaoniku')}</div>
      <div class="par__tekst otkrij" data-kasni="1">
        <h2>Tri kilometra do žičare. Bus staje kod kompleksa.</h2>
        <p class="tih">Ne morate da vozite svaki dan. Ski bus prolazi na otprilike pola sata i staje kod svakog kompleksa, karta se plaća u busu. Ako ipak vozite, auto vas čeka u garaži, ne pod snegom.</p>
        <ul class="daljine">
          <li><b class="broj">3 km</b><span>Do žičare, oko 5 minuta vožnje</span></li>
          <li><b class="broj">5 km</b><span>Do centra Kopaonika, oko 10 minuta</span></li>
          <li><b class="broj">30 min</b><span>Razmak između polazaka ski busa</span></li>
          <li><b>U krugu</b><span>Prodavnica, apoteka, restoran i spa</span></li>
        </ul>
        <a class="veza" href="/lokacija/">Kako se stiže i gde smo tačno {IKONE['strelica']}</a>
      </div>
    </div>
  </div>
</section>

<section class="sekcija" data-tema="noc">
  <div class="omot">
    <div class="par par--obrnuto">
      <div class="par__slika otkrij">{slika('spa-01.jpg', 'Spa centar u Milmari Resortu na Kopaoniku')}</div>
      <div class="par__tekst otkrij" data-kasni="1">
        <h2>Spa je u kompleksu, ne u drugom kraju planine</h2>
        <p class="tih">U Milmari Resortu se do spa centra stiže iz zgrade, toplom vezom. Bez kaputa, bez izlaska na minus, bez vožnje posle skijanja. Koriste ga gosti sva tri naša apartmana.</p>
        <p class="tih">Termini se ne zakazuju unapred, dolazi se kada vam odgovara. Ulaz se plaća posebno, na licu mesta, i nije uračunat u cenu smeštaja.</p>
        <a class="veza" href="/sadrzaji/">Šta sve ide uz boravak {IKONE['strelica']}</a>
      </div>
    </div>
  </div>
</section>

<section class="sekcija" data-tema="sneg">
  <div class="omot">
    <div class="zaglavlje-sekcije otkrij">
      <h2>Kako to izgleda</h2>
      <div class="zaglavlje-sporedno"><p class="tih sitno">Fotografije su iz naših jedinica, bez uređivanja i bez pozajmljenih slika planine sa interneta.</p></div>
    </div>
    {traka_slika([
        ('ap53-01.jpg', 'Dnevni deo apartmana TonticLux 53'),
        ('milmari-02.jpg', 'Spavaća soba u apartmanu Milmari'),
        ('ap54-03.jpg', 'Kuhinja apartmana TonticLux 54'),
        ('okolina-01.jpg', 'Pogled na planinu sa balkona'),
        ('garaza-01.jpg', 'Zatvoreno parking mesto u garaži kompleksa'),
        ('spa-02.jpg', 'Prostor za odmor u spa centru'),
        ('ap53-05.jpg', 'Francuski balkon apartmana 53'),
    ], 'pocetna')}
    <p style="margin-top:1.5rem"><a class="veza" href="/galerija/">Cela galerija {IKONE['strelica']}</a></p>
  </div>
</section>

<section class="sekcija" data-tema="papir">
  <div class="omot">
    <div class="zaglavlje-sekcije otkrij">
      <h2>Kako se rezerviše</h2>
      <div class="zaglavlje-sporedno"><p class="tih sitno">Nema naloga, nema kartice na sajtu, nema čekanja da neko odobri.</p></div>
    </div>
    <ol class="postupak">{koraci_html}</ol>
  </div>
</section>

<section class="sekcija" data-tema="sneg">
  <div class="omot">
    <div class="zaglavlje-sekcije otkrij">
      <h2>Pitanja koja<br>dobijamo najčešće</h2>
      <div class="zaglavlje-sporedno"><p><a class="veza" href="/faq/">Sva pitanja i odgovori {IKONE['strelica']}</a></p></div>
    </div>
    {pitanja_blok(PITANJA_KRATKO, otvoreno_prvo=True)}
  </div>
</section>

{upitnik_sekcija(
    naslov='Pošaljite upit, javljamo se isti dan',
    uvod='Popunjavate jednom. Posle možete da pošaljete upit nama, da nastavite na WhatsApp ili na Viber, sa istim podacima.',
    tema='papir')}
"""
    dodatno = """<style>
.postupak{list-style:none;margin:0;padding:0;display:grid;gap:1px;background:var(--linija);border-top:1px solid var(--linija);border-bottom:1px solid var(--linija)}
@media (min-width:820px){.postupak{grid-template-columns:repeat(3,1fr);border:1px solid var(--linija)}}
.postupak li{background:var(--pozadina);padding:clamp(1.5rem,3vw,2.25rem);display:flex;gap:1.25rem;align-items:flex-start}
.postupak b{font-family:var(--pismo-naslov);font-size:2.4rem;line-height:.8;font-weight:300;color:var(--akcent)}
.postupak h3{margin-bottom:.4rem}
</style>"""
    return stranica(
        "/",
        "Apartmani Tontić Lux Kopaonik | Garaža, spa, tri jedinice",
        "Tri apartmana na Kopaoniku sa zatvorenom garažom, podnim grejanjem i punom kuhinjom. Residence Hill i Milmari Resort, tri kilometra do žičare. Upit dobija odgovor za 1 do 4 sata.",
        telo, aktivno="", schema=SCHEMA_OBJEKAT, booking=True, dodatno=dodatno,
    )


# ---------------------------------------------------------------- APARTMANI
def apartmani_pregled():
    redovi = "".join(
        f"<tr><th>{a['naziv']}</th><td>{a['zgrada']}</td><td class='broj'>{a['kvadratura']} m²</td>"
        f"<td>{a['lezajevi']}</td><td>{a['razlika']}</td></tr>"
        for a in APARTMANI
    )
    telo = f"""
{naslov_strane('Apartmani', 'Tri apartmana na Kopaoniku za do četiri osobe',
               'Iste su im cene po sezoni, ista oprema i ista pravila. Razlikuju se po zgradi, rasporedu i kvadraturi.')}

<section class="sekcija" data-tema="sneg">
  <div class="omot">
    <div class="jedinice">{''.join(kartica_jedinice(a) for a in APARTMANI)}</div>
  </div>
</section>

<section class="sekcija sekcija--tanja" data-tema="papir">
  <div class="omot">
    <div class="zaglavlje-sekcije otkrij">
      <h2>Jedno pored drugog</h2>
      <div class="zaglavlje-sporedno"><p class="tih sitno">Ako vam je svejedno koja jedinica, pošaljite upit sa datumima i predložićemo ono što je slobodno.</p></div>
    </div>
    <div style="overflow-x:auto">
      <table class="tabela-uslova">
        <thead><tr><th>Jedinica</th><th>Zgrada</th><th>Površina</th><th>Ležajevi</th><th>Po čemu se razlikuje</th></tr></thead>
        <tbody>{redovi}</tbody>
      </table>
    </div>
    <p class="nagovestaj" style="margin-top:2rem">Sve tri jedinice imaju jedno kupatilo, podno grejanje, punu kuhinju, francuski balkon i jedno mesto u zatvorenoj garaži. Najkraći boravak je dva noćenja, a kapacitet je četiri osobe i ne može da se prekorači.</p>
  </div>
</section>

{upitnik_sekcija(naslov='Recite nam termin, mi kažemo šta je slobodno', tema='sneg')}
"""
    return stranica(
        "/apartmani/",
        "Apartmani Kopaonik za 4 osobe | Tontić Lux",
        "Tri apartmana na Kopaoniku za do četiri osobe. Residence Hill 53 i 54 po 30 m², Milmari 35 m² sa dve sobe. Garaža, podno grejanje, puna kuhinja.",
        telo, aktivno="/apartmani/", booking=True,
        schema=mrvice([("/", "Početna"), ("/apartmani/", "Apartmani")]),
    )


def apartman_strana(a):
    ostali = [x for x in APARTMANI if x["slug"] != a["slug"]]
    opis_html = "".join(f"<p>{p}</p>" for p in a["opis"])
    oprema_html = "".join(
        f"<li>{IKONE['kvaka']}<span><b style='font-weight:500'>{n}.</b> {t}</span></li>" for n, t in OPREMA
    )
    schema = schema_json({
        "@context": "https://schema.org",
        "@type": "Apartment",
        "name": a["naziv"],
        "url": f"{DOMEN}/apartmani/{a['slug']}/",
        "image": f"{DOMEN}/assets/img/{a['slike'][0][0]}",
        "description": a["kratko"],
        "floorSize": {"@type": "QuantitativeValue", "value": a["kvadratura"], "unitCode": "MTK"},
        "occupancy": {"@type": "QuantitativeValue", "maxValue": a["max_gostiju"], "unitText": "osoba"},
        "numberOfBathroomsTotal": 1,
        "petsAllowed": False,
        "address": {"@type": "PostalAddress", "streetAddress": a["zgrada"], "addressLocality": "Kopaonik", "addressCountry": "RS"},
        "amenityFeature": [
            {"@type": "LocationFeatureSpecification", "name": n, "value": True} for n, _ in OPREMA
        ],
    }) + mrvice([("/", "Početna"), ("/apartmani/", "Apartmani"), (f"/apartmani/{a['slug']}/", a["naziv"])])

    telo = f"""
{naslov_strane(f'<a href="/apartmani/">Apartmani</a> / {a["naziv"]}', a["naziv"], a["kratko"])}

<section class="sekcija sekcija--tanja" data-tema="sneg">
  <div class="omot">
    {traka_slika(a['slike'], a['slug'])}
  </div>
</section>

<section class="sekcija" data-tema="papir">
  <div class="omot">
    <div class="mreza" style="align-items:start">
      <div class="otkrij telo-usko k-sedam">
        <h2 style="margin-bottom:1.5rem">Kako izgleda boravak</h2>
        {opis_html}
        <ul class="spisak-kvaka" style="margin-top:2rem">{oprema_html}</ul>
      </div>
      <div class="otkrij k-desno9" data-kasni="1">
        <div class="tabela-omot"><table class="tabela-uslova">
          <tbody>
            <tr><th>Zgrada</th><td>{a['zgrada']}</td></tr>
            <tr><th>Sprat</th><td>{a['sprat']}</td></tr>
            <tr><th>Površina</th><td class="broj">{a['kvadratura']} m²</td></tr>
            <tr><th>Gosti</th><td>do {a['max_gostiju']} osobe</td></tr>
            <tr><th>Ležajevi</th><td>{a['lezajevi']}</td></tr>
            <tr><th>Kupatilo</th><td>1</td></tr>
            <tr><th>Garaža</th><td>1 zatvoreno mesto</td></tr>
            <tr><th>Najkraći boravak</th><td>2 noćenja</td></tr>
            <tr><th>Prijava</th><td>od 15 do 20 časova</td></tr>
            <tr><th>Odjava</th><td>do 10 časova</td></tr>
          </tbody>
        </table></div>
        <a class="dugme dugme--puno" href="#upit" style="margin-top:1.5rem">Proverite termin</a>
      </div>
    </div>
  </div>
</section>

{upitnik_sekcija(naslov=f'Upit za {a["naziv"]}',
                 uvod='Jedinica je već izabrana. Dodajte datume i broj gostiju, javljamo se sa cenom za taj termin.',
                 tema='sneg', predizbor=a['slug'])}

<section class="sekcija sekcija--tanja" data-tema="papir">
  <div class="omot">
    <div class="zaglavlje-sekcije otkrij"><h2>Druge dve jedinice</h2></div>
    <div class="jedinice" style="grid-template-columns:repeat(auto-fit,minmax(280px,1fr))">
      {''.join(kartica_jedinice(x) for x in ostali)}
    </div>
  </div>
</section>
"""
    naslovi = {
        "tonticlux-53": "TonticLux 53, Residence Hill Kopaonik | Tontić Lux",
        "tonticlux-54": "TonticLux 54, Residence Hill Kopaonik | Tontić Lux",
        "tonticlux-milmari": "TonticLux Milmari Resort | Apartman sa spa centrom",
    }
    return stranica(
        f"/apartmani/{a['slug']}/",
        naslovi[a["slug"]],
        f"{a['naziv']}, {a['kvadratura']} m² na Kopaoniku, {a['zgrada']}. {a['kratko']}",
        telo, aktivno="/apartmani/", schema=schema, booking=True, og_slika=a["slike"][0][0],
    )


# ---------------------------------------------------------------- SADRŽAJI
def sadrzaji():
    oprema_html = "".join(
        f'<article class="razlog otkrij"><h3>{n}</h3><p>{t}</p></article>' for n, t in OPREMA
    )
    telo = f"""
{naslov_strane('Sadržaji', 'Šta ide uz boravak, a šta se plaća posebno',
               'Bez sitnih slova. Ovo je sve što dobijate u ceni i sve što se plaća na licu mesta.')}

<section class="sekcija" data-tema="sneg">
  <div class="omot">
    <div class="mreza">
      <div class="otkrij telo-usko k-levo">
        <h2 style="margin-bottom:1.5rem">U ceni</h2>
        <p class="tih">Cena se računa po apartmanu za sve goste u njemu. Boravišna taksa je uračunata. Parking u zatvorenoj garaži, posteljina, peškiri i internet takođe.</p>
        <ul class="spisak-kvaka" style="margin-top:1.5rem">
          <li>{IKONE['kvaka']}<span>Jedno mesto u zatvorenoj garaži kompleksa</span></li>
          <li>{IKONE['kvaka']}<span>Boravišna taksa</span></li>
          <li>{IKONE['kvaka']}<span>Posteljina i peškiri</span></li>
          <li>{IKONE['kvaka']}<span>Bežični internet</span></li>
          <li>{IKONE['kvaka']}<span>Korišćenje kuhinje sa punim priborom</span></li>
        </ul>
      </div>
      <div class="otkrij telo-usko k-desno" data-kasni="1">
        <h2 style="margin-bottom:1.5rem">Plaća se posebno</h2>
        <p class="tih">Ovo nije deo cene smeštaja i plaća se tamo gde se koristi.</p>
        <ul class="spisak-kvaka" style="margin-top:1.5rem">
          <li>{IKONE['kvaka']}<span>Ulaz u spa centar, na licu mesta</span></li>
          <li>{IKONE['kvaka']}<span>Karta za ski bus, u busu</span></li>
          <li>{IKONE['kvaka']}<span>Ski pass i oprema</span></li>
        </ul>
        <p class="nagovestaj" style="margin-top:2rem">Kartica radi samo na recepciji N Lux zgrade u Milmari Resortu i recepcija naplaćuje svoju uslugu na tu transakciju. Residence Hill nema recepciju, pa se tamo plaća transferom ili gotovinom.</p>
      </div>
    </div>
  </div>
</section>

<section class="sekcija sekcija--tanja" data-tema="papir">
  <div class="omot">
    <div class="zaglavlje-sekcije otkrij">
      <h2>Oprema apartmana</h2>
      <div class="zaglavlje-sporedno"><p class="tih sitno">Isto u sve tri jedinice.</p></div>
    </div>
    <div class="razlozi" style="grid-template-columns:repeat(auto-fit,minmax(260px,1fr))">{oprema_html}</div>
  </div>
</section>

<section class="sekcija" data-tema="noc">
  <div class="omot">
    <div class="par">
      <div class="par__slika otkrij">{slika('spa-03.jpg', 'Topla veza do spa centra u Milmari Resortu')}</div>
      <div class="par__tekst otkrij" data-kasni="1">
        <h2>Spa centar</h2>
        <p class="tih">Nalazi se u Milmari Resortu. Gosti apartmana u toj zgradi do njega stižu iznutra, bez izlaska napolje. Gosti apartmana 53 i 54 iz Residence Hilla takođe mogu da ga koriste.</p>
        <p class="tih">Ne zakazuje se unapred. Ulaz se plaća na licu mesta i nije deo cene smeštaja.</p>
      </div>
    </div>
  </div>
</section>

<section class="sekcija" data-tema="sneg">
  <div class="omot">
    <div class="zaglavlje-sekcije otkrij">
      <h2>Pravila boravka</h2>
      <div class="zaglavlje-sporedno"><p class="tih sitno">Kratka su i postoje da bi svima bilo mirno.</p></div>
    </div>
    <table class="tabela-uslova">
      <tbody>
        <tr><th>Prijava</th><td>od 15 do 20 časova</td></tr>
        <tr><th>Odjava</th><td>do 10 časova</td></tr>
        <tr><th>Najkraći boravak</th><td>2 noćenja</td></tr>
        <tr><th>Kapacitet</th><td>4 osobe po apartmanu, prekoračenje nije dozvoljeno</td></tr>
        <tr><th>Deca</th><td>Dobrodošla. Računaju se u broj gostiju i ulaze u cenu.</td></tr>
        <tr><th>Kućni ljubimci</th><td>Nisu dozvoljeni</td></tr>
        <tr><th>Tišina</th><td>od 21 do 8 časova, bez glasne muzike</td></tr>
        <tr><th>Proslave</th><td>Žurke i slavlja nisu dozvoljeni</td></tr>
        <tr><th>Depozit</th><td>Ne traži se</td></tr>
        <tr><th>Plaćanje</th><td>Bankovni transfer ili gotovina. Kartica samo na recepciji N Lux.</td></tr>
        <tr><th>Otkazivanje</th><td>Besplatno do 14 dana pre dolaska, posle toga pun iznos</td></tr>
      </tbody>
    </table>
  </div>
</section>

{upitnik_sekcija(naslov='Ostalo je još da izaberete termin', tema='papir')}
"""
    return stranica(
        "/sadrzaji/",
        "Sadržaji i pravila | Apartmani Tontić Lux Kopaonik",
        "Šta ide u cenu apartmana na Kopaoniku, a šta se plaća posebno. Garaža, spa, podno grejanje, pravila prijave, otkazivanja i plaćanja.",
        telo, aktivno="/sadrzaji/", booking=True,
        schema=mrvice([("/", "Početna"), ("/sadrzaji/", "Sadržaji")]),
    )


# ---------------------------------------------------------------- GALERIJA
def galerija():
    grupe = [
        ("Residence Hill 53", [s for s in APARTMANI[0]["slike"]]),
        ("Residence Hill 54", [s for s in APARTMANI[1]["slike"]]),
        ("Milmari N Lux", [s for s in APARTMANI[2]["slike"]]),
        ("Kompleks i garaža", [("zgrada-01.jpg", "Residence Hill, večernji kadar"),
                               ("zgrada-02.jpg", "Milmari Resort"),
                               ("zgrada-03.jpg", "Prilaz i ulaz u zgradu"),
                               ("garaza-01.jpg", "Zatvoreno parking mesto"),
                               ("garaza-02.jpg", "Ulaz u garažu iz kompleksa")]),
        ("Spa centar", [("spa-01.jpg", "Spa centar u Milmari Resortu"),
                        ("spa-02.jpg", "Prostor za odmor"),
                        ("spa-03.jpg", "Topla veza iz zgrade")]),
        ("Okolina", [("okolina-01.jpg", "Pogled na planinu sa balkona"),
                     ("okolina-02.jpg", "Staza i žičara"),
                     ("okolina-03.jpg", "Kompleks u snegu"),
                     ("okolina-04.jpg", "Kopaonik leti")]),
    ]
    delovi = []
    for naslov, slike in grupe:
        dugmad = []
        for i, (f, o) in enumerate(slike):
            klasa = "siroka" if i == 0 else ("visoka" if i == 3 else "")
            dugmad.append(
                f'<button type="button" class="{klasa}" data-svetlo="{naslov}" data-opis="{o}" '
                f'data-puna="/assets/img/{f}" aria-label="Uvećaj: {o}">{slika(f, o)}</button>'
            )
        delovi.append(
            f'<div class="otkrij" style="margin-bottom:clamp(3rem,7vw,5rem)">'
            f'<h2 style="font-size:var(--t-h3);font-family:var(--pismo-telo);font-weight:500;margin-bottom:1.25rem">{naslov}</h2>'
            f'<div class="mozaik">{"".join(dugmad)}</div></div>'
        )

    telo = f"""
{naslov_strane('Galerija', 'Fotografije apartmana, kompleksa i okoline',
               'Sve slike su iz naših jedinica. Kliknite na bilo koju da je vidite u punoj veličini.')}
<section class="sekcija" data-tema="sneg">
  <div class="omot">{''.join(delovi)}</div>
</section>
{upitnik_sekcija(naslov='Dopalo vam se? Pitajte za termin', tema='papir')}
"""
    return stranica(
        "/galerija/",
        "Galerija | Apartmani Tontić Lux Kopaonik",
        "Fotografije apartmana Tontić Lux na Kopaoniku, kompleksa Residence Hill i Milmari Resort, garaže, spa centra i okoline.",
        telo, aktivno="/galerija/", booking=True,
        schema=mrvice([("/", "Početna"), ("/galerija/", "Galerija")]),
    )


# ---------------------------------------------------------------- LOKACIJA
def lokacija():
    telo = f"""
{naslov_strane('Lokacija', 'Gde smo na Kopaoniku i kako se stiže',
               'Dve zgrade u istom delu Kopaonika. Tri kilometra do žičare, pet do centra, ski bus staje kod kompleksa.')}

<section class="sekcija" data-tema="led">
  <div class="omot">
    <ul class="daljine otkrij" style="grid-template-columns:repeat(auto-fit,minmax(200px,1fr))">
      <li><b class="broj">3 km</b><span>Do žičare, oko 5 minuta vožnje</span></li>
      <li><b class="broj">5 km</b><span>Do centra Kopaonika, oko 10 minuta</span></li>
      <li><b class="broj">30 min</b><span>Razmak između polazaka ski busa</span></li>
      <li><b>U kompleksu</b><span>Spa centar, prodavnica, apoteka i restoran u blizini</span></li>
    </ul>
  </div>
</section>

<section class="sekcija" data-tema="sneg">
  <div class="omot">
    <div class="mreza" style="align-items:start">
      <div class="otkrij k-levo">
        <h2 style="margin-bottom:1.25rem">Residence Hill, jedinice 53 i 54</h2>
        <p class="tih">Treći sprat, dve jedinice vrata do vrata. Zgrada nema recepciju, pa se ključ i sve oko dolaska dogovara direktno sa nama. Plaćanje karticom ovde nije moguće.</p>
        <div class="okvir-mape" data-mapa="residence_hill" style="margin-top:1.5rem">
          <div class="mapa-zamena">
            <span>Mapa se otvara u Google Maps aplikaciji</span>
            <a class="dugme dugme--prazno" href="https://www.google.com/maps/search/?api=1&amp;query=Residence+Hill+Kopaonik" target="_blank" rel="noopener">Otvori mapu</a>
          </div>
        </div>
      </div>
      <div class="otkrij k-desno" data-kasni="1">
        <h2 style="margin-bottom:1.25rem">Milmari Resort, N Lux 68</h2>
        <p class="tih">Prvi sprat, do njega se ide stepenicama. U ovom kompleksu je spa centar, a na recepciji N Lux zgrade radi i plaćanje karticom, uz naknadu koju naplaćuje recepcija.</p>
        <div class="okvir-mape" data-mapa="milmari" style="margin-top:1.5rem">
          <div class="mapa-zamena">
            <span>Mapa se otvara u Google Maps aplikaciji</span>
            <a class="dugme dugme--prazno" href="https://www.google.com/maps/search/?api=1&amp;query=Milmari+Resort+Kopaonik" target="_blank" rel="noopener">Otvori mapu</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="sekcija" data-tema="papir">
  <div class="omot">
    <div class="par">
      <div class="par__slika otkrij">{slika('okolina-03.jpg', 'Kompleks na Kopaoniku pod snegom')}</div>
      <div class="par__tekst otkrij" data-kasni="1">
        <h2>Dolazak iz Beograda</h2>
        <p class="tih">Do Kopaonika vodi više puteva i zimi su prohodni. Ako krenete ujutru, stižete pre prijave, pa možete da ostavite stvari i da se popnete na planinu isti dan.</p>
        <p class="tih">Kada budete blizu, javite se porukom. Sačekaćemo vas i pokazati vam ulaz u garažu, da ne tražite parking u snegu prvi put.</p>
        <div style="display:flex;gap:.6rem;flex-wrap:wrap;margin-top:1.5rem">
          <a class="dugme" data-veza="whatsapp" href="#" target="_blank" rel="noopener">Pišite na WhatsApp</a>
          <a class="dugme dugme--prazno" data-veza="telefon1" href="#">Pozovite 063 877 3363</a>
        </div>
      </div>
    </div>
  </div>
</section>

{upitnik_sekcija(naslov='Znate kada dolazite? Pitajte za termin', tema='sneg')}
"""
    return stranica(
        "/lokacija/",
        "Gde smo na Kopaoniku, mapa i dolazak | Tontić Lux",
        "Apartmani Tontić Lux na Kopaoniku: Residence Hill i Milmari Resort. Tri kilometra do žičare, pet do centra, ski bus staje kod kompleksa.",
        telo, aktivno="/lokacija/", booking=True,
        schema=mrvice([("/", "Početna"), ("/lokacija/", "Lokacija")]),
    )


# ---------------------------------------------------------------- FAQ
def faq():
    schema = schema_json({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {"@type": "Question", "name": p,
             "acceptedAnswer": {"@type": "Answer", "text": o}}
            for p, o in PITANJA_SVE
        ],
    }) + mrvice([("/", "Početna"), ("/faq/", "Pitanja")])

    telo = f"""
{naslov_strane('Pitanja', 'Česta pitanja gostiju',
               'Odgovori koje inače dajemo telefonom. Ako nešto ne piše ovde, pitajte, javljamo se brzo.')}
<section class="sekcija" data-tema="sneg">
  <div class="omot">
    <div style="max-width:min(100%,72ch)">{pitanja_blok(PITANJA_SVE, otvoreno_prvo=True)}</div>
  </div>
</section>
{upitnik_sekcija(naslov='Nema odgovora na vaše pitanje?', uvod='Napišite ga u polje za napomenu. Odgovaramo za 1 do 4 sata.', tema='papir')}
"""
    return stranica(
        "/faq/",
        "Česta pitanja | Apartmani Tontić Lux Kopaonik",
        "Parking, spa, daljina od staze, plaćanje, otkazivanje i kućni red. Odgovori na pitanja koja gosti najčešće postavljaju pre rezervacije.",
        telo, aktivno="/faq/", schema=schema, booking=True,
    )


# ---------------------------------------------------------------- REZERVACIJA
def rezervacija():
    telo = f"""
{naslov_strane('Upit', 'Pošaljite upit za boravak',
               'Popunjavate jednom. Posle birate da li upit ide nama, na WhatsApp ili na Viber, sa istim podacima.')}

{upitnik_sekcija(naslov='Vaš termin', uvod='Cene se razlikuju po sezoni i po praznicima, pa ih šaljemo uz odgovor na upit.', tema='sneg')}

<section class="sekcija sekcija--tanja" data-tema="papir">
  <div class="omot">
    <div class="mreza" style="align-items:start">
      <div class="otkrij k-levo">
        <h2 style="margin-bottom:1.25rem">Ako vam je lakše direktno</h2>
        <p class="tih">Javljamo se i telefonom i porukom. Milica odgovara na upite, obično za 1 do 4 sata, u toku dana.</p>
        <ul class="podaci" style="grid-template-columns:1fr;margin-top:1.5rem;border-top:0;padding-top:0">
          <li><span>Telefon</span> <a data-veza="telefon1" data-upisi href="#">063 877 3363</a></li>
          <li><span>Drugi broj</span> <a data-veza="telefon2" data-upisi href="#">065 802 2270</a></li>
          <li><span>Email</span> <a data-veza="email" data-upisi href="#">tonticlux@gmail.com</a></li>
          <li><span>WhatsApp i Viber</span> <a data-veza="whatsapp" href="#" target="_blank" rel="noopener">063 877 3363</a></li>
        </ul>
      </div>
      <div class="otkrij k-desno" data-kasni="1">
        <h2 style="margin-bottom:1.25rem">Šta sledi posle upita</h2>
        <p class="tih">Dobijate cenu za vaš termin i potvrdu da li je jedinica slobodna. Termin je rezervisan tek kada vam pošaljemo potvrdu, ne u trenutku slanja upita.</p>
        <p class="tih">Bez depozita i bez avansa. Otkazivanje je besplatno do 14 dana pre dolaska, posle toga se naplaćuje pun iznos.</p>
      </div>
    </div>
  </div>
</section>
"""
    return stranica(
        "/rezervacija/",
        "Upit za boravak | Apartmani Tontić Lux Kopaonik",
        "Pošaljite upit za apartman na Kopaoniku. Termin, broj gostiju i kontakt, pa odgovor za 1 do 4 sata. WhatsApp, Viber ili mejl.",
        telo, aktivno="/rezervacija/", booking=True,
        schema=mrvice([("/", "Početna"), ("/rezervacija/", "Upit")]),
    )


# ---------------------------------------------------------------- 404
def stranica_404():
    telo = f"""
{naslov_strane('Greška 404', 'Ova strana ne postoji',
               'Možda je adresa pogrešno prekucana ili je strana uklonjena.')}
<section class="sekcija" data-tema="sneg">
  <div class="omot">
    <div style="display:flex;gap:.6rem;flex-wrap:wrap">
      <a class="dugme" href="/">Nazad na početnu</a>
      <a class="dugme dugme--prazno" href="/apartmani/">Apartmani</a>
      <a class="dugme dugme--prazno" href="/rezervacija/">Pošaljite upit</a>
    </div>
  </div>
</section>
"""
    return stranica("/404.html", "Strana nije pronađena | Tontić Lux",
                    "Tražena strana ne postoji.", telo)


# ---------------------------------------------------------------- upis
STRANICE = {
    "index.html": pocetna,
    "apartmani/index.html": apartmani_pregled,
    "sadrzaji/index.html": sadrzaji,
    "galerija/index.html": galerija,
    "lokacija/index.html": lokacija,
    "faq/index.html": faq,
    "rezervacija/index.html": rezervacija,
    "404.html": stranica_404,
}


def relativne_putanje(html, putanja):
    """Pretvara putanje od korena (/css/main.css) u relativne (../css/main.css).

    Razlog: sajt tako radi i kada se index.html otvori duplim klikom sa diska,
    i kada stoji u podfolderu na hostingu. Folderi dobijaju index.html na kraj
    jer file:// ne zna da sam otvori index iz foldera.
    Apsolutne adrese (https://, mailto:, tel:, #) se ne diraju.
    """
    dubina = putanja.count("/")
    baza = "../" * dubina

    def zameni(m):
        atribut, puna = m.group(1), m.group(2)
        deo, _, rep = puna.partition("?")
        if not rep:
            deo, _, sidro = puna.partition("#")
            rep = ("#" + sidro) if sidro else ""
        else:
            rep = "?" + rep
        put = deo.lstrip("/")
        if put == "" or put.endswith("/"):
            put += "index.html"
        return '%s="%s%s%s"' % (atribut, baza, put, rep)

    return re.sub(r'\b(href|src|data-veza)="(/(?!/)[^"]*)"', zameni, html)


def upisi(putanja, sadrzaj):
    if putanja.endswith(".html"):
        sadrzaj = relativne_putanje(sadrzaj, putanja)
    p = os.path.join(KOREN, putanja)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with open(p, "w", encoding="utf-8") as f:
        f.write(sadrzaj)
    return putanja


def main():
    napravljeno = []
    for putanja, fn in STRANICE.items():
        napravljeno.append(upisi(putanja, fn()))
    for a in APARTMANI:
        napravljeno.append(upisi(f"apartmani/{a['slug']}/index.html", apartman_strana(a)))

    # sitemap
    adrese = ["/", "/apartmani/", "/sadrzaji/", "/galerija/", "/lokacija/", "/faq/", "/rezervacija/"]
    adrese += [f"/apartmani/{a['slug']}/" for a in APARTMANI]
    sm = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    for u in adrese:
        prio = "1.0" if u == "/" else ("0.9" if "apartmani" in u or u == "/rezervacija/" else "0.7")
        sm += f"  <url><loc>{DOMEN}{u}</loc><changefreq>monthly</changefreq><priority>{prio}</priority></url>\n"
    sm += "</urlset>\n"
    napravljeno.append(upisi("sitemap.xml", sm))
    napravljeno.append(upisi("robots.txt",
        f"User-agent: *\nAllow: /\n\nSitemap: {DOMEN}/sitemap.xml\n"))

    print("Napravljeno %d fajlova:" % len(napravljeno))
    for n in napravljeno:
        print("  " + n)


if __name__ == "__main__":
    main()
