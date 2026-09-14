/**
 * TONTIĆ LUX / prijem upita sa sajta
 * ---------------------------------------------------------------------------
 * Šta radi:
 *   1. prima podatke iz forme na sajtu
 *   2. proverava ih i čisti
 *   3. upisuje jedan red u Google tabelu
 *   4. šalje mejl vlasnicima, sa adresom gosta u polju "odgovori"
 *   5. šalje gostu potvrdu da je upit primljen
 *   6. vraća sajtu odgovor o uspehu ili grešci
 *
 * Uputstvo za postavljanje je u docs/uputstvo-google.md
 * ---------------------------------------------------------------------------
 */

var PODESAVANJA = {
  // ID tabele iz adrese: docs.google.com/spreadsheets/d/OVAJ_DEO/edit
  ID_TABELE: "ID_TABELE_OVDE",
  LIST: "Upiti",

  // ko dobija upit
  PRIMA: "tonticlux@gmail.com",
  KOPIJA: "ognjentontic21@gmail.com",

  // ime koje gost vidi kao pošiljaoca
  POTPIS: "Tontić Lux, Kopaonik",
  TELEFON: "063 877 3363",

  // slanje potvrde gostu
  POTVRDA_GOSTU: true,

  // najviše upita sa iste adrese za 10 minuta
  GRANICA: 3
};

var KOLONE = [
  "Vreme upita", "Status", "Ime", "Prezime", "Telefon", "Email",
  "Apartman", "Dolazak", "Odlazak", "Noćenja",
  "Odrasli", "Deca", "Uzrast dece", "Ukupno gostiju",
  "Napomena", "Kako je čuo za nas", "Izvor", "Poslednji kontakt", "Interna napomena"
];

var STATUSI = ["Novo", "Javljeno", "Potvrđeno", "Odbijeno", "Završeno"];

/* ========================================================================= */
/* PRIJEM PODATAKA                                                            */
/* ========================================================================= */

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return odgovor(false, "Nema podataka u zahtevu.");
    }

    var u = JSON.parse(e.postData.contents);

    // jednostavna zaštita od robota
    if (u.polje_x) return odgovor(true, "Primljeno.");

    var greske = proveri(u);
    if (greske.length) return odgovor(false, greske.join(" "));

    var list = uzmiList();
    if (previseUpita(list, ocisti(u.email))) {
      return odgovor(false, "Već smo primili vaš upit. Javićemo se uskoro.");
    }

    var red = [
      new Date(),
      "Novo",
      ocisti(u.ime),
      ocisti(u.prezime),
      ocisti(u.telefon),
      ocisti(u.email),
      ocisti(u.apartman),
      ocisti(u.dolazak),
      ocisti(u.odlazak),
      Number(u.nocenja) || "",
      Number(u.odrasli) || "",
      Number(u.deca) || 0,
      ocisti(u.uzrasti),
      Number(u.gosti) || "",
      ocisti(u.napomena),
      ocisti(u.saznanje),
      ocisti(u.izvor) || "Sajt",
      "",
      ""
    ];
    list.appendRow(red);

    try { mejlVlasnicima(u); } catch (g1) { zabelezi("mejl vlasnicima", g1); }
    if (PODESAVANJA.POTVRDA_GOSTU) {
      try { mejlGostu(u); } catch (g2) { zabelezi("mejl gostu", g2); }
    }

    return odgovor(true, "Upit je primljen.");
  } catch (greska) {
    zabelezi("doPost", greska);
    return odgovor(false, null);
  }
}

function doGet() {
  return odgovor(true, "Servis radi.");
}

function odgovor(ok, poruka) {
  var telo = { ok: ok };
  if (poruka) telo.poruka = poruka;
  return ContentService
    .createTextOutput(JSON.stringify(telo))
    .setMimeType(ContentService.MimeType.JSON);
}

/* ========================================================================= */
/* PROVERE                                                                    */
/* ========================================================================= */

