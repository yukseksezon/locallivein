/* Rehber — sayfa davranışları (bölge filtresi, sıralama, arama). JS kapalıysa her şey yine görünür. */
(function () {
  "use strict";
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }

  /* ---------- Kategori sayfası: bölge filtresi + sıralama ---------- */
  var grid = document.querySelector("[data-list]");
  if (grid) {
    var cards = [].slice.call(grid.querySelectorAll(".card"));
    var count = document.querySelector("[data-count]");
    var chips = document.querySelectorAll("[data-area-chip]");
    var sel = document.getElementById("sort");
    var area = store("rehber-area") || "Tümü";

    var applyArea = function () {
      var shown = 0;
      cards.forEach(function (c) {
        var a = c.getAttribute("data-area");
        var ok = area === "Tümü" || a === area || a === "both";
        c.hidden = !ok;
        if (ok) shown++;
      });
      chips.forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-area-chip") === area)); });
      if (count) count.textContent = shown + " mekân";
      var empty = document.querySelector("[data-empty]");
      if (empty) empty.hidden = shown > 0;
    };
    var applySort = function () {
      var by = sel ? sel.value : "score";
      cards.sort(function (a, b) {
        if (by === "name") return a.getAttribute("data-name").localeCompare(b.getAttribute("data-name"), "tr");
        return parseFloat(b.getAttribute("data-score")) - parseFloat(a.getAttribute("data-score"));
      }).forEach(function (c) { grid.appendChild(c); });
    };
    chips.forEach(function (b) {
      b.addEventListener("click", function () { area = b.getAttribute("data-area-chip"); store("rehber-area", area); applyArea(); });
    });
    if (sel) sel.addEventListener("change", applySort);
    applyArea();
  }

  /* ---------- Ana sayfa: arama ---------- */
  var q = document.getElementById("q"), out = document.getElementById("results");
  if (q && out && window.SEARCH) {
    var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
    q.addEventListener("input", function () {
      var t = q.value.trim().toLocaleLowerCase("tr");
      if (!t) { out.hidden = true; return; }
      var hits = window.SEARCH.filter(function (s) { return s.k.indexOf(t) > -1; }).slice(0, 14);
      out.innerHTML = hits.length
        ? hits.map(function (s) { return '<li><a href="' + s.u + '"><span>' + esc(s.n) + '</span><small>' + esc(s.c) + '</small></a></li>'; }).join("")
        : '<li><a aria-disabled="true"><span>Sonuç yok</span></a></li>';
      out.hidden = false;
    });
    q.addEventListener("keydown", function (e) { if (e.key === "Escape") out.hidden = true; });
  }
})();
