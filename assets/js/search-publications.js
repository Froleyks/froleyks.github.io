(() => {
  const STORAGE_KEY = "papers-search:v2";
  const SECTION = "Papers";

  const normalizeText = (text) => (text || "").replace(/\s+/g, " ").trim();
  const normalizePath = (path) => {
    const pathname = (path || "").toString().split(/[?#]/)[0];
    return pathname.replace(/\/+$/, "") || "/";
  };

  const getBasePath = () => {
    const brandHref = document.querySelector("a.navbar-brand")?.getAttribute("href");
    if (brandHref && brandHref.startsWith("/")) return brandHref.replace(/\/?$/, "/");
    return "/";
  };

  const getPublicationsPath = () => `${getBasePath()}publications/`;
  const isOnPublicationsPage = () => normalizePath(window.location.pathname) === normalizePath(getPublicationsPath());

  const buildItems = (entries) => {
    const publicationsPath = getPublicationsPath();
    return entries.map(({ key, title, description }) => ({
      id: `paper-${key}`,
      title,
      description: description || "",
      section: SECTION,
      handler: () => {
        window.location.href = `${publicationsPath}#${encodeURIComponent(key)}`;
      },
    }));
  };

  const addItemsToNinja = (items) => {
    const ninja = document.querySelector("ninja-keys");
    if (!ninja) return;

    const existingIds = new Set((ninja.data || []).map((item) => item?.id).filter(Boolean));
    const newItems = items.filter((item) => item?.id && !existingIds.has(item.id));
    if (newItems.length === 0) return;

    ninja.data = [...(ninja.data || []), ...newItems];
  };

  const extractEntriesFromDocument = (doc) => {
    const entries = [];
    doc.querySelectorAll(".publications ol.bibliography .title").forEach((titleEl) => {
      const container = titleEl.closest("[id]");
      const key = container?.id;
      const title = normalizeText(titleEl.textContent);
      if (!key || !title) return;

      const periodicals = Array.from(container.querySelectorAll(".periodical"))
        .map((el) => normalizeText(el.textContent))
        .filter(Boolean);
      const description = periodicals.join(" · ");

      entries.push({ key, title, description });
    });

    const seenKeys = new Set();
    return entries.filter((entry) => {
      if (seenKeys.has(entry.key)) return false;
      seenKeys.add(entry.key);
      return true;
    });
  };

  let loadPromise;
  const loadPapersForSearch = async () => {
    if (loadPromise) return loadPromise;
    loadPromise = (async () => {
      try {
        const cached = sessionStorage.getItem(STORAGE_KEY);
        if (cached) {
          addItemsToNinja(buildItems(JSON.parse(cached)));
          return;
        }

        if (isOnPublicationsPage()) {
          const entries = extractEntriesFromDocument(document);
          if (entries.length > 0) {
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
            addItemsToNinja(buildItems(entries));
            return;
          }
        }

        const publicationsPath = getPublicationsPath();
        const response = await fetch(publicationsPath, { credentials: "same-origin" });
        if (!response.ok) return;

        const htmlText = await response.text();
        const doc = new DOMParser().parseFromString(htmlText, "text/html");
        const entries = extractEntriesFromDocument(doc);
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
        addItemsToNinja(buildItems(entries));
      } catch {
        // Best-effort only.
      }
    })();

    return loadPromise;
  };

  window.__loadPapersForSearch = loadPapersForSearch;

  document.addEventListener("DOMContentLoaded", () => {
    if (typeof requestIdleCallback === "function") {
      requestIdleCallback(() => loadPapersForSearch(), { timeout: 2000 });
    } else {
      setTimeout(() => loadPapersForSearch(), 0);
    }
  });
})();