function proveri(u) {
  var g = [];
  if (!u.puno_ime || String(u.puno_ime).trim().length < 3) g.push("Nedostaje ime i prezime.");
  if (!u.email || !/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(String(u.email).trim())) g.push("Adresa e-pošte nije ispravna.");
  if (!u.telefon || String(u.telefon).replace(/[^\d+]/g, "").length < 8) g.push("Broj telefona nije ispravan.");
  if (!u.dolazak || !u.odlazak) g.push("Nedostaju datumi boravka.");
  if (u.dolazak && u.odlazak && new Date(u.odlazak) <= new Date(u.dolazak)) g.push("Datum odlaska mora biti posle datuma dolaska.");
  if (Number(u.nocenja) < 2) g.push("Najkraći boravak je 2 noćenja.");
  return g;
}

function ocisti(v) {
  if (v === null || typeof v === "undefined") return "";
  return String(v).replace(/[\u0000-\u001F\u007F]/g, " ").trim().slice(0, 900);
}

/** sprečava da isti gost slučajno pošalje isti upit deset puta */
function previseUpita(list, email) {
  if (!email) return false;
  var ukupno = list.getLastRow();
  if (ukupno < 2) return false;
  var od = Math.max(2, ukupno - 40);
  var opseg = list.getRange(od, 1, ukupno - od + 1, 6).getValues();
  var granica = new Date().getTime() - 10 * 60 * 1000;
  var broj = 0;
  for (var i = 0; i < opseg.length; i++) {
    var vreme = opseg[i][0];
    if (vreme && new Date(vreme).getTime() > granica &&
        String(opseg[i][5]).toLowerCase() === email.toLowerCase()) broj++;
  }
  return broj >= PODESAVANJA.GRANICA;
}

/* ========================================================================= */
/* TABELA                                                                     */
/* ========================================================================= */

function uzmiList() {
  var tabela = PODESAVANJA.ID_TABELE && PODESAVANJA.ID_TABELE !== "ID_TABELE_OVDE"
    ? SpreadsheetApp.openById(PODESAVANJA.ID_TABELE)
    : SpreadsheetApp.getActiveSpreadsheet();
  var list = tabela.getSheetByName(PODESAVANJA.LIST);
  if (!list) {
    list = tabela.insertSheet(PODESAVANJA.LIST);
    napraviZaglavlje(list);
  }
  if (list.getLastRow() === 0) napraviZaglavlje(list);
  return list;
}

/**
 * Pokrenuti JEDNOM, ručno, iz menija "Pokreni".
 * Priprema tabelu: zaglavlje, širine, padajući spisak statusa i boje.
 */
function pripremiTabelu() {
  var list = uzmiList();
  napraviZaglavlje(list);

  var pravilo = SpreadsheetApp.newDataValidation()
    .requireValueInList(STATUSI, true).setAllowInvalid(false).build();
  list.getRange(2, 2, 2000, 1).setDataValidation(pravilo);

  var opseg = list.getRange(2, 1, 2000, KOLONE.length);
  var pravila = [];
  var boje = { "Novo": "#FFF3D6", "Javljeno": "#E3EEF8", "Potvrđeno": "#E0F1E4", "Odbijeno": "#F7E1DD", "Završeno": "#EFEFEF" };
  Object.keys(boje).forEach(function (s) {
    pravila.push(SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=$B2="' + s + '"')
      .setBackground(boje[s])
      .setRanges([opseg]).build());
  });
  list.setConditionalFormatRules(pravila);

  [140, 110, 110, 120, 130, 210, 170, 105, 105, 80, 75, 65, 110, 110, 320, 150, 120, 130, 260]
    .forEach(function (s, i) { list.setColumnWidth(i + 1, s); });

  list.setFrozenRows(1);
  list.getRange(1, 1, 1, KOLONE.length).setFontWeight("bold").setBackground("#1A1714").setFontColor("#FAF7F2");
  SpreadsheetApp.getActiveSpreadsheet().toast("Tabela je pripremljena.", "Tontić Lux", 5);
}

function napraviZaglavlje(list) {
  list.getRange(1, 1, 1, KOLONE.length).setValues([KOLONE]);
}

/* ========================================================================= */
/* MEJLOVI                                                                    */
/* ========================================================================= */

