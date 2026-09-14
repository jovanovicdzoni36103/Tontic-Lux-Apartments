# -*- coding: utf-8 -*-
"""Vizuelna i funkcionalna provera u pravom pregledacu."""
import os
import sys
from playwright.sync_api import sync_playwright

BAZA = "http://localhost:8777"
IZLAZ = "/home/claude/qa"
os.makedirs(IZLAZ, exist_ok=True)

STRANE = [
    ("/", "pocetna"),
    ("/apartmani/", "apartmani"),
    ("/apartmani/tonticlux-53/", "ap53"),
    ("/apartmani/tonticlux-milmari/", "milmari"),
    ("/sadrzaji/", "sadrzaji"),
    ("/galerija/", "galerija"),
    ("/lokacija/", "lokacija"),
    ("/faq/", "faq"),
    ("/rezervacija/", "rezervacija"),
]

greske = []


def zabelezi(strana, poruka):
    greske.append(strana + ": " + poruka)


def pregled(p, sirina, visina, sufiks, mobilni=False):
    b = p.chromium.launch()
    k = b.new_context(viewport={"width": sirina, "height": visina},
                      device_scale_factor=1,
                      is_mobile=mobilni, has_touch=mobilni)
    s = k.new_page()
    s.on("console", lambda m: zabelezi(s.url, "konzola " + m.type + ": " + m.text)
         if m.type == "error" else None)
    s.on("pageerror", lambda e: zabelezi(s.url, "greska: " + str(e)))

    for putanja, ime in STRANE:
        s.goto(BAZA + putanja, wait_until="networkidle")
        s.wait_for_timeout(700)
        # sve otkriveno, da se vidi cela strana na slici
        s.evaluate("document.querySelectorAll('.otkrij').forEach(e=>e.classList.add('vidljiv'))")
        s.wait_for_timeout(250)
        s.screenshot(path=os.path.join(IZLAZ, ime + "-" + sufiks + ".png"), full_page=True)

        # provera osnovnih stvari
        h1 = s.locator("h1").count()
        if h1 != 1:
            zabelezi(putanja, "broj H1 elemenata je " + str(h1))
        bez_alt = s.evaluate("Array.from(document.images).filter(i=>!i.alt && !i.hasAttribute('data-svetlo-slika')).length")
        if bez_alt:
            zabelezi(putanja, str(bez_alt) + " slika bez alt teksta")
        prazni = s.evaluate(
            "Array.from(document.querySelectorAll('a[href=\"#\"]')).filter(a=>!a.dataset.veza && !a.hasAttribute('data-uspeh-whatsapp') && !a.hasAttribute('data-greska-whatsapp') && !a.hasAttribute('data-greska-mejl')).length")
        if prazni:
            zabelezi(putanja, str(prazni) + " praznih linkova")
        prelivanje = s.evaluate("document.documentElement.scrollWidth - document.documentElement.clientWidth")
        if prelivanje > 2:
            zabelezi(putanja, "vodoravno prelivanje " + str(prelivanje) + " px")

    k.close()
    b.close()


