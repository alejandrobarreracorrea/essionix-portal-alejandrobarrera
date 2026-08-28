/* =========================================================================
   Alejandro Barrera — portal personal
   - i18n ES/EN (data-es/data-en, persistido)
   - smooth scroll sin #
   - scroll-reveal escalonado (IntersectionObserver)
   - hero cinemático: cursor glow, tilt 3D en celdas, botones magnéticos
   - FAB + año
   ========================================================================= */
(function () {
  "use strict";

  var fine = window.matchMedia("(pointer: fine)").matches;
  var motionOK = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- i18n ---------- */
  var STORAGE_KEY = "ab-lang";
  var supported = ["es", "en"];
  var current = localStorage.getItem(STORAGE_KEY);
  if (supported.indexOf(current) === -1) {
    current = (navigator.language || "es").toLowerCase().indexOf("en") === 0 ? "en" : "es";
  }

  function applyLang(lang) {
    current = lang;
    document.documentElement.lang = lang === "en" ? "en" : "es-CO";
    localStorage.setItem(STORAGE_KEY, lang);
    document.querySelectorAll("[data-" + lang + "]").forEach(function (el) {
      var val = el.getAttribute("data-" + lang);
      if (val !== null) el.textContent = val;
    });
    document.querySelectorAll(".lang__opt").forEach(function (opt) {
      opt.classList.toggle("is-active", opt.getAttribute("data-lang") === lang);
    });
  }

  var langBtn = document.getElementById("lang");
  if (langBtn) langBtn.addEventListener("click", function () { applyLang(current === "es" ? "en" : "es"); });
  applyLang(current);

  /* ---------- smooth scroll sin # ---------- */
  function scrollToId(id) {
    var target = id === "top" ? document.body : document.getElementById(id);
    if (!target) return;
    var top = id === "top" ? 0 : target.getBoundingClientRect().top + window.pageYOffset - 60;
    window.scrollTo({ top: top, behavior: motionOK ? "smooth" : "auto" });
  }
  document.querySelectorAll("[data-scroll]").forEach(function (link) {
    link.addEventListener("click", function (e) { e.preventDefault(); scrollToId(link.getAttribute("data-scroll")); });
  });

  /* ---------- scroll-reveal escalonado ---------- */
  document.querySelectorAll(".strip, .movement").forEach(function (group) {
    group.querySelectorAll(".reveal").forEach(function (el, i) {
      el.style.setProperty("--rd", (i % 6) * 0.06 + "s");
    });
  });
  var reveal = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add("in"); io.unobserve(entry.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    reveal.forEach(function (el) { io.observe(el); });
  } else {
    reveal.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- cursor glow ---------- */
  var glow = document.querySelector(".cursor-glow");
  if (glow && fine && motionOK) {
    var gx = window.innerWidth / 2, gy = window.innerHeight / 2, cx = gx, cy = gy, raf = false;
    function loop() {
      cx += (gx - cx) * 0.16; cy += (gy - cy) * 0.16;
      glow.style.transform = "translate(" + cx + "px," + cy + "px) translate(-50%,-50%)";
      if (Math.abs(gx - cx) > 0.5 || Math.abs(gy - cy) > 0.5) { requestAnimationFrame(loop); } else { raf = false; }
    }
    window.addEventListener("mousemove", function (e) {
      gx = e.clientX; gy = e.clientY;
      if (!raf) { raf = true; requestAnimationFrame(loop); }
    }, { passive: true });
  }

  /* ---------- botones magnéticos ---------- */
  if (fine && motionOK) {
    document.querySelectorAll(".magnetic").forEach(function (btn) {
      btn.addEventListener("mousemove", function (e) {
        var r = btn.getBoundingClientRect();
        var mx = e.clientX - r.left - r.width / 2;
        var my = e.clientY - r.top - r.height / 2;
        btn.style.transform = "translate(" + mx * 0.25 + "px," + my * 0.35 + "px)";
      });
      btn.addEventListener("mouseleave", function () { btn.style.transform = ""; });
    });
  }

  /* ---------- registro de leads ---------- */
  var leadForm = document.getElementById("lead-form");
  if (leadForm) {
    var MSG = {
      es: { sending: "enviando…", ok: "✓ ¡Listo! Te escribo pronto.", err: "algo falló — intenta de nuevo o escríbeme por LinkedIn", invalid: "revisa tu nombre y email", config: "registro en mantenimiento — escríbeme por LinkedIn" },
      en: { sending: "sending…", ok: "✓ Done! I'll be in touch soon.", err: "something failed — retry or ping me on LinkedIn", invalid: "check your name and email", config: "signup under maintenance — ping me on LinkedIn" }
    };
    var statusEl = leadForm.querySelector(".regform__status");
    var btnEl = leadForm.querySelector("button[type=submit]");

    function setStatus(kind, key) {
      var t = MSG[current === "en" ? "en" : "es"];
      statusEl.textContent = t[key];
      statusEl.className = "regform__status" + (kind ? " " + kind : "");
    }

    leadForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var endpoint = leadForm.getAttribute("data-endpoint") || "";
      if (endpoint.indexOf("http") !== 0) { setStatus("err", "config"); return; }

      var data = {
        nombre: (leadForm.nombre.value || "").trim(),
        email: (leadForm.email.value || "").trim(),
        whatsapp: (leadForm.whatsapp.value || "").trim(),
        interes: leadForm.interes.value,
        web: leadForm.web.value || ""
      };
      if (data.nombre.length < 2 || !/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(data.email)) {
        setStatus("err", "invalid"); return;
      }

      btnEl.disabled = true;
      setStatus("", "sending");
      fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      })
        .then(function (r) { return r.json(); })
        .then(function (j) {
          if (j && j.ok) { setStatus("ok", "ok"); leadForm.reset(); }
          else { setStatus("err", "invalid"); }
        })
        .catch(function () { setStatus("err", "err"); })
        .finally(function () { btnEl.disabled = false; });
    });
  }

  /* ---------- FAB ---------- */
  var fab = document.querySelector(".fab");
  if (fab) {
    window.addEventListener("scroll", function () {
      fab.classList.toggle("is-visible", window.pageYOffset > window.innerHeight * 0.85);
    }, { passive: true });
  }

  /* ---------- año ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