function mejlVlasnicima(u) {
  var naslov = "[Novi upit] " + (u.apartman || "Tontić Lux") + ", " + u.puno_ime + ", " + (u.dolazak_prikaz || u.dolazak);
  var redovi = [
    ["Apartman", u.apartman],
    ["Dolazak", u.dolazak_prikaz || u.dolazak],
    ["Odlazak", u.odlazak_prikaz || u.odlazak],
    ["Noćenja", u.nocenja],
    ["Odrasli", u.odrasli],
    ["Deca", (u.deca || 0) + (u.uzrasti ? " (uzrast: " + u.uzrasti + ")" : "")],
    ["Ime i prezime", u.puno_ime],
    ["Telefon", u.telefon],
    ["Email", u.email],
    ["Napomena", u.napomena || "nema"],
    ["Kako je čuo", u.saznanje || "nije rekao"],
    ["Izvor", u.izvor || "Sajt"]
  ];

  var html =
    '<div style="font-family:Helvetica,Arial,sans-serif;color:#2D2D2D;max-width:560px">' +
    '<p style="font-size:13px;color:#8B6F47;letter-spacing:.06em;margin:0 0 6px">NOVI UPIT SA SAJTA</p>' +
    '<h2 style="font-size:22px;font-weight:500;margin:0 0 18px">' + izlaz(u.puno_ime) + ", " + izlaz(u.nocenja) + " noćenja</h2>" +
    '<table style="border-collapse:collapse;width:100%;font-size:14px">' +
    redovi.map(function (r) {
      return '<tr><td style="padding:8px 10px 8px 0;color:#6f675c;border-bottom:1px solid #eee;width:38%">' +
        izlaz(r[0]) + '</td><td style="padding:8px 0;border-bottom:1px solid #eee">' + izlaz(r[1]) + "</td></tr>";
    }).join("") +
    "</table>" +
    '<p style="margin:20px 0 0"><a href="tel:' + izlaz(u.telefon) + '" style="background:#8B6F47;color:#fff;padding:10px 18px;border-radius:40px;text-decoration:none;font-size:14px">Pozovi gosta</a>' +
    ' &nbsp; <a href="https://wa.me/' + String(u.telefon || "").replace(/[^\d]/g, "") + '" style="color:#8B6F47;font-size:14px">WhatsApp</a></p>' +
    '<p style="font-size:12px;color:#9a9a9a;margin-top:22px">Odgovor na ovaj mejl ide direktno gostu. Upit je upisan i u tabelu.</p>' +
    "</div>";

  MailApp.sendEmail({
    to: PODESAVANJA.PRIMA,
    cc: PODESAVANJA.KOPIJA,
    replyTo: u.email,
    subject: naslov,
    htmlBody: html,
    body: redovi.map(function (r) { return r[0] + ": " + r[1]; }).join("\n"),
    name: "Sajt Tontić Lux"
  });
}

function mejlGostu(u) {
  var ime = String(u.ime || u.puno_ime || "").split(" ")[0];
  var html =
    '<div style="font-family:Helvetica,Arial,sans-serif;color:#2D2D2D;max-width:560px">' +
    "<p>Poštovani " + izlaz(ime) + ",</p>" +
    "<p>primili smo vaš upit za <b>" + izlaz(u.apartman) + "</b>, " +
    izlaz(u.dolazak_prikaz || u.dolazak) + " do " + izlaz(u.odlazak_prikaz || u.odlazak) +
    ", za " + izlaz(u.gosti) + " " + (Number(u.gosti) === 1 ? "osobu" : "osoba") + ".</p>" +
    "<p>Javljamo se u roku od 1 do 4 sata sa cenom za taj termin i potvrdom da li je jedinica slobodna. " +
    "Termin je rezervisan tek kada dobijete našu potvrdu.</p>" +
    "<p>Ako u međuvremenu nešto treba da dodate, odgovorite na ovaj mejl ili nas pozovite na " +
    izlaz(PODESAVANJA.TELEFON) + ".</p>" +
    '<p style="margin-top:24px">' + izlaz(PODESAVANJA.POTPIS) + "</p>" +
    "</div>";

  MailApp.sendEmail({
    to: u.email,
    replyTo: PODESAVANJA.PRIMA,
    subject: "Primili smo vaš upit, Tontić Lux",
    htmlBody: html,
    body: "Poštovani " + ime + ", primili smo vaš upit. Javljamo se za 1 do 4 sata. " + PODESAVANJA.POTPIS,
    name: PODESAVANJA.POTPIS
  });
}

