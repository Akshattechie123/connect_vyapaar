/* Connect Vyapaar — site behaviour.
   Edit SITE below to connect the forms:
   - whatsapp: digits only with country code, e.g. "919876543210". Empty = forms show a copy / email option instead.
   - email: where "Email this request" opens. */
var SITE = {
  whatsapp: "",
  email: "connectvyapaarofficial@gmail.com"
};

(function () {
  "use strict";
  var doc = document, html = doc.documentElement;
  html.classList.add("js");
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  function $(s, r) { return (r || doc).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || doc).querySelectorAll(s)); }

  /* ---------- Header: mobile menu + shadow on scroll ---------- */
  var mb = $(".menu-btn"), nav = $(".nav"), head = $(".site-head");
  function closeMenu() { if (nav && nav.classList.contains("open")) { nav.classList.remove("open"); mb.setAttribute("aria-expanded", "false"); } }
  if (mb && nav) {
    mb.addEventListener("click", function () {
      var o = nav.classList.toggle("open");
      mb.setAttribute("aria-expanded", o ? "true" : "false");
    });
    nav.addEventListener("click", function (e) { if (e.target.closest("a")) closeMenu(); });
    doc.addEventListener("keydown", function (e) { if (e.key === "Escape") closeMenu(); });
    window.addEventListener("resize", function () { if (window.innerWidth > 1020) closeMenu(); });
  }
  function onScroll() { if (head) head.classList.toggle("scrolled", window.scrollY > 8); }
  onScroll(); window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Tabs (requirement ticket + pillars) ---------- */
  $$("[data-tabs]").forEach(function (box) {
    var btns = $$("[role=tab]", box);
    function select(b, focus) {
      btns.forEach(function (x) {
        var on = x === b;
        x.setAttribute("aria-selected", on ? "true" : "false");
        x.tabIndex = on ? 0 : -1;
        var p = doc.getElementById(x.getAttribute("aria-controls"));
        if (p) p.hidden = !on;
      });
      if (focus) b.focus();
    }
    btns.forEach(function (b, i) {
      b.addEventListener("click", function () { select(b); });
      b.addEventListener("keydown", function (e) {
        var k = e.key, n = -1;
        if (k === "ArrowRight" || k === "ArrowDown") n = (i + 1) % btns.length;
        else if (k === "ArrowLeft" || k === "ArrowUp") n = (i - 1 + btns.length) % btns.length;
        else if (k === "Home") n = 0; else if (k === "End") n = btns.length - 1;
        if (n > -1) { e.preventDefault(); select(btns[n], true); }
      });
    });
  });

  /* ---------- Forms: compose the request, send on WhatsApp or by email ---------- */
  function selectPre(out) {
    var r = doc.createRange(); r.selectNodeContents($("pre", out));
    var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
  }
  $$("form[data-kind]").forEach(function (f) {
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!f.reportValidity()) return;
      var lines = ["Connect Vyapaar — " + f.dataset.kind];
      $$("input,select,textarea", f).forEach(function (el) {
        if (!el.value) return;
        var lab = $('label[for="' + el.id + '"]', f);
        lines.push((lab ? lab.textContent.replace(/\s*\*$/, "") : el.name) + ": " + el.value);
      });
      var msg = lines.join("\n");
      var mail = "mailto:" + SITE.email + "?subject=" + encodeURIComponent(f.dataset.kind + " — Connect Vyapaar") + "&body=" + encodeURIComponent(msg);
      var out = $(".form-result", f) || doc.createElement("div");
      out.className = "form-result"; out.setAttribute("role", "status");
      if (SITE.whatsapp) {
        var url = "https://wa.me/" + SITE.whatsapp + "?text=" + encodeURIComponent(msg);
        out.innerHTML = "<b>Your request is ready.</b><span>Send it to our team on WhatsApp, or email it.</span>" +
          '<div class="btn-row"><a class="btn btn-primary" target="_blank" rel="noopener" href="' + url + '">Send on WhatsApp</a>' +
          '<a class="btn btn-ghost" href="' + mail + '">Email this request</a></div>';
      } else {
        out.innerHTML = "<b>Your request is ready to send.</b><span>Email it to <b></b>, or copy it and send it on WhatsApp.</span><pre></pre>" +
          '<div class="btn-row"><a class="btn btn-primary" href="' + mail + '">Email this request</a><button type="button" class="btn btn-ghost">Copy message</button></div>';
        $("span b", out).textContent = SITE.email;
        $("pre", out).textContent = msg;
        $("button", out).addEventListener("click", function (ev) {
          var btn = ev.currentTarget;
          if (navigator.clipboard) navigator.clipboard.writeText(msg).then(function () { btn.textContent = "Copied"; }, function () { selectPre(out); });
          else selectPre(out);
        });
      }
      if (!out.parentNode) f.appendChild(out);
      out.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "nearest" });
    });
  });

  /* ---------- Pricing term toggle ---------- */
  var tg = $("[data-term]");
  if (tg) $$("button", tg).forEach(function (b) {
    b.addEventListener("click", function () {
      $$("button", tg).forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      var t = b.dataset.t;
      $$("[data-p6]").forEach(function (el) { el.textContent = el.dataset["p" + t]; });
      $$("[data-m6]").forEach(function (el) { el.textContent = el.dataset["m" + t]; });
      $$("[data-s12]").forEach(function (el) { el.textContent = t === "12" ? el.dataset.s12 : ""; });
      $$("[data-termlabel]").forEach(function (el) { el.textContent = t === "12" ? "for 12 months" : "for 6 months"; });
    });
  });

  /* ---------- Services: search + category scroll-spy ---------- */
  var q = $("#svc-q");
  if (q) q.addEventListener("input", function () {
    var v = q.value.trim().toLowerCase(), total = 0;
    $$(".svc-cat").forEach(function (cat) {
      var n = 0;
      $$(".svc", cat).forEach(function (s) {
        var hit = !v || s.textContent.toLowerCase().indexOf(v) > -1;
        s.hidden = !hit; if (hit) n++;
      });
      cat.hidden = n === 0; total += n;
    });
    $("#svc-empty").hidden = total > 0;
  });
  var svcNav = $(".svc-nav");
  if (svcNav && "IntersectionObserver" in window) {
    var links = $$("a", svcNav);
    var spy = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a) {
          var on = a.getAttribute("href") === "#" + en.target.id;
          a.classList.toggle("active", on);
          if (on) svcNav.scrollTo({ left: a.offsetLeft - svcNav.clientWidth / 2 + a.offsetWidth / 2, behavior: reduce ? "auto" : "smooth" });
        });
      });
    }, { rootMargin: "-30% 0px -60% 0px" });
    $$(".svc-cat").forEach(function (c) { spy.observe(c); });
    var firstCat = $(".svc-cat");
    window.addEventListener("scroll", function () {
      if (firstCat && window.scrollY < firstCat.offsetTop - 260) links.forEach(function (a, i) { a.classList.toggle("active", i === 0); });
    }, { passive: true });
  }

  /* ---------- Copy buttons ---------- */
  $$("[data-copy]").forEach(function (b) {
    b.addEventListener("click", function () {
      var t = b.dataset.copy;
      if (navigator.clipboard) navigator.clipboard.writeText(t).then(function () { b.textContent = "Copied"; setTimeout(function () { b.textContent = "Copy"; }, 1800); }, function () {});
    });
  });

  /* ---------- FAQ: smooth open / close ---------- */
  $$(".faq details").forEach(function (d) {
    var s = $("summary", d), a = $(".ans", d);
    if (!s || !a) return;
    s.addEventListener("click", function (e) {
      e.preventDefault();
      if (reduce) { d.open = !d.open; return; }
      if (d.open) {
        a.style.height = a.offsetHeight + "px"; a.style.overflow = "hidden";
        requestAnimationFrame(function () { a.style.transition = "height .28s ease"; a.style.height = "0px"; });
        a.addEventListener("transitionend", function () { d.open = false; a.removeAttribute("style"); }, { once: true });
      } else {
        d.open = true;
        var h = a.offsetHeight; a.style.height = "0px"; a.style.overflow = "hidden";
        requestAnimationFrame(function () { a.style.transition = "height .3s ease"; a.style.height = h + "px"; });
        a.addEventListener("transitionend", function () { a.removeAttribute("style"); }, { once: true });
      }
    });
  });

  /* ---------- Reveal on scroll, count-up, timeline fill ---------- */
  function countUp(el) {
    var to = parseInt(el.dataset.count, 10), t0 = performance.now(), d = 1100;
    (function step(t) {
      var p = Math.min(1, (t - t0) / d), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(to * e);
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  }
  var targets = $$("[data-reveal],[data-count],.flow");
  if (reduce || !("IntersectionObserver" in window)) {
    targets.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target; io.unobserve(el);
        el.classList.add("in");
        if (el.dataset.count !== undefined) countUp(el);
      });
    }, { threshold: 0.18, rootMargin: "0px 0px -6% 0px" });
    targets.forEach(function (el) { io.observe(el); });
  }

  /* ---------- SVG motion: stop travelling dot when motion is reduced ---------- */
  if (reduce) $$("svg").forEach(function (s) { if (s.pauseAnimations) s.pauseAnimations(); });

  /* ---------- Floating WhatsApp button (only when a number is set) ---------- */
  if (SITE.whatsapp) {
    var w = doc.createElement("a");
    w.className = "wa-float"; w.target = "_blank"; w.rel = "noopener";
    w.href = "https://wa.me/" + SITE.whatsapp + "?text=" + encodeURIComponent("Hello Connect Vyapaar, I would like to know more.");
    w.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20l1.3-4.2A8 8 0 1112 20a8 8 0 01-3.8-1z"/><path d="M9 9c0 3 3 6 6 6l1-1.5-2-1-1 .8c-.8-.4-1.7-1.3-2.1-2.1l.8-1-1-2z"/></svg>Chat with us';
    doc.body.appendChild(w);
  }
})();
