/* Malla de operación del hero — canvas 2D sin dependencias.
   Familia "constellation mesh" (particles.js la popularizó; aquí versión propia):
   nodos a la deriva + enlaces coloreados con el gradiente de marca (violeta→cian)
   + "pulso de firma": cada pocos segundos un nodo emite un anillo (el momento
   de aprobación, sello de la marca). Respeta prefers-reduced-motion, se pausa
   fuera de viewport / pestaña oculta, y baja densidad en móvil. */
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
  var A1 = tokenRGB("--a1", "#8b7bff"); // violeta
  var A2 = tokenRGB("--a2", "#38e0d8"); // cian

  var SPEED = 0.32, CONNECT = 140, LINE_A = 0.14, DOT_A = 0.5;
  var W = 0, H = 0, pts = [], pulses = [], nextPulse = 0;
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var running = false, visible = true, raf = 0;

  function count() { return W < 640 ? 26 : 52; }

  function resize() {
    W = canvas.offsetWidth; H = canvas.offsetHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function seed() {
    pts = [];
    for (var k = 0, n = count(); k < n; k++) {
      pts.push({ x: Math.random() * W, y: Math.random() * H,
                 vx: (Math.random() - 0.5) * SPEED, vy: (Math.random() - 0.5) * SPEED });
    }
    pulses = [];
  }

  function mix(t) { // color del gradiente en t∈[0,1]
    return [Math.round(A1[0] + (A2[0] - A1[0]) * t),
            Math.round(A1[1] + (A2[1] - A1[1]) * t),
            Math.round(A1[2] + (A2[2] - A1[2]) * t)];
  }

  function draw(now) {
    ctx.clearRect(0, 0, W, H);
    var i, j, p, q, dx, dy, d2, a, c;

    for (i = 0; i < pts.length; i++) {
      p = pts[i];
      p.x = (p.x + p.vx + W) % W;
      p.y = (p.y + p.vy + H) % H;
    }
    for (i = 0; i < pts.length - 1; i++) {
      for (j = i + 1; j < pts.length; j++) {
        p = pts[i]; q = pts[j];
        dx = p.x - q.x; dy = p.y - q.y; d2 = dx * dx + dy * dy;
        if (d2 < CONNECT * CONNECT) {
          a = LINE_A * (1 - Math.sqrt(d2) / CONNECT);
          c = mix(((p.x + q.x) / 2) / W);
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + a + ")";
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }
    for (i = 0; i < pts.length; i++) {
      p = pts[i];
      c = mix(p.x / W);
      ctx.fillStyle = "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + DOT_A + ")";
      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.4, 0, 6.2832);
      ctx.fill();
    }

    // pulso de firma: anillo que se expande desde un nodo al azar
    if (now > nextPulse && pts.length) {
      pulses.push({ p: pts[(Math.random() * pts.length) | 0], t0: now });
      nextPulse = now + 3800 + Math.random() * 2600;
    }
    for (i = pulses.length - 1; i >= 0; i--) {
      var t = (now - pulses[i].t0) / 1400;
      if (t >= 1) { pulses.splice(i, 1); continue; }
      p = pulses[i].p;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3 + t * 34, 0, 6.2832);
      ctx.strokeStyle = "rgba(" + A2[0] + "," + A2[1] + "," + A2[2] + "," + (0.35 * (1 - t)) + ")";
      ctx.lineWidth = 1.1;
      ctx.stroke();
    }
  }

  function loop(now) {
    if (!running) return;
    draw(now);
    raf = requestAnimationFrame(loop);
  }
  function setRunning(on) {
    if (on === running) return;
    running = on;
    if (on) { raf = requestAnimationFrame(loop); } else { cancelAnimationFrame(raf); }
  }

  resize(); seed();
  var resizeTimer;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () { resize(); seed(); }, 150);
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
