const TELEGRAM_USERNAME = "stanislav5621";
const VK_PROFILE_URL = "https://vk.ru/id1025918815";
const TELEGRAM_START_MESSAGE =
  "Здравствуйте! Хочу обсудить сайт для бизнеса. Подскажите, с чего лучше начать?";

const buildTelegramLink = (text = TELEGRAM_START_MESSAGE) =>
  `https://t.me/${TELEGRAM_USERNAME}?text=${encodeURIComponent(text)}`;

const buildTelegramLinkFromForm = ({ name, contact, social = "telegram" }) => {
  const lines = ["Здравствуйте! Хочу обсудить сайт для бизнеса.", ""];

  if (name) lines.push(`Имя: ${name}`);
  if (contact) {
    lines.push(`${social === "vk" ? "VK" : "Telegram"}: ${contact}`);
  }

  lines.push("", "Подскажите, с чего лучше начать?");
  return buildTelegramLink(lines.join("\n"));
};

document.querySelectorAll("[data-telegram-link]").forEach((link) => {
  link.setAttribute("href", buildTelegramLink());
});

const menuBtn = document.getElementById("burger");
const sideMenu = document.getElementById("side-menu");
const menuOverlay = document.getElementById("menu-overlay");
let menuScrollY = 0;

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
  menuScrollY = window.scrollY;
  document.body.style.setProperty("--menu-scroll-y", `${menuScrollY}px`);
  document.documentElement.classList.add("is-menu-scroll-locked");
};

const unlockPageScroll = () => {
  const scrollY = menuScrollY;
  document.documentElement.classList.remove("is-menu-scroll-locked");
  document.body.style.removeProperty("--menu-scroll-y");
  window.scrollTo(0, scrollY);
};

const toggleMenu = (forceOpen) => {
  if (!menuBtn || !sideMenu || !menuOverlay) return;

  const isOpen =
    typeof forceOpen === "boolean"
      ? forceOpen
      : !sideMenu.classList.contains("open");

  sideMenu.classList.toggle("open", isOpen);
  menuOverlay.classList.toggle("open", isOpen);
  menuOverlay.setAttribute("aria-hidden", isOpen ? "false" : "true");
  menuBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
  document.body.classList.toggle("menu-open", isOpen);

  if (isOpen) {
    lockPageScroll();
  } else {
    unlockPageScroll();
  }
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
const nameInput = document.getElementById("lead-name");
const contactInput = document.getElementById("lead-contact");
const consentCheckbox = document.getElementById("lead-consent");
const submitBtn = document.getElementById("lead-submit");

const SOCIAL_PLACEHOLDERS = {
  telegram: "@username в Telegram",
  vk: "Ссылка на профиль VK",
};

const getSelectedSocial = () => {
  const checked = form?.querySelector('input[name="social"]:checked');
  return checked instanceof HTMLInputElement ? checked.value : "telegram";
};

const syncSocialPlaceholder = () => {
  if (!(contactInput instanceof HTMLInputElement)) return;
  contactInput.placeholder =
    SOCIAL_PLACEHOLDERS[getSelectedSocial()] ?? SOCIAL_PLACEHOLDERS.telegram;
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

  formStatus.hidden = !message;
  formStatus.textContent = message;
  formStatus.classList.remove("lead-form__status--success", "lead-form__status--error");
  formStatus.classList.add(
    type === "error" ? "lead-form__status--error" : "lead-form__status--success"
  );
};

const syncSubmitState = () => {
  if (!(submitBtn instanceof HTMLButtonElement) || !(consentCheckbox instanceof HTMLInputElement)) {
    return;
  }

  submitBtn.disabled = !consentCheckbox.checked;
};

consentCheckbox?.addEventListener("change", syncSubmitState);
syncSubmitState();

const clearFieldErrors = () => {
  form?.querySelectorAll(".lead-form__input--error").forEach((field) => {
    field.classList.remove("lead-form__input--error");
  });
};

const markFieldError = (field) => {
  field?.classList.add("lead-form__input--error");
  field?.focus();
};

const sendLeadToTelegram = async (payload, leadApi) => {
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
  setFormStatus("");
  clearFieldErrors();

  if (!(consentCheckbox instanceof HTMLInputElement) || !consentCheckbox.checked) {
    setFormStatus("Для отправки нужно согласие на обработку персональных данных.", "error");
    syncSubmitState();
    return;
  }

  const name = nameInput instanceof HTMLInputElement ? nameInput.value.trim() : "";
  const contact = contactInput instanceof HTMLInputElement ? contactInput.value.trim() : "";
  const social = getSelectedSocial();

  if (!contact || contact.length < 3) {
    markFieldError(contactInput);
    setFormStatus("Укажите @username в Telegram или ссылку на VK.", "error");
    return;
  }

  const payload = { name, contact, social };
  const summary = buildLeadSummary(payload);
  const leadApi = form.dataset.leadApi?.trim();
  const endpointEmail = form.dataset.endpointEmail?.trim();

  if (submitBtn instanceof HTMLButtonElement) {
    submitBtn.disabled = true;
  }

  let telegramSent = false;
  let emailSent = false;

  if (leadApi) {
    try {
      await sendLeadToTelegram(payload, leadApi);
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
    if (consentCheckbox instanceof HTMLInputElement) {
      consentCheckbox.checked = false;
    }
    const telegramRadio = form?.querySelector('input[name="social"][value="telegram"]');
    if (telegramRadio instanceof HTMLInputElement) {
      telegramRadio.checked = true;
    }
    syncSocialPlaceholder();
    syncSubmitState();
    setFormStatus("Заявка отправлена. Отвечу в Telegram или VK в течение рабочего дня.");
    return;
  }

  syncSubmitState();
  if (social === "vk") {
    window.open(VK_PROFILE_URL, "_blank", "noopener,noreferrer");
    setFormStatus(
      "Открыл VK — напишите там с вашей задачей. Если окно не открылось, ссылка под кнопкой.",
      "error"
    );
    return;
  }

  const telegramUrl = buildTelegramLinkFromForm({ name, contact, social });
  document.querySelectorAll("[data-telegram-link]").forEach((link) => {
    link.setAttribute("href", telegramUrl);
  });
  window.open(telegramUrl, "_blank", "noopener,noreferrer");
  setFormStatus(
    "Открыл Telegram с вашей заявкой — нажмите «Отправить». Если окно не открылось, ссылка под кнопкой.",
    "error"
  );
});

contactInput?.addEventListener("input", () => {
  contactInput.classList.remove("lead-form__input--error");
});
