const TELEGRAM_USERNAME = "stanislav5621";
const TELEGRAM_START_MESSAGE =
  "Здравствуйте! Хочу обсудить сайт для бизнеса. Подскажите, с чего лучше начать?";

const buildTelegramLink = (text = TELEGRAM_START_MESSAGE) =>
  `https://t.me/${TELEGRAM_USERNAME}?text=${encodeURIComponent(text)}`;

document.querySelectorAll("[data-telegram-link]").forEach((link) => {
  link.setAttribute("href", buildTelegramLink());
});

const menuBtn = document.getElementById("burger");
const sideMenu = document.getElementById("side-menu");
const menuOverlay = document.getElementById("menu-overlay");

const updateSiteHeaderHeight = () => {
  const header = document.querySelector(".site-header");
  if (!header) return;
  const height = Math.ceil(header.getBoundingClientRect().height);
  document.documentElement.style.setProperty("--site-header-height", `${height}px`);
};

const initSiteHeaderHeight = () => {
  updateSiteHeaderHeight();
  window.addEventListener("resize", updateSiteHeaderHeight, { passive: true });
  const header = document.querySelector(".site-header");
  if (header && typeof ResizeObserver !== "undefined") {
    new ResizeObserver(updateSiteHeaderHeight).observe(header);
  }
};

const lockPageScroll = () => {
  document.documentElement.classList.add("is-menu-scroll-locked");
};

const unlockPageScroll = () => {
  document.documentElement.classList.remove("is-menu-scroll-locked");
};

const setMenuOpen = (isOpen) => {
  if (!menuBtn || !sideMenu || !menuOverlay) return;

  sideMenu.classList.toggle("open", isOpen);
  menuOverlay.classList.toggle("open", isOpen);
  menuOverlay.setAttribute("aria-hidden", isOpen ? "false" : "true");
  menuBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");

  if (isOpen) {
    document.body.classList.add("menu-open");
    lockPageScroll();
    return;
  }

  document.body.classList.remove("menu-open");
  unlockPageScroll();
  menuBtn.blur();
};

const toggleMenu = (forceOpen) => {
  const isOpen =
    typeof forceOpen === "boolean"
      ? forceOpen
      : !sideMenu?.classList.contains("open");

  setMenuOpen(isOpen);
};

menuBtn?.addEventListener("click", () => toggleMenu());
menuOverlay?.addEventListener("click", () => toggleMenu(false));

sideMenu?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => toggleMenu(false));
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && sideMenu?.classList.contains("open")) {
    toggleMenu(false);
  }
});

document.addEventListener(
  "touchmove",
  (event) => {
    if (!document.body.classList.contains("menu-open")) return;
    if (sideMenu?.contains(event.target)) return;
    event.preventDefault();
  },
  { passive: false }
);

initSiteHeaderHeight();

const siteHeader = document.querySelector(".site-header");
window.addEventListener(
  "scroll",
  () => {
    siteHeader?.classList.toggle("is-scrolled", window.scrollY > 24);
  },
  { passive: true }
);
siteHeader?.classList.toggle("is-scrolled", window.scrollY > 24);

const form = document.getElementById("lead-form");
const formStatus = document.getElementById("lead-form-status");
let isSubmitting = false;
const nameInput = document.getElementById("lead-name");
const contactInput = document.getElementById("lead-contact");
const consentCheckbox = document.getElementById("lead-consent");
const submitBtn = document.getElementById("lead-submit");

const SOCIAL_PLACEHOLDERS = {
  telegram: "username",
  vk: "Ссылка на профиль VK",
};

const normalizeContact = (contact, social) => {
  const trimmed = contact.trim();
  if (!trimmed) return trimmed;

  if (social === "telegram") {
    if (/^https?:\/\//i.test(trimmed) || trimmed.includes("t.me/")) {
      return trimmed;
    }
    const username = trimmed.replace(/^@+/, "");
    return username ? `@${username}` : "";
  }

  return trimmed;
};

const getSelectedSocial = () => {
  const checked = form?.querySelector('input[name="social"]:checked');
  return checked instanceof HTMLInputElement ? checked.value : "telegram";
};

const syncSocialPlaceholder = () => {
  if (!(contactInput instanceof HTMLInputElement)) return;
  const social = getSelectedSocial();
  contactInput.placeholder =
    SOCIAL_PLACEHOLDERS[social] ?? SOCIAL_PLACEHOLDERS.telegram;
};

form?.querySelectorAll('input[name="social"]').forEach((radio) => {
  radio.addEventListener("change", syncSocialPlaceholder);
});
syncSocialPlaceholder();