function izlaz(v) {
  return String(v === null || typeof v === "undefined" ? "" : v)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/* ========================================================================= */
/* DODATNO, NIJE OBAVEZNO                                                     */
/* ========================================================================= */

/**
 * Podsetnik gostu tri dana pre dolaska i molba za utisak posle odlaska.
 * Radi samo za redove sa statusom "Potvrđeno".
 * Uključuje se okidačem: Okidači, novi okidač, funkcija dnevniPosao, vremenski, jednom dnevno.
 */
function dnevniPosao() {
  var list = uzmiList();
  var ukupno = list.getLastRow();
  if (ukupno < 2) return;

  var podaci = list.getRange(2, 1, ukupno - 1, KOLONE.length).getValues();
  var danas = new Date();
  danas.setHours(0, 0, 0, 0);

  for (var i = 0; i < podaci.length; i++) {
    var r = podaci[i];
    if (r[1] !== "Potvrđeno") continue;
    var email = r[5];
    if (!email) continue;
    var interno = String(r[18] || "");

    var dolazak = r[7] ? new Date(r[7]) : null;
    var odlazak = r[8] ? new Date(r[8]) : null;

    if (dolazak) {
      var razlika = Math.round((dolazak - danas) / 86400000);
      if (razlika === 3 && interno.indexOf("[podsetnik]") === -1) {
        MailApp.sendEmail({
          to: email,
          subject: "Vidimo se uskoro na Kopaoniku, Tontić Lux",
          body: "Poštovani " + r[2] + ",\n\nza tri dana vas očekujemo u apartmanu " + r[6] +
                ".\nPrijava je od 15 do 20 časova, odjava do 10 časova. Parking mesto u garaži je vaše.\n\n" +
                "Ako kasnite ili stižete ranije, javite na " + PODESAVANJA.TELEFON + ".\n\n" + PODESAVANJA.POTPIS,
          name: PODESAVANJA.POTPIS,
          replyTo: PODESAVANJA.PRIMA
        });
        list.getRange(i + 2, 19).setValue((interno + " [podsetnik]").trim());
      }
    }

    if (odlazak) {
      var proslo = Math.round((danas - odlazak) / 86400000);
      if (proslo === 2 && interno.indexOf("[utisak]") === -1) {
        MailApp.sendEmail({
          to: email,
          subject: "Kako je bilo, Tontić Lux",
          body: "Poštovani " + r[2] + ",\n\nhvala što ste boravili kod nas.\n" +
                "Ako imate minut, napišite nam kako je bilo i šta bi moglo bolje. Čitamo svaki odgovor.\n\n" +
                PODESAVANJA.POTPIS,
          name: PODESAVANJA.POTPIS,
          replyTo: PODESAVANJA.PRIMA
        });
        list.getRange(i + 2, 19).setValue((list.getRange(i + 2, 19).getValue() + " [utisak]").trim());
      }
    }
  }
}

function zabelezi(gde, greska) {
  try {
    console.error("Tontić Lux, " + gde + ": " + (greska && greska.message ? greska.message : greska));
  } catch (e) { /* ignorisi */ }
}

/** Provera podešavanja. Pokrenuti ručno posle prvog postavljanja. */
function testUpit() {
  var probni = {
    ime: "Probni", prezime: "Gost", puno_ime: "Probni Gost",
    email: PODESAVANJA.PRIMA, telefon: "0641234567",
    apartman: "TonticLux 53", dolazak: "2026-12-20", odlazak: "2026-12-23",
    dolazak_prikaz: "20.12.2026.", odlazak_prikaz: "23.12.2026.",
    nocenja: 3, odrasli: 2, deca: 1, uzrasti: "6", gosti: 3,
    napomena: "Ovo je probni upit iz Apps Script editora.",
    saznanje: "Provera", izvor: "Test"
  };
  var odg = doPost({ postData: { contents: JSON.stringify(probni) } });
  Logger.log(odg.getContent());
}
