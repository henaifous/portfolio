/* henaifuos.com: theme switch, scroll reveal and stat counters. No dependencies. */
(function () {
  "use strict";

  var root = document.documentElement;
  var reduceMotion =
    typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Theme switch: dark by default, the choice is remembered. */
  var themeButtons = document.querySelectorAll("[data-theme-option]");
  var themeColor = document.querySelector('meta[name="theme-color"]');

  function applyTheme(mode, persist) {
    root.setAttribute("data-theme", mode);
    themeButtons.forEach(function (button) {
      button.setAttribute("aria-pressed", String(button.getAttribute("data-theme-option") === mode));
    });
    if (themeColor) {
      themeColor.setAttribute("content", mode === "light" ? "#f5f6f0" : "#060706");
    }
    if (persist) {
      try {
        localStorage.setItem("site-theme-mode", mode);
      } catch (error) {}
    }
  }

  applyTheme(root.getAttribute("data-theme") === "light" ? "light" : "dark", false);
  themeButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      applyTheme(button.getAttribute("data-theme-option"), true);
    });
  });

  /* Scroll reveal: elements with data-reveal fade in once, the first time they are visible. */
  var revealItems = document.querySelectorAll("[data-reveal]");

  if (!("IntersectionObserver" in window)) {
    revealItems.forEach(function (item) {
      item.classList.add("is-in");
    });
  } else {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.01 }
    );
    revealItems.forEach(function (item) {
      observer.observe(item);
    });
  }

  /* Stat counters: the final value is in the HTML, the script only animates up to it. */
  function ease(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  document.querySelectorAll("[data-count]").forEach(function (el) {
    var target = parseFloat(el.getAttribute("data-count"));
    if (reduceMotion || isNaN(target)) return;

    var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
    var delay = parseInt(el.getAttribute("data-delay") || "900", 10);
    var duration = parseInt(el.getAttribute("data-duration") || "1200", 10);

    el.textContent = (0).toFixed(decimals);
    window.setTimeout(function () {
      var start;
      function frame(now) {
        if (start === undefined) start = now;
        var t = Math.min(1, (now - start) / duration);
        el.textContent = (target * ease(t)).toFixed(decimals);
        if (t < 1) window.requestAnimationFrame(frame);
      }
      window.requestAnimationFrame(frame);
    }, delay);
  });
})();