const buildLeadSummary = ({ name, contact, social = "telegram" }) => {
  const socialLabel = social === "vk" ? "VK" : "Telegram";
  const lines = [`${socialLabel}: ${contact}`];

  if (name) {
    lines.unshift(`Имя: ${name}`);
  }

  return lines.join("\n");
};

const setFormStatus = (message, type = "success") => {
  if (!formStatus) return;

  const hasMessage = Boolean(message);
  formStatus.textContent = message;
  formStatus.classList.toggle("is-empty", !hasMessage);
  formStatus.setAttribute("aria-hidden", hasMessage ? "false" : "true");
  formStatus.classList.remove("lead-form__status--success", "lead-form__status--error", "lead-form__status--info");

  if (!hasMessage) {
    return;
  }

  formStatus.classList.add(
    type === "error"
      ? "lead-form__status--error"
      : type === "info"
        ? "lead-form__status--info"
        : "lead-form__status--success"
  );
};

const isLeadFormReady = () => {
  const name = nameInput instanceof HTMLInputElement ? nameInput.value.trim() : "";
  const contact = contactInput instanceof HTMLInputElement ? contactInput.value.trim() : "";
  const hasConsent = consentCheckbox instanceof HTMLInputElement && consentCheckbox.checked;

  return name.length > 0 && contact.length > 0 && hasConsent;
};

const syncSubmitState = () => {
  if (!(submitBtn instanceof HTMLButtonElement)) {
    return;
  }

  submitBtn.classList.toggle(
    "lead-form__submit--ready",
    isLeadFormReady() && !isSubmitting
  );
};

const clearFieldErrors = () => {
  form?.querySelectorAll(".lead-form__input--error").forEach((field) => {
    field.classList.remove("lead-form__input--error");
  });
  form?.querySelectorAll(".lead-form__consent--error").forEach((consent) => {
    consent.classList.remove("lead-form__consent--error");
  });
};

const markFieldError = (field, { focus = true } = {}) => {
  if (field instanceof HTMLInputElement) {
    field.readOnly = false;
    field.closest(".lead-form__input-wrap")?.classList.add("is-editing");
  }
  field?.classList.add("lead-form__input--error");
  if (focus) {
    field?.focus();
  }
};

const markConsentError = () => {
  consentCheckbox?.closest(".lead-form__consent")?.classList.add("lead-form__consent--error");
};

const validateLeadForm = () => {
  clearFieldErrors();

  const name = nameInput instanceof HTMLInputElement ? nameInput.value.trim() : "";
  const contact = contactInput instanceof HTMLInputElement ? contactInput.value.trim() : "";
  const social = getSelectedSocial();
  const hasConsent = consentCheckbox instanceof HTMLInputElement && consentCheckbox.checked;

  let isValid = true;

  if (!name) {
    markFieldError(nameInput, { focus: false });
    isValid = false;
  }

  if (!contact) {
    markFieldError(contactInput, { focus: false });
    isValid = false;
  }

  if (!hasConsent) {
    markConsentError();
    isValid = false;
  }

  if (!isValid) {
    const missing = [];
    if (!name) missing.push("name");
    if (!contact) missing.push("contact");
    if (!hasConsent) missing.push("consent");

    if (missing.length > 1) {
      setFormStatus("Заполните обязательные поля и отметьте согласие.", "error");
    } else if (!name) {
      setFormStatus("Укажите имя.", "error");
    } else if (!contact) {
      setFormStatus(
        social === "vk"
          ? "Укажите ссылку на профиль VK."
          : "Укажите username в Telegram.",
        "error"
      );
    } else {
      setFormStatus("Для отправки нужно согласие на обработку персональных данных.", "error");
    }

    const firstInvalid = !name
      ? nameInput
      : !contact
        ? contactInput
        : consentCheckbox;

    if (firstInvalid instanceof HTMLInputElement) {
      firstInvalid.focus({ preventScroll: true });
    }

    return null;
  }

  return { name, contact, social };
};

nameInput?.addEventListener("input", () => {
  nameInput.classList.remove("lead-form__input--error");
  syncSubmitState();
});
contactInput?.addEventListener("input", () => {
  contactInput.classList.remove("lead-form__input--error");
  syncSubmitState();
});
consentCheckbox?.addEventListener("change", () => {
  consentCheckbox.closest(".lead-form__consent")?.classList.remove("lead-form__consent--error");
  syncSubmitState();
});
syncSubmitState();

