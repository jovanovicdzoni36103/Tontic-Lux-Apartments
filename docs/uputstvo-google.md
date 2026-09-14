# Google tabela i forma, uputstvo za postavljanje

Ovo se radi jednom, traje oko 15 minuta. Potreban je Google nalog vlasnika
(najbolje tonticlux@gmail.com, da mejlovi idu sa te adrese).

## 1. Napravite tabelu

1. Otvorite https://sheets.google.com i napravite novu tabelu.
2. Nazovite je `Tontić Lux upiti`.
3. Iz adrese u pregledaču prekopirajte ID tabele. Adresa izgleda ovako:
   `docs.google.com/spreadsheets/d/`**`1a2B3c4D5e6F...`**`/edit`
   Podebljani deo je ID.

## 2. Ubacite skriptu

1. U tabeli idite na `Proširenja` pa `Apps Script`.
2. Obrišite sve što piše u editoru.
3. Otvorite fajl `google-apps-script/Code.gs` iz ovog projekta, kopirajte ceo
   sadržaj i nalepite ga u editor.
4. Na vrhu fajla, u bloku `PODESAVANJA`, popunite:
   - `ID_TABELE` na ID iz koraka 1
   - `PRIMA` na adresu koja prima upite
   - `KOPIJA` na drugu adresu ili prazno `""` ako kopija ne treba
   - `POTVRDA_GOSTU` ostavite `true` da gost dobija automatsku potvrdu
5. Sačuvajte (ikonica diskete).

## 3. Pripremite kolone

1. U editoru, u padajućem spisku funkcija izaberite `pripremiTabelu`.
2. Kliknite `Pokreni`.
3. Google će tražiti dozvolu. Idite na `Napredno` pa `Idi na projekat`
   pa `Dozvoli`. To je normalno, skripta pripada vama.
4. Vratite se u tabelu. Dobili ste list `Upiti` sa zaglavljem, bojama po
   statusu i padajućim spiskom u koloni Status.

## 4. Objavite skriptu kao web aplikaciju

1. U editoru gore desno kliknite `Deploy` pa `New deployment`.
2. Kod `Select type` izaberite `Web app`.
3. Popunite:
   - Description: `Forma sa sajta`
   - Execute as: `Me`
   - Who has access: `Anyone`
     (mora `Anyone`, inače sajt ne može da pošalje upit. Skripta ne otvara
     tabelu nikome, samo prima podatke.)
4. Kliknite `Deploy`, pa prekopirajte adresu koja se završava na `/exec`.

## 5. Povežite sajt

1. Otvorite `js/config.js`.
2. Nađite red `skripta: "GOOGLE_SCRIPT_URL_OVDE",`.
3. Zamenite tekst u navodnicima adresom iz koraka 4.
4. Sačuvajte fajl i postavite ga na hosting.

## 6. Proverite

1. Na sajtu pošaljite probni upit sa svojim podacima.
2. Za nekoliko sekundi red treba da se pojavi u tabeli, a mejl u sandučetu.
3. Ako nešto ne radi, u editoru izaberite funkciju `testUpit` i pokrenite je.
   Ona upisuje probni red bez sajta, pa odmah vidite da li je problem u
   skripti ili u adresi u `config.js`.

## 7. Opciono, automatski podsetnici

Skripta ume da pošalje podsetnik gostu 3 dana pre dolaska i molbu za utisak
2 dana posle odlaska. Uključuje se ovako:

1. U editoru levo kliknite na sat (`Triggers`).
2. `Add Trigger`, funkcija `dnevniPosao`, izvor `Time-driven`,
   tip `Day timer`, vreme `8am to 9am`.
3. Sačuvajte.

Podsetnici idu samo za redove čiji je Status `Potvrđeno`.

## Kada se nešto menja

- Menjate `PODESAVANJA` u skripti: sačuvajte, pa `Deploy` pa
  `Manage deployments` pa olovka pa `Version: New version` pa `Deploy`.
  Adresa `/exec` ostaje ista.
- Menjate `config.js` na sajtu: samo prekopirajte fajl na hosting.
