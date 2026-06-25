import { clampNumber } from "./number-utils.js";

export function createBookContentApi({
  localizationApi,
  bindingApi,
  pageApi,
}) {
  const {
    localization,
    availableLanguages,
    getCurrentLanguage,
    bookMinimumPageCount,
    getBookTotalPageCount,
  } = localizationApi;
  const {
    strings,
    rules,
    formatDisplayedNumber,
    resourceUiIcons,
    getDefaultUnitTypeId,
    normalizeUnitTypeId,
    hasDefinedUnitType,
    getResolvedUnitConfig,
    getUnitSpriteConfig,
    getDefaultUnitName,
    getTechnologyDefinition,
    getTechnologyLabel,
    getTechnologyDisplayState,
    getTechnologyProgressPercent,
    getSelectedResearchGoalTechnologyId,
    canSelectResearchGoal,
    getBuildingRules,
    getBuildingSpec,
    getBuildingLabel,
    getVehicleRules,
    getVehicleSpec,
    getVehicleLabel,
    getFoodDefinition,
    getResourceLabel,
  } = bindingApi;
  const {
    bookPageContentHiddenClass,
    getBookPageDefinition,
    getBookPageNumberById,
  } = pageApi;

  let bookTechArrowMarkerSequence = 0;

  function getBookManifestPaths(language = getCurrentLanguage()) {
    const defaultBookLanguage = localization?.defaultLanguage || "fr";
    const normalizedLanguage = availableLanguages[language] ? language : defaultBookLanguage;
    const localizedManifestPath = `book/${normalizedLanguage}/index.json`;

    if (normalizedLanguage === defaultBookLanguage) {
      return [localizedManifestPath];
    }

    return [localizedManifestPath, `book/${defaultBookLanguage}/index.json`];
  }

  function resolveBookAssetPath(path, manifestPath) {
    return new URL(path, new URL(manifestPath, window.location.href)).toString();
  }

  function resolveBookPageAssetUrl(reference, pageUrl) {
    if (typeof reference !== "string") {
      return reference;
    }

    const trimmedReference = reference.trim();
    if (!trimmedReference || trimmedReference.startsWith("#")) {
      return reference;
    }

    try {
      return new URL(trimmedReference, pageUrl).toString();
    } catch {
      return reference;
    }
  }

  function resolveBookPageSrcSet(srcset, pageUrl) {
    if (typeof srcset !== "string" || !srcset.trim()) {
      return srcset;
    }

    return srcset
      .split(",")
      .map((candidate) => {
        const trimmedCandidate = candidate.trim();
        if (!trimmedCandidate) {
          return trimmedCandidate;
        }

        const [url, ...descriptorParts] = trimmedCandidate.split(/\s+/);
        const resolvedUrl = resolveBookPageAssetUrl(url, pageUrl);
        return [resolvedUrl, ...descriptorParts].filter(Boolean).join(" ");
      })
      .join(", ");
  }

  function normalizeBookPageHtml(rawHtml, pageUrl) {
    const template = document.createElement("template");
    template.innerHTML = rawHtml;

    for (const element of template.content.querySelectorAll("img[src], audio[src], video[src], source[src]")) {
      element.setAttribute("src", resolveBookPageAssetUrl(element.getAttribute("src"), pageUrl));
    }

    for (const element of template.content.querySelectorAll("img[srcset], source[srcset]")) {
      element.setAttribute("srcset", resolveBookPageSrcSet(element.getAttribute("srcset"), pageUrl));
    }

    for (const element of template.content.querySelectorAll("video[poster]")) {
      element.setAttribute("poster", resolveBookPageAssetUrl(element.getAttribute("poster"), pageUrl));
    }

    return template.innerHTML;
  }

  function getBookBindingValueAtPath(rootValue, pathSegments = []) {
    let currentValue = rootValue;

    for (const rawSegment of pathSegments) {
      const segment = typeof rawSegment === "string" ? rawSegment.trim() : "";

      if (!segment || currentValue == null) {
        return null;
      }

      if (Array.isArray(currentValue)) {
        const index = Number.parseInt(segment, 10);

        if (!Number.isInteger(index) || index < 0 || index >= currentValue.length) {
          return null;
        }

        currentValue = currentValue[index];
        continue;
      }

      if (typeof currentValue !== "object") {
        return null;
      }

      if (!Object.prototype.hasOwnProperty.call(currentValue, segment)) {
        return null;
      }

      currentValue = currentValue[segment];
    }

    return currentValue;
  }

  function formatBookBindingValue(value) {
    if (value == null) {
      return "";
    }

    if (typeof value === "string") {
      return value;
    }

    if (typeof value === "number" || typeof value === "boolean" || typeof value === "bigint") {
      return typeof value === "number"
        ? formatDisplayedNumber(value)
        : String(value);
    }

    if (typeof value === "function") {
      return "";
    }

    if (Array.isArray(value)) {
      return value.map((item) => formatBookBindingValue(item)).filter(Boolean).join(", ");
    }

    if (typeof value === "object") {
      try {
        return JSON.stringify(value);
      } catch {
        return "";
      }
    }

    return String(value);
  }

  function getResolvedBookBindingTechnologyId(technologyId) {
    return typeof technologyId === "string" && technologyId.trim()
      ? technologyId.trim()
      : null;
  }

  function getResolvedBookBindingBuildingTypeId(typeId) {
    return typeof typeId === "string" && typeId.trim()
      ? typeId.trim()
      : null;
  }

  function getResolvedBookBindingVehicleTypeId(typeId) {
    return typeof typeId === "string" && typeId.trim()
      ? typeId.trim()
      : null;
  }

  function getResolvedBookBindingUnitTypeId(typeId) {
    const normalizedTypeId = typeof typeId === "string" ? typeId.trim() : "";

    if (!normalizedTypeId || normalizedTypeId === "default") {
      return getDefaultUnitTypeId();
    }

    return normalizeUnitTypeId(normalizedTypeId);
  }

  function createBookBindingTechnologyView(technologyId) {
    const resolvedTechnologyId = getResolvedBookBindingTechnologyId(technologyId);
    const technology = resolvedTechnologyId ? getTechnologyDefinition(resolvedTechnologyId) : null;

    if (!technology) {
      return null;
    }

    return {
      ...technology,
      id: technology.id,
      name: getTechnologyLabel(technology),
      label: getTechnologyLabel(technology),
      icon: technology.icon || null,
      prerequisiteTechIds: [...(technology.prerequisites?.tech || [])],
      prerequisiteEventIds: [...(technology.prerequisites?.events || [])],
    };
  }

  function createBookBindingBuildingView(typeId) {
    const resolvedTypeId = getResolvedBookBindingBuildingTypeId(typeId);
    const rulesEntry = resolvedTypeId ? getBuildingRules(resolvedTypeId) : null;
    const spec = resolvedTypeId ? getBuildingSpec(resolvedTypeId) : null;

    if (!resolvedTypeId || (!rulesEntry && !spec)) {
      return null;
    }

    const image = spec?.subtypes?.[0]?.image || null;

    return {
      ...(rulesEntry && typeof rulesEntry === "object" ? rulesEntry : {}),
      ...(spec && typeof spec === "object" ? spec : {}),
      id: resolvedTypeId,
      name: getBuildingLabel(resolvedTypeId),
      label: getBuildingLabel(resolvedTypeId),
      icon: image,
      iconText: typeof spec?.icon === "string" ? spec.icon : "",
      image,
    };
  }

  function createBookBindingVehicleView(typeId) {
    const resolvedTypeId = getResolvedBookBindingVehicleTypeId(typeId);
    const rulesEntry = resolvedTypeId ? getVehicleRules(resolvedTypeId) : null;
    const spec = resolvedTypeId ? getVehicleSpec(resolvedTypeId) : null;

    if (!resolvedTypeId || (!rulesEntry && !spec)) {
      return null;
    }

    const image = spec?.subtypes?.[0]?.image || null;

    return {
      ...(rulesEntry && typeof rulesEntry === "object" ? rulesEntry : {}),
      ...(spec && typeof spec === "object" ? spec : {}),
      id: resolvedTypeId,
      name: getVehicleLabel(resolvedTypeId),
      label: getVehicleLabel(resolvedTypeId),
      icon: image,
      iconText: typeof spec?.icon === "string" ? spec.icon : "",
      image,
    };
  }

  function createBookBindingUnitView(typeId) {
    const resolvedTypeId = getResolvedBookBindingUnitTypeId(typeId);

    if (!resolvedTypeId || !hasDefinedUnitType(resolvedTypeId)) {
      return null;
    }

    const config = getResolvedUnitConfig(resolvedTypeId);
    const spriteConfig = getUnitSpriteConfig(resolvedTypeId);
    const icon = spriteConfig?.idleImage || null;

    return {
      ...(config && typeof config === "object" ? config : {}),
      id: resolvedTypeId,
      typeId: resolvedTypeId,
      name: getDefaultUnitName(resolvedTypeId),
      label: getDefaultUnitName(resolvedTypeId),
      icon,
      image: icon,
      sprite: icon,
    };
  }

  function createBookBindingResourceView(resourceType) {
    const normalizedResourceType = typeof resourceType === "string" ? resourceType.trim() : "";

    if (!normalizedResourceType) {
      return null;
    }

    const iconPath = resourceUiIcons[normalizedResourceType];
    const foodDefinition = getFoodDefinition(normalizedResourceType);

    return {
      ...(foodDefinition && typeof foodDefinition === "object" ? foodDefinition : {}),
      id: normalizedResourceType,
      name: getResourceLabel(normalizedResourceType),
      label: getResourceLabel(normalizedResourceType),
      icon: iconPath ? new URL(iconPath, window.location.href).toString() : null,
    };
  }

  function resolveBookBindingValue(reference) {
    const normalizedReference = typeof reference === "string" ? reference.trim() : "";

    if (!normalizedReference) {
      return null;
    }

    const segments = normalizedReference.split(".").map((segment) => segment.trim()).filter(Boolean);
    const [namespace, ...rest] = segments;

    if (!namespace) {
      return null;
    }

    if (namespace === "strings" || namespace === "string") {
      return getBookBindingValueAtPath(strings, rest);
    }

    if (namespace === "rules" || namespace === "rule") {
      return getBookBindingValueAtPath(rules, rest);
    }

    if (namespace === "technology" || namespace === "technologies" || namespace === "tech") {
      const [technologyId, ...pathSegments] = rest;
      return getBookBindingValueAtPath(createBookBindingTechnologyView(technologyId), pathSegments);
    }

    if (namespace === "building" || namespace === "buildings") {
      const [buildingType, ...pathSegments] = rest;
      return getBookBindingValueAtPath(createBookBindingBuildingView(buildingType), pathSegments);
    }

    if (namespace === "vehicle" || namespace === "vehicles") {
      const [vehicleType, ...pathSegments] = rest;
      return getBookBindingValueAtPath(createBookBindingVehicleView(vehicleType), pathSegments);
    }

    if (namespace === "unit" || namespace === "units") {
      const [unitType, ...pathSegments] = rest;
      return getBookBindingValueAtPath(createBookBindingUnitView(unitType), pathSegments);
    }

    if (namespace === "resource" || namespace === "resources") {
      const [resourceType, ...pathSegments] = rest;
      return getBookBindingValueAtPath(createBookBindingResourceView(resourceType), pathSegments);
    }

    return null;
  }

  function applyBookBindingToElement(element, bindingTarget, bindingReference) {
    if (!(element instanceof HTMLElement) || typeof bindingTarget !== "string") {
      return;
    }

    const value = resolveBookBindingValue(bindingReference);
    const formattedValue = formatBookBindingValue(value);
    const target = bindingTarget.trim();

    if (!target || target === "text") {
      element.textContent = formattedValue;
      return;
    }

    if (formattedValue) {
      element.setAttribute(target, formattedValue);
    } else {
      element.removeAttribute(target);
    }
  }

  function applyBookBindings(pageBodyElement) {
    if (!(pageBodyElement instanceof HTMLElement)) {
      return;
    }

    const elements = [pageBodyElement, ...pageBodyElement.querySelectorAll("*")];

    for (const element of elements) {
      if (!(element instanceof HTMLElement)) {
        continue;
      }

      const directBinding = element.dataset.bookBind?.trim();
      if (directBinding) {
        applyBookBindingToElement(element, "text", directBinding);
      }

      for (const attributeName of element.getAttributeNames()) {
        if (!attributeName.startsWith("data-book-bind-")) {
          continue;
        }

        const bindingTarget = attributeName.slice("data-book-bind-".length);
        const bindingReference = element.getAttribute(attributeName)?.trim();
        applyBookBindingToElement(element, bindingTarget, bindingReference);
      }
    }
  }

  function normalizeBookPageCount(count, minimumPageCount = bookMinimumPageCount) {
    const normalizedCount = Math.max(0, Math.floor(Number(count) || 0));
    const evenCount = normalizedCount % 2 === 0 ? normalizedCount : normalizedCount + 1;
    return Math.max(Math.max(0, Math.floor(Number(minimumPageCount) || 0)), evenCount);
  }

  function normalizeBookManifestMeta(meta) {
    const minimumPageCount = Math.max(
      bookMinimumPageCount,
      Math.floor(Number(meta?.minimumPageCount) || 0),
    );

    return {
      minimumPageCount,
    };
  }

  function normalizeBookManifestBookmarks(rawBookmarks) {
    if (!Array.isArray(rawBookmarks)) {
      return [];
    }

    return rawBookmarks
      .map((bookmark) => {
        if (!bookmark || typeof bookmark !== "object") {
          return null;
        }

        const id = typeof bookmark.id === "string" ? bookmark.id.trim() : "";
        const page = typeof bookmark.page === "string" ? bookmark.page.trim() : "";
        const label = typeof bookmark.label === "string" ? bookmark.label.trim() : "";

        if (!id || !page) {
          return null;
        }

        return {
          id,
          page,
          label,
        };
      })
      .filter(Boolean);
  }

  function normalizeBookManifestSequences(rawSequences) {
    if (!rawSequences || typeof rawSequences !== "object" || Array.isArray(rawSequences)) {
      return {};
    }

    const normalizedEntries = Object.entries(rawSequences)
      .map(([sequenceId, sequencePages]) => {
        const id = typeof sequenceId === "string" ? sequenceId.trim() : "";
        if (!id || !Array.isArray(sequencePages)) {
          return null;
        }

        const pages = sequencePages
          .map((pageId) => (typeof pageId === "string" ? pageId.trim() : ""))
          .filter(Boolean);

        return [id, pages];
      })
      .filter(Boolean);

    return Object.fromEntries(normalizedEntries);
  }

  function createBlankBookPageDefinition(index, totalCount = bookMinimumPageCount) {
    return {
      id: `blank-page-${String(index + 1).padStart(2, "0")}`,
      file: null,
      html: "",
      showPageNumber: index < totalCount,
      isBlank: true,
    };
  }

  function createDefaultBookDocument(pageCount = getBookTotalPageCount()) {
    const meta = normalizeBookManifestMeta();
    const normalizedPageCount = normalizeBookPageCount(pageCount, meta.minimumPageCount);
    const pages = Array.from(
      { length: normalizedPageCount },
      (_, index) => createBlankBookPageDefinition(index, normalizedPageCount),
    );

    return {
      loaded: false,
      language: null,
      requestedLanguage: null,
      manifestPath: null,
      meta,
      bookmarks: [],
      sequences: {},
      pages,
    };
  }

  function normalizeBookManifestEntry(entry, index) {
    if (!entry || typeof entry !== "object") {
      return null;
    }

    const id = typeof entry.id === "string" ? entry.id.trim() : "";
    const file = typeof entry.file === "string" ? entry.file.trim() : "";

    if (!id || !file) {
      return null;
    }

    return {
      id,
      file,
      showPageNumber: entry.showPageNumber !== false,
      html: "",
      isBlank: false,
      sourceIndex: index,
    };
  }

  function normalizeBookManifestPages(rawPages, minimumPageCount = bookMinimumPageCount) {
    const pages = [];
    const seenIds = new Set();

    for (const [index, entry] of rawPages.entries()) {
      const normalizedEntry = normalizeBookManifestEntry(entry, index);
      if (!normalizedEntry || seenIds.has(normalizedEntry.id)) {
        continue;
      }

      seenIds.add(normalizedEntry.id);
      pages.push(normalizedEntry);
    }

    const targetCount = normalizeBookPageCount(pages.length, minimumPageCount);
    while (pages.length < targetCount) {
      pages.push(createBlankBookPageDefinition(pages.length, targetCount));
    }

    return pages;
  }

  async function loadBookManifestDocument(language = getCurrentLanguage()) {
    let lastError = null;

    for (const manifestPath of getBookManifestPaths(language)) {
      try {
        const manifestResponse = await fetch(manifestPath, { cache: "no-cache" });
        if (!manifestResponse.ok) {
          lastError = new Error(`Failed to load book manifest: ${manifestResponse.status}`);
          continue;
        }

        const manifest = await manifestResponse.json();
        const meta = normalizeBookManifestMeta(manifest?.meta);
        const bookmarks = normalizeBookManifestBookmarks(manifest?.bookmarks);
        const sequences = normalizeBookManifestSequences(manifest?.sequences);
        const rawPages = Array.isArray(manifest?.pages) ? manifest.pages : [];
        const pages = normalizeBookManifestPages(rawPages, meta.minimumPageCount);

        await Promise.all(pages.map(async (page) => {
          if (!page.file) {
            return;
          }

          const pageUrl = resolveBookAssetPath(page.file, manifestPath);
          const pageResponse = await fetch(pageUrl, { cache: "no-cache" });
          if (!pageResponse.ok) {
            throw new Error(`Failed to load book page "${page.id}": ${pageResponse.status}`);
          }

          page.html = normalizeBookPageHtml(await pageResponse.text(), pageUrl);
        }));

        const manifestLanguageMatch = manifestPath.match(/book\/([^/]+)\/index\.json$/);

        return {
          loaded: true,
          language: manifestLanguageMatch ? manifestLanguageMatch[1] : language,
          requestedLanguage: language,
          manifestPath,
          meta,
          bookmarks,
          sequences,
          pages,
        };
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError || new Error("Failed to load localized book manifest.");
  }

  function createBookTechArrowSvgElement(tagName) {
    return document.createElementNS("http://www.w3.org/2000/svg", tagName);
  }

  function clearBookTechWidgetArrows(pageBodyElement) {
    if (!(pageBodyElement instanceof HTMLElement)) {
      return;
    }

    for (const overlay of pageBodyElement.querySelectorAll(".book-tech-arrow-layer")) {
      overlay.remove();
    }
  }

  function isBookTechWidgetElement(element) {
    return element instanceof HTMLElement && element.dataset.bookWidget === "tech";
  }

  function getBookTechWidgetTechnologyId(widget) {
    return typeof widget?.dataset?.techId === "string" ? widget.dataset.techId.trim() : "";
  }

  function groupBookTechWidgetsIntoRows(pageBodyElement) {
    if (!(pageBodyElement instanceof HTMLElement)) {
      return;
    }

    const children = [...pageBodyElement.children];
    let index = 0;

    while (index < children.length) {
      if (!isBookTechWidgetElement(children[index])) {
        index += 1;
        continue;
      }

      const row = document.createElement("div");
      row.className = "book-tech-widget-row";
      children[index].before(row);

      while (index < children.length && isBookTechWidgetElement(children[index])) {
        row.append(children[index]);
        index += 1;
      }
    }
  }

  function enhanceBookTechWidget(widget) {
    if (!(widget instanceof HTMLElement)) {
      return;
    }

    const technologyId = getBookTechWidgetTechnologyId(widget);
    const technology = getTechnologyDefinition(technologyId);
    const technologyLabel = getTechnologyLabel(technology);
    const contentMarkup = widget.innerHTML;
    const displayState = getTechnologyDisplayState(technologyId);
    const progressPercent = getTechnologyProgressPercent(technologyId);
    const isSelectedGoal = technologyId && getSelectedResearchGoalTechnologyId() === technologyId;
    const isSelectable = technologyId && canSelectResearchGoal(technologyId);
    const header = document.createElement("div");
    const body = document.createElement("div");

    widget.classList.add("book-tech-widget");
    widget.dataset.techState = displayState;
    widget.dataset.techSelectable = isSelectable ? "true" : "false";
    widget.dataset.techSelectedGoal = isSelectedGoal ? "true" : "false";
    widget.dataset.techLabel = technologyLabel;
    widget.style.setProperty("--book-tech-progress-percent", `${progressPercent}%`);
    if (technologyLabel) {
      widget.setAttribute("aria-label", technologyLabel);
      widget.title = technologyLabel;
    }
    widget.replaceChildren();

    header.className = "book-tech-header";
    body.className = "book-tech-body";
    body.innerHTML = contentMarkup;

    if (technology?.icon) {
      const iconImage = document.createElement("img");
      iconImage.className = "book-tech-icon";
      iconImage.src = technology.icon;
      iconImage.alt = technologyLabel;
      iconImage.decoding = "async";
      header.append(iconImage);
    }

    if (technology) {
      const costBadge = document.createElement("span");
      costBadge.className = "book-tech-cost";
      costBadge.textContent = String(technology.cost);
      header.append(costBadge);
    } else {
      widget.dataset.techState = "missing";
    }

    widget.append(header, body);
  }

  function getBookTechWidgetBounds(widget, containerRect) {
    const rect = widget.getBoundingClientRect();

    return {
      left: rect.left - containerRect.left,
      right: rect.right - containerRect.left,
      top: rect.top - containerRect.top,
      bottom: rect.bottom - containerRect.top,
      width: rect.width,
      height: rect.height,
      centerX: rect.left - containerRect.left + rect.width / 2,
      centerY: rect.top - containerRect.top + rect.height / 2,
    };
  }

  function getBookTechArrowAxis(fromBounds, toBounds) {
    if (!fromBounds || !toBounds) {
      return "horizontal";
    }

    const isClearlyVertical =
      toBounds.top >= fromBounds.bottom ||
      toBounds.bottom <= fromBounds.top;

    return isClearlyVertical ? "vertical" : "horizontal";
  }

  function getBookTechArrowSides(axis, fromBounds, toBounds) {
    if (axis === "vertical") {
      const isForward = toBounds.centerY >= fromBounds.centerY;
      return {
        startSide: isForward ? "bottom" : "top",
        endSide: isForward ? "top" : "bottom",
      };
    }

    const isForward = toBounds.centerX >= fromBounds.centerX;
    return {
      startSide: isForward ? "right" : "left",
      endSide: isForward ? "left" : "right",
    };
  }

  function createBookTechArrowConnectionLayout(fromWidget, toWidget, containerRect) {
    const fromBounds = getBookTechWidgetBounds(fromWidget, containerRect);
    const toBounds = getBookTechWidgetBounds(toWidget, containerRect);
    const axis = getBookTechArrowAxis(fromBounds, toBounds);
    const { startSide, endSide } = getBookTechArrowSides(axis, fromBounds, toBounds);
    const sortValue = axis === "vertical" ? toBounds.centerX : toBounds.centerY;
    const reverseSortValue = axis === "vertical" ? fromBounds.centerX : fromBounds.centerY;

    return {
      from: fromWidget,
      to: toWidget,
      fromBounds,
      toBounds,
      axis,
      startSide,
      endSide,
      startSortValue: sortValue,
      endSortValue: reverseSortValue,
      startFraction: 0.5,
      endFraction: 0.5,
    };
  }

  function getBookTechArrowDistributedFraction(index, count) {
    if (!Number.isInteger(index) || !Number.isInteger(count) || count <= 1) {
      return 0.5;
    }

    const minimum = 0.28;
    const maximum = 0.72;
    return minimum + ((maximum - minimum) * index) / (count - 1);
  }

  function getBookTechArrowGroupBuckets(groupMap, widget) {
    if (!groupMap.has(widget)) {
      groupMap.set(widget, {
        top: [],
        right: [],
        bottom: [],
        left: [],
      });
    }

    return groupMap.get(widget);
  }

  function assignBookTechArrowAttachmentFractions(connections) {
    const endGroups = new Map();

    for (const connection of connections) {
      getBookTechArrowGroupBuckets(endGroups, connection.to)[connection.endSide].push(connection);
    }

    const assignFractionsForGroups = (groupMap, sortKey, fractionKey) => {
      for (const sideGroups of groupMap.values()) {
        for (const group of Object.values(sideGroups)) {
          if (group.length === 0) {
            continue;
          }

          group.sort((leftConnection, rightConnection) => leftConnection[sortKey] - rightConnection[sortKey]);

          for (const [index, connection] of group.entries()) {
            connection[fractionKey] = getBookTechArrowDistributedFraction(index, group.length);
          }
        }
      }
    };

    assignFractionsForGroups(endGroups, "endSortValue", "endFraction");
  }

  function getBookTechArrowAnchorPoint(bounds, side, fraction = 0.5) {
    const clampedFraction = clampNumber(fraction, 0, 1, 0.5);

    if (side === "top") {
      return {
        x: bounds.left + bounds.width * clampedFraction,
        y: bounds.top,
      };
    }

    if (side === "bottom") {
      return {
        x: bounds.left + bounds.width * clampedFraction,
        y: bounds.bottom,
      };
    }

    if (side === "left") {
      return {
        x: bounds.left,
        y: bounds.top + bounds.height * clampedFraction,
      };
    }

    return {
      x: bounds.right,
      y: bounds.top + bounds.height * clampedFraction,
    };
  }

  function getBookTechArrowHeadReachPx() {
    return 8;
  }

  function buildBookTechArrowPath(start, end) {
    const headReach = getBookTechArrowHeadReachPx();
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const length = Math.hypot(dx, dy);

    if (!Number.isFinite(length) || length <= 0.001) {
      return `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
    }

    const shaftLength = Math.max(0, length - headReach);
    const unitX = dx / length;
    const unitY = dy / length;
    const shaftEnd = {
      x: start.x + unitX * shaftLength,
      y: start.y + unitY * shaftLength,
    };

    return `M ${start.x} ${start.y} L ${shaftEnd.x} ${shaftEnd.y}`;
  }

  function renderBookTechWidgetArrows(pageBodyElement) {
    if (!(pageBodyElement instanceof HTMLElement)) {
      return false;
    }

    clearBookTechWidgetArrows(pageBodyElement);

    const widgets = [...pageBodyElement.querySelectorAll('[data-book-widget="tech"]')];
    const containerRect = pageBodyElement.getBoundingClientRect();

    if (widgets.length === 0) {
      return false;
    }

    const hasUsableContainerSize =
      Number.isFinite(containerRect.width) &&
      Number.isFinite(containerRect.height) &&
      containerRect.width > 1 &&
      containerRect.height > 1;

    if (!hasUsableContainerSize) {
      return false;
    }

    const widgetsById = new Map();
    for (const widget of widgets) {
      const widgetRect = widget.getBoundingClientRect();

      if (widgetRect.width <= 0 || widgetRect.height <= 0) {
        return false;
      }

      const technologyId = getBookTechWidgetTechnologyId(widget);
      if (technologyId) {
        widgetsById.set(technologyId, widget);
      }
    }

    const connections = [];
    for (const widget of widgets) {
      const technology = getTechnologyDefinition(getBookTechWidgetTechnologyId(widget));
      if (!technology) {
        continue;
      }

      for (const prerequisiteId of technology.prerequisites.tech) {
        const prerequisiteWidget = widgetsById.get(prerequisiteId);
        if (prerequisiteWidget) {
          connections.push(createBookTechArrowConnectionLayout(prerequisiteWidget, widget, containerRect));
        }
      }
    }

    if (connections.length === 0) {
      return false;
    }

    const overlay = createBookTechArrowSvgElement("svg");
    const defs = createBookTechArrowSvgElement("defs");
    const marker = createBookTechArrowSvgElement("marker");
    const markerPath = createBookTechArrowSvgElement("path");
    const markerId = `bookTechArrowMarker${bookTechArrowMarkerSequence += 1}`;
    const overlayWidth = Math.max(1, pageBodyElement.clientWidth || Math.ceil(containerRect.width));
    const overlayHeight = Math.max(1, pageBodyElement.clientHeight || Math.ceil(containerRect.height));

    overlay.classList.add("book-tech-arrow-layer");
    overlay.setAttribute("viewBox", `0 0 ${overlayWidth} ${overlayHeight}`);
    overlay.setAttribute("preserveAspectRatio", "none");
    overlay.setAttribute("aria-hidden", "true");

    marker.setAttribute("id", markerId);
    marker.setAttribute("viewBox", "0 0 10 8");
    marker.setAttribute("markerWidth", "10");
    marker.setAttribute("markerHeight", "8");
    marker.setAttribute("refX", "1");
    marker.setAttribute("refY", "4");
    marker.setAttribute("orient", "auto");
    marker.setAttribute("markerUnits", "userSpaceOnUse");

    markerPath.setAttribute("d", "M 1 1 L 9 4 L 1 7 z");
    marker.append(markerPath);
    defs.append(marker);
    overlay.append(defs);

    assignBookTechArrowAttachmentFractions(connections);

    for (const connection of connections) {
      const start = getBookTechArrowAnchorPoint(connection.fromBounds, connection.startSide, connection.startFraction);
      const end = getBookTechArrowAnchorPoint(connection.toBounds, connection.endSide, connection.endFraction);
      const path = createBookTechArrowSvgElement("path");
      path.setAttribute("d", buildBookTechArrowPath(start, end));
      path.setAttribute("marker-end", `url(#${markerId})`);
      overlay.append(path);
    }

    pageBodyElement.prepend(overlay);
    return true;
  }

  function scheduleBookTechWidgetArrowRender(pageBodyElement, attempt = 0) {
    if (!(pageBodyElement instanceof HTMLElement)) {
      return;
    }

    requestAnimationFrame(() => {
      if (!pageBodyElement.isConnected) {
        return;
      }

      const rendered = renderBookTechWidgetArrows(pageBodyElement);

      if (!rendered && attempt < 4) {
        scheduleBookTechWidgetArrowRender(pageBodyElement, attempt + 1);
      }
    });
  }

  function enhanceBookPageBody(pageBodyElement) {
    if (!(pageBodyElement instanceof HTMLElement)) {
      return;
    }

    applyBookBindings(pageBodyElement);
    groupBookTechWidgetsIntoRows(pageBodyElement);

    const techWidgets = [...pageBodyElement.querySelectorAll('[data-book-widget="tech"]')];

    for (const widget of techWidgets) {
      enhanceBookTechWidget(widget);
    }

    scheduleBookTechWidgetArrowRender(pageBodyElement);

    if (document.fonts?.ready) {
      document.fonts.ready.then(() => {
        if (!pageBodyElement.isConnected) {
          return;
        }

        renderBookTechWidgetArrows(pageBodyElement);
      });
    }

    for (const image of pageBodyElement.querySelectorAll("img")) {
      if (image.complete) {
        continue;
      }

      const rerenderArrows = () => {
        if (!pageBodyElement.isConnected) {
          return;
        }

        renderBookTechWidgetArrows(pageBodyElement);
      };

      image.addEventListener("load", rerenderArrows, { once: true });
      image.addEventListener("error", rerenderArrows, { once: true });
    }
  }

  function fillBookPageSideContent(content, pageNumber) {
    if (!content) {
      return;
    }

    content.replaceChildren();

    if (!Number.isInteger(pageNumber)) {
      content.classList.add(bookPageContentHiddenClass);
      content.removeAttribute("data-book-page-id");
      return;
    }

    const pageDefinition = getBookPageDefinition(pageNumber);
    if (pageDefinition?.id) {
      content.dataset.bookPageId = pageDefinition.id;
    } else {
      content.removeAttribute("data-book-page-id");
    }

    content.classList.remove(bookPageContentHiddenClass);

    const pageBodyElement = document.createElement("div");
    pageBodyElement.className = "book-page-body";
    pageBodyElement.innerHTML = pageDefinition?.html || "";
    content.append(pageBodyElement);

    if (pageDefinition?.showPageNumber !== false) {
      const pageNumberElement = document.createElement("div");
      pageNumberElement.className = "book-page-number";
      pageNumberElement.textContent = String(pageNumber);
      content.append(pageNumberElement);
    }

    enhanceBookPageBody(pageBodyElement);
  }

  function getBookTargetPageIdFromLink(link) {
    if (!link) {
      return null;
    }

    const explicitTarget = link.dataset.bookTarget?.trim();
    if (explicitTarget) {
      return explicitTarget;
    }

    const href = link.getAttribute("href")?.trim();
    if (!href || href === "#") {
      return null;
    }

    if (href.startsWith("book:")) {
      return href.slice("book:".length).trim() || null;
    }

    if (href.startsWith("#")) {
      return href.slice(1).trim() || null;
    }

    return getBookPageNumberById(href) ? href : null;
  }

  return {
    createDefaultBookDocument,
    loadBookManifestDocument,
    fillBookPageSideContent,
    getBookTargetPageIdFromLink,
    getBookTechWidgetTechnologyId,
  };
}
