/* =========================================================================
   Alejandro Barrera — portal personal
   - Toggle de idioma ES/EN (atributos data-es / data-en, persistido)
   - Scroll suave SIN # en la URL
   - Scroll-reveal con IntersectionObserver
   - FAB visible tras el hero
   ========================================================================= */
(function () {
  "use strict";

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
  if (langBtn) {
    langBtn.addEventListener("click", function () {
      applyLang(current === "es" ? "en" : "es");
    });
  }
  applyLang(current);

  /* ---------- smooth scroll sin # ---------- */
  function scrollToId(id) {
    var target = id === "top" ? document.body : document.getElementById(id);
    if (!target) return;
    var top = id === "top" ? 0 : target.getBoundingClientRect().top + window.pageYOffset - 64;
    window.scrollTo({ top: top, behavior: "smooth" });
  }

  document.querySelectorAll("[data-scroll]").forEach(function (link) {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      scrollToId(link.getAttribute("data-scroll"));
    });
  });

  /* ---------- scroll-reveal ---------- */
  var reveal = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    reveal.forEach(function (el) { io.observe(el); });
  } else {
    reveal.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- FAB tras el hero ---------- */
  var fab = document.querySelector(".fab");
  if (fab) {
    window.addEventListener("scroll", function () {
      fab.classList.toggle("is-visible", window.pageYOffset > window.innerHeight * 0.7);
    }, { passive: true });
  }

  /* ---------- año footer ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
