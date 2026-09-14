# QA, šta je provereno i šta se proverava pred lansiranje

## Automatski, skriptom `build/qa.py`

Skripta otvara pravi pregledač (Chromium), prolazi sve stranice na širini
1440 i na 390 piksela i pada ako nešto ne valja. Trenutno prolazi sve.

Proverava:
- svaka stranica se učita bez greške u konzoli
- nema vodoravnog prelivanja ni na jednoj širini
- svaka slika ima alt tekst, nema praznih linkova
- svaka stranica ima naslov, opis, jedan `h1` i podatke za deljenje linka
- upitnik: izbor jedinice, kalendar, najkraći boravak od dve noći, obavezan
  uzrast deteta, provera imena, mejla i telefona, prelazak kroz sva četiri
  koraka, pamćenje unetog posle osvežavanja stranice
- rezervno slanje kada backend nije podešen
- meni na telefonu se otvara i zatvara, radi sa tastature
- galerija se otvara, menja slike strelicama i zatvara tasterom Escape

Pokretanje:

```
cd tonticlux
python3 -m http.server 8777 &
python3 build/qa.py
```

Snimci ekrana ostaju u folderu `qa`.

## Ručno, pre nego što sajt ide uživo

- [ ] prave fotografije na svim mestima, nijedna privremena nije ostala
- [ ] cene upisane ili svesna odluka da ih nema
- [ ] `config.js`: telefoni, mejl, WhatsApp broj, Instagram, domen
- [ ] `config.js`: adresa Apps Script aplikacije upisana
- [ ] probni upit stigao u tabelu i na mejl
- [ ] probni upit preko WhatsApp dugmeta otvara poruku sa popunjenim podacima
- [ ] mape pokazuju tačne zgrade
- [ ] sajt otvoren na pravom telefonu, ne samo u pregledaču
- [ ] svi brojevi telefona pozvani klikom sa telefona
- [ ] tekst pročitan naglas, nijedna rečenica ne obećava ono što ne stoji
- [ ] `robots.txt` i `sitemap.xml` pokazuju na pravi domen
- [ ] Google Search Console: sajt dodat i sitemap poslat
