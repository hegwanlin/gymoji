(function () {
  var tour = document.querySelector(".tour");
  if (!tour) return;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var stage = tour.querySelector(".tour-stage");
  var copy = tour.querySelector(".tour-copy");
  var phone = tour.querySelector(".phone");
  var scaler = tour.querySelector(".scaler");
  var steps = tour.querySelectorAll(".tour-steps li");
  var screens = tour.querySelectorAll(".scr");
  var dots = tour.querySelectorAll(".tour-dots span");
  var header = document.querySelector(".site-header");
  var N = screens.length;
  var current = -1;
  var scale = 1;

  /* ---------- Sizing ---------- */
  function layout() {
    var hh = header ? header.offsetHeight : 57;
    tour.style.setProperty("--hh", hh + "px");
    var vw = window.innerWidth;
    var stageH = window.innerHeight - hh;
    var mobile = vw < 900;
    var avail = mobile ? stageH - copy.offsetHeight - 44 : stageH - 64;
    var pw = Math.min(mobile ? vw * 0.74 : 340, avail / 2.13);
    pw = Math.max(200, Math.min(340, pw));
    var bz = Math.round(pw * 0.03);
    scale = (pw - bz * 2) / 390;
    var ph = Math.round(844 * scale + bz * 2);
    phone.style.setProperty("--pw", Math.round(pw) + "px");
    tour.style.setProperty("--pw", Math.round(pw) + "px");
    phone.style.setProperty("--bz", bz + "px");
    phone.style.setProperty("--s", scale.toFixed(4));
    phone.style.setProperty("--ph", ph + "px");
  }

  /* ---------- Helpers ---------- */
  var timers = [];
  function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
  function every(fn, ms) { timers.push(setInterval(fn, ms)); }
  function clearTimers() { timers.forEach(function (t) { clearTimeout(t); clearInterval(t); }); timers = []; }

  function fmtNum(n, decimals) {
    return n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  }
  function countTo(el, from, to, ms, decimals) {
    if (!el) return;
    decimals = decimals || 0;
    if (reduce) { el.textContent = fmtNum(to, decimals); return; }
    var start = null;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min(1, (ts - start) / ms);
      var e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmtNum(from + (to - from) * e, decimals);
      if (p < 1 && el.isConnected) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  function mmss(sec) { var m = Math.floor(sec / 60), s = sec % 60; return m + ":" + (s < 10 ? "0" : "") + s; }

  // Show a tap ripple centred on an element inside the phone
  function tapOn(scr, el) {
    var tap = scr.querySelector(".tap");
    if (!tap || !el || reduce) return;
    var a = el.getBoundingClientRect(), b = scaler.getBoundingClientRect();
    tap.style.left = ((a.left + a.width / 2 - b.left) / scale) + "px";
    tap.style.top = ((a.top + a.height / 2 - b.top) / scale) + "px";
    tap.classList.remove("go"); void tap.offsetWidth; tap.classList.add("go");
  }

  /* ---------- Screen animations ---------- */
  var elapsed = 68;
  var players = [
    // 01 Workout: rate the set, tick it, volume updates, rest timer starts
    function (scr) {
      var target = scr.querySelector(".set.target");
      var fill = target.querySelector(".fill-anim");
      var pill = scr.querySelector(".rest-pill");
      var rest = scr.querySelector("[data-rest]");
      var vol = scr.querySelector("[data-vol]");
      var volTop = scr.querySelector("[data-vol-top]");
      var sets = scr.querySelector("[data-sets]");
      target.classList.remove("done"); fill.classList.remove("on"); pill.classList.remove("on");
      vol.textContent = "900"; volTop.textContent = "900"; sets.textContent = "2/24"; rest.textContent = "2:30";
      every(function () { elapsed++; scr.querySelector("[data-elapsed]").textContent = mmss(elapsed); }, 1000);
      if (reduce) { target.classList.add("done"); fill.classList.add("on"); pill.classList.add("on"); vol.textContent = "1,530"; volTop.textContent = "1,530"; sets.textContent = "3/24"; return; }
      later(function () { tapOn(scr, target.querySelector(".slider")); fill.classList.add("on"); }, 700);
      later(function () {
        tapOn(scr, target.querySelector(".tick"));
        target.classList.add("done");
        sets.textContent = "3/24";
        countTo(vol, 900, 1530, 700); countTo(volTop, 900, 1530, 700);
      }, 2000);
      later(function () {
        pill.classList.add("on");
        var left = 150;
        every(function () { left = Math.max(0, left - 1); rest.textContent = mmss(left); }, 1000);
      }, 2600);
      later(function () { clearTimers(); players[0](scr); }, 9000);
    },
    // 02 Lock screen: live activity slides in and counts down
    function (scr) {
      var live = scr.querySelector(".live");
      var t = scr.querySelector("[data-live]");
      var left = 67;
      t.textContent = mmss(left);
      live.classList.remove("on");
      later(function () { live.classList.add("on"); }, reduce ? 0 : 350);
      every(function () { left = left > 0 ? left - 1 : 67; t.textContent = mmss(left); }, 1000);
    },
    // 03 Share: numbers count up, rows appear, background options cycle, copy
    function (scr) {
      var card = scr.querySelector(".sh-card");
      var chips = scr.querySelectorAll(".bg-chips span");
      var toast = scr.querySelector(".toast");
      function setBg(i) { card.setAttribute("data-bg", i); chips.forEach(function (c, j) { c.classList.toggle("on", i === j); }); }
      scr.classList.remove("played"); setBg(0); toast.classList.remove("on");
      void scr.offsetWidth;
      scr.classList.add("played");
      countTo(scr.querySelector("[data-share-vol]"), 0, 12843.5, 1100, 1);
      if (reduce) return;
      later(function () { tapOn(scr, chips[1]); setBg(1); }, 2200);
      later(function () { tapOn(scr, chips[2]); setBg(2); }, 3600);
      later(function () { tapOn(scr, scr.querySelector(".big-btn.primary")); toast.classList.add("on"); }, 5000);
      later(function () { toast.classList.remove("on"); }, 6300);
      later(function () { clearTimers(); players[2](scr); }, 8000);
    },
    // 04 Analysis: total counts up, bars grow, body map fades in
    function (scr) {
      scr.classList.remove("played"); void scr.offsetWidth;
      scr.classList.add("played");
      countTo(scr.querySelector("[data-an-vol]"), 0, 84474, 1100);
    },
    // 05 Exercises: underline moves to 胸, rows stagger in
    function (scr) {
      var tabs = scr.querySelectorAll(".mtabs span");
      var line = scr.querySelector(".uline");
      function underline(i) {
        tabs.forEach(function (t, j) { t.classList.toggle("on", i === j); });
        line.style.setProperty("--ux", tabs[i].offsetLeft + "px");
        line.style.setProperty("--uw", tabs[i].offsetWidth + "px");
      }
      underline(0);
      scr.classList.remove("played"); void scr.offsetWidth;
      scr.classList.add("played");
      if (reduce) return;
      later(function () {
        tapOn(scr, tabs[1]); underline(1);
        scr.classList.remove("played"); void scr.offsetWidth;
        later(function () { scr.classList.add("played"); }, 120);
      }, 1800);
      later(function () { clearTimers(); players[4](scr); }, 6000);
    }
  ];

  /* ---------- Heat map cells for the analysis screen ---------- */
  var heat = tour.querySelector(".heat");
  if (heat) {
    var pattern = "110110010111101101101011";
    for (var i = 0; i < pattern.length; i++) {
      var c = document.createElement("i");
      if (pattern[i] === "1") c.className = "on";
      heat.appendChild(c);
    }
  }

  /* ---------- Step switching ---------- */
  function setActive(i) {
    if (i === current) return;
    current = i;
    clearTimers();
    steps.forEach(function (s, j) { s.classList.toggle("is-active", j === i); });
    dots.forEach(function (d, j) { d.classList.toggle("on", j === i); });
    screens.forEach(function (s, j) {
      s.classList.toggle("is-active", j === i);
      s.classList.toggle("is-past", j < i);
    });
    players[i](screens[i]);
  }

  function stepFromScroll() {
    var rect = tour.getBoundingClientRect();
    var range = tour.offsetHeight - stage.offsetHeight;
    var p = range > 0 ? -rect.top / range : 0;
    p = Math.max(0, Math.min(0.9999, p));
    return Math.floor(p * N);
  }

  var ticking = false;
  window.addEventListener("scroll", function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { ticking = false; setActive(stepFromScroll()); });
  }, { passive: true });

  window.addEventListener("resize", function () { layout(); });

  // Clicking a step title scrolls to that step
  steps.forEach(function (li, i) {
    li.querySelector("button").addEventListener("click", function () {
      var range = tour.offsetHeight - stage.offsetHeight;
      var y = window.scrollY + tour.getBoundingClientRect().top + range * (i + 0.5) / N;
      window.scrollTo({ top: y, behavior: reduce ? "auto" : "smooth" });
    });
  });

  layout();
  setActive(stepFromScroll());
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);

  /* ---------- Feature cards animate when they enter the viewport ---------- */
  var cards = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.45 });
    cards.forEach(function (c) { io.observe(c); });
  } else {
    cards.forEach(function (c) { c.classList.add("in"); });
  }
})();
