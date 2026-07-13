import { clampInteger } from "./number-utils.js";

export function createBookRuntimeApi({
  state,
  dom,
  config,
  callbacks,
}) {
  const {
    getBookDocument,
    setBookDocument,
    getBookContentLoadPromise,
    setBookContentLoadPromise,
    getBookTotalPageCount,
    setBookTotalPageCount,
    getBookState,
    setBookState,
    getBookOverlayTriggerButton,
    setBookOverlayTriggerButton,
    getBookOverlayRestoreState,
    setBookOverlayRestoreState,
    getBookOverlayIntroMode,
    setBookOverlayIntroMode,
    getBookPageTurnAnimation,
    setBookPageTurnAnimation,
    getBookPageTurnAnimationTimeoutId,
    setBookPageTurnAnimationTimeoutId,
    getBookSequencePlayback,
    setBookSequencePlayback,
    getBookSequencePlaybackTimeoutId,
    setBookSequencePlaybackTimeoutId,
    getMainMenuOpen,
    setMainMenuOpen,
    getInteractionMode,
    setInteractionMode,
  } = state;
  const {
    bookOverlay,
    bookVisual,
    bookBookmarkBackBar,
    bookBookmarkFrontBar,
    bookBookmarkBars,
    previousBookPageButtons,
    nextBookPageButtons,
    bookPageLayers,
    mainMenuOverlay,
  } = dom;
  const {
    bookVisiblePageLayerCount,
    bookEntityHiddenClass,
    bookLayerWithSpineClass,
    bookPagePlaceholderClass,
    bookPageContentClass,
    bookPageContentHiddenClass,
    bookPageTurnOverlayClass,
    bookPageTurnFramesPerPhase,
    bookPageTurnFrameDurationMs,
    bookPageTurnCollapsedScale,
    bookIntroSequenceId,
    bookSequenceInitialPauseMs,
    bookSequenceTurnPauseMs,
    interactionModes,
  } = config;
  const {
    loadBookManifestDocument,
    updateWatchIntroButton,
    fillBookPageSideContent,
    closeGameActionMenu,
    closeSaveSlotPanel,
    hideTileMenu,
    ensureTechnologyCatalogLoaded,
    ensureBuildingDefinitionsLoaded,
    ensureVehicleDefinitionsLoaded,
    ensureUnitDefinitionsLoaded,
    updateInteractionModeUi,
    draw,
    hideBookTransientHint,
    clearPendingBookResearchAssignment,
    startIntroMusicSegmentPlayback,
    stopIntroMusicSegmentPlayback,
    isPlayMode,
    getCurrentLanguage,
    getBookPageDefinition,
    getBookPageNumberById,
  } = callbacks;

  function createInitialBookState(totalPageCount = getBookTotalPageCount()) {
    const normalizedTotalPageCount = Math.max(2, Math.floor(totalPageCount / 2) * 2);
    const initialSpreadIndex = Math.floor(normalizedTotalPageCount / 4);
    return getBookStateForSpreadIndex(initialSpreadIndex, normalizedTotalPageCount);
  }

  async function ensureBookContentLoaded() {
    const bookDocument = getBookDocument();

    if (bookDocument.loaded && bookDocument.requestedLanguage === getCurrentLanguage()) {
      return bookDocument;
    }

    if (!getBookContentLoadPromise()) {
      setBookContentLoadPromise(
        loadBookManifestDocument()
          .then((documentDefinition) => {
            setBookDocument(documentDefinition);
            setBookTotalPageCount(documentDefinition.pages.length);
            setBookState(createInitialBookState(documentDefinition.pages.length));
            updateWatchIntroButton();

            if (bookOverlay && !bookOverlay.hidden) {
              cancelBookPageTurnAnimation();
              updateBookPageStack(getBookState());
            }

            return getBookDocument();
          })
          .catch((error) => {
            console.error(error);
            updateWatchIntroButton();
            return getBookDocument();
          }),
      );
    }

    return getBookContentLoadPromise();
  }

  function closeBookOverlay({ restoreFocus = false, restoreState = true } = {}) {
    cancelBookSequencePlayback();
    cancelBookPageTurnAnimation();
    setBookOverlayIntroMode(false);
    hideBookTransientHint();
    clearPendingBookResearchAssignment();

    if (bookOverlay) {
      bookOverlay.hidden = true;
    }

    const bookOverlayRestoreState = getBookOverlayRestoreState();

    if (bookOverlayRestoreState && restoreState) {
      setInteractionMode(bookOverlayRestoreState.interactionMode);
      setMainMenuOpen(bookOverlayRestoreState.mainMenuOpen);
      mainMenuOverlay.hidden = !getMainMenuOpen();
      setBookOverlayRestoreState(null);
      updateInteractionModeUi();
      draw();
    } else if (bookOverlayRestoreState) {
      setBookOverlayRestoreState(null);
      updateInteractionModeUi();
    } else {
      updateInteractionModeUi();
    }

    const bookOverlayTriggerButton = getBookOverlayTriggerButton();
    if (restoreFocus && bookOverlayTriggerButton) {
      bookOverlayTriggerButton.focus({ preventScroll: true });
    }

    setBookOverlayTriggerButton(null);
  }

  function createBookPageContentElement(side) {
    const content = document.createElement("div");
    content.className = bookPageContentClass;
    content.dataset.bookPageContentSide = side;
    return content;
  }

  function initializeBookPageContent() {
    for (const layer of bookPageLayers) {
      for (const side of ["left", "right"]) {
        if (layer.querySelector(`.${bookPageContentClass}[data-book-page-content-side="${side}"]`)) {
          continue;
        }

        layer.append(createBookPageContentElement(side));
      }
    }
  }

  function updateBookTurnButtons() {
    const bookPageTurnAnimation = getBookPageTurnAnimation();
    const bookSequencePlayback = getBookSequencePlayback();

    let previousDisabled = false;
    let nextDisabled = false;

    if (bookPageTurnAnimation || bookSequencePlayback) {
      previousDisabled = true;
      nextDisabled = true;
    } else {
      previousDisabled = !canTurnBookPage(getBookState(), -1);
      nextDisabled = !canTurnBookPage(getBookState(), 1);
    }

    for (const button of previousBookPageButtons) {
      button.disabled = previousDisabled;
    }

    for (const button of nextBookPageButtons) {
      button.disabled = nextDisabled;
    }
  }

  function getBookPageCountsForState(state = getBookState()) {
    const bookTotalPageCount = getBookTotalPageCount();
    const actualLeftCount = Number.isInteger(state?.leftPageNumber)
      ? Math.max(0, Math.floor((state.leftPageNumber + 1) / 2))
      : 0;
    const actualRightCount = Number.isInteger(state?.rightPageNumber)
      ? Math.max(0, Math.floor((bookTotalPageCount - state.rightPageNumber + 2) / 2))
      : 0;
    const actualTotalCount = actualLeftCount + actualRightCount;

    if (actualTotalCount <= bookVisiblePageLayerCount) {
      return {
        left: actualLeftCount,
        right: actualRightCount,
      };
    }

    const minimumLeftCount = actualLeftCount > 0 ? 1 : 0;
    const minimumRightCount = actualRightCount > 0 ? 1 : 0;
    const minimumVisibleCount = minimumLeftCount + minimumRightCount;

    if (minimumVisibleCount >= bookVisiblePageLayerCount) {
      return {
        left: minimumLeftCount,
        right: minimumRightCount,
      };
    }

    const remainingVisibleCount = bookVisiblePageLayerCount - minimumVisibleCount;
    const extraLeftCount = Math.max(0, actualLeftCount - minimumLeftCount);
    const extraRightCount = Math.max(0, actualRightCount - minimumRightCount);
    const extraTotalCount = extraLeftCount + extraRightCount;

    if (extraTotalCount <= 0) {
      return {
        left: minimumLeftCount,
        right: minimumRightCount,
      };
    }

    const leftQuota = extraLeftCount * remainingVisibleCount / extraTotalCount;
    const rightQuota = extraRightCount * remainingVisibleCount / extraTotalCount;

    let leftCount = minimumLeftCount + Math.floor(leftQuota);
    let rightCount = minimumRightCount + Math.floor(rightQuota);
    let remainingCount = bookVisiblePageLayerCount - leftCount - rightCount;

    while (remainingCount > 0) {
      const leftRemainder = leftQuota - (leftCount - minimumLeftCount);
      const rightRemainder = rightQuota - (rightCount - minimumRightCount);

      if (
        leftRemainder > rightRemainder
        || (leftRemainder === rightRemainder && actualLeftCount > 0 && actualLeftCount <= actualRightCount)
      ) {
        leftCount += 1;
      } else {
        rightCount += 1;
      }

      remainingCount -= 1;
    }

    return {
      left: leftCount,
      right: rightCount,
    };
  }

  function getVisibleBookStatePageNumbers(state = getBookState()) {
    const counts = getBookPageCountsForState(state);

    return {
      left: Array.from({ length: counts.left }, (_, index) => state.leftPageNumber - index * 2),
      right: Array.from({ length: counts.right }, (_, index) => state.rightPageNumber + index * 2),
    };
  }

  function getTopVisibleBookLayerIndex(state = getBookState()) {
    const counts = getBookPageCountsForState(state);
    const visibleLayerCount = Math.max(counts.left, counts.right);
    return bookVisiblePageLayerCount - visibleLayerCount + 1;
  }

  function isBookPageLayerVisible(layerIndex, side, state = getBookState()) {
    const counts = getBookPageCountsForState(state);
    const topVisibleLayer = getTopVisibleBookLayerIndex(state);
    const sideCount = counts[side];

    if (sideCount <= 0) {
      return false;
    }

    return layerIndex >= topVisibleLayer && layerIndex < topVisibleLayer + sideCount;
  }

  function canTurnBookPage(state = getBookState(), direction = 1) {
    const spreadIndex = getBookSpreadIndexForState(state);

    if (!Number.isInteger(spreadIndex)) {
      return false;
    }

    if (direction > 0) {
      return spreadIndex < getBookMaxSpreadIndex(getBookTotalPageCount());
    }

    return spreadIndex > 0;
  }

  function getBookStateAfterPageTurn(state = getBookState(), direction = 1) {
    const spreadIndex = getBookSpreadIndexForState(state);

    if (!Number.isInteger(spreadIndex) || !canTurnBookPage(state, direction)) {
      return state;
    }

    return getBookStateForSpreadIndex(spreadIndex + (direction > 0 ? 1 : -1));
  }

  function getBookPageLayerByIndex(layerIndex) {
    return bookPageLayers.find((layer) => Number(layer.dataset.bookPageLayer) === layerIndex) || null;
  }

  function getBookPageSideContent(layer, side) {
    return layer?.querySelector(`.${bookPageContentClass}[data-book-page-content-side="${side}"]`) || null;
  }

  function getBookPageTurnOverlayElements(layer, side) {
    if (!layer) {
      return {
        page: null,
        content: null,
      };
    }

    return {
      page: layer.querySelector(`.book-page-entity.${bookPageTurnOverlayClass}[data-book-page-side="${side}"]`),
      content: layer.querySelector(`.${bookPageContentClass}.${bookPageTurnOverlayClass}[data-book-page-content-side="${side}"]`),
    };
  }

  function getBookMaxSpreadIndex(totalPageCount = getBookTotalPageCount()) {
    return Math.max(1, Math.floor(Math.max(2, Math.floor(totalPageCount / 2) * 2) / 2));
  }

  function getBookStateForSpreadIndex(spreadIndex, totalPageCount = getBookTotalPageCount()) {
    const normalizedTotalPageCount = Math.max(2, Math.floor(totalPageCount / 2) * 2);
    const maxSpreadIndex = getBookMaxSpreadIndex(normalizedTotalPageCount);
    const normalizedSpreadIndex = clampInteger(spreadIndex, 0, maxSpreadIndex, 0);

    if (normalizedSpreadIndex <= 0) {
      return {
        leftPageNumber: null,
        rightPageNumber: 1,
      };
    }

    if (normalizedSpreadIndex >= maxSpreadIndex) {
      return {
        leftPageNumber: normalizedTotalPageCount,
        rightPageNumber: null,
      };
    }

    const leftPageNumber = normalizedSpreadIndex * 2;

    return {
      leftPageNumber,
      rightPageNumber: leftPageNumber + 1,
    };
  }

  function getBookSpreadIndexForState(state) {
    const bookTotalPageCount = getBookTotalPageCount();
    const leftPageNumber = Number.isInteger(state?.leftPageNumber) ? state.leftPageNumber : null;
    const rightPageNumber = Number.isInteger(state?.rightPageNumber) ? state.rightPageNumber : null;
    const maxSpreadIndex = getBookMaxSpreadIndex(bookTotalPageCount);

    if (leftPageNumber === null && rightPageNumber === 1) {
      return 0;
    }

    if (leftPageNumber === bookTotalPageCount && rightPageNumber === null) {
      return maxSpreadIndex;
    }

    if (
      Number.isInteger(leftPageNumber)
      && Number.isInteger(rightPageNumber)
      && leftPageNumber >= 2
      && rightPageNumber === leftPageNumber + 1
    ) {
      const spreadIndex = Math.floor(leftPageNumber / 2);
      return clampInteger(spreadIndex, 1, Math.max(1, maxSpreadIndex - 1), 1);
    }

    return null;
  }

  function getBookStateForPageNumber(pageNumber) {
    const bookTotalPageCount = getBookTotalPageCount();

    if (!Number.isInteger(pageNumber) || pageNumber < 1 || pageNumber > bookTotalPageCount) {
      return null;
    }

    if (pageNumber === 1) {
      return getBookStateForSpreadIndex(0);
    }

    if (pageNumber === bookTotalPageCount) {
      return getBookStateForSpreadIndex(getBookMaxSpreadIndex(bookTotalPageCount));
    }

    return getBookStateForSpreadIndex(Math.floor(pageNumber / 2));
  }

  function jumpBookToPageNumber(pageNumber) {
    const nextState = getBookStateForPageNumber(pageNumber);
    if (!nextState) {
      return false;
    }

    cancelBookSequencePlayback();
    cancelBookPageTurnAnimation();
    setBookState(nextState);
    updateBookPageStack(getBookState());
    return true;
  }

  function jumpBookToPageId(pageId) {
    const pageNumber = getBookPageNumberById(pageId);
    if (!Number.isInteger(pageNumber)) {
      return false;
    }

    return jumpBookToPageNumber(pageNumber);
  }

  function isBookStateShowingPageNumber(state = getBookState(), pageNumber) {
    return Number.isInteger(pageNumber) && (
      state?.leftPageNumber === pageNumber ||
      state?.rightPageNumber === pageNumber
    );
  }

  function getRenderableBookBookmarks() {
    const bookDocument = getBookDocument();

    return (Array.isArray(bookDocument?.bookmarks) ? bookDocument.bookmarks : [])
      .map((bookmark) => {
        const pageNumber = getBookPageNumberById(bookmark?.page);

        if (!Number.isInteger(pageNumber)) {
          return null;
        }

        return {
          id: bookmark.id,
          pageId: bookmark.page,
          pageNumber,
          label: bookmark.label || getBookPageDefinition(pageNumber)?.id || String(pageNumber),
        };
      })
      .filter(Boolean);
  }

  function getBookBookmarkDefinition(bookmarkId) {
    const bookDocument = getBookDocument();

    if (!bookmarkId || !Array.isArray(bookDocument?.bookmarks)) {
      return null;
    }

    return bookDocument.bookmarks.find((bookmark) => bookmark?.id === bookmarkId) || null;
  }

  function getBookBookmarkLengthPx(index, totalCount) {
    if (totalCount <= 1) {
      return 84;
    }

    return 74 + index * 10;
  }

  function getBookSpreadIndexForPageNumber(pageNumber) {
    const state = getBookStateForPageNumber(pageNumber);
    return state ? getBookSpreadIndexForState(state) : null;
  }

  function clearBookBookmarkSlotLayers() {
    if (!bookVisual) {
      return;
    }

    for (const layer of bookVisual.querySelectorAll(".book-bookmark-slot-layer")) {
      layer.remove();
    }
  }

  function ensureBookBookmarkSlotLayer(layerIndex) {
    if (!bookVisual || !Number.isInteger(layerIndex)) {
      return null;
    }

    let layer = bookVisual.querySelector(`.book-bookmark-slot-layer[data-book-bookmark-layer="${layerIndex}"]`);

    if (layer) {
      return layer;
    }

    const beforeLayer = getBookPageLayerByIndex(layerIndex);
    if (!beforeLayer) {
      return null;
    }

    const beforeLayerStyles = window.getComputedStyle(beforeLayer);
    layer = document.createElement("div");
    layer.className = "book-bookmark-slot-layer";
    layer.dataset.bookBookmarkLayer = String(layerIndex);
    layer.style.top = beforeLayerStyles.top;
    layer.style.right = beforeLayerStyles.right;
    layer.style.bottom = beforeLayerStyles.bottom;
    layer.style.left = beforeLayerStyles.left;
    layer.style.zIndex = beforeLayerStyles.zIndex;
    bookVisual.insertBefore(layer, beforeLayer);
    return layer;
  }

  function getBookBookmarkInactivePlacement(bookmark, state = getBookState()) {
    if (!bookmark || isBookStateShowingPageNumber(state, bookmark.pageNumber)) {
      return null;
    }

    const bookTotalPageCount = getBookTotalPageCount();
    const topVisibleLayer = getTopVisibleBookLayerIndex(state);
    const visibleCounts = getBookPageCountsForState(state);

    if (Number.isInteger(state?.leftPageNumber) && bookmark.pageNumber < state.leftPageNumber && visibleCounts.left > 0) {
      const actualCount = Math.max(1, Math.floor((state.leftPageNumber + 1) / 2));
      const actualIndex = clampInteger(
        Math.floor((state.leftPageNumber - bookmark.pageNumber) / 2),
        0,
        Math.max(0, actualCount - 1),
        0,
      );
      const slotIndex = clampInteger(
        Math.floor(actualIndex * visibleCounts.left / actualCount),
        0,
        Math.max(0, visibleCounts.left - 1),
        0,
      );

      return {
        side: "left",
        layerIndex: topVisibleLayer + slotIndex,
      };
    }

    if (Number.isInteger(state?.rightPageNumber) && bookmark.pageNumber > state.rightPageNumber && visibleCounts.right > 0) {
      const actualCount = Math.max(1, Math.floor((bookTotalPageCount - state.rightPageNumber + 2) / 2));
      const actualIndex = clampInteger(
        Math.floor((bookmark.pageNumber - state.rightPageNumber) / 2),
        0,
        Math.max(0, actualCount - 1),
        0,
      );
      const slotIndex = clampInteger(
        Math.floor(actualIndex * visibleCounts.right / actualCount),
        0,
        Math.max(0, visibleCounts.right - 1),
        0,
      );

      return {
        side: "right",
        layerIndex: topVisibleLayer + slotIndex,
      };
    }

    return {
      side: "center",
      layerIndex: topVisibleLayer,
    };
  }

  function getBookBookmarkRenderMeta(bookmarks, state = getBookState()) {
    const renderMeta = new Map();
    const inactiveLeftBookmarks = bookmarks
      .filter((bookmark) => Number.isInteger(state?.leftPageNumber) && bookmark.pageNumber < state.leftPageNumber)
      .sort((a, b) => b.pageNumber - a.pageNumber);
    const inactiveRightBookmarks = bookmarks
      .filter((bookmark) => Number.isInteger(state?.rightPageNumber) && bookmark.pageNumber > state.rightPageNumber)
      .sort((a, b) => a.pageNumber - b.pageNumber);
    const activeBookmarks = bookmarks
      .filter((bookmark) => isBookStateShowingPageNumber(state, bookmark.pageNumber))
      .sort((a, b) => a.pageNumber - b.pageNumber);

    for (const [index, bookmark] of inactiveLeftBookmarks.entries()) {
      renderMeta.set(bookmark.id, {
        lengthIndex: index,
        lengthCount: inactiveLeftBookmarks.length,
        zIndex: inactiveLeftBookmarks.length - index,
      });
    }

    for (const [index, bookmark] of inactiveRightBookmarks.entries()) {
      renderMeta.set(bookmark.id, {
        lengthIndex: index,
        lengthCount: inactiveRightBookmarks.length,
        zIndex: inactiveRightBookmarks.length - index,
      });
    }

    for (const [index, bookmark] of activeBookmarks.entries()) {
      renderMeta.set(bookmark.id, {
        lengthIndex: index,
        lengthCount: activeBookmarks.length,
        zIndex: activeBookmarks.length - index,
      });
    }

    return renderMeta;
  }

  function createBookBookmarkGroupElement(groupId, bookmarks, state = getBookState(), {
    activeOnly = false,
    renderMeta = null,
  } = {}) {
    const groupElement = document.createElement("div");
    groupElement.className = `book-bookmark-group book-bookmark-group-${groupId}`;

    for (const [index, bookmark] of bookmarks.entries()) {
      const isActive = isBookStateShowingPageNumber(state, bookmark.pageNumber);

      if (activeOnly !== isActive) {
        continue;
      }

      const button = document.createElement("button");
      const fullLabel = bookmark.label || getBookPageDefinition(bookmark.pageNumber)?.id || String(bookmark.pageNumber);
      button.type = "button";
      button.className = "book-bookmark-button";
      button.dataset.bookBookmarkId = bookmark.id;
      button.dataset.bookPageId = bookmark.pageId;
      button.textContent = fullLabel || "•";
      button.title = fullLabel;
      button.setAttribute("aria-label", fullLabel);
      const bookmarkMeta = renderMeta?.get(bookmark.id) || null;
      const lengthIndex = bookmarkMeta?.lengthIndex ?? index;
      const lengthCount = bookmarkMeta?.lengthCount ?? bookmarks.length;
      const zIndex = bookmarkMeta?.zIndex ?? (bookmarks.length - index);
      button.style.setProperty("--book-bookmark-length", `${getBookBookmarkLengthPx(lengthIndex, lengthCount)}px`);
      button.style.zIndex = String(zIndex);
      button.classList.toggle("is-active", isActive);
      groupElement.append(button);
    }

    return groupElement;
  }

  function updateBookBookmarks(state = getBookState()) {
    if (!bookBookmarkBackBar || !bookBookmarkFrontBar) {
      return;
    }

    const bookmarks = getBookOverlayIntroMode() ? [] : getRenderableBookBookmarks();
    clearBookBookmarkSlotLayers();

    for (const bar of bookBookmarkBars) {
      bar.replaceChildren();
      bar.hidden = bookmarks.length === 0;
    }

    if (bookmarks.length === 0) {
      return;
    }

    const bookmarkRenderMeta = getBookBookmarkRenderMeta(bookmarks, state);
    const activeBookmarks = bookmarks.filter((bookmark) => isBookStateShowingPageNumber(state, bookmark.pageNumber));
    const inactiveBookmarkGroups = new Map();

    for (const bookmark of bookmarks) {
      if (activeBookmarks.includes(bookmark)) {
        continue;
      }

      const placement = getBookBookmarkInactivePlacement(bookmark, state);

      if (!placement) {
        continue;
      }

      const key = `${placement.layerIndex}:${placement.side}`;
      if (!inactiveBookmarkGroups.has(key)) {
        inactiveBookmarkGroups.set(key, {
          layerIndex: placement.layerIndex,
          side: placement.side,
          bookmarks: [],
        });
      }

      inactiveBookmarkGroups.get(key).bookmarks.push(bookmark);
    }

    const sortedInactiveGroups = [...inactiveBookmarkGroups.values()].sort((a, b) => {
      if (a.layerIndex !== b.layerIndex) {
        return a.layerIndex - b.layerIndex;
      }

      return a.side.localeCompare(b.side);
    });

    for (const group of sortedInactiveGroups) {
      if (group.side === "left") {
        group.bookmarks.sort((a, b) => b.pageNumber - a.pageNumber);
      } else {
        group.bookmarks.sort((a, b) => a.pageNumber - b.pageNumber);
      }

      const slotLayer = ensureBookBookmarkSlotLayer(group.layerIndex);
      if (!slotLayer) {
        continue;
      }

      slotLayer.append(createBookBookmarkGroupElement(group.side, group.bookmarks, state, {
        activeOnly: false,
        renderMeta: bookmarkRenderMeta,
      }));
    }

    const activeBookmarkGroups = {
      left: [],
      center: activeBookmarks,
      right: [],
    };

    for (const groupId of ["left", "center", "right"]) {
      const groupBookmarks = activeBookmarkGroups[groupId];
      if (groupBookmarks.length === 0) {
        continue;
      }

      bookBookmarkFrontBar.append(createBookBookmarkGroupElement(groupId, groupBookmarks, state, {
        activeOnly: true,
        renderMeta: bookmarkRenderMeta,
      }));
    }
  }

  function getBookSequencePageNumbers(sequenceId) {
    const sequenceEntries = getBookDocument()?.sequences?.[sequenceId];
    if (!Array.isArray(sequenceEntries)) {
      return [];
    }

    return sequenceEntries
      .map((pageId) => getBookPageNumberById(pageId))
      .filter((pageNumber) => Number.isInteger(pageNumber));
  }

  function getBookStateKey(state) {
    return `${state?.leftPageNumber ?? ""}/${state?.rightPageNumber ?? ""}`;
  }

  function cloneBookState(state) {
    return {
      leftPageNumber: state?.leftPageNumber ?? null,
      rightPageNumber: state?.rightPageNumber ?? null,
    };
  }

  function getBookSequenceSpreadStates(sequenceId) {
    const spreadStates = [];
    let previousKey = null;

    for (const pageNumber of getBookSequencePageNumbers(sequenceId)) {
      const state = getBookStateForPageNumber(pageNumber);
      if (!state) {
        continue;
      }

      const stateKey = getBookStateKey(state);
      if (stateKey === previousKey) {
        continue;
      }

      spreadStates.push(cloneBookState(state));
      previousKey = stateKey;
    }

    return spreadStates;
  }

  function clearBookSequencePlaybackTimeout() {
    const timeoutId = getBookSequencePlaybackTimeoutId();
    if (!timeoutId) {
      return;
    }

    clearTimeout(timeoutId);
    setBookSequencePlaybackTimeoutId(0);
  }

  function cancelBookSequencePlayback() {
    clearBookSequencePlaybackTimeout();
    stopIntroMusicSegmentPlayback();

    if (!getBookSequencePlayback()) {
      return;
    }

    setBookSequencePlayback(null);
    updateBookTurnButtons();
  }

  function scheduleBookSequencePlaybackStep(delayMs = bookSequenceTurnPauseMs) {
    if (!getBookSequencePlayback()) {
      return;
    }

    clearBookSequencePlaybackTimeout();
    setBookSequencePlaybackTimeoutId(setTimeout(() => {
      setBookSequencePlaybackTimeoutId(0);
      playNextBookSequenceTurn();
    }, delayMs));
  }

  function scheduleBookSequencePlaybackClose(delayMs = bookSequenceTurnPauseMs) {
    if (!getBookSequencePlayback()) {
      return;
    }

    clearBookSequencePlaybackTimeout();
    setBookSequencePlaybackTimeoutId(setTimeout(() => {
      setBookSequencePlaybackTimeoutId(0);

      const bookSequencePlayback = getBookSequencePlayback();
      if (!bookSequencePlayback) {
        return;
      }

      if (bookSequencePlayback.awaitingAudioCompletion) {
        bookSequencePlayback.pendingCloseAfterAudio = true;
        return;
      }

      closeBookOverlay();
    }, delayMs));
  }

  function finalizeBookSequencePlaybackStep() {
    const bookSequencePlayback = getBookSequencePlayback();
    if (!bookSequencePlayback) {
      return;
    }

    if (Number.isInteger(bookSequencePlayback.pendingSpreadIndex)) {
      bookSequencePlayback.currentSpreadIndex = bookSequencePlayback.pendingSpreadIndex;
      bookSequencePlayback.pendingSpreadIndex = null;
    }

    if (bookSequencePlayback.currentSpreadIndex >= bookSequencePlayback.spreadStates.length - 1) {
      scheduleBookSequencePlaybackClose();
      return;
    }

    scheduleBookSequencePlaybackStep();
  }

  function playNextBookSequenceTurn() {
    const bookSequencePlayback = getBookSequencePlayback();
    const bookPageTurnAnimation = getBookPageTurnAnimation();

    if (!bookSequencePlayback || bookPageTurnAnimation) {
      return;
    }

    const nextSpreadIndex = bookSequencePlayback.currentSpreadIndex + 1;
    const nextState = bookSequencePlayback.spreadStates[nextSpreadIndex];
    const currentState = bookSequencePlayback.spreadStates[bookSequencePlayback.currentSpreadIndex];

    if (!nextState || !currentState) {
      cancelBookSequencePlayback();
      return;
    }

    const direction = (nextState.leftPageNumber ?? 0) >= (currentState.leftPageNumber ?? 0) ? 1 : -1;
    bookSequencePlayback.pendingSpreadIndex = nextSpreadIndex;
    startBookPageTurnAnimation(direction);

    if (!getBookPageTurnAnimation()) {
      setBookState(cloneBookState(nextState));
      updateBookPageStack(getBookState());
      finalizeBookSequencePlaybackStep();
    }
  }

  function startBookSequencePlayback(sequenceId = bookIntroSequenceId) {
    const spreadStates = getBookSequenceSpreadStates(sequenceId);
    if (!spreadStates.length) {
      return false;
    }

    cancelBookSequencePlayback();
    cancelBookPageTurnAnimation();
    setBookState(cloneBookState(spreadStates[0]));
    updateBookPageStack(getBookState());

    setBookSequencePlayback({
      sequenceId,
      spreadStates,
      currentSpreadIndex: 0,
      pendingSpreadIndex: null,
      awaitingAudioCompletion: false,
      pendingCloseAfterAudio: false,
    });

    updateBookTurnButtons();

    if (sequenceId === bookIntroSequenceId) {
      getBookSequencePlayback().awaitingAudioCompletion = true;
      void startIntroMusicSegmentPlayback().then((didStart) => {
        const bookSequencePlayback = getBookSequencePlayback();

        if (!bookSequencePlayback || bookSequencePlayback.sequenceId !== sequenceId) {
          stopIntroMusicSegmentPlayback();
          return;
        }

        if (didStart) {
          return;
        }

        bookSequencePlayback.awaitingAudioCompletion = false;

        if (bookSequencePlayback.pendingCloseAfterAudio) {
          closeBookOverlay();
        }
      });
    }

    if (spreadStates.length > 1) {
      scheduleBookSequencePlaybackStep(bookSequenceInitialPauseMs);
    } else {
      scheduleBookSequencePlaybackClose();
    }

    return true;
  }

  function getBookPageNumberForLayer(layerIndex, side, state = getBookState()) {
    const topVisibleLayer = getTopVisibleBookLayerIndex(state);
    const slotIndex = layerIndex - topVisibleLayer;

    if (slotIndex < 0) {
      return null;
    }

    const pageNumbers = getVisibleBookStatePageNumbers(state);
    return pageNumbers[side][slotIndex] ?? null;
  }

  function updateBookPageLayerContent(layer, layerIndex, leftVisible, rightVisible, state = getBookState()) {
    const leftContent = getBookPageSideContent(layer, "left");
    const rightContent = getBookPageSideContent(layer, "right");

    fillBookPageSideContent(leftContent, leftVisible ? getBookPageNumberForLayer(layerIndex, "left", state) : null);
    fillBookPageSideContent(rightContent, rightVisible ? getBookPageNumberForLayer(layerIndex, "right", state) : null);
  }

  function clearBookPageTurnOverlayTransforms(layer, side) {
    const { page, content } = getBookPageTurnOverlayElements(layer, side);

    if (page) {
      page.style.removeProperty("transform");
      page.style.removeProperty("transform-origin");
    }

    if (content) {
      content.style.removeProperty("transform");
      content.style.removeProperty("transform-origin");
    }
  }

  function removeBookPageTurnOverlay(layer, side) {
    const { page, content } = getBookPageTurnOverlayElements(layer, side);
    page?.remove();
    content?.remove();
  }

  function ensureBookPageTurnOverlay(layer, side) {
    if (!layer) {
      return {
        page: null,
        content: null,
      };
    }

    const existing = getBookPageTurnOverlayElements(layer, side);
    if (existing.page || existing.content) {
      return existing;
    }

    const sourcePage = layer.querySelector(`.book-page-entity:not(.${bookPageTurnOverlayClass})[data-book-page-side="${side}"]`);
    const sourceContent = layer.querySelector(`.${bookPageContentClass}:not(.${bookPageTurnOverlayClass})[data-book-page-content-side="${side}"]`);
    const overlay = {
      page: null,
      content: null,
    };

    if (sourcePage) {
      overlay.page = sourcePage.cloneNode(true);
      overlay.page.classList.remove(bookEntityHiddenClass);
      overlay.page.classList.add(bookPageTurnOverlayClass);
      layer.append(overlay.page);
    }

    if (sourceContent) {
      overlay.content = sourceContent.cloneNode(true);
      overlay.content.classList.remove(bookPageContentHiddenClass);
      overlay.content.classList.add(bookPageTurnOverlayClass);
      layer.append(overlay.content);
    }

    return overlay;
  }

  function getBookAnimationBackgroundState(startState, nextState, direction) {
    if (direction > 0) {
      return {
        leftPageNumber: startState.leftPageNumber,
        rightPageNumber: nextState.rightPageNumber,
      };
    }

    return {
      leftPageNumber: nextState.leftPageNumber,
      rightPageNumber: startState.rightPageNumber,
    };
  }

  function getBookAnimationLayerIndex(backgroundState) {
    return getTopVisibleBookLayerIndex(backgroundState);
  }

  function getBookAnimatedPageNumber(animation, side = animation?.activeSide) {
    if (!animation || !side) {
      return null;
    }

    if (animation.direction > 0) {
      return side === "right" ? animation.startState.rightPageNumber : animation.nextState.leftPageNumber;
    }

    return side === "left" ? animation.startState.leftPageNumber : animation.nextState.rightPageNumber;
  }

  function updateBookTurnOverlayContent(layer, side, pageNumber) {
    const { content } = ensureBookPageTurnOverlay(layer, side);
    fillBookPageSideContent(content, pageNumber);
  }

  function applyBookPageTurnOverlayTransform(
    layer,
    side,
    scale,
    skewDegrees,
    pageNumber = getBookAnimatedPageNumber(getBookPageTurnAnimation(), side),
  ) {
    const { page, content } = ensureBookPageTurnOverlay(layer, side);
    const transform = `scaleX(${scale}) skewY(${skewDegrees}deg)`;

    if (page) {
      page.style.transformOrigin = "50% center";
      page.style.transform = transform;
    }

    if (content) {
      fillBookPageSideContent(content, pageNumber);
      content.style.transformOrigin = side === "left" ? "right center" : "left center";
      content.style.transform = transform;
    }
  }

  function getBookPageTurnSkewDegrees(side) {
    return side === "right" ? -12 : 12;
  }

  function clearBookPageTurnAnimationState() {
    const bookPageTurnAnimation = getBookPageTurnAnimation();

    if (bookPageTurnAnimation?.layerIndex) {
      const animationLayer = getBookPageLayerByIndex(bookPageTurnAnimation.layerIndex);
      clearBookPageTurnOverlayTransforms(animationLayer, "left");
      clearBookPageTurnOverlayTransforms(animationLayer, "right");
      removeBookPageTurnOverlay(animationLayer, "left");
      removeBookPageTurnOverlay(animationLayer, "right");
    }

    const timeoutId = getBookPageTurnAnimationTimeoutId();
    if (timeoutId) {
      clearTimeout(timeoutId);
      setBookPageTurnAnimationTimeoutId(0);
    }

    setBookPageTurnAnimation(null);
  }

  function cancelBookPageTurnAnimation() {
    if (!getBookPageTurnAnimation()) {
      return;
    }

    clearBookPageTurnAnimationState();
    updateBookPageStack(getBookState());
  }

  function updateBookPageStack(state = getBookState(), { spineLayerIndex = null } = {}) {
    const showBlankCompanionLeft = !Number.isInteger(state?.leftPageNumber) && Number.isInteger(state?.rightPageNumber);
    const showBlankCompanionRight = Number.isInteger(state?.leftPageNumber) && !Number.isInteger(state?.rightPageNumber);
    const shouldShowSpine = !(showBlankCompanionLeft || showBlankCompanionRight);
    const effectiveSpineLayerIndex = shouldShowSpine
      ? (Number.isInteger(spineLayerIndex) ? spineLayerIndex : getTopVisibleBookLayerIndex(state))
      : null;

    for (const layer of bookPageLayers) {
      const layerIndex = Number(layer.dataset.bookPageLayer);
      if (!Number.isInteger(layerIndex)) {
        continue;
      }

      const leftPage = layer.querySelector('[data-book-page-side="left"]');
      const rightPage = layer.querySelector('[data-book-page-side="right"]');
      const leftPlaceholder = showBlankCompanionLeft && layerIndex === effectiveSpineLayerIndex;
      const rightPlaceholder = showBlankCompanionRight && layerIndex === effectiveSpineLayerIndex;
      const leftVisible = isBookPageLayerVisible(layerIndex, "left", state) || leftPlaceholder;
      const rightVisible = isBookPageLayerVisible(layerIndex, "right", state) || rightPlaceholder;

      if (leftPage) {
        leftPage.classList.toggle(bookEntityHiddenClass, !leftVisible);
        leftPage.classList.toggle(bookPagePlaceholderClass, leftPlaceholder);
      }

      if (rightPage) {
        rightPage.classList.toggle(bookEntityHiddenClass, !rightVisible);
        rightPage.classList.toggle(bookPagePlaceholderClass, rightPlaceholder);
      }

      updateBookPageLayerContent(layer, layerIndex, leftVisible, rightVisible, state);
      layer.classList.toggle(
        bookLayerWithSpineClass,
        Number.isInteger(effectiveSpineLayerIndex) && layerIndex === effectiveSpineLayerIndex,
      );
    }

    updateBookTurnButtons();
    updateBookBookmarks(getBookPageTurnAnimation()?.startState || state);
  }

  function finishBookPageTurnAnimation() {
    const bookPageTurnAnimation = getBookPageTurnAnimation();

    if (bookPageTurnAnimation?.nextState) {
      setBookState(cloneBookState(bookPageTurnAnimation.nextState));
    }

    clearBookPageTurnAnimationState();
    updateBookPageStack(getBookState());
    finalizeBookSequencePlaybackStep();
  }

  function renderBookPageTurnAnimationFrame() {
    const animation = getBookPageTurnAnimation();
    if (!animation) {
      return;
    }

    const activeLayer = getBookPageLayerByIndex(animation.layerIndex);
    const skew = getBookPageTurnSkewDegrees(animation.activeSide);
    const progress = animation.frame / bookPageTurnFramesPerPhase;

    clearBookPageTurnOverlayTransforms(activeLayer, "left");
    clearBookPageTurnOverlayTransforms(activeLayer, "right");

    if (animation.phase === "out") {
      const scale = 1 - (1 - bookPageTurnCollapsedScale) * progress;
      applyBookPageTurnOverlayTransform(
        activeLayer,
        animation.activeSide,
        scale,
        skew * progress,
        getBookAnimatedPageNumber(animation, animation.activeSide),
      );
      return;
    }

    const scale = bookPageTurnCollapsedScale + (1 - bookPageTurnCollapsedScale) * progress;
    applyBookPageTurnOverlayTransform(
      activeLayer,
      animation.activeSide,
      scale,
      skew * (1 - progress),
      getBookAnimatedPageNumber(animation, animation.activeSide),
    );
  }

  function stepBookPageTurnAnimation() {
    const animation = getBookPageTurnAnimation();
    if (!animation) {
      return;
    }

    if (animation.phase === "out") {
      if (animation.frame < bookPageTurnFramesPerPhase) {
        animation.frame += 1;
        renderBookPageTurnAnimationFrame();
        updateBookTurnButtons();
        return;
      }

      const animationLayer = getBookPageLayerByIndex(animation.layerIndex);
      clearBookPageTurnOverlayTransforms(animationLayer, animation.outgoingSide);
      removeBookPageTurnOverlay(animationLayer, animation.outgoingSide);

      if (!animationLayer) {
        finishBookPageTurnAnimation();
        return;
      }

      animation.phase = "in";
      animation.frame = 0;
      animation.activeSide = animation.incomingSide;
      ensureBookPageTurnOverlay(animationLayer, animation.incomingSide);
      updateBookTurnOverlayContent(
        animationLayer,
        animation.incomingSide,
        getBookAnimatedPageNumber(animation, animation.incomingSide),
      );
      renderBookPageTurnAnimationFrame();
      updateBookTurnButtons();
      return;
    }

    if (animation.frame < bookPageTurnFramesPerPhase) {
      animation.frame += 1;
      renderBookPageTurnAnimationFrame();

      if (animation.frame >= bookPageTurnFramesPerPhase) {
        finishBookPageTurnAnimation();
        return;
      }

      updateBookTurnButtons();
      return;
    }

    finishBookPageTurnAnimation();
  }

  function scheduleBookPageTurnAnimationStep() {
    if (!getBookPageTurnAnimation()) {
      return;
    }

    const timeoutId = getBookPageTurnAnimationTimeoutId();
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    setBookPageTurnAnimationTimeoutId(setTimeout(() => {
      setBookPageTurnAnimationTimeoutId(0);

      if (!getBookPageTurnAnimation()) {
        return;
      }

      stepBookPageTurnAnimation();

      if (getBookPageTurnAnimation()) {
        scheduleBookPageTurnAnimationStep();
      }
    }, bookPageTurnFrameDurationMs));
  }

  function startBookPageTurnAnimation(direction) {
    if (getBookPageTurnAnimation()) {
      return;
    }

    const currentBookState = getBookState();
    const nextState = getBookStateAfterPageTurn(currentBookState, direction);
    if (nextState === currentBookState) {
      return;
    }

    const outgoingSide = direction > 0 ? "right" : "left";
    const incomingSide = direction > 0 ? "left" : "right";
    const startState = cloneBookState(currentBookState);
    const backgroundState = getBookAnimationBackgroundState(startState, nextState, direction);
    const layerIndex = getBookAnimationLayerIndex(backgroundState);
    const animationLayer = getBookPageLayerByIndex(layerIndex);

    if (!animationLayer) {
      setBookState(cloneBookState(nextState));
      updateBookPageStack(getBookState());
      return;
    }

    setBookPageTurnAnimation({
      direction,
      startState,
      phase: "out",
      frame: 0,
      nextState: cloneBookState(nextState),
      backgroundState,
      layerIndex,
      outgoingSide,
      incomingSide,
      activeSide: outgoingSide,
    });

    updateBookPageStack(backgroundState, { spineLayerIndex: layerIndex });
    ensureBookPageTurnOverlay(animationLayer, outgoingSide);
    updateBookTurnOverlayContent(
      animationLayer,
      outgoingSide,
      getBookAnimatedPageNumber(getBookPageTurnAnimation(), outgoingSide),
    );
    updateBookTurnButtons();
    stepBookPageTurnAnimation();

    if (getBookPageTurnAnimation()) {
      scheduleBookPageTurnAnimationStep();
    }
  }

  async function openBookOverlayPanel(triggerButton = null, { allowNonPlayMode = false, allowMainMenuOpen = false } = {}) {
    if (!bookOverlay || ((!allowNonPlayMode && !isPlayMode()) || (!allowMainMenuOpen && getMainMenuOpen()))) {
      return;
    }

    closeGameActionMenu();
    closeSaveSlotPanel();
    hideTileMenu();
    setBookOverlayTriggerButton(triggerButton);
    initializeBookPageContent();
    updateBookPageStack(getBookState());
    bookOverlay.hidden = false;
    bookOverlay.querySelector('[data-action="close-book-overlay"]')?.focus({ preventScroll: true });
    await Promise.all([
      ensureBookContentLoaded(),
      ensureTechnologyCatalogLoaded(),
      ensureBuildingDefinitionsLoaded(),
      ensureVehicleDefinitionsLoaded(),
      ensureUnitDefinitionsLoaded(),
    ]);
    updateBookPageStack(getBookState());
  }

  async function openBookOverlayAtBookmark(bookmarkId, triggerButton = null, options = {}) {
    await openBookOverlayPanel(triggerButton, options);

    if (!bookOverlay || bookOverlay.hidden) {
      return false;
    }

    const bookmark = getBookBookmarkDefinition(bookmarkId);
    const pageId = typeof bookmark?.page === "string" ? bookmark.page.trim() : "";

    if (!pageId) {
      return false;
    }

    return jumpBookToPageId(pageId);
  }

  async function playBookSequence(sequenceId = bookIntroSequenceId, triggerButton = null) {
    const shouldSuspendMainMenu = getMainMenuOpen() && !mainMenuOverlay.hidden;
    setBookOverlayIntroMode(true);

    if (shouldSuspendMainMenu) {
      setBookOverlayRestoreState({
        interactionMode: getInteractionMode(),
        mainMenuOpen: getMainMenuOpen(),
      });
      setInteractionMode(interactionModes.play);
      setMainMenuOpen(false);
      mainMenuOverlay.hidden = true;
      updateInteractionModeUi();
      draw();
    }

    await openBookOverlayPanel(triggerButton, { allowNonPlayMode: true, allowMainMenuOpen: true });

    if (!bookOverlay || bookOverlay.hidden) {
      if (shouldSuspendMainMenu) {
        const bookOverlayRestoreState = getBookOverlayRestoreState();
        setInteractionMode(bookOverlayRestoreState?.interactionMode ?? getInteractionMode());
        setMainMenuOpen(bookOverlayRestoreState?.mainMenuOpen ?? true);
        mainMenuOverlay.hidden = !getMainMenuOpen();
        setBookOverlayRestoreState(null);
      }
      setBookOverlayIntroMode(false);
      updateInteractionModeUi();
      draw();
      return false;
    }

    return startBookSequencePlayback(sequenceId);
  }

  return {
    createInitialBookState,
    ensureBookContentLoaded,
    closeBookOverlay,
    initializeBookPageContent,
    updateBookPageStack,
    jumpBookToPageId,
    openBookOverlayAtBookmark,
    openBookOverlayPanel,
    playBookSequence,
    startBookPageTurnAnimation,
  };
}
