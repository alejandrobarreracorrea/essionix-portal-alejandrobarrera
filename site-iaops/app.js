/* IAOps LATAM — área de miembro: login sin contraseña (/entrar), dashboard (/app)
   y player de clase (/app/clase). La sesión es un token HMAC emitido por verify;
   vive en localStorage. El catálogo viene de catalog.js (window.IAOPS_CATALOG). */
(function () {
  "use strict";

  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  var EP = document.body.getAttribute("data-endpoint") || "";
  var TOKEN_KEY = "iaops_token";
  var NAME_KEY = "iaops_nombre";
  var CATALOG = window.IAOPS_CATALOG || [];

  function token() { return localStorage.getItem(TOKEN_KEY) || ""; }
  function post(payload) {
    return fetch(EP, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      .then(function (r) { return r.json(); });
  }
  function clearSession() { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(NAME_KEY); }
  function goLogin() {
    location.href = "/entrar/?next=" + encodeURIComponent(location.pathname + location.search);
  }
  function firstName(nombre) { return (nombre || "").split(" ")[0] || "miembro"; }
  function setStatus(el, kind, text) { el.textContent = text || ""; el.className = "status" + (kind ? " " + kind : ""); }

  var logoutEl = document.getElementById("logout");
  if (logoutEl) {
    if (token()) {
      logoutEl.addEventListener("click", function (e) { e.preventDefault(); clearSession(); location.href = "/"; });
    } else {
      // Sin sesión (clase gratis vista de anónimo): el link es para entrar.
      logoutEl.textContent = "Iniciar sesión";
      logoutEl.href = "/entrar/";
    }
  }
  var avatarInit = document.getElementById("avatar");
  if (avatarInit) {
    var savedName = localStorage.getItem(NAME_KEY) || "";
    if (savedName) avatarInit.textContent = savedName[0].toUpperCase();
  }

  /* ============================== /entrar ============================== */
  var loginForm = document.getElementById("login-form");
  if (loginForm) {
    var lStatus1 = document.getElementById("login-status-1");
    var lStatus2 = document.getElementById("login-status-2");
    var step1 = document.getElementById("login-step-1");
    var step2 = document.getElementById("login-step-2");
    var codeEl = document.getElementById("login-code");
    var resendEl = document.getElementById("login-resend");
    var verifyBtn = document.getElementById("login-verify-btn");
    var sendBtn = step1.querySelector("button[type=submit]");
    var loginEmail = "";
    var resendTimer = null;

    // ¿Ya hay sesión? — directo a donde iba.
    if (token()) { finishLogin(); }

    function nextUrl() {
      var next = new URLSearchParams(location.search).get("next") || "/app/";
      return next.indexOf("/") === 0 ? next : "/app/"; // solo rutas internas
    }
    function finishLogin() { location.href = nextUrl(); }
    function cooldown(secs) {
      var left = secs;
      resendEl.classList.add("is-disabled");
      clearInterval(resendTimer);
      resendTimer = setInterval(function () {
        left -= 1;
        if (left <= 0) { clearInterval(resendTimer); resendEl.classList.remove("is-disabled"); resendEl.textContent = "Reenviar código"; }
        else { resendEl.textContent = "reenviar en " + left + "s"; }
      }, 1000);
      resendEl.textContent = "reenviar en " + left + "s";
    }

    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (EP.indexOf("http") !== 0) { setStatus(lStatus1, "err", "acceso en mantenimiento"); return; }
      var email = (loginForm.email.value || "").trim().toLowerCase();
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(email)) { setStatus(lStatus1, "err", "revisa tu email"); return; }
      sendBtn.disabled = true;
      setStatus(lStatus1, "", "enviando…");
      post({ action: "login", email: email, web: loginForm.web.value || "" }).then(function (j) {
        if (j.ok) {
          loginEmail = email;
          document.getElementById("login-email-echo").textContent = email;
          step1.classList.add("is-hidden");
          step2.classList.remove("is-hidden");
          setStatus(lStatus2, "ok", "✓ código enviado");
          cooldown(60);
          codeEl.focus();
        } else if (j.error === "desconocido") {
          setStatus(lStatus1, "err", "ese correo no está en la comunidad — únete gratis abajo");
        } else if (j.error === "cooldown" || j.error === "max_sends") {
          setStatus(lStatus1, "err", "espera un momento e intenta de nuevo");
        } else { setStatus(lStatus1, "err", "algo falló — intenta de nuevo"); }
      }).catch(function () { setStatus(lStatus1, "err", "algo falló — intenta de nuevo"); })
        .finally(function () { sendBtn.disabled = false; });
    });

    function doVerify() {
      var code = (codeEl.value || "").replace(/\D/g, "");
      if (code.length !== 6) { setStatus(lStatus2, "err", "código incorrecto"); return; }
      verifyBtn.disabled = true;
      setStatus(lStatus2, "", "verificando…");
      post({ action: "verify", email: loginEmail, code: code }).then(function (j) {
        if (j.ok && j.token) {
          localStorage.setItem(TOKEN_KEY, j.token);
          localStorage.setItem(NAME_KEY, j.nombre || "");
          finishLogin();
        } else if (j.error === "expirado") { setStatus(lStatus2, "err", "el código venció — pide uno nuevo"); }
        else if (j.error === "max_attempts") { setStatus(lStatus2, "err", "demasiados intentos — pide un código nuevo"); }
        else { setStatus(lStatus2, "err", "código incorrecto"); }
      }).catch(function () { setStatus(lStatus2, "err", "algo falló — intenta de nuevo"); })
        .finally(function () { verifyBtn.disabled = false; });
    }
    verifyBtn.addEventListener("click", doVerify);
    codeEl.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); doVerify(); } });
    resendEl.addEventListener("click", function () {
      if (resendEl.classList.contains("is-disabled") || !loginEmail) return;
      post({ action: "resend", email: loginEmail }).then(function (j) {
        if (j.ok) { setStatus(lStatus2, "ok", "✓ código enviado"); cooldown(60); }
        else { setStatus(lStatus2, "err", "espera un momento para reenviar"); }
      }).catch(function () { setStatus(lStatus2, "err", "algo falló"); });
    });
  }

  /* =============================== /app =============================== */
  var dash = document.getElementById("app-dash");
  if (dash) {
    if (!token()) { goLogin(); return; }
    post({ action: "me", token: token() }).then(function (j) {
      if (!j.ok) { clearSession(); goLogin(); return; }
      var done = j.done || [];
      document.getElementById("dash-nombre").textContent = firstName(j.nombre);
      var avatarEl = document.getElementById("avatar");
      if (avatarEl) avatarEl.textContent = (firstName(j.nombre)[0] || "·").toUpperCase();

      // Continuar: la primera clase del catálogo que no esté completada.
      var next = null;
      for (var i = 0; i < CATALOG.length; i++) {
        if (done.indexOf(CATALOG[i].id) === -1) { next = CATALOG[i]; break; }
      }
      var contT = document.getElementById("cont-title");
      var contS = document.getElementById("cont-sub");
      var contBtn = document.getElementById("cont-btn");
      if (next) {
        contT.textContent = "▶ " + next.t;
        contS.textContent = "Clase " + (CATALOG.indexOf(next) + 1) + " de " + CATALOG.length + " · " + next.min + " min" +
          (next.video ? "" : " · se graba en " + next.eta);
        contBtn.href = "/app/clase/?c=" + next.id;
      } else {
        contT.textContent = "✓ Completaste el catálogo actual";
        contS.textContent = "Nuevas clases cada mes — te avisamos por correo.";
        contBtn.href = "/cursos/";
        contBtn.textContent = "Ver catálogo →";
      }
      document.getElementById("prog-clases").textContent = done.length + " de " + CATALOG.length;
      dash.classList.remove("is-hidden");
    }).catch(function () { clearSession(); goLogin(); });
  }

  /* ============================ /app/clase ============================ */
  var player = document.getElementById("player");
  if (player) {
    var id = (new URLSearchParams(location.search).get("c") || "a1").toLowerCase();
    var idx = -1;
    for (var k = 0; k < CATALOG.length; k++) if (CATALOG[k].id === id) { idx = k; break; }
    if (idx === -1) { location.href = "/cursos/"; return; }
    var clase = CATALOG[idx];

    // El muro está en consumir: las clases gratis se ven sin sesión.
    if (!clase.free && !token()) { goLogin(); return; }

    document.getElementById("cl-kicker").textContent =
      clase.cat + " · " + clase.lvl + " · clase " + (idx + 1) + " de " + CATALOG.length;
    document.getElementById("cl-title").textContent = clase.t;
    document.getElementById("cl-mision").textContent = clase.m;
    document.title = clase.t + " — IAOps LATAM";

    var videoEl = document.getElementById("cl-video");
    if (clase.video) {
      var frame = document.createElement("iframe");
      frame.src = clase.video;
      frame.allow = "autoplay; fullscreen; picture-in-picture";
      frame.allowFullscreen = true;
      videoEl.textContent = "";
      videoEl.appendChild(frame);
    } else {
      document.getElementById("cl-video-note").textContent =
        "📅 esta clase se graba en " + clase.eta + " — te avisamos por correo";
    }

    var nextClase = CATALOG[idx + 1] || null;
    var nextBtn = document.getElementById("cl-next");
    if (nextClase) { nextBtn.textContent = "Siguiente: " + nextClase.t + " →"; nextBtn.href = "/app/clase/?c=" + nextClase.id; }
    else { nextBtn.textContent = "Volver a mi aprendizaje →"; nextBtn.href = "/app/"; }

    var doneBtn = document.getElementById("cl-done");
    var doneNote = document.getElementById("cl-done-note");
    function markCompleted() { doneBtn.textContent = "✓ completada"; doneBtn.classList.add("is-disabled"); }
    if (!token()) {
      doneBtn.classList.add("is-hidden");
      doneNote.innerHTML = "<a href=\"/entrar/\" class=\"resend\">Entra con tu firma</a> para guardar tu progreso.";
    } else {
      post({ action: "me", token: token() }).then(function (j) {
        if (j.ok && (j.done || []).indexOf(clase.id) !== -1) markCompleted();
      }).catch(function () {});
      doneBtn.addEventListener("click", function (e) {
        e.preventDefault();
        if (doneBtn.classList.contains("is-disabled")) return;
        post({ action: "progress", token: token(), clase: clase.id }).then(function (j) {
          if (j.ok) { markCompleted(); }
          else if (j.error === "sesion") { clearSession(); goLogin(); }
        }).catch(function () {});
      });
    }
    player.classList.remove("is-hidden");
  }
})();
