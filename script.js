const themeStorageKey = "site-theme-mode";
const themeButtons = document.querySelectorAll("[data-theme-option]");
const systemThemeQuery = window.matchMedia("(prefers-color-scheme: dark)");

const resolveTheme = (mode) =>
  mode === "dark" || (mode === "system" && systemThemeQuery.matches) ? "dark" : "light";

const applyTheme = (mode) => {
  const resolvedTheme = resolveTheme(mode);

  document.documentElement.setAttribute("data-theme-mode", mode);
  document.documentElement.setAttribute("data-theme", resolvedTheme);
  document.documentElement.style.colorScheme = resolvedTheme;

  themeButtons.forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.themeOption === mode));
  });
};

const getInitialThemeMode = () => {
  try {
    return localStorage.getItem(themeStorageKey) || document.documentElement.dataset.themeMode || "system";
  } catch (error) {
    return document.documentElement.dataset.themeMode || "system";
  }
};

applyTheme(getInitialThemeMode());

themeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const mode = button.dataset.themeOption || "system";

    try {
      localStorage.setItem(themeStorageKey, mode);
    } catch (error) {}

    applyTheme(mode);
  });
});

const syncSystemTheme = () => {
  if ((document.documentElement.dataset.themeMode || "system") === "system") {
    applyTheme("system");
  }
};

if (systemThemeQuery.addEventListener) {
  systemThemeQuery.addEventListener("change", syncSystemTheme);
} else if (systemThemeQuery.addListener) {
  systemThemeQuery.addListener(syncSystemTheme);
}

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const revealElements = document.querySelectorAll("[data-reveal]");
const tiltElements = document.querySelectorAll("[data-tilt]");
const progressBar = document.querySelector(".scroll-progress span");
const header = document.querySelector(".site-header");

if (reducedMotion) {
  revealElements.forEach((element) => element.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.16,
      rootMargin: "0px 0px -10% 0px",
    }
  );

  revealElements.forEach((element) => revealObserver.observe(element));
}

const updateScrollState = () => {
  const scrollTop = window.scrollY;
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? scrollTop / scrollable : 0;

  if (progressBar) {
    progressBar.style.transform = `scaleX(${progress})`;
  }

  if (header) {
    header.classList.toggle("is-scrolled", scrollTop > 16);
  }
};

updateScrollState();
window.addEventListener("scroll", updateScrollState, { passive: true });

if (!reducedMotion) {
  tiltElements.forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const bounds = card.getBoundingClientRect();
      const x = event.clientX - bounds.left;
      const y = event.clientY - bounds.top;
      const centerX = bounds.width / 2;
      const centerY = bounds.height / 2;
      const rotateX = ((centerY - y) / bounds.height) * 10;
      const rotateY = ((x - centerX) / bounds.width) * 10;

      card.style.setProperty("--rotate-x", `${rotateX.toFixed(2)}deg`);
      card.style.setProperty("--rotate-y", `${rotateY.toFixed(2)}deg`);
      card.style.setProperty("--glow-x", `${(x / bounds.width) * 100}%`);
      card.style.setProperty("--glow-y", `${(y / bounds.height) * 100}%`);
    });

    card.addEventListener("pointerleave", () => {
      card.style.setProperty("--rotate-x", "0deg");
      card.style.setProperty("--rotate-y", "0deg");
      card.style.setProperty("--glow-x", "50%");
      card.style.setProperty("--glow-y", "50%");
    });
  });
}
