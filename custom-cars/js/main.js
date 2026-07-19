if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

window.addEventListener("load", () => {
  window.scrollTo(0, 0);
});

const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");

const closeMobileNav = () => {
  if (navToggle) {
    navToggle.checked = false;
  }
  document.body.classList.remove("nav-open");
  document.querySelectorAll(".nav-dropdown.is-open").forEach((dropdown) => {
    dropdown.classList.remove("is-open");
    const toggle = dropdown.querySelector(".nav-dropdown__toggle");
    if (toggle) {
      toggle.setAttribute("aria-expanded", "false");
    }
  });
};

document.querySelectorAll(".nav-links a").forEach((link) => {
  link.addEventListener("click", closeMobileNav);
});

if (navToggle) {
  navToggle.addEventListener("change", () => {
    document.body.classList.toggle("nav-open", navToggle.checked);
  });
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && navToggle?.checked) {
    closeMobileNav();
  }
});

document.querySelectorAll(".nav-dropdown__toggle").forEach((toggle) => {
  toggle.addEventListener("click", () => {
    const dropdown = toggle.closest(".nav-dropdown");
    if (!dropdown || !window.matchMedia("(max-width: 980px)").matches) {
      return;
    }

    const isOpen = dropdown.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });
});

if (navLinks) {
  navLinks.addEventListener("mouseleave", () => {
    document.querySelectorAll(".nav-dropdown.is-open").forEach((dropdown) => {
      if (!window.matchMedia("(max-width: 980px)").matches) {
        dropdown.classList.remove("is-open");
        const toggle = dropdown.querySelector(".nav-dropdown__toggle");
        if (toggle) {
          toggle.setAttribute("aria-expanded", "false");
        }
      }
    });
  });
}

document.querySelectorAll(".youtube-widget").forEach((widget) => {
  widget.addEventListener("click", () => {
    const videoId = widget.dataset.youtubeId;
    if (!videoId || widget.classList.contains("is-playing")) {
      return;
    }

    const iframe = document.createElement("iframe");
    iframe.src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
    iframe.title = widget.getAttribute("aria-label") || "YouTube video";
    iframe.allow =
      "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    iframe.allowFullscreen = true;
    iframe.loading = "lazy";

    widget.classList.add("is-playing");
    widget.appendChild(iframe);
  });
});

