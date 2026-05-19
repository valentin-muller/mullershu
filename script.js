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

const WEATHER_CODE_MAP = {
  0:  { emoji: "☀️", night: "🌙", label: "Napos" },
  1:  { emoji: "🌤️", night: "🌙", label: "Túlnyomóan napos" },
  2:  { emoji: "⛅", night: "☁️", label: "Részben felhős" },
  3:  { emoji: "☁️", night: "☁️", label: "Borult" },
  45: { emoji: "🌫️", night: "🌫️", label: "Köd" },
  48: { emoji: "🌫️", night: "🌫️", label: "Zúzmarás köd" },
  51: { emoji: "🌦️", night: "🌧️", label: "Enyhe szitálás" },
  53: { emoji: "🌦️", night: "🌧️", label: "Szitálás" },
  55: { emoji: "🌧️", night: "🌧️", label: "Sűrű szitálás" },
  56: { emoji: "🌧️", night: "🌧️", label: "Ónos szitálás" },
  57: { emoji: "🌧️", night: "🌧️", label: "Ónos szitálás" },
  61: { emoji: "🌦️", night: "🌧️", label: "Enyhe eső" },
  63: { emoji: "🌧️", night: "🌧️", label: "Eső" },
  65: { emoji: "🌧️", night: "🌧️", label: "Erős eső" },
  66: { emoji: "🌧️", night: "🌧️", label: "Ónos eső" },
  67: { emoji: "🌧️", night: "🌧️", label: "Ónos eső" },
  71: { emoji: "🌨️", night: "🌨️", label: "Enyhe havazás" },
  73: { emoji: "🌨️", night: "🌨️", label: "Havazás" },
  75: { emoji: "❄️", night: "❄️", label: "Erős havazás" },
  77: { emoji: "🌨️", night: "🌨️", label: "Hószemcsék" },
  80: { emoji: "🌦️", night: "🌧️", label: "Záporok" },
  81: { emoji: "🌧️", night: "🌧️", label: "Záporok" },
  82: { emoji: "⛈️", night: "⛈️", label: "Heves zápor" },
  85: { emoji: "🌨️", night: "🌨️", label: "Hózápor" },
  86: { emoji: "🌨️", night: "🌨️", label: "Erős hózápor" },
  95: { emoji: "⛈️", night: "⛈️", label: "Zivatar" },
  96: { emoji: "⛈️", night: "⛈️", label: "Jégesős zivatar" },
  99: { emoji: "⛈️", night: "⛈️", label: "Heves jégesős zivatar" },
};

const weatherInfoFor = (code, isDay) => {
  const info = WEATHER_CODE_MAP[code] ?? { emoji: "·", night: "·", label: "—" };
  return { emoji: isDay ? info.emoji : info.night, label: info.label };
};

const formatHour = (isoString) => {
  const d = new Date(isoString);
  return `${String(d.getHours()).padStart(2, "0")}h`;
};

