const initTabs = () => {
  const tabs = Array.from(document.querySelectorAll("[data-tab]"));
  const panels = Array.from(document.querySelectorAll("[data-panel]"));

  if (!tabs.length || !panels.length) {
    return;
  }

  const activate = (target) => {
    tabs.forEach((tab) => {
      const isActive = tab.dataset.tab === target;
      tab.classList.toggle("active", isActive);
      tab.setAttribute("aria-selected", isActive ? "true" : "false");
      tab.tabIndex = isActive ? 0 : -1;
    });

    panels.forEach((panel) => {
      const isActive = panel.dataset.panel === target;
      panel.classList.toggle("active", isActive);
      panel.hidden = !isActive;
    });
  };

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => activate(tab.dataset.tab));
  });

  activate(tabs[0].dataset.tab);
};

const initAccordions = () => {
  const groups = document.querySelectorAll("[data-accordion-group]");
  groups.forEach((group) => {
    const items = Array.from(group.querySelectorAll("details"));
    items.forEach((item) => {
      item.addEventListener("toggle", () => {
        if (!item.open) {
          return;
        }
        items.forEach((other) => {
          if (other !== item) {
            other.open = false;
          }
        });
      });
    });
  });
};

const initScrollReveal = () => {
  const elements = document.querySelectorAll("[data-animate]");
  if (!elements.length) {
    return;
  }

  if (!("IntersectionObserver" in window)) {
    elements.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  elements.forEach((el) => observer.observe(el));
};

const initCardLinks = () => {
  const cards = document.querySelectorAll(".card[data-link]");
  cards.forEach((card) => {
    const link = card.dataset.link;
    if (!link) {
      return;
    }

    const handleClick = (event) => {
      if (event.target.closest("a, button")) {
        return;
      }
      window.location.href = link;
    };

    const handleKey = (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        window.location.href = link;
      }
    };

    card.addEventListener("click", handleClick);
    card.addEventListener("keydown", handleKey);
  });
};

const initMobileMenu = () => {
  const header = document.querySelector(".site-header");
  const nav = header?.querySelector(".site-nav");
  if (!header || !nav || header.querySelector(".menu-toggle")) {
    return;
  }

  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "menu-toggle";
  toggle.setAttribute("aria-label", "Menü megnyitása");
  toggle.setAttribute("aria-expanded", "false");
  toggle.setAttribute("aria-controls", "mobile-menu-panel");
  toggle.innerHTML = `
    <span class="menu-toggle__line"></span>
    <span class="menu-toggle__line"></span>
    <span class="menu-toggle__line"></span>
  `;

  const overlay = document.createElement("div");
  overlay.className = "mobile-menu-overlay";
  overlay.hidden = true;

  const panel = document.createElement("aside");
  panel.className = "mobile-menu-panel";
  panel.id = "mobile-menu-panel";
  panel.setAttribute("aria-hidden", "true");

  const closeButton = document.createElement("button");
  closeButton.type = "button";
  closeButton.className = "mobile-menu-close";
  closeButton.setAttribute("aria-label", "Menü bezárása");
  closeButton.innerHTML = "&times;";

  const title = document.createElement("p");
  title.className = "mobile-menu-title";
  title.textContent = "Menü";

  const mobileNav = document.createElement("nav");
  mobileNav.className = "mobile-menu-links";
  mobileNav.setAttribute("aria-label", nav.getAttribute("aria-label") || "Mobil navigáció");

  nav.querySelectorAll("a").forEach((link) => {
    mobileNav.appendChild(link.cloneNode(true));
  });

  panel.append(closeButton, title, mobileNav);
  document.body.append(overlay, panel);
  header.appendChild(toggle);

  const setMenuState = (isOpen) => {
    overlay.hidden = !isOpen;
    toggle.classList.toggle("is-open", isOpen);
    panel.classList.toggle("is-open", isOpen);
    overlay.classList.toggle("is-open", isOpen);
    panel.setAttribute("aria-hidden", isOpen ? "false" : "true");
    toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    document.body.classList.toggle("mobile-menu-open", isOpen);

    if (isOpen) {
      closeButton.focus();
    }
  };

  const closeMenu = () => setMenuState(false);
  const toggleMenu = () => setMenuState(toggle.getAttribute("aria-expanded") !== "true");

  toggle.addEventListener("click", toggleMenu);
  closeButton.addEventListener("click", closeMenu);
  overlay.addEventListener("click", closeMenu);

  mobileNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && panel.classList.contains("is-open")) {
      closeMenu();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth >= 760 && panel.classList.contains("is-open")) {
      closeMenu();
    }
  });
};