def proba_upitnika(p):
    b = p.chromium.launch()
    s = b.new_page(viewport={"width": 1440, "height": 900})
    s.on("pageerror", lambda e: zabelezi("upitnik", "greska: " + str(e)))
    s.goto(BAZA + "/rezervacija/", wait_until="networkidle")

    # korak 1: apartman i datumi
    s.locator('[data-izbor] input[value="tonticlux-53"]').check()
    dani = s.locator(".dan:not([disabled])")
    ukupno = dani.count()
    if ukupno < 5:
        zabelezi("upitnik", "kalendar nema dovoljno dostupnih dana")
        b.close()
        return
    dani.nth(2).click()
    dani.nth(5).click()
    s.wait_for_timeout(200)

    sazetak = s.locator("[data-sazetak]").inner_text()
    if "noćenja" not in sazetak and "noćenje" not in sazetak:
        zabelezi("upitnik", "sazetak ne prikazuje nocenja: " + sazetak.replace("\n", " | "))

    # kratak boravak mora da bude odbijen
    s.locator("[data-ocisti]").click()
    dani = s.locator(".dan:not([disabled])")
    dani.nth(2).click()
    dani.nth(3).click()
    s.wait_for_timeout(200)
    if "2 noćenja" not in s.locator("[data-sazetak]").inner_text():
        zabelezi("upitnik", "minimum od 2 nocenja nije primenjen")

    s.locator("[data-napred]").click()
    s.wait_for_timeout(200)

    # korak 2: gosti
    s.locator('[data-vise="deca"]').click()
    s.wait_for_timeout(150)
    if s.locator("[data-uzrast]").count() != 1:
        zabelezi("upitnik", "nije se pojavilo polje za uzrast deteta")
    s.locator("[data-napred]").click()
    s.wait_for_timeout(200)
    if not s.locator('[data-greska-za="uzrasti"]').inner_text().strip():
        zabelezi("upitnik", "prazan uzrast deteta nije prijavljen kao greska")
    s.locator("[data-uzrast]").select_option("6")
    s.locator("[data-napred]").click()
    s.wait_for_timeout(250)

    # korak 3: pogresan unos
    s.locator('[data-polje="ime"]').fill("Nikola")
    s.locator('[data-polje="email"]').fill("nikola@")
    s.locator('[data-polje="telefon"]').fill("123")
    s.locator("[data-napred]").click()
    s.wait_for_timeout(200)
    for polje in ["ime", "email", "telefon"]:
        if not s.locator('[data-greska-za="' + polje + '"]').inner_text().strip():
            zabelezi("upitnik", "nevalidno polje " + polje + " nije prijavljeno")

    s.locator('[data-polje="ime"]').fill("Nikola Jovanović")
    s.locator('[data-polje="email"]').fill("nikola@primer.com")
    s.locator('[data-polje="telefon"]').fill("064 123 4567")
    s.locator('[data-polje="napomena"]').fill("Stižemo oko 19 časova.")
    s.locator("[data-napred]").click()
    s.wait_for_timeout(250)

    if s.locator('[data-panel="4"]').is_hidden():
        zabelezi("upitnik", "cetvrti korak se nije otvorio")

    # WhatsApp adresa
    adresa = s.evaluate("""() => {
      const d = document.querySelector('[data-whatsapp]');
      return d ? 'ima' : 'nema';
    }""")
    if adresa != "ima":
        zabelezi("upitnik", "nema WhatsApp dugmeta")

    if s.locator("[data-booking]").count() != 0:
        zabelezi("upitnik", "Booking dugme se prikazuje iako je iskljuceno u podesavanjima")

    s.screenshot(path=os.path.join(IZLAZ, "upitnik-korak4.png"), full_page=True)

    # pamcenje podataka posle osvezavanja
    s.reload(wait_until="networkidle")
    s.wait_for_timeout(400)
    vrednost = s.locator('[data-polje="ime"]').input_value()
    if vrednost != "Nikola Jovanović":
        zabelezi("upitnik", "podaci se ne pamte posle osvezavanja, dobijeno: " + vrednost)

    # slanje bez podesenog backenda mora da ponudi izlaz
    s.locator('[data-korak="4"]').click()
    s.wait_for_timeout(200)
    s.wait_for_timeout(1700)
    s.locator("[data-posalji]").click()
    s.wait_for_timeout(600)
    if s.locator("[data-stanje-greska]").is_hidden():
        zabelezi("upitnik", "bez backenda nije prikazana rezervna poruka")
    else:
        mejl = s.locator("[data-greska-mejl]").get_attribute("href")
        if not mejl or not mejl.startswith("mailto:"):
            zabelezi("upitnik", "rezervni mejl link nije ispravan")
    s.screenshot(path=os.path.join(IZLAZ, "upitnik-rezerva.png"), full_page=True)

    b.close()


def proba_menija(p):
    b = p.chromium.launch()
    s = b.new_page(viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True)
    s.goto(BAZA + "/", wait_until="networkidle")
    s.locator("[data-meni-dugme]").click()
    s.wait_for_timeout(600)
    if s.locator("[data-meni]").is_hidden():
        zabelezi("meni", "meni se nije otvorio na telefonu")
    s.screenshot(path=os.path.join(IZLAZ, "meni-mobilni.png"))
    s.keyboard.press("Escape")
    s.wait_for_timeout(400)
    if s.locator("[data-meni]").is_visible():
        zabelezi("meni", "meni se ne zatvara tasterom Escape")
    b.close()


def proba_galerije(p):
    b = p.chromium.launch()
    s = b.new_page(viewport={"width": 1440, "height": 900})
    s.goto(BAZA + "/galerija/", wait_until="networkidle")
    s.locator(".mozaik button").first.click()
    s.wait_for_timeout(500)
    if s.locator("dialog.svetlo").count() == 0 or not s.locator("dialog.svetlo").is_visible():
        zabelezi("galerija", "lightbox se nije otvorio")
    else:
        s.keyboard.press("ArrowRight")
        s.wait_for_timeout(300)
        s.screenshot(path=os.path.join(IZLAZ, "lightbox.png"))
        s.keyboard.press("Escape")
        s.wait_for_timeout(300)
        if s.locator("dialog.svetlo").is_visible():
            zabelezi("galerija", "lightbox se ne zatvara tasterom Escape")
    b.close()


with sync_playwright() as p:
    pregled(p, 1440, 900, "desktop")
    pregled(p, 390, 844, "mobilni", mobilni=True)
    proba_upitnika(p)
    proba_menija(p)
    proba_galerije(p)

print("=" * 60)
if greske:
    print("NALAZI (%d):" % len(greske))
    for g in sorted(set(greske)):
        print(" - " + g)
    sys.exit(1)
print("Sve provere prosle.")
