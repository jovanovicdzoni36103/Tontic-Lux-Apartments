/* ==========================================================================
   TONTIĆ LUX / PODEŠAVANJA
   Ovo je JEDINI fajl koji vlasnik menja za redovne izmene.
   Sve vrednosti napisane VELIKIM SLOVIMA sa "_OVDE" treba zameniti.
   ========================================================================== */

window.CONFIG = {
  /* ---- osnovno ---- */
  naziv: "Tontić Lux",
  naziv_pun: "Apartmani Tontić Lux, Kopaonik",
  domen: "https://tonticlux.rs",

  /* ---- kontakt ---- */
  telefon1: "+381638773363",
  telefon1_prikaz: "063 877 3363",
  telefon2: "+381658022270",
  telefon2_prikaz: "065 802 2270",
  whatsapp: "381638773363", // bez plusa i bez nula, format za wa.me
  viber: "+381638773363", // sa plusom
  email: "tonticlux@gmail.com",
  instagram: "https://www.instagram.com/tonticluxmilmari/",
  infokop:
    "https://www.eng.infokop.net/accommodation-apartments-vikend-nas-kopaonik/apartments-tonticlux.html",

  /* ---- backend za formu ----
     Zalepiti /exec adresu Google Apps Script web aplikacije.
     Uputstvo: docs/uputstvo-google.md
     Dok ovde stoji GOOGLE_SCRIPT_URL_OVDE, forma se prebacuje na
     rezervni način slanja (otvara mejl program gosta). */
  skripta:
    "https://script.google.com/macros/s/AKfycbxKNdfD8B7twPtQWSY8pMBetSM0QFO4oSuPlN2VTt2y5jPHjbn7RJRO6tm-JPRChfTg/exec",

  /* ---- Booking.com ----
     ukljucen: false dok se ne dobije stvarna adresa objekta na Booking-u.
     Dok je false, dugme "Proveri na Booking-u" se ne prikazuje nigde na sajtu.
     nacin: "objekat"  => adresa stranice objekta, npr.
            https://www.booking.com/hotel/rs/tontic-lux.sr.html
     nacin: "pretraga" => pretraga po imenu objekta (rezervno resenje) */
  booking: {
    ukljucen: false,
    nacin: "objekat",
    adresa: "BOOKING_ADRESA_OVDE",
    valuta: "EUR",
    jezik: "sr",
  },

  /* ---- mape ----
     Zalepiti "Ugradi mapu" (embed) adresu iz Google Maps za svaku zgradu.
     Dok je prazno, na sajtu stoji dugme koje otvara Google Maps pretragu. */
  mape: {
    residence_hill: {
      embed: "",
      link: "https://www.google.com/maps/search/?api=1&query=Residence+Hill+Kopaonik",
    },
    milmari: {
      embed: "",
      link: "https://www.google.com/maps/search/?api=1&query=Milmari+Resort+Kopaonik",
    },
  },

  /* ---- pravila boravka ---- */
  pravila: {
    dolazak: "od 15 do 20 časova",
    odlazak: "do 10 časova",
    min_nocenja: 2,
    max_odraslih: 4,
    max_dece: 4,
    max_gostiju: 4,
    otkazivanje:
      "Besplatno do 14 dana pre dolaska. Posle toga se naplaćuje pun iznos.",
    ljubimci: false,
    depozit: false,
    tisina: "od 21 do 8 časova",
  },

  /* ---- vreme odgovora, koristi se u copy-ju ---- */
  odgovor: "1 do 4 sata",

  /* ---- analitika (opciono) ----
     Uneti GA4 oznaku oblika G-XXXXXXX da bi se ukljucila. */
  ga4: "",
};

/* ==========================================================================
   APARTMANI
   Dodavanje nove jedinice: dodati objekat u niz i napraviti stranicu.
   Polje "slike" prima imena fajlova iz /assets/img/.
   ========================================================================== */