const initTyping = () => {
  const target = document.querySelector("[data-typing]");
  if (!target) {
    return;
  }

  const words = (target.dataset.words || "")
    .split("|")
    .map((word) => word.trim())
    .filter(Boolean);

  if (!words.length) {
    return;
  }

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    target.textContent = words[0];
    return;
  }

  target.textContent = "";
  let wordIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  const typingSpeed = 90;
  const deletingSpeed = 55;
  const pause = 1200;

  const tick = () => {
    const currentWord = words[wordIndex];
    const nextLength = isDeleting ? charIndex - 1 : charIndex + 1;
    charIndex = Math.max(0, Math.min(currentWord.length, nextLength));
    target.textContent = currentWord.slice(0, charIndex);

    if (!isDeleting && charIndex === currentWord.length) {
      isDeleting = true;
      setTimeout(tick, pause);
      return;
    }

    if (isDeleting && charIndex === 0) {
      isDeleting = false;
      wordIndex = (wordIndex + 1) % words.length;
    }

    setTimeout(tick, isDeleting ? deletingSpeed : typingSpeed);
  };

  tick();
};

const initGalleryLightbox = () => {
  const galleries = Array.from(document.querySelectorAll(".gallery-grid"));
  if (!galleries.length) {
    return;
  }

  const lightbox = document.createElement("div");
  lightbox.className = "lightbox";
  lightbox.innerHTML = `
    <div class="lightbox-panel" role="dialog" aria-modal="true">
      <button class="lightbox-close" type="button" aria-label="Bezárás">×</button>
      <button class="lightbox-nav prev" type="button" aria-label="Előző">‹</button>
      <img class="lightbox-image" alt="">
      <button class="lightbox-nav next" type="button" aria-label="Következő">›</button>
      <div class="lightbox-caption"></div>
      <div class="lightbox-counter"></div>
    </div>
  `;
  document.body.appendChild(lightbox);

  const panel = lightbox.querySelector(".lightbox-panel");
  const image = lightbox.querySelector(".lightbox-image");
  const caption = lightbox.querySelector(".lightbox-caption");
  const counter = lightbox.querySelector(".lightbox-counter");
  const closeBtn = lightbox.querySelector(".lightbox-close");
  const prevBtn = lightbox.querySelector(".lightbox-nav.prev");
  const nextBtn = lightbox.querySelector(".lightbox-nav.next");

  let currentItems = [];
  let currentIndex = 0;
  let touchStartX = 0;

  const update = () => {
    const item = currentItems[currentIndex];
    if (!item) {
      return;
    }
    image.src = item.src;
    image.alt = item.alt;
    caption.textContent = item.title;
    counter.textContent = `${currentIndex + 1} / ${currentItems.length}`;
  };

  const open = (items, index) => {
    currentItems = items;
    currentIndex = index;
    update();
    lightbox.classList.add("is-open");
    document.body.style.overflow = "hidden";
  };

  const close = () => {
    lightbox.classList.remove("is-open");
    document.body.style.overflow = "";
  };

  const prev = () => {
    currentIndex = (currentIndex - 1 + currentItems.length) % currentItems.length;
    update();
  };

  const next = () => {
    currentIndex = (currentIndex + 1) % currentItems.length;
    update();
  };

  closeBtn.addEventListener("click", close);
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) {
      close();
    }
  });
  prevBtn.addEventListener("click", prev);
  nextBtn.addEventListener("click", next);

  document.addEventListener("keydown", (event) => {
    if (!lightbox.classList.contains("is-open")) {
      return;
    }
    if (event.key === "Escape") {
      close();
    }
    if (event.key === "ArrowLeft") {
      prev();
    }
    if (event.key === "ArrowRight") {
      next();
    }
  });

  panel.addEventListener("touchstart", (event) => {
    touchStartX = event.touches[0].clientX;
  });

  panel.addEventListener("touchend", (event) => {
    const touchEndX = event.changedTouches[0].clientX;
    const deltaX = touchEndX - touchStartX;
    if (Math.abs(deltaX) < 50) {
      return;
    }
    if (deltaX > 0) {
      prev();
    } else {
      next();
    }
  });

  galleries.forEach((gallery) => {
    const items = Array.from(gallery.querySelectorAll(".gallery-item")).map((item) => {
      const img = item.querySelector("img");
      const captionEl = item.querySelector("figcaption");
      return {
        src: img?.dataset.full || img?.src || "",
        alt: img?.alt || "",
        title: captionEl?.textContent?.trim() || img?.alt || "",
      };
    });

    gallery.querySelectorAll(".gallery-item").forEach((item, index) => {
      item.tabIndex = 0;
      item.setAttribute("role", "button");

      item.addEventListener("click", () => open(items, index));
      item.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          open(items, index);
        }
      });
    });
  });
};


