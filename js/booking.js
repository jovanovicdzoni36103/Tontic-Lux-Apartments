/* ==========================================================================
   TONTIĆ LUX / UPIT ZA BORAVAK
   Jedan widget, četiri koraka, tri načina da gost nastavi:
   upit u tabelu i na mejl, WhatsApp poruka, Booking.
   Podaci se pamte u pregledaču, pa se ne gube kad gost ode na Booking.
   ========================================================================== */
(function () {
  "use strict";

  var koren = document.querySelector("[data-upitnik]");
  if (!koren) return;

  var C = window.CONFIG || {};
  var AP = window.APARTMANI || [];
  var P = C.pravila || {};
  var MIN = P.min_nocenja || 2;
  var KLJUC = "tl-upit";
  var mirno = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var MESECI = ["januar", "februar", "mart", "april", "maj", "jun",
                "jul", "avgust", "septembar", "oktobar", "novembar", "decembar"];
  var DANI = ["pon", "uto", "sre", "čet", "pet", "sub", "ned"];

  /* ---- jedinice koje gost bira ------------------------------------- */
  var JEDINICE = AP.map(function (a) {
    return {
      slug: a.slug, naziv: a.naziv, zgrada: a.zgrada,
      opis: a.kvadratura + " m², " + a.max_gostiju + " osobe, " + a.zgrada,
      max: a.max_gostiju, booking: a.booking_adresa || ""
    };
  });
  if (AP.length >= 2) {
    JEDINICE.push({
      slug: "tonticlux-53-54",
      naziv: "TonticLux 53 i 54 zajedno",
      zgrada: "Residence Hill",
      opis: "Dva apartmana na istom spratu, do 8 osoba",
      max: 8, booking: "", spojen: true
    });
  }
  JEDINICE.push({
    slug: "bilo-koji",
    naziv: "Nisam siguran, predložite mi",
    zgrada: "",
    opis: "Javljamo se sa onim što je slobodno za vaš termin",
    max: 4
  });

  /* ---- stanje ------------------------------------------------------- */
  var S = {
    korak: 1,
    apartman: "",
    dolazak: null,
    odlazak: null,
    odrasli: 2,
    deca: 0,
    uzrasti: [],
    ime: "",
    email: "",
    telefon: "",
    napomena: "",
    saznanje: ""
  };
  var prikazMeseca = new Date();
  prikazMeseca.setDate(1);
  var vremePocetka = Date.now();

  /* ---- pomoćne funkcije --------------------------------------------- */
  function danas() { var d = new Date(); d.setHours(0, 0, 0, 0); return d; }
  function kljucD(d) {
    return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2);
  }
  function izKljuca(s) {
    if (!s) return null;
    var d = s.split("-");
    if (d.length !== 3) return null;
    var x = new Date(+d[0], +d[1] - 1, +d[2]);
    x.setHours(0, 0, 0, 0);
    return isNaN(x.getTime()) ? null : x;
  }
  function prikazD(d) {
    if (!d) return "";
    return ("0" + d.getDate()).slice(-2) + "." + ("0" + (d.getMonth() + 1)).slice(-2) + "." + d.getFullYear() + ".";
  }
  function noci() {
    if (!S.dolazak || !S.odlazak) return 0;
    return Math.round((S.odlazak - S.dolazak) / 86400000);
  }
  function jedinica(slug) {
    for (var i = 0; i < JEDINICE.length; i++) if (JEDINICE[i].slug === slug) return JEDINICE[i];
    return null;
  }
  function maxGostiju() {
    var j = jedinica(S.apartman);
    return j ? j.max : (P.max_gostiju || 4);
  }
  function ukupnoGostiju() { return S.odrasli + S.deca; }
  function rec(broj, jed, dva, pet) {
    var n = Math.abs(broj) % 100, n1 = n % 10;
    if (n > 10 && n < 20) return pet;
    if (n1 > 1 && n1 < 5) return dva;
    if (n1 === 1) return jed;
    return pet;
  }

  /* ---- pamćenje ------------------------------------------------------ */
  function sacuvaj() {
    try {
      localStorage.setItem(KLJUC, JSON.stringify({
        apartman: S.apartman,
        dolazak: S.dolazak ? kljucD(S.dolazak) : "",
        odlazak: S.odlazak ? kljucD(S.odlazak) : "",
        odrasli: S.odrasli, deca: S.deca, uzrasti: S.uzrasti,
        ime: S.ime, email: S.email, telefon: S.telefon,
        napomena: S.napomena, saznanje: S.saznanje
      }));
    } catch (e) { /* privatni režim pregledača */ }
  }
  function ucitaj() {
    var izvor = {};
    try {
      var sirovo = localStorage.getItem(KLJUC);
      if (sirovo) izvor = JSON.parse(sirovo) || {};
    } catch (e) { izvor = {}; }

    var url = new URLSearchParams(window.location.search);
    ["apartman", "dolazak", "odlazak", "odrasli", "deca"].forEach(function (k) {
      if (url.get(k)) izvor[k] = url.get(k);
    });

    if (izvor.apartman && jedinica(izvor.apartman)) S.apartman = izvor.apartman;
    /* na stranici konkretne jedinice ta jedinica ima prednost nad zapamcenom */
    if (window.PREDIZBOR && jedinica(window.PREDIZBOR) && !url.get("apartman")) {
      S.apartman = window.PREDIZBOR;
    }
    var d1 = izKljuca(izvor.dolazak), d2 = izKljuca(izvor.odlazak);
    if (d1 && d1 >= danas()) S.dolazak = d1;
    if (d2 && S.dolazak && d2 > S.dolazak) S.odlazak = d2;
    if (izvor.odrasli) S.odrasli = Math.min(4, Math.max(1, parseInt(izvor.odrasli, 10) || 2));
    if (izvor.deca) S.deca = Math.min(4, Math.max(0, parseInt(izvor.deca, 10) || 0));
    S.uzrasti = Array.isArray(izvor.uzrasti) ? izvor.uzrasti.slice(0, S.deca) : [];
    while (S.uzrasti.length < S.deca) S.uzrasti.push("");
    ["ime", "email", "telefon", "napomena", "saznanje"].forEach(function (k) {
      if (typeof izvor[k] === "string") S[k] = izvor[k];
    });
    if (S.dolazak) { prikazMeseca = new Date(S.dolazak.getFullYear(), S.dolazak.getMonth(), 1); }
  }

  /* ---- provere ------------------------------------------------------- */
  function proveriEmail(v) { return /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(v.trim()); }
  function proveriTelefon(v) {
    var c = v.replace(/[\s()\-./]/g, "");
    return /^\+?\d{8,15}$/.test(c);
  }
  function proveriIme(v) {
    var d = v.trim().split(/\s+/);
    return d.length >= 2 && d[0].length >= 2 && d[d.length - 1].length >= 2;
  }

  function greskeKoraka(k) {
    var g = {};
    if (k === 1) {
      if (!S.apartman) g.apartman = "Izaberite apartman ili opciju da vam predložimo.";
      if (!S.dolazak || !S.odlazak) g.datum = "Izaberite datum dolaska i datum odlaska.";
      else if (noci() < MIN) g.datum = "Najkraći boravak je " + MIN + " noćenja.";
    }
    if (k === 2) {
      if (ukupnoGostiju() > maxGostiju()) {
        g.gosti = "Izabrani smeštaj prima najviše " + maxGostiju() + " " + rec(maxGostiju(), "osobu", "osobe", "osoba") + ".";
      }
      for (var i = 0; i < S.deca; i++) {
        if (S.uzrasti[i] === "" || S.uzrasti[i] === null || typeof S.uzrasti[i] === "undefined") {
          g.uzrasti = "Unesite uzrast za svako dete.";
          break;
        }
      }
    }
    if (k === 3) {
      if (!proveriIme(S.ime)) g.ime = "Unesite ime i prezime.";
      if (!proveriEmail(S.email)) g.email = "Proverite adresu, nedostaje deo posle znaka @.";
      if (!proveriTelefon(S.telefon)) g.telefon = "Unesite broj telefona sa pozivnim brojem.";
    }
    return g;
  }
  function sveGreske() {
    return Object.assign({}, greskeKoraka(1), greskeKoraka(2), greskeKoraka(3));
  }

  /* ---- crtanje ------------------------------------------------------- */
  function crtajKostur() {
    koren.classList.add("rezervacija-okvir");
    koren.innerHTML =
      '<div class="upitnik">' +
        '<ol class="koraci" data-koraci>' +
          korakDugme(1, "Smeštaj i termin") +
          korakDugme(2, "Gosti") +
          korakDugme(3, "Kontakt") +
          korakDugme(4, "Slanje") +
        "</ol>" +
        '<form data-forma novalidate>' +
          panel1() + panel2() + panel3() + panel4() +
          '<div class="navigacija-koraka" data-navigacija>' +
            '<button class="dugme dugme--prazno" type="button" data-nazad>Nazad</button>' +
            '<button class="dugme" type="button" data-napred>Dalje</button>' +
          "</div>" +
        "</form>" +
        stanjeSlanja() +
      "</div>" +
      '<aside class="sazetak" data-sazetak></aside>';
  }

  function korakDugme(n, naziv) {
    return '<li><button type="button" data-korak="' + n + '"><b>' + n + '</b><span>' + naziv + "</span></button></li>";
  }

  function panel1() {
    var izbor = JEDINICE.map(function (j) {
      return '<label><input type="radio" name="apartman" value="' + j.slug + '">' +
        '<span class="opis"><b>' + j.naziv + "</b><span>" + j.opis + "</span></span></label>";
    }).join("");
    return '<section class="panel" data-panel="1" hidden>' +
      "<h3>Gde i kada</h3>" +
      '<p class="uputstvo">Najkraći boravak je ' + MIN + " noćenja. Dolazak " + (P.dolazak || "") + ", odlazak " + (P.odlazak || "") + ".</p>" +
      '<div class="izbor-jedinica" data-izbor>' + izbor + "</div>" +
      '<p class="poruka-greske" data-greska-za="apartman"></p>' +
      '<div class="kalendar" data-kalendar style="margin-top:1.25rem"></div>' +
      '<p class="poruka-greske" data-greska-za="datum"></p>' +
      "</section>";
  }

  function panel2() {
    return '<section class="panel" data-panel="2" hidden>' +
      "<h3>Ko dolazi</h3>" +
      '<p class="uputstvo">Cena se računa po apartmanu, ne po osobi. Deca se računaju u broj gostiju.</p>' +
      '<div class="polja polja--dva">' +
        brojac("odrasli", "Odrasli", "Od 18 godina") +
        brojac("deca", "Deca", "Do 18 godina") +
      "</div>" +
      '<div data-uzrasti style="margin-top:1rem"></div>' +
      '<p class="poruka-greske" data-greska-za="gosti"></p>' +
      '<p class="poruka-greske" data-greska-za="uzrasti"></p>' +
      '<p class="nagovestaj" style="margin-top:1.25rem">Kućni ljubimci nisu dozvoljeni. Broj gostiju ne može da se prekorači na licu mesta.</p>' +
      "</section>";
  }

  function brojac(polje, naslov, dodatak) {
    return '<div class="brojac" data-brojac="' + polje + '">' +
      '<span class="brojac__tekst"><b>' + naslov + "</b><span>" + dodatak + "</span></span>" +
      '<span class="brojac__kontrole">' +
        '<button type="button" data-manje="' + polje + '" aria-label="Manje: ' + naslov.toLowerCase() + '">&minus;</button>' +
        '<output data-broj="' + polje + '" aria-live="polite">0</output>' +
        '<button type="button" data-vise="' + polje + '" aria-label="Više: ' + naslov.toLowerCase() + '">+</button>' +
      "</span></div>";
  }

  function panel3() {
    return '<section class="panel" data-panel="3" hidden>' +
      "<h3>Kako da vam se javimo</h3>" +
      '<p class="uputstvo">Odgovaramo za ' + (C.odgovor || "1 do 4 sata") + ", u toku dana.</p>" +
      '<div class="polja polja--dva">' +
        polje("ime", "Ime i prezime", "text", "Milica Tontić", "name") +
        polje("telefon", "Telefon", "tel", "064 123 4567", "tel") +
      "</div>" +
      '<div class="polja" style="margin-top:1rem">' +
        polje("email", "Email", "email", "vase.ime@primer.com", "email") +
        '<div class="polje">' +
          '<label for="p-napomena">Napomena (nije obavezno)</label>' +
          '<textarea id="p-napomena" data-polje="napomena" placeholder="Dolazimo sa bebom, treba nam krevetac. Stižemo oko 19 časova."></textarea>' +
        "</div>" +
        '<div class="polje">' +
          '<label for="p-saznanje">Kako ste čuli za nas (nije obavezno)</label>' +
          '<select id="p-saznanje" data-polje="saznanje">' +
            '<option value="">Izaberite</option>' +
            '<option>Google pretraga</option>' +
            '<option>InfoKOP oglas</option>' +
            '<option>Instagram</option>' +
            '<option>Preporuka</option>' +
            '<option>Već sam boravio kod vas</option>' +
            '<option>Nešto drugo</option>' +
          "</select>" +
        "</div>" +
      "</div>" +
      '<div style="position:absolute;left:-9999px" aria-hidden="true">' +
        '<label>Ne popunjavajte ovo polje<input type="text" data-zamka tabindex="-1" autocomplete="off"></label>' +
      "</div>" +
      "</section>";
  }

  function polje(ime, naslov, tip, primer, autocomplete) {
    return '<div class="polje" data-polje-okvir="' + ime + '">' +
      '<label for="p-' + ime + '">' + naslov + "</label>" +
      '<input id="p-' + ime + '" type="' + tip + '" data-polje="' + ime + '" placeholder="' + primer +
        '" autocomplete="' + autocomplete + '" inputmode="' + (tip === "tel" ? "tel" : tip === "email" ? "email" : "text") + '">' +
      '<span class="poruka-greske" data-greska-za="' + ime + '"></span>' +
      "</div>";
  }

  function panel4() {
    return '<section class="panel" data-panel="4" hidden>' +
      "<h3>Kako želite da nastavite</h3>" +
      '<p class="uputstvo">Podaci koje ste uneli idu uz svaki od ova tri načina. Ne morate ništa da kucate ponovo.</p>' +
      '<p class="poruka-greske" data-greska-za="ukupno"></p>' +
      '<div class="nastavak">' +
        '<div class="nastavak__stavka nastavak__stavka--glavna">' +
          "<div><h4>Pošaljite upit nama</h4><p>Upit stiže na mejl i u našu tabelu. Javljamo se za " + (C.odgovor || "1 do 4 sata") + ".</p></div>" +
          '<button class="dugme" type="button" data-posalji>Pošalji upit</button>' +
        "</div>" +
        '<div class="nastavak__stavka">' +
          "<div><h4>WhatsApp</h4><p>Otvara se poruka sa vašim podacima. Vi samo pritisnete pošalji.</p></div>" +
          '<button class="dugme dugme--zeleno" type="button" data-whatsapp>Otvori WhatsApp</button>' +
        "</div>" +
        '<div class="nastavak__stavka">' +
          "<div><h4>Viber</h4><p>Poruka se kopira, otvara se razgovor sa nama. Nalepite je i pošaljite.</p></div>" +
          '<button class="dugme dugme--ljubicasto" type="button" data-viber>Otvori Viber</button>' +
        "</div>" +
        (C.booking && C.booking.ukljucen ?
        '<div class="nastavak__stavka">' +
          "<div><h4>Booking.com</h4><p>Otvara se stranica sa već upisanim datumima i brojem gostiju.</p></div>" +
          '<button class="dugme dugme--prazno" type="button" data-booking>Proveri na Booking-u</button>' +
        "</div>" : "") +
      "</div>" +
      "</section>";
  }

  function stanjeSlanja() {
    return '<div class="stanje" data-stanje-uspeh hidden>' +
        '<svg class="stanje__znak" viewBox="0 0 48 48" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.2">' +
        '<circle cx="24" cy="24" r="21"/><path d="M15 24.5l6.5 6.5L33 19"/></svg>' +
        "<h3 data-uspeh-naslov>Upit je poslat</h3>" +
        "<p data-uspeh-tekst></p>" +
        '<div class="stanje__akcije">' +
          '<a class="dugme dugme--zeleno" data-uspeh-whatsapp href="#">Pošalji i na WhatsApp</a>' +
          '<button class="dugme dugme--prazno" type="button" data-novi-upit>Novi upit</button>' +
        "</div>" +
      "</div>" +
      '<div class="stanje" data-stanje-greska hidden>' +
        "<h3>Upit nije poslat</h3>" +
        '<p data-greska-tekst>Proverite internet vezu i pokušajte ponovo. Ako se ponovi, pišite nam direktno.</p>' +
        '<div class="stanje__akcije">' +
          '<button class="dugme" type="button" data-ponovi>Pokušaj ponovo</button>' +
          '<a class="dugme dugme--zeleno" data-greska-whatsapp href="#">Pošalji na WhatsApp</a>' +
          '<a class="dugme dugme--prazno" data-greska-mejl href="#">Otvori mejl program</a>' +
        "</div>" +
      "</div>";
  }

  /* ---- kalendar ------------------------------------------------------ */
  function crtajKalendar() {
    var okvir = koren.querySelector("[data-kalendar]");
    if (!okvir) return;
    var dvaMeseca = window.matchMedia("(min-width: 720px)").matches;
    var mesecA = new Date(prikazMeseca.getFullYear(), prikazMeseca.getMonth(), 1);
    var mesecB = new Date(prikazMeseca.getFullYear(), prikazMeseca.getMonth() + 1, 1);
    var prviMoguci = new Date(danas().getFullYear(), danas().getMonth(), 1);

    var html =
      '<div class="kalendar__vrh">' +
        '<button class="kalendar__strelica" type="button" data-mesec="-1" aria-label="Prethodni mesec"' +
          (mesecA <= prviMoguci ? " disabled" : "") + ">" +
          '<svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><path d="M10 2L4 8l6 6" stroke="currentColor" fill="none" stroke-width="1.5"/></svg>' +
        "</button>" +
        "<b>" + (S.dolazak && !S.odlazak ? "Izaberite datum odlaska" : "Izaberite termin") + "</b>" +
        '<button class="kalendar__strelica" type="button" data-mesec="1" aria-label="Sledeći mesec">' +
          '<svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><path d="M6 2l6 6-6 6" stroke="currentColor" fill="none" stroke-width="1.5"/></svg>' +
        "</button>" +
      "</div>" +
      '<div class="kalendar__meseci">' + mesec(mesecA) + (dvaMeseca ? mesec(mesecB) : "") + "</div>" +
      '<div class="kalendar__noga"><span>' +
        (noci() ? prikazD(S.dolazak) + " do " + prikazD(S.odlazak) + ", " + noci() + " " + rec(noci(), "noćenje", "noćenja", "noćenja")
                : "Najkraći boravak je " + MIN + " noćenja") +
      "</span>" +
      (S.dolazak ? '<button type="button" data-ocisti>Poništi izbor</button>' : "") +
      "</div>";
    okvir.innerHTML = html;
  }

  function mesec(prvi) {
    var god = prvi.getFullYear(), m = prvi.getMonth();
    var brojDana = new Date(god, m + 1, 0).getDate();
    var pomak = (new Date(god, m, 1).getDay() + 6) % 7;
    var d0 = danas();

    var html = '<div><div class="mesec__ime">' + MESECI[m] + " " + god + "</div>" +
      '<div class="mesec__zaglavlje" aria-hidden="true">' + DANI.map(function (d) { return "<span>" + d + "</span>"; }).join("") + "</div>" +
      '<div class="mesec__dani" role="grid">';

    for (var i = 0; i < pomak; i++) html += '<span class="dan prazan"></span>';

    for (var dan = 1; dan <= brojDana; dan++) {
      var d = new Date(god, m, dan);
      var k = kljucD(d);
      var proslo = d < d0;
      var klase = ["dan"];
      if (S.dolazak && k === kljucD(S.dolazak)) klase.push("pocetak");
      if (S.odlazak && k === kljucD(S.odlazak)) klase.push("kraj");
      if (S.dolazak && S.odlazak && d > S.dolazak && d < S.odlazak) klase.push("u-opsegu");
      html += '<button type="button" class="' + klase.join(" ") + '" data-dan="' + k + '"' +
        (proslo ? " disabled" : "") + ' aria-label="' + dan + ". " + MESECI[m] + " " + god + '">' + dan + "</button>";
    }
    return html + "</div></div>";
  }

  function izaberiDan(k) {
    var d = izKljuca(k);
    if (!d) return;
    if (!S.dolazak || (S.dolazak && S.odlazak)) {
      S.dolazak = d; S.odlazak = null;
    } else if (d <= S.dolazak) {
      S.dolazak = d; S.odlazak = null;
    } else {
      var razmak = Math.round((d - S.dolazak) / 86400000);
      if (razmak < MIN) {
        window.poruka && window.poruka("Najkraći boravak je " + MIN + " noćenja.");
        S.odlazak = new Date(S.dolazak.getTime() + MIN * 86400000);
      } else {
        S.odlazak = d;
      }
    }
    osvezi();
  }

  /* ---- osvežavanje prikaza ------------------------------------------ */
  function osvezi() {
    /* koraci */
    koren.querySelectorAll("[data-korak]").forEach(function (b) {
      var n = +b.getAttribute("data-korak");
      b.setAttribute("aria-current", n === S.korak ? "step" : "false");
      b.setAttribute("data-zavrsen", n < S.korak && Object.keys(greskeKoraka(n)).length === 0 ? "1" : "0");
    });
    koren.querySelectorAll("[data-panel]").forEach(function (p) {
      p.hidden = +p.getAttribute("data-panel") !== S.korak;
    });

    /* dugmad navigacije */
    var nazad = koren.querySelector("[data-nazad]");
    var napred = koren.querySelector("[data-napred]");
    nazad.style.visibility = S.korak === 1 ? "hidden" : "visible";
    napred.hidden = S.korak === 4;

    /* izbor jedinice */
    koren.querySelectorAll('[data-izbor] input').forEach(function (r) {
      r.checked = r.value === S.apartman;
    });

    /* brojači */
    ["odrasli", "deca"].forEach(function (k) {
      var out = koren.querySelector('[data-broj="' + k + '"]');
      if (out) out.textContent = S[k];
      var manje = koren.querySelector('[data-manje="' + k + '"]');
      var vise = koren.querySelector('[data-vise="' + k + '"]');
      if (manje) manje.disabled = S[k] <= (k === "odrasli" ? 1 : 0);
      if (vise) vise.disabled = S[k] >= (k === "odrasli" ? Math.min(4, maxGostiju()) : Math.min(P.max_dece || 4, maxGostiju() - 1));
    });

    /* uzrasti dece */
    var uz = koren.querySelector("[data-uzrasti]");
    if (uz) {
      if (S.deca > 0) {
        var html = '<div class="polje"><label>Uzrast dece na dan dolaska</label><div class="uzrasti">';
        for (var i = 0; i < S.deca; i++) {
          html += '<select data-uzrast="' + i + '" aria-label="Uzrast ' + (i + 1) + '. deteta">' +
            '<option value="">' + (i + 1) + ". dete</option>";
          for (var g = 0; g <= 17; g++) {
            html += '<option value="' + g + '"' + (String(S.uzrasti[i]) === String(g) ? " selected" : "") + ">" +
              (g === 0 ? "manje od 1 godine" : g + " " + rec(g, "godina", "godine", "godina")) + "</option>";
          }
          html += "</select>";
        }
        uz.innerHTML = html + "</div></div>";
      } else {
        uz.innerHTML = "";
      }
    }

    /* polja */
    ["ime", "email", "telefon", "napomena", "saznanje"].forEach(function (k) {
      var el = koren.querySelector('[data-polje="' + k + '"]');
      if (el && el.value !== S[k]) el.value = S[k];
    });

    crtajKalendar();
    crtajSazetak();
    sacuvaj();
  }

  function crtajSazetak() {
    var el = koren.querySelector("[data-sazetak]");
    if (!el) return;
    var j = jedinica(S.apartman);
    var n = noci();
    function red(naziv, vrednost) {
      return '<div class="red"><dt>' + naziv + "</dt>" +
        '<dd' + (vrednost ? "" : ' class="prazno"') + ">" + (vrednost || "nije izabrano") + "</dd></div>";
    }
    el.innerHTML = "<h3>Vaš boravak</h3><dl>" +
      red("Smeštaj", j ? j.naziv : "") +
      red("Dolazak", S.dolazak ? prikazD(S.dolazak) : "") +
      red("Odlazak", S.odlazak ? prikazD(S.odlazak) : "") +
      red("Noćenja", n ? n + " " + rec(n, "noćenje", "noćenja", "noćenja") : "") +
      red("Gosti", S.odrasli + " " + rec(S.odrasli, "odrasla osoba", "odrasle osobe", "odraslih") +
        (S.deca ? " i " + S.deca + " " + rec(S.deca, "dete", "deteta", "dece") : "")) +
      "</dl>" +
      '<p class="sazetak__napomena">Cene se razlikuju po sezoni, pa ih šaljemo uz odgovor na upit. ' +
      "Rezervacija je potvrđena tek kada vam pošaljemo potvrdu.</p>";
  }

  function prikaziGreske(g) {
    koren.querySelectorAll("[data-greska-za]").forEach(function (el) {
      var k = el.getAttribute("data-greska-za");
      el.textContent = g[k] || "";
    });
    koren.querySelectorAll("[data-polje-okvir]").forEach(function (el) {
      el.setAttribute("data-greska", g[el.getAttribute("data-polje-okvir")] ? "1" : "0");
    });
  }

  function naKorak(n) {
    if (n > S.korak) {
      for (var k = S.korak; k < n; k++) {
        var g = greskeKoraka(k);
        if (Object.keys(g).length) {
          S.korak = k;
          prikaziGreske(g);
          osvezi();
          zumiraj();
          return;
        }
      }
    }
    S.korak = Math.max(1, Math.min(4, n));
    prikaziGreske({});
    osvezi();
    zumiraj();
  }

  function zumiraj() {
    var vrh = koren.getBoundingClientRect().top + window.scrollY - 110;
    if (window.scrollY > vrh + 40 || window.scrollY < vrh - 400) {
      window.scrollTo({ top: vrh, behavior: mirno ? "auto" : "smooth" });
    }
  }

  /* ---- pakovanje podataka -------------------------------------------- */
  function podaci(izvor) {
    var j = jedinica(S.apartman);
    var delovi = S.ime.trim().split(/\s+/);
    return {
      ime: delovi[0] || "",
      prezime: delovi.slice(1).join(" "),
      puno_ime: S.ime.trim(),
      email: S.email.trim(),
      telefon: S.telefon.trim(),
      apartman: j ? j.naziv : "",
      apartman_slug: S.apartman,
      dolazak: S.dolazak ? kljucD(S.dolazak) : "",
      odlazak: S.odlazak ? kljucD(S.odlazak) : "",
      dolazak_prikaz: prikazD(S.dolazak),
      odlazak_prikaz: prikazD(S.odlazak),
      nocenja: noci(),
      odrasli: S.odrasli,
      deca: S.deca,
      uzrasti: S.uzrasti.filter(function (x) { return x !== "" && x !== null; }).join(", "),
      gosti: ukupnoGostiju(),
      napomena: S.napomena.trim(),
      saznanje: S.saznanje,
      izvor: izvor,
      stranica: window.location.pathname
    };
  }

  function porukaZaPoruke() {
    var d = podaci("poruka");
    return "Poštovani, zanima me apartman " + d.apartman +
      " od " + d.dolazak_prikaz + " do " + d.odlazak_prikaz +
      ", ukupno " + d.nocenja + " " + rec(d.nocenja, "noćenje", "noćenja", "noćenja") +
      ", za " + d.odrasli + " " + rec(d.odrasli, "odraslu osobu", "odrasle osobe", "odraslih") +
      (d.deca ? " i " + d.deca + " " + rec(d.deca, "dete", "deteta", "dece") + (d.uzrasti ? " (uzrast: " + d.uzrasti + ")" : "") : "") +
      ". Ime: " + d.puno_ime + ", telefon: " + d.telefon + ", email: " + d.email +
      (d.napomena ? ". Napomena: " + d.napomena : "") +
      ". Molim vas javite mi da li je termin slobodan.";
  }

  function whatsappAdresa() {
    return "https://wa.me/" + C.whatsapp + "?text=" + encodeURIComponent(porukaZaPoruke());
  }

  function mejlAdresa() {
    var d = podaci("mejl");
    var telo = [
      "Apartman: " + d.apartman,
      "Dolazak: " + d.dolazak_prikaz,
      "Odlazak: " + d.odlazak_prikaz,
      "Noćenja: " + d.nocenja,
      "Odrasli: " + d.odrasli,
      "Deca: " + d.deca + (d.uzrasti ? " (uzrast: " + d.uzrasti + ")" : ""),
      "",
      "Ime i prezime: " + d.puno_ime,
      "Telefon: " + d.telefon,
      "Email: " + d.email,
      "",
      "Napomena: " + (d.napomena || "nema")
    ].join("\n");
    return "mailto:" + C.email + "?subject=" +
      encodeURIComponent("Upit za " + d.apartman + ", " + d.dolazak_prikaz) +
      "&body=" + encodeURIComponent(telo);
  }

  function bookingAdresa() {
    if (!C.booking || !C.booking.ukljucen) return "";
    var d = podaci("booking");
    var p = new URLSearchParams();
    p.set("checkin", d.dolazak);
    p.set("checkout", d.odlazak);
    p.set("group_adults", String(d.odrasli));
    p.set("group_children", String(d.deca));
    p.set("no_rooms", jedinica(S.apartman) && jedinica(S.apartman).spojen ? "2" : "1");
    p.set("selected_currency", C.booking.valuta || "EUR");
    S.uzrasti.forEach(function (g) { if (g !== "") p.append("age", String(g)); });

    var j = jedinica(S.apartman);
    var osnova = (j && j.booking) ? j.booking : C.booking.adresa;
    if (C.booking.nacin === "pretraga" || !osnova || osnova.indexOf("http") !== 0) {
      var t = new URLSearchParams(p);
      t.set("ss", C.naziv + " Kopaonik");
      return "https://www.booking.com/searchresults." + (C.booking.jezik || "sr") + ".html?" + t.toString();
    }
    return osnova + (osnova.indexOf("?") > -1 ? "&" : "?") + p.toString();
  }

  /* ---- slanje --------------------------------------------------------- */
  var salje = false;

  function upisi(izvor) {
    /* tiho upisivanje u tabelu za WhatsApp i Booking, bez blokiranja gosta */
    if (!C.skripta || C.skripta.indexOf("http") !== 0) return;
    try {
      fetch(C.skripta, {
        method: "POST",
        body: JSON.stringify(podaci(izvor)),
        keepalive: true
      }).catch(function () {});
    } catch (e) { /* nema veze, gost ide dalje */ }
  }

  function posalji() {
    if (salje) return;
    var g = sveGreske();
    if (Object.keys(g).length) {
      prikaziGreske(g);
      var prvi = Object.keys(g)[0];
      naKorak(["apartman", "datum"].indexOf(prvi) > -1 ? 1 : ["gosti", "uzrasti"].indexOf(prvi) > -1 ? 2 : 3);
      return;
    }
    var zamka = koren.querySelector("[data-zamka]");
    if (zamka && zamka.value) return;
    if (Date.now() - vremePocetka < 1500) {
      window.poruka && window.poruka("Sačekajte trenutak pa pošaljite ponovo.");
      return;
    }

    var dugme = koren.querySelector("[data-posalji]");
    salje = true;
    if (dugme) {
      dugme.disabled = true;
      dugme.innerHTML = '<span class="vrti" aria-hidden="true"></span> Šaljem';
    }

    if (!C.skripta || C.skripta.indexOf("http") !== 0) {
      /* backend nije podešen, gost ne sme da ostane bez izlaza */
      salje = false;
      if (dugme) { dugme.disabled = false; dugme.textContent = "Pošalji upit"; }
      pokaziGresku("Slanje preko sajta još nije uključeno. Pošaljite nam poruku na WhatsApp ili mejl, podaci su već popunjeni.");
      return;
    }

    fetch(C.skripta, {
      method: "POST",
      body: JSON.stringify(podaci("Sajt, forma"))
    })
      .then(function (r) { return r.json(); })
      .then(function (o) {
        if (o && o.ok) pokaziUspeh();
        else pokaziGresku(o && o.poruka ? o.poruka : null);
      })
      .catch(function (e) {
        if (window.console) console.error("Tontić Lux, slanje upita:", e);
        pokaziGresku(null);
      })
      .then(function () {
        salje = false;
        if (dugme) { dugme.disabled = false; dugme.textContent = "Pošalji upit"; }
      });
  }

  function pokaziUspeh() {
    var forma = koren.querySelector("[data-forma]");
    var koraci = koren.querySelector("[data-koraci]");
    var uspeh = koren.querySelector("[data-stanje-uspeh]");
    var greska = koren.querySelector("[data-stanje-greska]");
    var d = podaci("Sajt, forma");
    forma.hidden = true;
    koraci.hidden = true;
    greska.hidden = true;
    uspeh.hidden = false;
    koren.querySelector("[data-uspeh-naslov]").textContent = "Hvala, " + d.ime + ". Upit je stigao.";
    koren.querySelector("[data-uspeh-tekst]").textContent =
      "Javljamo se na " + d.telefon + " ili na " + d.email + " za " + (C.odgovor || "1 do 4 sata") +
      ". Zabeležili smo " + d.apartman + ", " + d.dolazak_prikaz + " do " + d.odlazak_prikaz + ". " +
      "Termin je rezervisan tek kada dobijete našu potvrdu.";
    koren.querySelector("[data-uspeh-whatsapp]").href = whatsappAdresa();
    window.dogadjaj && window.dogadjaj("upit_poslat", { apartman: d.apartman_slug, nocenja: d.nocenja });
    uspeh.scrollIntoView({ behavior: mirno ? "auto" : "smooth", block: "center" });
    try { localStorage.removeItem(KLJUC); } catch (e) {}
  }

  function pokaziGresku(tekst) {
    var greska = koren.querySelector("[data-stanje-greska]");
    koren.querySelector("[data-greska-tekst]").textContent = tekst ||
      "Nismo uspeli da pošaljemo upit. Proverite internet vezu i pokušajte ponovo, ili nam pišite direktno.";
    koren.querySelector("[data-greska-whatsapp]").href = whatsappAdresa();
    koren.querySelector("[data-greska-mejl]").href = mejlAdresa();
    greska.hidden = false;
    koren.querySelector("[data-forma]").hidden = true;
    koren.querySelector("[data-koraci]").hidden = true;
    greska.scrollIntoView({ behavior: mirno ? "auto" : "smooth", block: "center" });
  }

  function nazadNaFormu() {
    koren.querySelector("[data-stanje-greska]").hidden = true;
    koren.querySelector("[data-stanje-uspeh]").hidden = true;
    koren.querySelector("[data-forma]").hidden = false;
    koren.querySelector("[data-koraci]").hidden = false;
  }

  /* ---- događaji ------------------------------------------------------- */
  function poveziDogadjaje() {
    koren.addEventListener("click", function (e) {
      var t = e.target;

      var dan = t.closest("[data-dan]");
      if (dan && !dan.disabled) { izaberiDan(dan.getAttribute("data-dan")); return; }

      var strelica = t.closest("[data-mesec]");
      if (strelica) {
        prikazMeseca.setMonth(prikazMeseca.getMonth() + parseInt(strelica.getAttribute("data-mesec"), 10));
        crtajKalendar();
        return;
      }
      if (t.closest("[data-ocisti]")) { S.dolazak = null; S.odlazak = null; osvezi(); return; }

      var korak = t.closest("[data-korak]");
      if (korak) { naKorak(+korak.getAttribute("data-korak")); return; }
      if (t.closest("[data-napred]")) { naKorak(S.korak + 1); return; }
      if (t.closest("[data-nazad]")) { naKorak(S.korak - 1); return; }

      var manje = t.closest("[data-manje]");
      if (manje) {
        var km = manje.getAttribute("data-manje");
        S[km] = Math.max(km === "odrasli" ? 1 : 0, S[km] - 1);
        if (km === "deca") S.uzrasti = S.uzrasti.slice(0, S.deca);
        osvezi(); return;
      }
      var vise = t.closest("[data-vise]");
      if (vise) {
        var kv = vise.getAttribute("data-vise");
        var granica = kv === "odrasli" ? Math.min(4, maxGostiju()) : Math.min(P.max_dece || 4, maxGostiju() - 1);
        if (S[kv] + 1 > granica || ukupnoGostiju() + 1 > maxGostiju()) {
          if (maxGostiju() <= 4 && ukupnoGostiju() + 1 > 4) {
            window.poruka && window.poruka("Jedan apartman prima 4 osobe. Za veću grupu izaberite dva apartmana zajedno.");
          }
          return;
        }
        S[kv] = S[kv] + 1;
        if (kv === "deca") S.uzrasti.push("");
        osvezi(); return;
      }

      if (t.closest("[data-posalji]")) { posalji(); return; }

      if (t.closest("[data-whatsapp]")) {
        var g1 = sveGreske();
        if (Object.keys(g1).length) { prikaziGreske(g1); naKorak(1); return; }
        upisi("WhatsApp");
        window.dogadjaj && window.dogadjaj("whatsapp_klik", {});
        window.open(whatsappAdresa(), "_blank", "noopener");
        return;
      }

      if (t.closest("[data-viber]")) {
        var g2 = sveGreske();
        if (Object.keys(g2).length) { prikaziGreske(g2); naKorak(1); return; }
        upisi("Viber");
        var tekst = porukaZaPoruke();
        var posle = function () {
          window.poruka && window.poruka("Poruka je kopirana. Nalepite je u Viber i pošaljite.");
          window.location.href = "viber://chat?number=" + encodeURIComponent(C.viber);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(tekst).then(posle, posle);
        } else { posle(); }
        return;
      }

      if (t.closest("[data-booking]")) {
        var g3 = sveGreske();
        if (Object.keys(g3).length) { prikaziGreske(g3); naKorak(1); return; }
        upisi("Booking");
        window.dogadjaj && window.dogadjaj("booking_klik", {});
        window.open(bookingAdresa(), "_blank", "noopener");
        return;
      }

      if (t.closest("[data-ponovi]")) { nazadNaFormu(); naKorak(4); return; }
      if (t.closest("[data-novi-upit]")) {
        S.dolazak = null; S.odlazak = null; S.napomena = "";
        nazadNaFormu(); naKorak(1); return;
      }
    });

    koren.addEventListener("change", function (e) {
      var r = e.target.closest('[data-izbor] input');
      if (r) {
        S.apartman = r.value;
        var m = maxGostiju();
        if (S.odrasli > m) S.odrasli = m;
        if (ukupnoGostiju() > m) { S.deca = Math.max(0, m - S.odrasli); S.uzrasti = S.uzrasti.slice(0, S.deca); }
        osvezi();
        return;
      }
      var uzrast = e.target.closest("[data-uzrast]");
      if (uzrast) {
        S.uzrasti[+uzrast.getAttribute("data-uzrast")] = uzrast.value;
        sacuvaj();
        return;
      }
      var sel = e.target.closest('select[data-polje]');
      if (sel) { S[sel.getAttribute("data-polje")] = sel.value; sacuvaj(); }
    });

    koren.addEventListener("input", function (e) {
      var el = e.target.closest("[data-polje]");
      if (!el || el.tagName === "SELECT") return;
      S[el.getAttribute("data-polje")] = el.value;
      sacuvaj();
      crtajSazetak();
    });

    koren.addEventListener("blur", function (e) {
      var el = e.target.closest("[data-polje]");
      if (!el) return;
      var k = el.getAttribute("data-polje");
      if (["ime", "email", "telefon"].indexOf(k) === -1) return;
      var g = greskeKoraka(3);
      var sam = {};
      if (g[k] && S[k]) sam[k] = g[k];
      var okvir = koren.querySelector('[data-polje-okvir="' + k + '"]');
      if (okvir) {
        okvir.setAttribute("data-greska", sam[k] ? "1" : "0");
        var poruka = okvir.querySelector("[data-greska-za]");
        if (poruka) poruka.textContent = sam[k] || "";
      }
    }, true);

    /* strelice u kalendaru */
    koren.addEventListener("keydown", function (e) {
      var dan = e.target.closest("[data-dan]");
      if (!dan) return;
      var pomak = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: 7, ArrowUp: -7 }[e.key];
      if (!pomak) return;
      e.preventDefault();
      var d = izKljuca(dan.getAttribute("data-dan"));
      d.setDate(d.getDate() + pomak);
      var sledeci = koren.querySelector('[data-dan="' + kljucD(d) + '"]');
      if (!sledeci) {
        prikazMeseca.setMonth(prikazMeseca.getMonth() + (pomak > 0 ? 1 : -1));
        crtajKalendar();
        sledeci = koren.querySelector('[data-dan="' + kljucD(d) + '"]');
      }
      if (sledeci) sledeci.focus();
    });

    window.addEventListener("resize", (function () {
      var sirok = window.matchMedia("(min-width: 720px)").matches;
      return function () {
        var novo = window.matchMedia("(min-width: 720px)").matches;
        if (novo !== sirok) { sirok = novo; crtajKalendar(); }
      };
    })());
  }

  /* ---- pokretanje ----------------------------------------------------- */
  ucitaj();
  crtajKostur();
  poveziDogadjaje();
  if (!S.apartman && JEDINICE.length) S.apartman = "";
  osvezi();

  /* spoljni linkovi tipa "Proveri dostupnost za TonticLux 53" */
  document.querySelectorAll("[data-izaberi-apartman]").forEach(function (el) {
    el.addEventListener("click", function (e) {
      var slug = el.getAttribute("data-izaberi-apartman");
      if (!jedinica(slug)) return;
      e.preventDefault();
      S.apartman = slug;
      naKorak(1);
    });
  });
})();
