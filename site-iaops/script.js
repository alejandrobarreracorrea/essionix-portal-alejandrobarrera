/* IAOps LATAM — JS mínimo: año + wizard de membresía (register/verify/resend/profile). */
(function () {
  "use strict";

  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  var leadForm = document.getElementById("lead-form");
  if (!leadForm) return;

  var MSG = {
    sending: "enviando…", verifying: "verificando…", codeSent: "✓ código enviado",
    err: "algo falló — intenta de nuevo", invalid: "revisa nombre y email",
    config: "registro en mantenimiento", badCode: "código incorrecto",
    expired: "el código venció — pide uno nuevo", cooldown: "espera un momento para reenviar",
    maxTries: "demasiados intentos — pide un código nuevo", resendIn: "reenviar en "
  };
  var endpoint = leadForm.getAttribute("data-endpoint") || "";
  var steps = [null,
    document.getElementById("reg-step-1"),
    document.getElementById("reg-step-2"),
    document.getElementById("reg-step-3"),
    document.getElementById("reg-step-4")];
  var status1 = document.getElementById("reg-status-1");
  var status2 = document.getElementById("reg-status-2");
  var status3 = document.getElementById("reg-status-3");
  var btn1 = steps[1].querySelector("button[type=submit]");
  var verifyBtn = document.getElementById("reg-verify-btn");
  var profileBtn = document.getElementById("reg-profile-btn");
  var skipEl = document.getElementById("reg-skip");
  var resendEl = document.getElementById("reg-resend");
  var codeEl = document.getElementById("reg-code");
  var barFill = document.getElementById("bar-fill");
  var regEmail = "";
  var resendTimer = null;

  function setStatus(el, kind, key) {
    el.textContent = key ? MSG[key] : "";
    el.className = "status" + (kind ? " " + kind : "");
  }
  function show(n) {
    for (var i = 1; i <= 4; i++) steps[i].classList.toggle("is-hidden", i !== n);
    var widths = { 1: "8%", 2: "40%", 3: "72%", 4: "100%" };
    if (barFill) barFill.style.width = widths[n];
    document.querySelectorAll(".steps span").forEach(function (s) {
      var k = parseInt(s.getAttribute("data-step"), 10);
      s.classList.toggle("is-active", k === n);
      s.classList.toggle("is-done", k < n || n === 4);
    });
  }
  function post(payload) {
    return fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      .then(function (r) { return r.json(); });
  }
  function cooldown(secs) {
    var left = secs;
    resendEl.classList.add("is-disabled");
    clearInterval(resendTimer);
    resendTimer = setInterval(function () {
      left -= 1;
      if (left <= 0) { clearInterval(resendTimer); resendEl.classList.remove("is-disabled"); resendEl.textContent = "Reenviar código"; }
      else { resendEl.textContent = MSG.resendIn + left + "s"; }
    }, 1000);
    resendEl.textContent = MSG.resendIn + left + "s";
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
        show(2); setStatus(status2, "ok", "codeSent"); cooldown(60); codeEl.focus();
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

  resendEl.addEventListener("click", function () {
    if (resendEl.classList.contains("is-disabled")) return;
    post({ action: "resend", email: regEmail }).then(function (j) {
      if (j.ok) { setStatus(status2, "ok", "codeSent"); cooldown(60); }
      else { setStatus(status2, "err", j.error === "cooldown" ? "cooldown" : "err"); }
    }).catch(function () { setStatus(status2, "err", "err"); });
  });

  profileBtn.addEventListener("click", function () {
    profileBtn.disabled = true;
    setStatus(status3, "", "sending");
    post({
      action: "profile", email: regEmail,
      pais: leadForm.pais.value, dedicacion: leadForm.dedicacion.value,
      rol: (leadForm.rol.value || "").trim(), empresa: (leadForm.empresa.value || "").trim(),
      linkedin: (leadForm.linkedin.value || "").trim(), whatsapp: (leadForm.whatsapp.value || "").trim(),
      canal: leadForm.canal.value, interes: leadForm.interes.value
    }).then(function (j) {
      if (j.ok) { show(4); } else { setStatus(status3, "err", "err"); }
    }).catch(function () { setStatus(status3, "err", "err"); })
      .finally(function () { profileBtn.disabled = false; });
  });
  skipEl.addEventListener("click", function () { show(4); });
})();
