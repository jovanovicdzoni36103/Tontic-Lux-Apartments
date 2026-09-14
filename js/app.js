/* ==========================================================================
   TONTIĆ LUX / PONAŠANJE SAJTA
   Bez biblioteka. Sve je vezano za elemente preko data atributa,
   pa se komad koji ne postoji na stranici jednostavno preskače.
   ========================================================================== */
(function () {
  "use strict";

  var mirno = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fina = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  function $(s, k) { return (k || document).querySelector(s); }
  function $$(s, k) { return Array.prototype.slice.call((k || document).querySelectorAll(s)); }

  /* ---- 1. godina u podnožju ---------------------------------------- */
  $$("[data-godina]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---- 2. popunjavanje kontakata iz CONFIG -------------------------- */
  var C = window.CONFIG || {};
  $$("[data-veza]").forEach(function (el) {
    var vrsta = el.getAttribute("data-veza");
    if (vrsta === "telefon1") { el.href = "tel:" + C.telefon1; if (el.hasAttribute("data-upisi")) el.textContent = C.telefon1_prikaz; }
    if (vrsta === "telefon2") { el.href = "tel:" + C.telefon2; if (el.hasAttribute("data-upisi")) el.textContent = C.telefon2_prikaz; }
    if (vrsta === "email") { el.href = "mailto:" + C.email; if (el.hasAttribute("data-upisi")) el.textContent = C.email; }
    if (vrsta === "whatsapp") { el.href = "https://wa.me/" + C.whatsapp; }
    if (vrsta === "viber") { el.href = "viber://chat?number=" + encodeURIComponent(C.viber); }
    if (vrsta === "instagram") { el.href = C.instagram; }
    if (vrsta === "infokop") { el.href = C.infokop; }
  });

  /* ---- 3. meni ------------------------------------------------------ */
  var dugmeMeni = $("[data-meni-dugme]");
  var meni = $("[data-meni]");
  if (dugmeMeni && meni) {
    var otvori = function (stanje) {
      document.documentElement.classList.toggle("meni-otvoren", stanje);
      dugmeMeni.setAttribute("aria-expanded", stanje ? "true" : "false");
      meni.hidden = !stanje;
      if (stanje) {
        var prvi = $("a", meni);
        if (prvi) setTimeout(function () { prvi.focus(); }, 120);
      } else {
        dugmeMeni.focus();
      }
    };
    meni.hidden = true;
    dugmeMeni.addEventListener("click", function () {
      otvori(!document.documentElement.classList.contains("meni-otvoren"));
    });
    $$("a", meni).forEach(function (a) {
      a.addEventListener("click", function () { otvori(false); });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && document.documentElement.classList.contains("meni-otvoren")) otvori(false);
    });
  }

  /* ---- 4. zaglavlje: skupljanje i boja prema sekciji ---------------- */
  var zaglavlje = $("[data-zaglavlje]");
  var sekcijeTeme = $$("[data-tema]");
  var napredak = $("[data-napredak]");

  function osveziZaglavlje() {
    var y = window.scrollY || window.pageYOffset;
    if (zaglavlje) zaglavlje.classList.toggle("skupljeno", y > 40);

    if (zaglavlje && sekcijeTeme.length) {
      var linija = zaglavlje.offsetHeight * 0.6;
      var tekuca = null;
      for (var i = 0; i < sekcijeTeme.length; i++) {
        var r = sekcijeTeme[i].getBoundingClientRect();
        if (r.top <= linija && r.bottom > linija) { tekuca = sekcijeTeme[i]; break; }
      }
      if (!tekuca) tekuca = sekcijeTeme[0];
      var tema = tekuca.getAttribute("data-tema");
      var svetla = tema === "sneg" || tema === "papir";
      zaglavlje.classList.toggle("na-svetlom", svetla);
      document.body.className = document.body.className.replace(/pozadina-\w+/g, "").trim();
      document.body.classList.add("pozadina-" + tema);
    }

    if (napredak) {
      var vis = document.documentElement.scrollHeight - window.innerHeight;
      napredak.style.transform = "scaleX(" + (vis > 0 ? Math.min(1, y / vis) : 0) + ")";
    }
  }

  var ceka = false;
  window.addEventListener("scroll", function () {
    if (ceka) return;
    ceka = true;
    window.requestAnimationFrame(function () { osveziZaglavlje(); ceka = false; });
  }, { passive: true });
  window.addEventListener("resize", osveziZaglavlje, { passive: true });
  osveziZaglavlje();

  /* ---- 5. otkrivanje pri skrolu ------------------------------------- */
  var zaOtkrivanje = $$(".otkrij");
  if (mirno || !("IntersectionObserver" in window)) {
    zaOtkrivanje.forEach(function (el) { el.classList.add("vidljiv"); });
  } else {
    var oko = new IntersectionObserver(function (unosi) {
      unosi.forEach(function (u) {
        if (u.isIntersecting) {
          u.target.classList.add("vidljiv");
          oko.unobserve(u.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    zaOtkrivanje.forEach(function (el) { oko.observe(el); });
  }

  /* ---- 6. hero ------------------------------------------------------ */
  var hero = $("[data-hero]");
  if (hero) {
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () { hero.classList.add("ucitan"); });
    });
  }

  /* ---- 7. kursor ---------------------------------------------------- */
  if (fina && !mirno) {
    var kursor = document.createElement("div");
    kursor.className = "kursor";
    document.body.appendChild(kursor);
    var kx = 0, ky = 0, cx = 0, cy = 0, radi = false;

    document.addEventListener("mousemove", function (e) {
      kx = e.clientX; ky = e.clientY;
      if (!radi) { radi = true; kursor.classList.add("aktivan"); petlja(); }
    }, { passive: true });

    function petlja() {
      cx += (kx - cx) * 0.18;
      cy += (ky - cy) * 0.18;
      kursor.style.transform = "translate3d(" + (cx - 13) + "px," + (cy - 13) + "px,0)";
      window.requestAnimationFrame(petlja);
    }
    document.addEventListener("mouseover", function (e) {
      var meta = e.target.closest("a, button, input, select, textarea, [data-svetlo], .traka");
      kursor.classList.toggle("veliki", !!meta);
    });
    document.addEventListener("mouseleave", function () { kursor.style.opacity = "0"; });
    document.addEventListener("mouseenter", function () { kursor.style.opacity = "1"; });
  }

  /* ---- 8. magnetna dugmad ------------------------------------------ */
  if (fina && !mirno) {
    $$("[data-magnet]").forEach(function (el) {
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        var x = e.clientX - r.left - r.width / 2;
        var y = e.clientY - r.top - r.height / 2;
        el.style.transform = "translate(" + x * 0.16 + "px," + y * 0.22 + "px)";
      });
      el.addEventListener("mouseleave", function () { el.style.transform = ""; });
    });
  }

  /* ---- 9. traka sa slikama: vuci i strelice ------------------------- */
  $$("[data-traka]").forEach(function (traka) {
    var dole = false, pocetakX = 0, pocetakSkrol = 0, pomeraj = 0;

    traka.addEventListener("pointerdown", function (e) {
      if (e.pointerType === "touch") return;
      dole = true; pomeraj = 0;
      pocetakX = e.clientX;
      pocetakSkrol = traka.scrollLeft;
      traka.classList.add("vuce");
      traka.setPointerCapture(e.pointerId);
    });
    traka.addEventListener("pointermove", function (e) {
      if (!dole) return;
      var d = e.clientX - pocetakX;
      pomeraj = Math.abs(d);
      traka.scrollLeft = pocetakSkrol - d;
    });
    ["pointerup", "pointercancel"].forEach(function (dog) {
      traka.addEventListener(dog, function () { dole = false; traka.classList.remove("vuce"); });
    });
    traka.addEventListener("click", function (e) {
      if (pomeraj > 8) { e.preventDefault(); e.stopPropagation(); }
    }, true);

    var grupa = traka.closest("[data-traka-grupa]");
    if (grupa) {
      var korak = function () {
        var prva = traka.querySelector("figure");
        return prva ? prva.offsetWidth + 16 : traka.clientWidth * 0.8;
      };
      var nazad = $("[data-traka-nazad]", grupa);
      var napred = $("[data-traka-napred]", grupa);
      if (nazad) nazad.addEventListener("click", function () { traka.scrollBy({ left: -korak(), behavior: mirno ? "auto" : "smooth" }); });
      if (napred) napred.addEventListener("click", function () { traka.scrollBy({ left: korak(), behavior: mirno ? "auto" : "smooth" }); });
    }
  });

  /* ---- 10. lightbox ------------------------------------------------- */
  var okidaci = $$("[data-svetlo]");
  if (okidaci.length && typeof HTMLDialogElement === "function") {
    var dijalog = document.createElement("dialog");
    dijalog.className = "svetlo";
    dijalog.innerHTML =
      '<div class="svetlo__telo">' +
        '<div class="svetlo__vrh">' +
          '<span data-svetlo-broj></span>' +
          '<button class="krug" type="button" data-svetlo-zatvori aria-label="Zatvori galeriju">' +
            '<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M2 2l12 12M14 2L2 14" stroke="currentColor" fill="none" stroke-width="1.4"/></svg>' +
          "</button>" +
        "</div>" +
        '<div class="svetlo__slika"><img alt="" data-svetlo-slika></div>' +
        '<div class="svetlo__dno">' +
          '<button class="krug" type="button" data-svetlo-nazad aria-label="Prethodna fotografija">' +
            '<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M10 2L4 8l6 6" stroke="currentColor" fill="none" stroke-width="1.4"/></svg>' +
          "</button>" +
          '<span data-svetlo-opis></span>' +
          '<button class="krug" type="button" data-svetlo-napred aria-label="Sledeća fotografija">' +
            '<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M6 2l6 6-6 6" stroke="currentColor" fill="none" stroke-width="1.4"/></svg>' +
          "</button>" +
        "</div>" +
      "</div>";
    document.body.appendChild(dijalog);

    var slikaEl = $("[data-svetlo-slika]", dijalog);
    var opisEl = $("[data-svetlo-opis]", dijalog);
    var brojEl = $("[data-svetlo-broj]", dijalog);
    var spisak = [], indeks = 0;

    function prikazi(i) {
      if (!spisak.length) return;
      indeks = (i + spisak.length) % spisak.length;
      var s = spisak[indeks];
      slikaEl.src = s.src;
      slikaEl.alt = s.opis || "";
      opisEl.textContent = s.opis || "";
      brojEl.textContent = (indeks + 1) + " / " + spisak.length;
    }

    okidaci.forEach(function (o) {
      o.addEventListener("click", function () {
        var grupa = o.getAttribute("data-svetlo");
        spisak = okidaci.filter(function (x) { return x.getAttribute("data-svetlo") === grupa; })
          .map(function (x) {
            var img = x.querySelector("img");
            return {
              src: x.getAttribute("data-puna") || (img ? img.src : ""),
              opis: x.getAttribute("data-opis") || (img ? img.alt : "")
            };
          });
        prikazi(okidaci.filter(function (x) { return x.getAttribute("data-svetlo") === grupa; }).indexOf(o));
        dijalog.showModal();
        document.documentElement.classList.add("modal-otvoren");
      });
    });

    $("[data-svetlo-zatvori]", dijalog).addEventListener("click", function () { dijalog.close(); });
    $("[data-svetlo-nazad]", dijalog).addEventListener("click", function () { prikazi(indeks - 1); });
    $("[data-svetlo-napred]", dijalog).addEventListener("click", function () { prikazi(indeks + 1); });
    dijalog.addEventListener("close", function () { document.documentElement.classList.remove("modal-otvoren"); });
    dijalog.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { e.preventDefault(); prikazi(indeks + 1); }
      if (e.key === "ArrowLeft") { e.preventDefault(); prikazi(indeks - 1); }
    });
    dijalog.addEventListener("click", function (e) {
      if (e.target === dijalog) dijalog.close();
    });

    var tx = 0;
    dijalog.addEventListener("touchstart", function (e) { tx = e.changedTouches[0].clientX; }, { passive: true });
    dijalog.addEventListener("touchend", function (e) {
      var d = e.changedTouches[0].clientX - tx;
      if (Math.abs(d) > 48) prikazi(indeks + (d < 0 ? 1 : -1));
    }, { passive: true });
  }

  /* ---- 11. pitanja i odgovori -------------------------------------- */
  $$("[data-pitanje]").forEach(function (glava) {
    var telo = glava.nextElementSibling;
    glava.addEventListener("click", function () {
      var otvoreno = glava.getAttribute("aria-expanded") === "true";
      glava.setAttribute("aria-expanded", otvoreno ? "false" : "true");
      telo.setAttribute("data-otvoreno", otvoreno ? "0" : "1");
    });
  });

  /* ---- 12. obaveštenje (toast) ------------------------------------- */
  var obavest = null, obavestTajmer = null;
  window.poruka = function (tekst) {
    if (!obavest) {
      obavest = document.createElement("div");
      obavest.className = "obavestenje";
      obavest.setAttribute("role", "status");
      obavest.setAttribute("aria-live", "polite");
      document.body.appendChild(obavest);
    }
    obavest.textContent = tekst;
    obavest.classList.add("vidljivo");
    clearTimeout(obavestTajmer);
    obavestTajmer = setTimeout(function () { obavest.classList.remove("vidljivo"); }, 4200);
  };

  /* ---- 13. prelaz između stranica ---------------------------------- */
  if (!mirno && !("startViewTransition" in document)) {
    var zavesa = document.createElement("div");
    zavesa.className = "zavesa";
    document.body.appendChild(zavesa);
    document.addEventListener("click", function (e) {
      var a = e.target.closest("a");
      if (!a) return;
      if (a.target === "_blank" || a.hasAttribute("download")) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      var href = a.getAttribute("href") || "";
      if (!href || href.charAt(0) === "#" || href.indexOf("mailto:") === 0 ||
          href.indexOf("tel:") === 0 || href.indexOf("viber:") === 0 || href.indexOf("http") === 0) return;
      e.preventDefault();
      zavesa.classList.add("gore");
      setTimeout(function () { window.location.href = a.href; }, 380);
    });
    window.addEventListener("pageshow", function () { zavesa.classList.remove("gore"); });
  }

  /* ---- 13b. mape iz podesavanja --------------------------------- */
  $$("[data-mapa]").forEach(function (okvir) {
    var kljuc = okvir.getAttribute("data-mapa");
    var m = (C.mape || {})[kljuc];
    if (!m || !m.embed) return;
    var okvirIframe = document.createElement("iframe");
    okvirIframe.src = m.embed;
    okvirIframe.loading = "lazy";
    okvirIframe.title = "Mapa lokacije";
    okvirIframe.referrerPolicy = "no-referrer-when-downgrade";
    okvirIframe.allowFullscreen = true;
    okvir.innerHTML = "";
    okvir.appendChild(okvirIframe);
  });

  /* ---- 14. analitika (samo ako je oznaka uneta) -------------------- */
  if (C.ga4) {
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + C.ga4;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", C.ga4);
  }
  window.dogadjaj = function (ime, podaci) {
    if (typeof window.gtag === "function") window.gtag("event", ime, podaci || {});
  };

  $$('[data-veza="whatsapp"], [data-veza="telefon1"], [data-veza="telefon2"]').forEach(function (el) {
    el.addEventListener("click", function () {
      window.dogadjaj("kontakt_klik", { kanal: el.getAttribute("data-veza") });
    });
  });
})();
