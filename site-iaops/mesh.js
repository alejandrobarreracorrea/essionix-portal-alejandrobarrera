/* Fondo del hero — "ondas de contorno": capas de líneas topográficas que
   respiran lento, coloreadas con el gradiente de marca (violeta→cian).
   Canvas 2D sin dependencias; respeta prefers-reduced-motion, se pausa fuera
   de viewport / pestaña oculta y baja densidad en móvil. */
(function () {
  "use strict";

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var canvas = document.getElementById("mesh");
  if (!canvas || !canvas.getContext) return;
  var hero = canvas.closest(".hero");
  if (!hero) return;
  var ctx = canvas.getContext("2d");

  function tokenRGB(name, fallback) {
    var hex = getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
    var n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  var A1 = tokenRGB("--a1", "#8b7bff");
  var A2 = tokenRGB("--a2", "#38e0d8");

  var W = 0, H = 0;
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var running = false, visible = true, raf = 0;

  function lines() { return W < 640 ? 9 : 14; }

  function resize() {
    W = canvas.offsetWidth; H = canvas.offsetHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function mix(t) {
    return [Math.round(A1[0] + (A2[0] - A1[0]) * t),
            Math.round(A1[1] + (A2[1] - A1[1]) * t),
            Math.round(A1[2] + (A2[2] - A1[2]) * t)];
  }

  function draw(t) {
    ctx.clearRect(0, 0, W, H);
    var N = lines();
    for (var i = 0; i < N; i++) {
      var base = (i + 1) / (N + 1) * H;
      ctx.beginPath();
      for (var x = 0; x <= W; x += 10) {
        var y = base
          + Math.sin(x * 0.006 + i * 0.9 + t * 0.00025) * 18
          + Math.sin(x * 0.0021 - i * 0.6 + t * 0.00014) * 30;
        x ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      var a = 0.05 + 0.09 * Math.abs(Math.sin(i * 0.7 + t * 0.0003));
      var c = mix(i / N);
      ctx.strokeStyle = "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + a + ")";
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  function loop(t) {
    if (!running) return;
    draw(t);
    raf = requestAnimationFrame(loop);
  }
  function setRunning(on) {
    if (on === running) return;
    running = on;
    if (on) { raf = requestAnimationFrame(loop); } else { cancelAnimationFrame(raf); }
  }

  resize();
  var resizeTimer;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 150);
  });
  new IntersectionObserver(function (entries) {
    visible = entries[0].isIntersecting;
    setRunning(visible && !document.hidden);
  }).observe(hero);
  document.addEventListener("visibilitychange", function () {
    setRunning(visible && !document.hidden);
  });
  setRunning(true);
})();
