"""
Generise privremene fotografije (placeholder) u brendiranim bojama.
Kada stignu prave fotografije, zameniti fajlove ISTIM imenima u /assets/img/.
"""
import os
from PIL import Image, ImageDraw, ImageFont

OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "assets", "img")
os.makedirs(OUT, exist_ok=True)

FONT_PATHS = [
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSansCondensed.ttf",
]


def font(size):
    for p in FONT_PATHS:
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()


# tema: (gornja boja, donja boja, boja teksta)
TEME = {
    "noc": ((26, 23, 20), (44, 38, 32), (214, 203, 188)),
    "led": ((27, 42, 51), (58, 82, 95), (198, 216, 226)),
    "sneg": ((250, 247, 242), (231, 223, 211), (109, 97, 80)),
    "bronza": ((93, 74, 48), (139, 111, 71), (245, 238, 228)),
}


def gradient(w, h, tema):
    gore, dole, _ = TEME[tema]
    img = Image.new("RGB", (1, h))
    d = ImageDraw.Draw(img)
    for y in range(h):
        t = y / max(1, h - 1)
        d.point((0, y), fill=tuple(int(gore[i] + (dole[i] - gore[i]) * t) for i in range(3)))
    return img.resize((w, h), Image.BILINEAR)


def napravi(ime, w, h, tema, naslov, potpis):
    img = gradient(w, h, tema)
    d = ImageDraw.Draw(img, "RGBA")
    boja = TEME[tema][2]

    # tanak okvir
    m = max(12, int(min(w, h) * 0.035))
    d.rectangle([m, m, w - m, h - m], outline=boja + (70,), width=1)

    # horizont linija, blagi nagovestaj planine
    hy = int(h * 0.62)
    d.line([(m, hy), (w - m, hy)], fill=boja + (45,), width=1)

    f1 = font(max(16, int(min(w, h) * 0.055)))
    f2 = font(max(11, int(min(w, h) * 0.028)))

    tx, ty = m + int(m * 0.8), int(h * 0.68)
    d.text((tx, ty), naslov, font=f1, fill=boja + (235,))
    d.text((tx, ty + int(f1.size * 1.5)), potpis, font=f2, fill=boja + (150,))

    img.save(os.path.join(OUT, ime), "JPEG", quality=72, optimize=True)
    return ime


SLIKE = [
    # hero
    ("hero.jpg", 2000, 1250, "noc", "HERO", "Pogled sa francuskog balkona, zimska fotografija"),
    ("hero-mobile.jpg", 1200, 1600, "noc", "HERO / telefon", "Vertikalni kadar, pogled ili enterijer"),
    ("hero-leto.jpg", 2000, 1250, "led", "HERO / leto", "Ista scena u letnjem periodu"),
    # jedinice
    ("ap53-01.jpg", 1600, 1100, "sneg", "TonticLux 53", "Dnevni deo, pokretni pregradni zid otvoren"),
    ("ap53-02.jpg", 1600, 1100, "sneg", "TonticLux 53", "Bracni krevet sa posteljinom"),
    ("ap53-03.jpg", 1100, 1400, "sneg", "TonticLux 53", "Kuhinja, rerna i masina za sudove"),
    ("ap53-04.jpg", 1600, 1100, "sneg", "TonticLux 53", "Kupatilo"),
    ("ap53-05.jpg", 1600, 1100, "led", "TonticLux 53", "Francuski balkon i pogled"),
    ("ap53-06.jpg", 1100, 1400, "sneg", "TonticLux 53", "Detalj, sef ili radni ugao"),
    ("ap54-01.jpg", 1600, 1100, "sneg", "TonticLux 54", "Dnevni deo"),
    ("ap54-02.jpg", 1600, 1100, "sneg", "TonticLux 54", "Bracni krevet"),
    ("ap54-03.jpg", 1100, 1400, "sneg", "TonticLux 54", "Kuhinja"),
    ("ap54-04.jpg", 1600, 1100, "sneg", "TonticLux 54", "Kupatilo"),
    ("ap54-05.jpg", 1600, 1100, "led", "TonticLux 54", "Francuski balkon i pogled"),
    ("ap54-06.jpg", 1100, 1400, "sneg", "TonticLux 54", "Detalj"),
    ("milmari-01.jpg", 1600, 1100, "sneg", "TonticLux Milmari", "Dnevna soba"),
    ("milmari-02.jpg", 1600, 1100, "sneg", "TonticLux Milmari", "Spavaca soba, bracni krevet"),
    ("milmari-03.jpg", 1100, 1400, "sneg", "TonticLux Milmari", "Kuhinja"),
    ("milmari-04.jpg", 1600, 1100, "sneg", "TonticLux Milmari", "Kupatilo"),
    ("milmari-05.jpg", 1600, 1100, "led", "TonticLux Milmari", "Balkon, pogled na planinu"),
    ("milmari-06.jpg", 1100, 1400, "sneg", "TonticLux Milmari", "Drugi lezaj na razvlacenje"),
    # objekat
    ("zgrada-01.jpg", 1600, 1100, "noc", "Residence Hill", "Zgrada spolja, vecernji kadar"),
    ("zgrada-02.jpg", 1600, 1100, "led", "Milmari Resort", "Zgrada spolja"),
    ("zgrada-03.jpg", 1600, 1100, "led", "Ulaz", "Prilaz i ulaz u zgradu"),
    ("garaza-01.jpg", 1600, 1100, "noc", "Garaza", "Zatvoreno parking mesto"),
    ("garaza-02.jpg", 1600, 1100, "noc", "Garaza", "Ulaz u garazu iz kompleksa"),
    ("spa-01.jpg", 1600, 1100, "bronza", "Spa", "Bazen ili sauna u Milmari Resortu"),
    ("spa-02.jpg", 1100, 1400, "bronza", "Spa", "Detalj, prostor za odmor"),
    ("spa-03.jpg", 1600, 1100, "bronza", "Spa", "Hodnik, topla veza iz zgrade"),
    ("okolina-01.jpg", 1600, 1100, "led", "Okolina", "Pogled na planinu sa balkona"),
    ("okolina-02.jpg", 1600, 1100, "led", "Okolina", "Zicara ili staza"),
    ("okolina-03.jpg", 1600, 1100, "led", "Okolina", "Kompleks u snegu"),
    ("okolina-04.jpg", 1600, 1100, "sneg", "Okolina", "Leto na Kopaoniku"),
    ("og-cover.jpg", 1200, 630, "noc", "Tontic Lux", "Slika za deljenje na mrezama"),
]

if __name__ == "__main__":
    for s in SLIKE:
        napravi(*s)
    print("napravljeno:", len(SLIKE), "fajlova u", OUT)
