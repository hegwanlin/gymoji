(function () {
  var shots = document.querySelector(".shots");
  var dots = document.querySelectorAll("#dots span");
  if (shots && dots.length) {
    shots.addEventListener("scroll", function () {
      var items = shots.children;
      var best = 0, bestDist = Infinity;
      for (var i = 0; i < items.length; i++) {
        var d = Math.abs(items[i].offsetLeft - shots.scrollLeft - items[0].offsetLeft);
        if (d < bestDist) { bestDist = d; best = i; }
      }
      if (shots.scrollLeft + shots.clientWidth >= shots.scrollWidth - 2) best = items.length - 1;
      dots.forEach(function (dot, i) {
        if (i === best) dot.setAttribute("aria-current", "true");
        else dot.removeAttribute("aria-current");
      });
    }, { passive: true });
  }

  function selectText(el) {
    try {
      var range = document.createRange();
      range.selectNodeContents(el);
      var sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    } catch (e) {}
  }

  document.querySelectorAll("[data-copy]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var target = document.getElementById(btn.getAttribute("data-copy"));
      if (!target) return;
      var text = target.textContent.trim();
      var original = btn.textContent;
      var done = btn.getAttribute("data-done") || "已複製";
      function ok() {
        btn.textContent = done;
        setTimeout(function () { btn.textContent = original; }, 1800);
      }
      try {
        navigator.clipboard.writeText(text).then(ok, function () { selectText(target); });
      } catch (e) {
        selectText(target);
      }
    });
  });
})();