const initMobileFormUx = () => {
  if (!form) return;

  const isTouchDevice = window.matchMedia("(hover: none) and (pointer: coarse)").matches;

  const syncKeyboardState = () => {
    const viewport = window.visualViewport;
    if (!viewport) return;
    document.body.classList.toggle(
      "is-keyboard-open",
      viewport.height < window.innerHeight * 0.82
    );
  };

  const blurFieldIfScrolledAway = () => {
    const active = document.activeElement;
    if (!(active instanceof HTMLElement) || !form.contains(active)) return;

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

  const bindFieldFocusTracking = (field) => {
    field.addEventListener("focus", syncKeyboardState);
    field.addEventListener("blur", () => {
      window.setTimeout(syncKeyboardState, 0);
    });
  };

  if (!isTouchDevice) {
    form.querySelectorAll(".lead-form__input").forEach((field) => {
      if (field instanceof HTMLInputElement) {
        bindFieldFocusTracking(field);
      }
    });
    window.addEventListener("scroll", blurFieldIfScrolledAway, { passive: true });
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", syncKeyboardState);
    }
    return;
  }

  form.querySelectorAll(".lead-form__input-wrap").forEach((wrap) => {
    const input = wrap.querySelector(".lead-form__input");
    if (!(input instanceof HTMLInputElement)) return;

    input.readOnly = true;
    let startX = 0;
    let startY = 0;
    let moved = false;

    const enableEditing = () => {
      input.readOnly = false;
      wrap.classList.add("is-editing");
      input.focus();
    };

    const disableEditing = () => {
      input.readOnly = true;
      wrap.classList.remove("is-editing");
    };

    wrap.addEventListener(
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

    wrap.addEventListener(
      "touchmove",
      (event) => {
        const touch = event.touches[0];
        if (!touch) return;
        if (
          Math.abs(touch.clientX - startX) > 8 ||
          Math.abs(touch.clientY - startY) > 8
        ) {
          moved = true;
        }
      },
      { passive: true }
    );

    wrap.addEventListener("touchend", () => {
      if (moved) return;
      enableEditing();
    });

    input.addEventListener("blur", disableEditing);
    bindFieldFocusTracking(input);

    const label = wrap.closest(".lead-form__field")?.querySelector(".lead-form__label");
    label?.addEventListener("click", (event) => {
      event.preventDefault();
      enableEditing();
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
};

initMobileFormUx();

const sendLeadToApi = async (payload, leadApi) => {
  const response = await fetch(leadApi, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Telegram delivery failed");
  }
};

const sendLeadToEmail = async (payload, summary, endpointEmail) => {
  const response = await fetch(`https://formsubmit.co/ajax/${endpointEmail}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      _subject: "Новая заявка — Станислав",
      _template: "box",
      name: payload.name || "—",
      contact: payload.contact,
      message: summary,
      summary,
    }),
  });

  if (!response.ok) {
    throw new Error("Email delivery failed");
  }
};

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (isSubmitting) return;

  if (document.activeElement instanceof HTMLElement && form.contains(document.activeElement)) {
    document.activeElement.blur();
  }

  const validated = validateLeadForm();
  if (!validated) {
    syncSubmitState();
    return;
  }

  const { name, contact, social } = validated;
  const payload = {
    name,
    contact: normalizeContact(contact, social),
    social,
  };
  const summary = buildLeadSummary(payload);
  const leadApi = form.dataset.leadApi?.trim();
  const endpointEmail = form.dataset.endpointEmail?.trim();

  isSubmitting = true;
  if (submitBtn instanceof HTMLButtonElement) {
    submitBtn.setAttribute("aria-busy", "true");
  }

  let telegramSent = false;
  let emailSent = false;

  try {
    if (leadApi) {
      try {
        await sendLeadToApi(payload, leadApi);
        telegramSent = true;
      } catch {
        telegramSent = false;
      }
    }

    if (endpointEmail && !endpointEmail.includes("xxx")) {
      try {
        await sendLeadToEmail(payload, summary, endpointEmail);
        emailSent = true;
      } catch {
        emailSent = false;
      }
    }

    if (telegramSent || emailSent) {
      form.reset();
      clearFieldErrors();
      if (consentCheckbox instanceof HTMLInputElement) {
        consentCheckbox.checked = false;
      }
      const telegramRadio = form?.querySelector('input[name="social"][value="telegram"]');
      if (telegramRadio instanceof HTMLInputElement) {
        telegramRadio.checked = true;
      }
      syncSocialPlaceholder();
      setFormStatus("Заявка отправлена. Напишу вам в Telegram или VK в течение рабочего дня.");
      syncSubmitState();
      return;
    }

    setFormStatus(
      "Не удалось отправить заявку. Попробуйте ещё раз или напишите напрямую — ссылки под формой.",
      "error"
    );
  } finally {
    isSubmitting = false;
    if (submitBtn instanceof HTMLButtonElement) {
      submitBtn.removeAttribute("aria-busy");
    }
    syncSubmitState();
  }
});
