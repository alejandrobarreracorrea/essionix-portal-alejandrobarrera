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
  document.querySelectorAll(".bento, .block").forEach(function (group) {
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

  /* ---------- tilt 3D en celdas ---------- */
  if (fine && motionOK) {
    document.querySelectorAll(".cell").forEach(function (cell) {
      cell.classList.add("tilt");
      cell.addEventListener("mousemove", function (e) {
        var r = cell.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        var max = 5;
        cell.style.transform =
          "perspective(900px) rotateX(" + (-py * max).toFixed(2) + "deg) rotateY(" + (px * max).toFixed(2) + "deg) translateY(-3px)";
      });
      cell.addEventListener("mouseleave", function () { cell.style.transform = ""; });
    });
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
