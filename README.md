# Apartmani Tontić Lux, Kopaonik

Sajt je čist HTML, CSS i JavaScript. Nema WordPress, nema Webflow, nema
mesečnu pretplatu. Stavlja se na bilo koji hosting prevlačenjem foldera.

## Kako se otvara

Dvoklik na `index.html`. Sve putanje u sajtu su relativne, pa sajt radi i sa
diska, i sa hostinga, i iz podfoldera.

Jedina razlika je forma. Kada se sajt otvori sa diska, slanje upita na Google
tabelu ne radi jer pregledač blokira takav zahtev sa `file://` adrese. Sve
ostalo radi. Ako hoćete da probate i formu lokalno, pokrenite mali server:

```
cd tonticlux
python3 -m http.server 8777
```

Pa u pregledaču otvorite `http://localhost:8777`.

## Šta gde stoji

```
index.html              početna
apartmani/              spisak i tri stranice jedinica
sadrzaji/               šta ide uz boravak
galerija/               fotografije
lokacija/               kako se stiže, mape
faq/                    česta pitanja
rezervacija/            upitnik
404.html                stranica za pogrešnu adresu

css/main.css            ceo izgled sajta
js/config.js            PODEŠAVANJA, jedini fajl koji menja vlasnik
js/app.js               meni, galerija, animacije
js/booking.js           upitnik i slanje

assets/img/             fotografije
google-apps-script/     kod koji prima upite u Google tabelu
docs/                   uputstva
build/                  alati za generisanje stranica i za testiranje
```

Folder `build` nije potreban da bi sajt radio. On samo sastavlja HTML
stranice iz zajedničkih delova, da se zaglavlje i podnožje ne prepisuju
devet puta. Ako menjate tekst, možete direktno u `.html` fajlu.

## Postavljanje na hosting

Prekopirajte sve osim foldera `build` i `docs` u glavni folder hostinga
(obično `public_html`). Sajt radi odmah. Ako koristite Netlify ili
Cloudflare Pages, prevucite folder na njihovu stranicu.

Obavezno uključite HTTPS. Bez toga forma u nekim pregledačima neće raditi.

## Šta vlasnik menja sam

Sve u `js/config.js`: telefone, mejl, Instagram, pravila boravka, vreme
odgovora, uključivanje Booking dugmeta. Fajl je napisan običnim jezikom i
svaka stavka ima objašnjenje iznad sebe.

Fotografije se menjaju tako što se nova slika nazove istim imenom i prebaci
preko stare. Spisak je u `docs/fotografije.md`.

## Forma i upiti

Upit sa sajta ide u Google tabelu i na mejl. Postavlja se jednom, uputstvo je
u `docs/uputstvo-google.md`. Dok to nije podešeno, forma i dalje radi ali
otvara mejl program gosta, pa ništa nije izgubljeno.

Gost posle popunjavanja bira da li upit ide mejlom, na WhatsApp ili na Viber.
Podaci su isti u sva tri slučaja, forma se popunjava jednom.

## Šta još fali

Spisak je u `docs/otvorena-pitanja.md`. Najvažnije su cene i prave fotografije.
