/* Fondo del hero — "terminal viva": una bitácora de operación real (la
   decomisión legacy + auditoría FinOps ejecutadas por agentes) se tipea en
   fantasma al costado derecho del hero. La línea de la firma humana se
   resalta en cian: es el sello de la marca. Canvas 2D sin dependencias;
   respeta prefers-reduced-motion, se pausa fuera de viewport / pestaña
   oculta y se desactiva en pantallas angostas (chocaría con el texto). */
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
  var GRAY = [156, 156, 170];

  // Operación real, no utilería: decomisión con firma + FinOps (posts 3 y 11).
  var LINES = [
    "$ agent run decommission-legacy",
    "verificando DNS apunta a distro nueva… ok",
    "backup s3://legacy → 220 objetos ✓",
    "esperando firma humana [y/n] ✍  y",
    "liberando alias CloudFront… ok",
    "propagación DNS: 58/60 verificaciones ✓",
    "eliminando distribución EZ6LM98… hecho",
    "$ curl -I https://dominio → HTTP 200",
    "downtime: 0s · toil ahorrado: 1 tarde",
    "$ agent run finops-audit",
    "huérfanos detectados: 7 · ahorro: $118/mes"
  ];

  var W = 0, H = 0, feed = [], cursor = 0, ch = 0, tPrev = 0;
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var running = false, visible = true, raf = 0;

  function resize() {
    W = canvas.offsetWidth; H = canvas.offsetHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function rgba(c, a) { return "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + a + ")"; }

  function mix(t) {
    return [Math.round(A1[0] + (A2[0] - A1[0]) * t),
            Math.round(A1[1] + (A2[1] - A1[1]) * t),
            Math.round(A1[2] + (A2[2] - A1[2]) * t)];
  }

  // En pantallas angostas la bitácora chocaría con el texto del hero:
  // ahí el fondo son ondas de contorno suaves (mismas de iaopslatam).
  function drawWaves(t) {
    var N = 9;
    for (var i = 0; i < N; i++) {
      var base = (i + 1) / (N + 1) * H;
      ctx.beginPath();
      for (var x = 0; x <= W; x += 10) {
        var y = base
          + Math.sin(x * 0.006 + i * 0.9 + t * 0.00025) * 14
          + Math.sin(x * 0.0021 - i * 0.6 + t * 0.00014) * 24;
        x ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      var a = 0.06 + 0.10 * Math.abs(Math.sin(i * 0.7 + t * 0.0003));
      var c = mix(i / N);
      ctx.strokeStyle = "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + a + ")";
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  function draw(t) {
    ctx.clearRect(0, 0, W, H);
    if (W < 760) { drawWaves(t); return; }

    if (t - tPrev > 34) { // cadencia de tipeo (~30 caracteres/s)
      tPrev = t;
      ch++;
      var cur = LINES[cursor % LINES.length];
      if (ch >= cur.length + 14) { // pausa breve al final de cada línea
        ch = 0;
        cursor++;
        feed.push(cur);
        if (feed.length > 9) feed.shift();
      }
    }

    ctx.font = '13px "JetBrains Mono", monospace';
    ctx.textBaseline = "top";
    var x0 = W * 0.56, y0 = H * 0.14, lh = 26;
    for (var i = 0; i < feed.length; i++) {
      var line = feed[i];
      var firma = line.indexOf("✍") > -1;
      var c = firma ? A2 : (line[0] === "$" ? A1 : GRAY);
      var a = 0.06 + 0.11 * (i / feed.length) + (firma ? 0.10 : 0);
      ctx.fillStyle = rgba(c, a);
      ctx.fillText(line, x0, y0 + i * lh);
    }
    ctx.fillStyle = rgba(A2, 0.32);
    ctx.fillText(LINES[cursor % LINES.length].slice(0, ch) + "▌", x0, y0 + feed.length * lh);
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
