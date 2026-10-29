(function () {
  // Paste the Apps Script web app URL (ends in /exec) between the quotes.
  // While this is empty, the page keeps showing the Google Form button.
  var ENDPOINT = window.GYMOJI_APPLY_ENDPOINT || "";

  var wrap = document.getElementById("apply-wrap");
  var fallback = document.getElementById("apply-fallback");
  var form = document.getElementById("apply-form");
  if (!wrap || !fallback || !form || !ENDPOINT) return;

  wrap.hidden = false;
  fallback.hidden = true;

  var button = document.getElementById("apply-submit");
  var status = document.getElementById("apply-status");
  var done = document.getElementById("apply-done");

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    status.textContent = "";
    status.removeAttribute("data-error");
    button.disabled = true;
    var label = button.textContent;
    button.textContent = "送出中…";

    var controller = typeof AbortController === "function" ? new AbortController() : null;
    var timer = setTimeout(function () { if (controller) controller.abort(); }, 15000);

    // Apps Script does not answer cross-site reads, so a sent request counts as success.
    fetch(ENDPOINT, {
      method: "POST",
      mode: "no-cors",
      body: new URLSearchParams(new FormData(form)),
      signal: controller ? controller.signal : undefined
    }).then(function () {
      form.hidden = true;
      done.hidden = false;
      done.setAttribute("tabindex", "-1");
      done.focus();
    }).catch(function () {
      button.disabled = false;
      button.textContent = label;
      status.setAttribute("data-error", "true");
      status.textContent = "送出失敗，請稍後再試，或直接來信 hegwanlin@gmail.com。";
    }).then(function () { clearTimeout(timer); });
  });
})();