window.APARTMANI = [
  {
    slug: "tonticlux-53",
    naziv: "TonticLux 53",
    zgrada: "Residence Hill",
    sprat: "Treći sprat",
    kvadratura: 30,
    max_odraslih: 4,
    max_dece: 4,
    max_gostiju: 4,
    lezajevi: "Dva bračna kreveta",
    kupatila: 1,
    kratko:
      "Trideset kvadrata sa dva pokretna pregradna zida, pa se prostor deli onako kako vam odgovara te večeri.",
    razlika: "Pregradni zidovi",
    booking_adresa: "",
    slike: [
      { fajl: "ap53-01.jpg", opis: "Dnevni deo apartmana TonticLux 53" },
      { fajl: "ap53-02.jpg", opis: "Bračni krevet u apartmanu TonticLux 53" },
      { fajl: "ap53-03.jpg", opis: "Kuhinja sa rernom i mašinom za sudove" },
      { fajl: "ap53-04.jpg", opis: "Kupatilo apartmana TonticLux 53" },
      { fajl: "ap53-05.jpg", opis: "Francuski balkon i pogled na prirodu" },
      { fajl: "ap53-06.jpg", opis: "Detalj enterijera" },
    ],
  },
  {
    slug: "tonticlux-54",
    naziv: "TonticLux 54",
    zgrada: "Residence Hill",
    sprat: "Treći sprat",
    kvadratura: 30,
    max_odraslih: 4,
    max_dece: 4,
    max_gostiju: 4,
    lezajevi: "Dva bračna kreveta",
    kupatila: 1,
    kratko:
      "Isti raspored kao broj 53, na istom spratu. Kada se uzmu zajedno, dva apartmana primaju osam osoba.",
    razlika: "Vrata do broja 53",
    booking_adresa: "",
    slike: [
      { fajl: "ap54-01.jpg", opis: "Dnevni deo apartmana TonticLux 54" },
      { fajl: "ap54-02.jpg", opis: "Bračni krevet u apartmanu TonticLux 54" },
      { fajl: "ap54-03.jpg", opis: "Kuhinja apartmana TonticLux 54" },
      { fajl: "ap54-04.jpg", opis: "Kupatilo apartmana TonticLux 54" },
      { fajl: "ap54-05.jpg", opis: "Francuski balkon i pogled na prirodu" },
      { fajl: "ap54-06.jpg", opis: "Detalj enterijera" },
    ],
  },
  {
    slug: "tonticlux-milmari",
    naziv: "TonticLux Milmari",
    zgrada: "Milmari Resort, N Lux",
    sprat: "Prvi sprat",
    kvadratura: 35,
    max_odraslih: 4,
    max_dece: 4,
    max_gostiju: 4,
    lezajevi: "Bračni krevet i ležaj na razvlačenje",
    kupatila: 1,
    kratko:
      "Dve odvojene sobe i pet kvadrata više. Prvi sprat, do njega se stiže bez lifta. Spa centar je u istom kompleksu.",
    razlika: "Dve odvojene sobe",
    booking_adresa: "",
    slike: [
      {
        fajl: "milmari-01.jpg",
        opis: "Dnevna soba apartmana TonticLux Milmari",
      },
      { fajl: "milmari-02.jpg", opis: "Spavaća soba sa bračnim krevetom" },
      { fajl: "milmari-03.jpg", opis: "Kuhinja apartmana TonticLux Milmari" },
      { fajl: "milmari-04.jpg", opis: "Kupatilo apartmana TonticLux Milmari" },
      { fajl: "milmari-05.jpg", opis: "Balkon sa pogledom na planinu" },
      { fajl: "milmari-06.jpg", opis: "Ležaj na razvlačenje" },
    ],
  },
];

/* Oprema je ista u sve tri jedinice, pa stoji na jednom mestu. */
window.OPREMA = [
  "Podno grejanje",
  "Potpuno opremljena kuhinja, rerna i mašina za sudove",
  "Zatvoreno parking mesto u garaži kompleksa",
  "Francuski balkon",
  "Besplatan bežični internet",
  "Televizor",
  "Sef",
  "Posteljina i peškiri",
];
