(function () {
  "use strict";

  const CHAR_MS = 16;
  const FADE_MS = 1400;

  const prefersReducedMotion = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const delay = (ms) =>
    new Promise((resolve) => {
      window.setTimeout(resolve, ms);
    });

  async function waitForFonts() {
    if (!document.fonts?.ready) return;

    try {
      await Promise.race([
        document.fonts.ready,
        new Promise((resolve) => window.setTimeout(resolve, 1200)),
      ]);
    } catch {
      console.warn("Font loading timeout");
    }
  }

  const readTypewriterSource = (el) => {
    if (el.dataset.typewriterSource) {
      return el.dataset.typewriterSource.replace(/&#10;/g, "\n");
    }

    return el.textContent.trim();
  };

  const getTypewriterLines = (el) =>
    readTypewriterSource(el)
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

  const buildTypewriterLayout = (container, revealAll = false) => {
    const lines = getTypewriterLines(container);
    const chars = [];

    container.textContent = "";

    lines.forEach((line) => {
      const lineEl = document.createElement("span");
      lineEl.className = "hero-typewriter__line";

      for (const char of line) {
        const span = document.createElement("span");
        span.className = "hero-typewriter__char";
        span.textContent = char === " " ? "\u00A0" : char;
        span.style.setProperty("--char-delay", `${chars.length * CHAR_MS}ms`);
        if (revealAll) span.classList.add("is-shown");
        lineEl.appendChild(span);
        chars.push(span);
      }

      container.appendChild(lineEl);
    });

    return chars;
  };

  const typeChars = (chars) =>
    new Promise((resolve) => {
      if (!chars.length) {
        resolve();
        return;
      }

      chars.forEach((char) => char.classList.add("is-shown"));
      window.setTimeout(resolve, chars.length * CHAR_MS + 50);
    });

  const revealFadeBlocks = () => {
    document.querySelectorAll(".hero__fade").forEach((el) => {
      el.classList.add("is-revealed");
    });
  };

  const resetFadeBlocks = () => {
    document.querySelectorAll(".hero__fade").forEach((el) => {
      el.classList.remove("is-revealed");
    });
  };

  const restoreHeroEnter = () => {
    const typewriter = document.querySelector(".hero-typewriter");

    if (typewriter) {
      buildTypewriterLayout(typewriter, true);
    }

    resetFadeBlocks();
    document.documentElement.classList.remove("is-content-ready");
  };

  const runHeroEnter = async () => {
    const typewriter = document.querySelector(".hero-typewriter");
    const hook = document.querySelector(".hero__block--hook");

    if (!typewriter) {
      document.documentElement.classList.remove("is-booting");
      document.documentElement.classList.add("is-content-ready");
      revealFadeBlocks();
      window.dispatchEvent(new CustomEvent("hero-enter-complete"));
      return;
    }

    const chars = buildTypewriterLayout(typewriter);

    if (hook) {
      const height = hook.offsetHeight;
      if (height > 0) hook.style.minHeight = `${height}px`;
    }

    document.documentElement.classList.remove("is-booting");
    document.documentElement.classList.add("is-content-ready");

    await typeChars(chars);

    requestAnimationFrame(() => {
      revealFadeBlocks();
    });

    await delay(FADE_MS);
    window.dispatchEvent(new CustomEvent("hero-enter-complete"));
  };

  const boot = async () => {
    await waitForFonts();

    if (prefersReducedMotion()) {
      const typewriter = document.querySelector(".hero-typewriter");
      if (typewriter) buildTypewriterLayout(typewriter, true);

      document.documentElement.classList.remove("is-booting");
      document.documentElement.classList.add("is-content-ready");
      revealFadeBlocks();
      window.dispatchEvent(new CustomEvent("hero-enter-complete"));
      return;
    }

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        runHeroEnter();
      });
    });
  };

  window.addEventListener(
    "pageshow",
    (event) => {
      if (!event.persisted) return;

      window.scrollTo(0, 0);
      restoreHeroEnter();

      if (!prefersReducedMotion()) {
        requestAnimationFrame(() => {
          runHeroEnter();
        });
      } else {
        document.documentElement.classList.add("is-content-ready");
        const typewriter = document.querySelector(".hero-typewriter");
        if (typewriter) buildTypewriterLayout(typewriter, true);
        revealFadeBlocks();
      }
    },
    { passive: true }
  );

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