const formatPhone = (value) => {
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("8")) digits = `7${digits.slice(1)}`;
  else if (digits.length && digits[0] !== "7") digits = `7${digits}`;
  digits = digits.slice(0, 11);

  if (!digits.length) return "";
  if (digits.length <= 1) return "+7";
  if (digits.length <= 4) return `+7 (${digits.slice(1)}`;
  if (digits.length <= 7) return `+7 (${digits.slice(1, 4)}) ${digits.slice(4)}`;
  if (digits.length <= 9) {
    return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`;
};

const initPhoneMask = () => {
  document.querySelectorAll('input[type="tel"]').forEach((input) => {
    if (input.dataset.phoneMask) return;
    input.dataset.phoneMask = "1";
    if (!input.placeholder) input.placeholder = "+7 (___) ___-__-__";

    input.addEventListener("input", () => {
      const pos = input.selectionStart || 0;
      const prev = input.value;
      const formatted = formatPhone(prev);
      input.value = formatted;
      const diff = formatted.length - prev.length;
      const newPos = Math.max(0, Math.min(formatted.length, pos + diff));
      input.setSelectionRange(newPos, newPos);
    });

    input.addEventListener("focus", () => {
      if (!input.value) input.value = "+7 ";
    });

    input.addEventListener("blur", () => {
      if (input.value === "+7" || input.value === "+7 ") input.value = "";
    });
  });
};

const contactForm = document.querySelector(".mini-form");
const contactPrivacyAgree = document.getElementById("contact-privacy-agree");
const contactSubmitBtn = document.getElementById("contact-submit-btn");
const contactNameInput = document.getElementById("contact-name");
const contactPhoneInput = document.getElementById("contact-phone");
const contactEmailInput = document.getElementById("contact-email");

const isValidEmail = (value) => {
  const email = value.trim();
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(email);
};

const isContactFormReady = () => {
  if (!(contactPrivacyAgree instanceof HTMLInputElement) || !contactPrivacyAgree.checked) {
    return false;
  }

  const name = contactNameInput instanceof HTMLInputElement ? contactNameInput.value.trim() : "";
  const phone = contactPhoneInput instanceof HTMLInputElement ? contactPhoneInput.value.trim() : "";
  const email = contactEmailInput instanceof HTMLInputElement ? contactEmailInput.value : "";
  const phoneDigits = phone.replace(/\D/g, "");

  return name.length > 0 && phoneDigits.length >= 11 && isValidEmail(email);
};

const syncContactSubmitState = () => {
  if (!(contactSubmitBtn instanceof HTMLButtonElement)) return;
  contactSubmitBtn.disabled = !isContactFormReady();
};

contactPrivacyAgree?.addEventListener("change", syncContactSubmitState);
contactNameInput?.addEventListener("input", syncContactSubmitState);
contactPhoneInput?.addEventListener("input", syncContactSubmitState);
contactEmailInput?.addEventListener("input", syncContactSubmitState);
syncContactSubmitState();
initPhoneMask();

contactForm?.addEventListener("submit", (event) => {
  if (!isContactFormReady()) {
    event.preventDefault();
    contactEmailInput?.reportValidity?.();
  }
});

const initMobileFormUx = () => {
  const contactForm = document.querySelector(".mini-form");
  const ctaFloat = document.querySelector(".cta-float");
  const contactSection = document.getElementById("contact");

  if (!contactForm) return;

  const formFields = contactForm.querySelectorAll(
    'input:not([type="checkbox"]), textarea'
  );
  const isTouchDevice = window.matchMedia("(hover: none) and (pointer: coarse)").matches;

  const syncFormFocusState = () => {
    const active = document.activeElement;
    const focusedInForm =
      active instanceof HTMLElement && contactForm.contains(active);
    document.body.classList.toggle("is-form-focused", focusedInForm);
  };

  const syncKeyboardState = () => {
    const viewport = window.visualViewport;
    if (!viewport) return;
    const keyboardOpen = viewport.height < window.innerHeight * 0.82;
    document.body.classList.toggle("is-keyboard-open", keyboardOpen);
  };

  const blurFieldIfScrolledAway = () => {
    const active = document.activeElement;
    if (!(active instanceof HTMLElement) || !contactForm.contains(active)) return;

    const viewport = window.visualViewport;
    const viewportHeight = viewport?.height ?? window.innerHeight;
    const viewportTop = viewport?.offsetTop ?? 0;
    const rect = active.getBoundingClientRect();
    const visibleTop = viewportTop + 12;
    const visibleBottom = viewportTop + viewportHeight - 12;

    if (rect.bottom < visibleTop || rect.top > visibleBottom) {
      active.blur();
    }
  };

  formFields.forEach((field) => {
    if (!(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement)) {
      return;
    }

    field.addEventListener("focus", () => {
      syncFormFocusState();
      syncKeyboardState();
    });

    field.addEventListener("blur", () => {
      window.setTimeout(syncFormFocusState, 0);
    });

    if (!isTouchDevice) return;

    field.readOnly = true;
    let startX = 0;
    let startY = 0;
    let moved = false;

    field.addEventListener(
      "touchstart",
      (event) => {
        const touch = event.touches[0];
        if (!touch) return;
        startX = touch.clientX;
        startY = touch.clientY;
        moved = false;
      },
      { passive: true }
    );

    field.addEventListener(
      "touchmove",
      (event) => {
        const touch = event.touches[0];
        if (!touch) return;
        if (
          Math.abs(touch.clientX - startX) > 8 ||
          Math.abs(touch.clientY - startY) > 8
        ) {
          moved = true;
          if (document.activeElement === field) {
            field.blur();
          }
        }
      },
      { passive: true }
    );

    field.addEventListener("touchend", () => {
      if (moved) return;
      field.readOnly = false;
      field.focus();
    });

    field.addEventListener("blur", () => {
      field.readOnly = true;
    });
  });

  window.addEventListener("scroll", blurFieldIfScrolledAway, { passive: true });

  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", () => {
      syncKeyboardState();
      blurFieldIfScrolledAway();
    });
    window.visualViewport.addEventListener("scroll", blurFieldIfScrolledAway);
    syncKeyboardState();
  }

  if (ctaFloat && contactSection && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      ([entry]) => {
        ctaFloat.classList.toggle("is-hidden", entry.isIntersecting);
      },
      { threshold: 0.12, rootMargin: "0px 0px -72px 0px" }
    );
    observer.observe(contactSection);
  }
};

initMobileFormUx();

function buildAnySizeBlock(wrap, items) {
  const anySize = document.createElement("div");
  anySize.className = "price-any-size";
  if (wrap.classList.contains("dark-table")) {
    anySize.classList.add("dark-table");
  }

  const title = document.createElement("p");
  title.className = "price-any-size__title";
  title.textContent = "Любой размер";
  anySize.appendChild(title);

  const list = document.createElement("ul");
  list.className = "price-any-size__list";

  items.forEach((item) => {
    const listItem = document.createElement("li");
    listItem.className = "price-any-size__item";

    const name = document.createElement("span");
    name.className = "price-any-size__name";
    name.textContent = item.name;

    const price = document.createElement("span");
    price.className = "price-any-size__price";
    price.textContent = item.price;

    listItem.append(name, price);
    list.appendChild(listItem);
  });

  anySize.appendChild(list);
  return anySize;
}

function processSamePriceRows() {
  document.querySelectorAll(".price-table-wrap").forEach((wrap) => {
    const tbody = wrap.querySelector(".price-table tbody");
    if (!tbody) {
      return;
    }

    const parsed = [...tbody.querySelectorAll("tr")]
      .map((row) => {
        const cells = [...row.querySelectorAll("td")];
        if (cells.length < 4) {
          return null;
        }

        const prices = cells.slice(1, 4).map((cell) => cell.textContent.trim());
        return {
          name: cells[0].textContent.trim(),
          price: prices[0],
          row,
          isSame: prices[0] === prices[1] && prices[1] === prices[2],
        };
      })
      .filter(Boolean);

    const sameRows = parsed.filter((item) => item.isSame);
    const variableRows = parsed.filter((item) => !item.isSame);

    if (!sameRows.length) {
      return;
    }

    const anySize = buildAnySizeBlock(
      wrap,
      sameRows.map(({ name, price }) => ({ name, price }))
    );

    if (!variableRows.length) {
      anySize.classList.add("price-any-size--only");
      wrap.replaceWith(anySize);
      return;
    }

    wrap.insertAdjacentElement("afterend", anySize);
    sameRows.forEach(({ row }) => row.remove());
  });
}

processSamePriceRows();