const initEntityPickers = () => {
  const pickers = document.querySelectorAll("[data-entity-picker]");
  pickers.forEach((picker) => {
    const buttons = Array.from(picker.querySelectorAll("[data-entity]"));
    const section = picker.closest("[data-entity-section]");
    const target = section?.querySelector("[data-entity-output]");
    const contentItems = section ? Array.from(section.querySelectorAll("[data-entity-content]")) : [];

    if (!buttons.length || !target) {
      return;
    }

    const slugToEntity = new Map();
    const entityToSlug = new Map();
    buttons.forEach((button) => {
      const slug = button.dataset.entitySlug;
      if (slug) {
        slugToEntity.set(slug, button.dataset.entity);
        entityToSlug.set(button.dataset.entity, slug);
      }
    });
    const hasSlugs = slugToEntity.size > 0;

    const setEntity = (value, { updateHash = false } = {}) => {
      buttons.forEach((button) => {
        const isActive = button.dataset.entity === value;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-pressed", isActive ? "true" : "false");
      });
      target.textContent = value;

      if (contentItems.length) {
        contentItems.forEach((item) => {
          const matches = item.dataset.entityContent === value;
          item.hidden = !matches;
          item.setAttribute("aria-hidden", matches ? "false" : "true");
        });
      }

      if (updateHash && hasSlugs) {
        const slug = entityToSlug.get(value);
        if (slug) {
          history.replaceState(null, "", `#${slug}`);
        }
      }
    };

    buttons.forEach((button) => {
      button.addEventListener("click", () => setEntity(button.dataset.entity, { updateHash: true }));
    });

    let initial = buttons[0].dataset.entity;
    if (hasSlugs && window.location.hash) {
      const matched = slugToEntity.get(window.location.hash.replace(/^#/, ""));
      if (matched) {
        initial = matched;
      }
    }
    setEntity(initial);

    if (hasSlugs) {
      window.addEventListener("hashchange", () => {
        const matched = slugToEntity.get(window.location.hash.replace(/^#/, ""));
        if (matched) {
          setEntity(matched);
        }
      });
    }
  });
};

const initBlogTitleFit = () => {
  const titles = Array.from(document.querySelectorAll(".blog-card h2"));
  if (!titles.length) {
    return;
  }

  titles.forEach((title) => {
    const baseSize = parseFloat(getComputedStyle(title).fontSize);
    title.dataset.baseSize = Number.isFinite(baseSize) ? String(baseSize) : "16";
  });

  const fitTitle = (title) => {
    const baseSize = parseFloat(title.dataset.baseSize || "16");
    const minSize = 12;
    let size = baseSize;
    title.style.whiteSpace = "nowrap";
    title.style.letterSpacing = "";
    title.style.fontSize = `${size}px`;

    while (size > minSize && title.scrollWidth > title.clientWidth) {
      size -= 0.5;
      title.style.fontSize = `${size}px`;
    }

    if (title.scrollWidth > title.clientWidth) {
      title.style.letterSpacing = "-0.01em";
    }
  };

  const fitAll = () => {
    titles.forEach((title) => fitTitle(title));
  };

  fitAll();
  if (document.fonts?.ready) {
    document.fonts.ready.then(fitAll);
  }
  let resizeTimer;
  window.addEventListener("resize", () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(fitAll, 120);
  });
};

const initBookingHamarosanBadges = () => {
  document.querySelectorAll("a[data-booking-url], [data-hamarosan]").forEach((el) => {
    if (el.querySelector(":scope > .btn-hamarosan-badge")) return;
    const badge = document.createElement("span");
    badge.className = "btn-hamarosan-badge";
    badge.setAttribute("aria-hidden", "true");
    badge.textContent = "Hamarosan";
    el.appendChild(badge);
  });
};

window.addEventListener("DOMContentLoaded", () => {
  initTabs();
  initAccordions();
  initScrollReveal();
  initCardLinks();
  initMobileMenu();
  initTyping();
  initEntityPickers();
  initGalleryLightbox();
  initBlogTitleFit();
  initBookingHamarosanBadges();
});