const formatClock = (isoString) => {
  const d = new Date(isoString);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

// JS-style "day of week" → short Hungarian label (0 = Sunday).
const HUNGARIAN_DAY_SHORT = ["Vas", "Hét", "Ke", "Sze", "Csü", "Pé", "Szo"];

// Map a Celsius temperature to a color along the iOS-style cool→warm scale.
const tempToColor = (temp) => {
  // hue: cyan/blue at cold, red at hot; clamp at the extremes.
  const hue = Math.max(0, Math.min(220, 200 - temp * 6.5));
  return `hsl(${hue}, 70%, 58%)`;
};

const renderWeatherWidget = (root, data) => {
  const current = data?.current ?? {};
  const daily = data?.daily ?? {};
  const isDay = current.is_day === 1;

  root.dataset.isDay = isDay ? "true" : "false";

  const { emoji, label } = weatherInfoFor(current.weather_code, isDay);

  const set = (selector, value) => {
    const el = root.querySelector(selector);
    if (el) el.textContent = value;
  };

  set("[data-weather-icon]", emoji);
  set("[data-weather-temp]", Math.round(current.temperature_2m ?? 0));
  set("[data-weather-condition]", label);
  set("[data-weather-hi]", Math.round(daily.temperature_2m_max?.[0] ?? 0));
  set("[data-weather-lo]", Math.round(daily.temperature_2m_min?.[0] ?? 0));
  set("[data-weather-sunrise]", daily.sunrise?.[0] ? formatClock(daily.sunrise[0]) : "—");
  set("[data-weather-sunset]", daily.sunset?.[0] ? formatClock(daily.sunset[0]) : "—");

  // 10-day forecast list
  const list = root.querySelector("[data-weather-forecast-list]");
  if (list && Array.isArray(daily.time) && daily.time.length > 0) {
    const lows = daily.temperature_2m_min ?? [];
    const highs = daily.temperature_2m_max ?? [];
    const codes = daily.weather_code ?? [];

    // Global temperature span across all days, used to position each row's bar.
    const globalMin = Math.min(...lows);
    const globalMax = Math.max(...highs);
    const span = Math.max(1, globalMax - globalMin); // guard against degenerate span

    list.innerHTML = "";
    const count = Math.min(10, daily.time.length);
    const currentTemp = current.temperature_2m;

    for (let i = 0; i < count; i++) {
      const date = new Date(daily.time[i]);
      const low = lows[i];
      const high = highs[i];
      const code = codes[i];

      const dayLabel = i === 0
        ? "Ma"
        : HUNGARIAN_DAY_SHORT[date.getDay()];

      const leftPct = ((low - globalMin) / span) * 100;
      const rightPct = ((high - globalMin) / span) * 100;
      const widthPct = Math.max(2, rightPct - leftPct); // minimum visible width
      const colorLow = tempToColor(low);
      const colorHigh = tempToColor(high);

      const row = document.createElement("li");
      row.className = "weather-forecast-row";
      if (i === 0) row.classList.add("weather-forecast-row--today");

      // Today's marker — current temp position on the global scale.
      let markerHtml = "";
      if (i === 0 && typeof currentTemp === "number" && Number.isFinite(currentTemp)) {
        const markerPct = Math.max(0, Math.min(100, ((currentTemp - globalMin) / span) * 100));
        markerHtml = `<span class="weather-forecast-today-dot" style="left: ${markerPct}%"></span>`;
      }

      const dayInfo = weatherInfoFor(code, true); // forecast icons always use day variant
      row.innerHTML = `
        <span class="weather-forecast-day">${dayLabel}</span>
        <span class="weather-forecast-icon" aria-hidden="true">${dayInfo.emoji}</span>
        <span class="weather-forecast-temp weather-forecast-temp--lo">${Math.round(low)}°</span>
        <span class="weather-forecast-bar-track">
          <span class="weather-forecast-bar" style="left: ${leftPct}%; width: ${widthPct}%; background: linear-gradient(to right, ${colorLow}, ${colorHigh});"></span>
          ${markerHtml}
        </span>
        <span class="weather-forecast-temp weather-forecast-temp--hi">${Math.round(high)}°</span>
      `;
      list.appendChild(row);
    }
  }
};

const initWeatherWidget = async () => {
  const root = document.querySelector("[data-weather-widget]");
  if (!root) return;

  const url = "https://api.open-meteo.com/v1/forecast"
    + "?latitude=46.9097&longitude=18.0594"
    + "&current=temperature_2m,weather_code,wind_speed_10m,is_day"
    + "&daily=temperature_2m_max,temperature_2m_min,weather_code,sunrise,sunset"
    + "&timezone=Europe%2FBudapest&forecast_days=10";

  try {
    const r = await fetch(url);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const data = await r.json();
    renderWeatherWidget(root, data);
  } catch (err) {
    console.warn("Weather widget fetch failed:", err);
    // Leave skeleton placeholders in place; do not break the page.
  }
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
  initWeatherWidget();
});
