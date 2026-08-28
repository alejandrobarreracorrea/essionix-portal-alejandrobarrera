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

  /* ---------- scroll por anclas NATIVAS (href="#id") — el navegador hace el
     trabajo (siempre funciona); el JS solo limpia el # de la URL después. ---------- */
  document.querySelectorAll("a[data-scroll]").forEach(function (link) {
    var id = link.getAttribute("data-scroll");
    if (!link.getAttribute("href")) link.setAttribute("href", "#" + id);
    link.addEventListener("click", function () {
      setTimeout(function () {
        history.replaceState(null, "", window.location.pathname + window.location.search);
      }, 500);
    });
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

  /* ---------- registro de leads (con verificación por código) ---------- */
  var leadForm = document.getElementById("lead-form");
  if (leadForm) {
    var MSG = {
      es: { sending: "enviando…", verifying: "verificando…", codeSent: "✓ código enviado", err: "algo falló — intenta de nuevo o escríbeme por LinkedIn", invalid: "revisa los campos marcados con *", config: "registro en mantenimiento — escríbeme por LinkedIn", badCode: "código incorrecto — revisa e intenta de nuevo", expired: "el código venció — pide uno nuevo", cooldown: "espera un momento antes de reenviar", maxTries: "demasiados intentos — pide un código nuevo", resendIn: "reenviar en " },
      en: { sending: "sending…", verifying: "verifying…", codeSent: "✓ code sent", err: "something failed — retry or ping me on LinkedIn", invalid: "check the fields marked with *", config: "signup under maintenance — ping me on LinkedIn", badCode: "wrong code — check and retry", expired: "code expired — request a new one", cooldown: "wait a moment before resending", maxTries: "too many tries — request a new code", resendIn: "resend in " }
    };
    var endpoint = leadForm.getAttribute("data-endpoint") || "";
    var step1 = document.getElementById("reg-step-1");
    var step2 = document.getElementById("reg-step-2");
    var step3 = document.getElementById("reg-step-3");
    var step4 = document.getElementById("reg-step-4");
    var status1 = step1.querySelector(".regform__status");
    var status2 = document.getElementById("reg-status-2");
    var status3 = document.getElementById("reg-status-3");
    var btn1 = step1.querySelector("button[type=submit]");
    var verifyBtn = document.getElementById("reg-verify-btn");
    var profileBtn = document.getElementById("reg-profile-btn");
    var skipEl = document.getElementById("reg-skip");
    var resendEl = document.getElementById("reg-resend");
    var codeEl = document.getElementById("reg-code");
    var barFill = document.getElementById("regbar-fill");
    var regEmail = "";
    var resendTimer = null;

    function t(key) { return MSG[current === "en" ? "en" : "es"][key]; }
    function setStatus(el, kind, key) { el.textContent = key ? t(key) : ""; el.className = el.className.replace(/ (ok|err)/g, "").trim(); if (kind) el.className += " " + kind; }
    function show(step) {
      step1.classList.toggle("is-hidden", step !== 1);
      step2.classList.toggle("is-hidden", step !== 2);
      step3.classList.toggle("is-hidden", step !== 3);
      step4.classList.toggle("is-hidden", step !== 4);
      var widths = { 1: "8%", 2: "40%", 3: "72%", 4: "100%" };
      if (barFill) barFill.style.width = widths[step];
      document.querySelectorAll(".regstep").forEach(function (s) {
        var n = parseInt(s.getAttribute("data-step"), 10);
        s.classList.toggle("is-active", n === step);
        s.classList.toggle("is-done", n < step || step === 4);
      });
    }
    function post(payload) {
      return fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
        .then(function (r) { return r.json().then(function (j) { j._status = r.status; return j; }); });
    }
    function startResendCooldown(secs) {
      var left = secs;
      resendEl.classList.add("is-disabled");
      clearInterval(resendTimer);
      resendTimer = setInterval(function () {
        left -= 1;
        if (left <= 0) { clearInterval(resendTimer); resendEl.classList.remove("is-disabled"); resendEl.textContent = t("resendIn").replace(/en $|in $/, "") && (current === "en" ? "Resend code" : "Reenviar código"); }
        else { resendEl.textContent = t("resendIn") + left + "s"; }
      }, 1000);
      resendEl.textContent = t("resendIn") + left + "s";
    }

    leadForm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (endpoint.indexOf("http") !== 0) { setStatus(status1, "err", "config"); return; }
      var data = {
        action: "register",
        nombre: (leadForm.nombre.value || "").trim(),
        email: (leadForm.email.value || "").trim(),
        web: leadForm.web.value || ""
      };
      if (data.nombre.length < 2 || !/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(data.email)) { setStatus(status1, "err", "invalid"); return; }
      btn1.disabled = true;
      setStatus(status1, "", "sending");
      post(data).then(function (j) {
        regEmail = data.email;
        if (j.ok && j.verified) { show(3); return; }
        if (j.ok) {
          document.getElementById("reg-email-echo").textContent = regEmail;
          show(2); setStatus(status2, "ok", "codeSent"); startResendCooldown(60); codeEl.focus();
        } else { setStatus(status1, "err", j.error === "cooldown" ? "cooldown" : "invalid"); }
      }).catch(function () { setStatus(status1, "err", "err"); })
        .finally(function () { btn1.disabled = false; });
    });

    function doVerify() {
      var code = (codeEl.value || "").replace(/\D/g, "");
      if (code.length !== 6) { setStatus(status2, "err", "badCode"); return; }
      verifyBtn.disabled = true;
      setStatus(status2, "", "verifying");
      post({ action: "verify", email: regEmail, code: code }).then(function (j) {
        if (j.ok && j.verified) { show(3); }
        else if (j.error === "expirado") { setStatus(status2, "err", "expired"); }
        else if (j.error === "max_attempts") { setStatus(status2, "err", "maxTries"); }
        else { setStatus(status2, "err", "badCode"); }
      }).catch(function () { setStatus(status2, "err", "err"); })
        .finally(function () { verifyBtn.disabled = false; });
    }
    verifyBtn.addEventListener("click", doVerify);
    codeEl.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); doVerify(); } });

    profileBtn.addEventListener("click", function () {
      profileBtn.disabled = true;
      setStatus(status3, "", "sending");
      post({
        action: "profile",
        email: regEmail,
        pais: leadForm.pais.value,
        dedicacion: leadForm.dedicacion.value,
        rol: (leadForm.rol.value || "").trim(),
        empresa: (leadForm.empresa.value || "").trim(),
        linkedin: (leadForm.linkedin.value || "").trim(),
        whatsapp: (leadForm.whatsapp.value || "").trim(),
        canal: leadForm.canal.value,
        interes: leadForm.interes.value
      }).then(function (j) {
        if (j.ok) { show(4); } else { setStatus(status3, "err", "err"); }
      }).catch(function () { setStatus(status3, "err", "err"); })
        .finally(function () { profileBtn.disabled = false; });
    });
    skipEl.addEventListener("click", function () { show(4); });

    resendEl.addEventListener("click", function () {
      if (resendEl.classList.contains("is-disabled")) return;
      post({ action: "resend", email: regEmail }).then(function (j) {
        if (j.ok) { setStatus(status2, "ok", "codeSent"); startResendCooldown(60); }
        else { setStatus(status2, "err", j.error === "cooldown" ? "cooldown" : "err"); }
      }).catch(function () { setStatus(status2, "err", "err"); });
    });
  }

  /* ---------- FAB ---------- */
  var fab = document.querySelector(".fab");
  if (fab) {
    var scroller = document.scrollingElement || document.documentElement;
    window.addEventListener("scroll", function () {
      fab.classList.toggle("is-visible", scroller.scrollTop > window.innerHeight * 0.85);
    }, { passive: true });
  }

  /* ---------- año ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
