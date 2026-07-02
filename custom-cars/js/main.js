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

const contactPrivacyAgree = document.getElementById("contact-privacy-agree");
const contactSubmitBtn = document.getElementById("contact-submit-btn");

if (contactPrivacyAgree && contactSubmitBtn) {
  contactPrivacyAgree.addEventListener("change", () => {
    contactSubmitBtn.disabled = !contactPrivacyAgree.checked;
  });
}
