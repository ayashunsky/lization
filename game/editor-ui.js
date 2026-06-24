import {
  clampInteger,
  clampNumber,
  clampNonNegativeNumber,
} from "./number-utils.js";

export function createEditorUiApi({
  strings,
  terrain,
  rules,
  unitActions,
  editorSupportedUnitActions,
  getEditorLabel,
  state,
  dom,
  research,
  world,
  mutations,
}) {
  const {
    getHoverCell,
    setHoverCell,
    getActiveCell,
    setActiveCell,
    getOpenDropdownId,
    setOpenDropdownId,
    getEditorResearchReturnFocusButton,
    setEditorResearchReturnFocusButton,
    getResearchState,
    setResearchState,
    getMainMenuOpen,
  } = state;
  const {
    elements,
    setTextContent,
    setAttributeForElements,
    setDisabledState,
    setHiddenState,
    roundDisplayedQuantity,
    formatDisplayedQuantity,
    formatDisplayedNumber,
  } = dom;
  const {
    getTechnologyCatalog,
    normalizeResearchState,
    ensureTechnologyCatalogLoaded,
    getSelectedResearchGoalTechnologyId,
    setSelectedResearchGoalTechnologyId,
    getTechnologyDisplayState,
    getTechnologyLabel,
    isTechnologyDiscovered,
    canSelectResearchGoal,
    getTechnologyProgress,
    getTechnologyDefinition,
    serializeResearchState,
    updateResearchPresentation,
  } = research;
  const {
    isEditMode,
    draw,
    resetTileReadout,
    getTerrainVariant,
    ensureCellVariant,
    getTerrainVariants,
    hasFoodResource,
    getBuildingAtCell,
    getVehicleAtCell,
    getUnitAtCell,
    getDefinedBuildingTypes,
    getDefinedVehicleTypes,
    getDefinedUnitTypeIds,
    canPlaceEditorBuildingAtCell,
    canPlaceEditorVehicleAtCell,
    canPlaceEditorUnitTypeAtCell,
    getCellVisitsCount,
    getCellPathWellKnownVisitsThreshold,
    getResourceLabel,
    getCellFoodMaxAmount,
    getBuildingCompleteness,
    getBuildingLabel,
    getVehicleLabel,
    getDefaultUnitName,
    getUnitTypeId,
    getUnitActionLabel,
    getFoundationBuildingTypeIcon,
    getVehicleTypeIcon,
    canUnitUseAction,
    getActionForTask,
    serializeCell,
    pickTile,
  } = world;
  const {
    invalidateStaticLayer,
    setEditStateDirty,
    syncCellResourcesWithVariant,
    applyTerrainSelection,
    applyEditorFoodSelection,
    applyEditorBuildingSelection,
    applyEditorVehicleSelection,
    applyEditorUnitSelection,
    applyEditorUnitActionSelection,
    applyEditorResourceCurrentValue,
    applyEditorResourceTotalValue,
    applyEditorFoodCurrentValue,
    applyEditorFoodTotalValue,
    applyEditorBuildingCompletionValue,
    applyEditorBuildingAbandonedValue,
    applyEditorVehicleCompletionValue,
    applyEditorVehicleAbandonedValue,
  } = mutations;

  const {
    canvas,
    editInspector,
    hoverReadouts,
    editorResearchOverlay,
    editorResearchPanel,
    editorResearchList,
    editorResearchEmpty,
    tileMenuTitle,
    terrainMenuOptions,
    variantMenuOptions,
    foodMenuOptions,
    buildingMenuOptions,
    vehicleMenuOptions,
    unitMenuOptions,
    unitActionMenuOptions,
    editorDropdownToggleButtons,
    editorDropdownMenuElements,
    editorTerrainLabelElements,
    editorVisualLabelElements,
    editorFoodLabelElements,
    editorBuildingLabelElements,
    editorVehicleLabelElements,
    editorUnitLabelElements,
    editorUnitActionLabelElements,
    openEditorResearchButtons,
    closeEditorResearchButtons,
    clearEditorResearchGoalButtons,
    editorResearchTitleElements,
    editorResearchGoalElements,
    editorResourcePanels,
    editorResourceTitleElements,
    editorResourceSeparators,
    editorResourceTotalFields,
    editorFoodPanels,
    editorBuildingPanels,
    editorVehiclePanels,
    editorCurrentLabelElements,
    editorTotalLabelElements,
    editorCompletionLabelElements,
    editorAbandonedLabelElements,
    editorResourceCurrentInput,
    editorResourceTotalInput,
    editorFoodCurrentInput,
    editorFoodTotalInput,
    editorBuildingCompletionInput,
    editorBuildingAbandonedInput,
    editorVehicleCompletionInput,
    editorVehicleAbandonedInput,
  } = elements;

  let eventsBound = false;

  function formatEditorDropdownLabel(key, value) {
    return `${getEditorLabel(key)}: ${value}`;
  }

  function getEditInspectorDisplayCell() {
    return getActiveCell() || getHoverCell() || null;
  }

  function setTileReadout(cell) {
    const spec = terrain[cell.type];
    const variant = getTerrainVariant(cell.type, ensureCellVariant(cell));
    const variantLabel = getTerrainVariants(cell.type).length > 1 && variant ? variant.label : "";
    setTextContent(hoverReadouts, strings.readouts.tile(cell.x, cell.y, spec.label, variantLabel));
  }

  function canEditTerrainSelection(cell) {
    return Boolean(cell) && !hasFoodResource(cell) && !getBuildingAtCell(cell.x, cell.y) && !getVehicleAtCell(cell.x, cell.y);
  }

  function getEditableFoodTypesForCell(cell) {
    if (!cell || getBuildingAtCell(cell.x, cell.y) || getVehicleAtCell(cell.x, cell.y)) {
      return [];
    }

    return Object.entries(rules.resources?.foodTypes || {})
      .filter(([, definition]) => definition?.terrain === cell.type && definition?.terrain !== "water")
      .map(([foodType]) => foodType);
  }

  function canEditFoodSelection(cell) {
    return getEditableFoodTypesForCell(cell).length > 0;
  }

  function canEditBuildingSelection(cell) {
    if (!cell) {
      return false;
    }

    if (getBuildingAtCell(cell.x, cell.y)) {
      return true;
    }

    if (getVehicleAtCell(cell.x, cell.y)) {
      return false;
    }

    if (hasFoodResource(cell)) {
      return false;
    }

    return getDefinedBuildingTypes().some((buildingType) => canPlaceEditorBuildingAtCell(cell, buildingType));
  }

  function canEditVehicleSelection(cell) {
    if (!cell) {
      return false;
    }

    if (getVehicleAtCell(cell.x, cell.y)) {
      return true;
    }

    if (getBuildingAtCell(cell.x, cell.y) || getUnitAtCell(cell.x, cell.y)) {
      return false;
    }

    return getDefinedVehicleTypes().some((vehicleType) => canPlaceEditorVehicleAtCell(cell, vehicleType));
  }

  function getEditorResourceMode(cell) {
    if (!cell) {
      return null;
    }

    if (cell.type === "grass") {
      return {
        kind: "path",
        title: strings.editor.path,
        current: getCellVisitsCount(cell),
        total: getCellPathWellKnownVisitsThreshold(cell),
        showTotal: true,
      };
    }

    if (cell.type === "forest") {
      return {
        kind: "material",
        title: getResourceLabel("lumber"),
        current: clampNonNegativeNumber(cell.materialAmount, 999999, 0),
        total: null,
        showTotal: false,
      };
    }

    if (cell.type === "mountain") {
      return {
        kind: "material",
        title: getResourceLabel("stone"),
        current: clampNonNegativeNumber(cell.materialAmount, 999999, 0),
        total: null,
        showTotal: false,
      };
    }

    return null;
  }

  function setEditorNumberInputValue(input, value) {
    if (!input) {
      return;
    }

    input.value = Number.isFinite(value) ? formatDisplayedNumber(value) : "";
  }

  function getEditorIntegerInputValue(input, fallback, min = 0, max = 999999) {
    return clampInteger(input?.value, min, max, fallback);
  }

  function getEditorNumberInputValue(input, fallback, min = 0, max = 999999) {
    const numericValue = Number(input?.value);

    if (!Number.isFinite(numericValue)) {
      return fallback;
    }

    return Math.max(min, Math.min(max, numericValue));
  }

  function getEditorFoodLabel(cell) {
    if (!cell?.foodType) {
      return getEditorLabel("none");
    }

    return getResourceLabel(cell.foodType);
  }

  function getEditorBuildingLabel(cell) {
    const building = cell ? getBuildingAtCell(cell.x, cell.y) : null;
    return building ? getBuildingLabel(building.type) : getEditorLabel("none");
  }

  function getEditorVehicleLabel(cell) {
    const vehicle = cell ? getVehicleAtCell(cell.x, cell.y) : null;
    return vehicle ? getVehicleLabel(vehicle.type) : getEditorLabel("none");
  }

  function getEditorUnitLabel(cell) {
    const currentUnit = cell ? getUnitAtCell(cell.x, cell.y) : null;
    return currentUnit ? getDefaultUnitName(getUnitTypeId(currentUnit)) : getEditorLabel("none");
  }

  function getEditorUnitActionMenuLabel(currentUnit) {
    const action = getActionForTask(currentUnit?.task);
    return action ? getUnitActionLabel(action) : getEditorLabel("none");
  }

  function createEditorTextOptionButton({ label, value, selected = false, disabled = false, icon = "" }) {
    const button = document.createElement("button");
    const swatch = document.createElement("span");
    const text = document.createElement("span");

    button.type = "button";
    button.className = "terrain-option";
    button.dataset.value = value;
    button.classList.toggle("is-selected", selected);
    button.disabled = disabled;
    button.setAttribute("role", "menuitem");
    button.setAttribute("aria-current", selected ? "true" : "false");
    swatch.className = "terrain-swatch";
    swatch.textContent = icon;
    swatch.style.display = "grid";
    swatch.style.placeItems = "center";
    swatch.style.background = "rgba(245, 243, 230, 0.08)";
    text.textContent = label;
    button.append(swatch, text);
    return button;
  }

  function updateTerrainMenuSelection(type) {
    if (!terrainMenuOptions) {
      return;
    }

    for (const button of terrainMenuOptions.querySelectorAll(".terrain-option")) {
      const isSelected = Boolean(type) && button.dataset.terrain === type;
      button.classList.toggle("is-selected", isSelected);
      button.setAttribute("aria-current", isSelected ? "true" : "false");
    }
  }

  function updateVariantMenu(cell) {
    if (!variantMenuOptions) {
      return;
    }

    const variants = getTerrainVariants(cell.type);
    variantMenuOptions.replaceChildren();

    const selectedVariant = ensureCellVariant(cell);

    for (const variant of variants) {
      const button = document.createElement("button");
      const swatch = document.createElement("span");
      const label = document.createElement("span");
      const isSelected = variant.id === selectedVariant;

      button.type = "button";
      button.className = "terrain-option";
      button.classList.toggle("is-selected", isSelected);
      button.dataset.variant = variant.id;
      button.setAttribute("role", "menuitem");
      button.setAttribute("aria-current", isSelected ? "true" : "false");
      swatch.className = "terrain-swatch";
      swatch.style.background = terrain[cell.type].top;
      label.textContent = variant.label;
      button.append(swatch, label);
      variantMenuOptions.append(button);
    }
  }

  function getSelectedTerrainButton() {
    return terrainMenuOptions?.querySelector(".terrain-option.is-selected") || null;
  }

  function updateEditorTerrainMenuAvailability() {
    if (!terrainMenuOptions) {
      return;
    }

    setDisabledState(
      [...terrainMenuOptions.querySelectorAll(".terrain-option")],
      !canEditTerrainSelection(getActiveCell()),
    );
  }

  function rebuildFoodMenuOptions(displayCell) {
    if (!foodMenuOptions) {
      return;
    }

    foodMenuOptions.replaceChildren();

    if (!displayCell) {
      return;
    }

    const editableFoodTypes = getEditableFoodTypesForCell(displayCell);
    const selectedFoodType = displayCell.foodType || "";
    const activeCell = getActiveCell();
    const controlDisabled = !activeCell || !canEditFoodSelection(activeCell);

    foodMenuOptions.append(
      createEditorTextOptionButton({
        label: getEditorLabel("none"),
        value: "",
        selected: !selectedFoodType,
        disabled: controlDisabled,
        icon: "∅",
      }),
    );

    for (const foodType of editableFoodTypes) {
      foodMenuOptions.append(
        createEditorTextOptionButton({
          label: getResourceLabel(foodType),
          value: foodType,
          selected: selectedFoodType === foodType,
          disabled: controlDisabled,
          icon: "✿",
        }),
      );
    }
  }

  function rebuildBuildingMenuOptions(displayCell) {
    if (!buildingMenuOptions) {
      return;
    }

    buildingMenuOptions.replaceChildren();

    if (!displayCell) {
      return;
    }

    const currentBuilding = getBuildingAtCell(displayCell.x, displayCell.y);
    const activeCell = getActiveCell();
    const controlDisabled = !activeCell || !canEditBuildingSelection(activeCell);
    const currentBuildingType = currentBuilding?.type || "";

    buildingMenuOptions.append(
      createEditorTextOptionButton({
        label: getEditorLabel("none"),
        value: "",
        selected: !currentBuildingType,
        disabled: controlDisabled,
        icon: "∅",
      }),
    );

    if (currentBuilding) {
      buildingMenuOptions.append(
        createEditorTextOptionButton({
          label: getBuildingLabel(currentBuilding.type),
          value: currentBuilding.type,
          selected: true,
          disabled: true,
          icon: getFoundationBuildingTypeIcon(currentBuilding.type),
        }),
      );
      return;
    }

    for (const buildingType of getDefinedBuildingTypes()) {
      buildingMenuOptions.append(
        createEditorTextOptionButton({
          label: getBuildingLabel(buildingType),
          value: buildingType,
          selected: false,
          disabled: controlDisabled || !canPlaceEditorBuildingAtCell(displayCell, buildingType),
          icon: getFoundationBuildingTypeIcon(buildingType),
        }),
      );
    }
  }

  function rebuildVehicleMenuOptions(displayCell) {
    if (!vehicleMenuOptions) {
      return;
    }

    vehicleMenuOptions.replaceChildren();

    if (!displayCell) {
      return;
    }

    const currentVehicle = getVehicleAtCell(displayCell.x, displayCell.y);
    const activeCell = getActiveCell();
    const controlDisabled = !activeCell || !canEditVehicleSelection(activeCell);
    const currentVehicleType = currentVehicle?.type || "";

    vehicleMenuOptions.append(
      createEditorTextOptionButton({
        label: getEditorLabel("none"),
        value: "",
        selected: !currentVehicleType,
        disabled: controlDisabled,
        icon: "∅",
      }),
    );

    if (currentVehicle) {
      vehicleMenuOptions.append(
        createEditorTextOptionButton({
          label: getVehicleLabel(currentVehicle.type),
          value: currentVehicle.type,
          selected: true,
          disabled: true,
          icon: getVehicleTypeIcon(currentVehicle.type),
        }),
      );
      return;
    }

    for (const vehicleType of getDefinedVehicleTypes()) {
      vehicleMenuOptions.append(
        createEditorTextOptionButton({
          label: getVehicleLabel(vehicleType),
          value: vehicleType,
          selected: false,
          disabled: controlDisabled || !canPlaceEditorVehicleAtCell(displayCell, vehicleType),
          icon: getVehicleTypeIcon(vehicleType),
        }),
      );
    }
  }

  function rebuildUnitMenuOptions(displayCell) {
    if (!unitMenuOptions) {
      return;
    }

    unitMenuOptions.replaceChildren();

    if (!displayCell) {
      return;
    }

    const currentUnit = getUnitAtCell(displayCell.x, displayCell.y);
    const currentUnitType = currentUnit ? getUnitTypeId(currentUnit) : "";
    const controlDisabled = !getActiveCell();

    unitMenuOptions.append(
      createEditorTextOptionButton({
        label: getEditorLabel("none"),
        value: "",
        selected: !currentUnitType,
        disabled: controlDisabled,
        icon: "∅",
      }),
    );

    for (const unitTypeId of getDefinedUnitTypeIds()) {
      unitMenuOptions.append(
        createEditorTextOptionButton({
          label: getDefaultUnitName(unitTypeId),
          value: unitTypeId,
          selected: currentUnitType === unitTypeId,
          disabled: controlDisabled || !canPlaceEditorUnitTypeAtCell(displayCell, unitTypeId, currentUnit),
          icon: "☺",
        }),
      );
    }
  }

  function rebuildUnitActionMenuOptions(displayCell) {
    if (!unitActionMenuOptions) {
      return;
    }

    unitActionMenuOptions.replaceChildren();

    if (!displayCell) {
      return;
    }

    const currentUnit = getUnitAtCell(displayCell.x, displayCell.y);

    if (!currentUnit) {
      return;
    }

    const currentAction = getActionForTask(currentUnit.task);
    const controlDisabled = !getActiveCell();

    if (currentAction && !editorSupportedUnitActions.includes(currentAction)) {
      unitActionMenuOptions.append(
        createEditorTextOptionButton({
          label: getUnitActionLabel(currentAction),
          value: currentAction,
          selected: true,
          disabled: true,
          icon: "•",
        }),
      );
    }

    unitActionMenuOptions.append(
      createEditorTextOptionButton({
        label: getEditorLabel("none"),
        value: "",
        selected: !currentAction,
        disabled: controlDisabled,
        icon: "∅",
      }),
    );

    for (const action of editorSupportedUnitActions) {
      unitActionMenuOptions.append(
        createEditorTextOptionButton({
          label: getUnitActionLabel(action),
          value: action,
          selected: currentAction === action,
          disabled:
            controlDisabled
            || !canUnitUseAction(currentUnit, action)
            || (action === unitActions.research && !getSelectedResearchGoalTechnologyId()),
          icon: action === unitActions.play ? "♪" : "✶",
        }),
      );
    }
  }

  function positionEditorDropdownMenu(menu) {
    if (!menu || !editInspector) {
      return;
    }

    const group = menu.closest(".edit-dropdown-group");
    const button = group?.querySelector(".edit-dropdown-toggle");

    if (!group || !button) {
      return;
    }

    const inspectorRect = editInspector.getBoundingClientRect();
    const buttonRect = button.getBoundingClientRect();
    const menuHeight = Math.max(menu.offsetHeight, menu.scrollHeight, 0);
    const margin = 10;
    const spaceBelow = inspectorRect.bottom - buttonRect.bottom - margin;
    const spaceAbove = buttonRect.top - inspectorRect.top - margin;
    const openUpward = menuHeight > spaceBelow && spaceAbove > spaceBelow;
    const availableSpace = openUpward ? spaceAbove : spaceBelow;
    const topOffset = `${button.offsetTop + button.offsetHeight + 6}px`;
    const bottomOffset = `${group.offsetHeight - button.offsetTop + 6}px`;

    group.classList.toggle("opens-upward", openUpward);
    menu.style.maxHeight = `${Math.max(120, Math.floor(availableSpace))}px`;
    menu.style.top = openUpward ? "auto" : topOffset;
    menu.style.bottom = openUpward ? bottomOffset : "auto";
  }

  function updateEditorDropdownMenus() {
    const openDropdownId = getOpenDropdownId();

    for (const button of editorDropdownToggleButtons) {
      const dropdownId = button.dataset.editorDropdown;
      const isOpen = dropdownId === openDropdownId && !button.disabled;
      button.setAttribute("aria-expanded", isOpen ? "true" : "false");
    }

    for (const menu of editorDropdownMenuElements) {
      const isOpen = menu.dataset.editorDropdownMenu === openDropdownId;
      menu.hidden = !isOpen;

      const group = menu.closest(".edit-dropdown-group");
      if (!isOpen) {
        group?.classList.remove("opens-upward");
        menu.style.maxHeight = "";
        menu.style.top = "";
        menu.style.bottom = "";
        continue;
      }

      positionEditorDropdownMenu(menu);
    }
  }

  function closeEditorDropdowns() {
    if (!getOpenDropdownId()) {
      return;
    }

    setOpenDropdownId(null);
    updateEditorDropdownMenus();
  }

  function toggleEditorDropdown(dropdownId) {
    setOpenDropdownId(getOpenDropdownId() === dropdownId ? null : dropdownId);
    updateEditorDropdownMenus();
  }

  function getEditorResearchStatusLabel(displayState) {
    if (displayState === "discovered") {
      return getEditorLabel("statusDiscovered");
    }

    if (displayState === "available") {
      return getEditorLabel("statusAvailable");
    }

    if (displayState === "locked") {
      return getEditorLabel("statusLocked");
    }

    return getEditorLabel("none");
  }

  function getEditorResearchGoalReadout() {
    const researchState = getResearchState();
    const selectedGoalTechnologyId = getSelectedResearchGoalTechnologyId(researchState, {
      requireAvailable: false,
    });
    const selectedGoalLabel = selectedGoalTechnologyId
      ? getTechnologyLabel(selectedGoalTechnologyId)
      : getEditorLabel("none");

    return `${getEditorLabel("goal")}: ${selectedGoalLabel}`;
  }

  function renderEditorResearchPanel() {
    if (!editorResearchList || !editorResearchEmpty) {
      return;
    }

    const technologyCatalog = getTechnologyCatalog();
    const researchState = getResearchState();
    const technologies = Array.isArray(technologyCatalog?.technologies)
      ? technologyCatalog.technologies
      : [];

    editorResearchList.replaceChildren();
    editorResearchEmpty.hidden = technologies.length > 0;
    editorResearchEmpty.textContent = getEditorLabel("noTechnologies");

    for (const technology of technologies) {
      const displayState = getTechnologyDisplayState(technology.id, researchState);
      const technologyLabel = getTechnologyLabel(technology);
      const isDiscovered = isTechnologyDiscovered(technology.id, researchState);
      const isSelectedGoal = researchState.selectedGoalTechId === technology.id;
      const canSelectGoal = canSelectResearchGoal(technology.id, researchState);
      const item = document.createElement("article");
      const main = document.createElement("div");
      const header = document.createElement("div");
      const icon = technology.icon ? document.createElement("img") : document.createElement("span");
      const copy = document.createElement("div");
      const name = document.createElement("div");
      const meta = document.createElement("div");
      const status = document.createElement("span");
      const controls = document.createElement("div");
      const goalButton = document.createElement("button");
      const discoveredLabel = document.createElement("label");
      const discoveredInput = document.createElement("input");
      const discoveredText = document.createElement("span");
      const progressField = document.createElement("label");
      const progressInput = document.createElement("input");
      const progressSuffix = document.createElement("span");

      item.className = "editor-research-item";
      item.dataset.technologyId = technology.id;
      item.dataset.techState = displayState;
      item.setAttribute("role", "listitem");

      main.className = "editor-research-main";
      header.className = "editor-research-header";
      copy.className = "editor-research-copy";
      name.className = "editor-research-name";
      meta.className = "editor-research-meta";
      status.className = "editor-research-status";
      controls.className = "editor-research-controls";

      if (technology.icon) {
        icon.className = "editor-research-icon";
        icon.src = technology.icon;
        icon.alt = technologyLabel;
        icon.decoding = "async";
      } else {
        icon.className = "editor-research-icon-placeholder";
        icon.setAttribute("aria-hidden", "true");
      }

      name.textContent = technologyLabel;
      status.textContent = getEditorResearchStatusLabel(displayState);
      meta.append(status);

      goalButton.type = "button";
      goalButton.className = "menu-button editor-research-goal-button";
      goalButton.dataset.action = "editor-research-select-goal";
      goalButton.dataset.technologyId = technology.id;
      goalButton.disabled = !canSelectGoal;
      goalButton.textContent = getEditorLabel("goal");
      goalButton.classList.toggle("is-selected", isSelectedGoal);
      goalButton.setAttribute("aria-pressed", isSelectedGoal ? "true" : "false");

      discoveredLabel.className = "toggle-control edit-toggle-control editor-research-discovered";
      discoveredInput.dataset.action = "editor-research-discovered";
      discoveredInput.dataset.technologyId = technology.id;
      discoveredInput.type = "checkbox";
      discoveredInput.checked = isDiscovered;
      discoveredText.textContent = getEditorLabel("statusDiscovered");
      discoveredLabel.append(discoveredInput, discoveredText);

      progressField.className = "edit-number-field edit-number-field-inline editor-research-progress-field";
      progressInput.className = "edit-number-input";
      progressInput.dataset.action = "editor-research-progress";
      progressInput.dataset.technologyId = technology.id;
      progressInput.type = "number";
      progressInput.min = "0";
      progressInput.step = "any";
      progressInput.disabled = isDiscovered;
      progressInput.value = String(
        isDiscovered
          ? roundDisplayedQuantity(technology.cost)
          : roundDisplayedQuantity(getTechnologyProgress(technology.id, researchState)),
      );
      progressSuffix.className = "edit-field-suffix";
      progressSuffix.textContent = `/${formatDisplayedQuantity(technology.cost)}`;
      progressField.append(progressInput, progressSuffix);

      copy.append(name, meta);
      header.append(icon, copy);
      main.append(header);
      controls.append(goalButton, discoveredLabel, progressField);
      item.append(main, controls);
      editorResearchList.append(item);
    }
  }

  function updateEditorResearchPanel() {
    const researchState = getResearchState();

    setTextContent(openEditorResearchButtons, getEditorLabel("technologies"));
    setTextContent(editorResearchTitleElements, getEditorLabel("technologies"));
    setTextContent(editorResearchGoalElements, getEditorResearchGoalReadout());
    setTextContent(clearEditorResearchGoalButtons, getEditorLabel("clearGoal"));
    setAttributeForElements(closeEditorResearchButtons, "aria-label", strings.actions.close);
    if (editorResearchEmpty) {
      editorResearchEmpty.textContent = getEditorLabel("noTechnologies");
    }
    setDisabledState(
      clearEditorResearchGoalButtons,
      !getSelectedResearchGoalTechnologyId(researchState, { requireAvailable: false }),
    );

    if (!editorResearchOverlay || editorResearchOverlay.hidden) {
      return;
    }

    renderEditorResearchPanel();
  }

  function openEditorResearchPanel(triggerButton = null) {
    if (!editorResearchOverlay || !isEditMode() || getMainMenuOpen()) {
      return Promise.resolve(false);
    }

    setEditorResearchReturnFocusButton(triggerButton instanceof HTMLElement ? triggerButton : null);
    closeEditorDropdowns();
    return ensureTechnologyCatalogLoaded()
      .then(() => {
        if (!editorResearchOverlay || !isEditMode() || getMainMenuOpen()) {
          return false;
        }

        const researchState = normalizeResearchState(getResearchState());
        setResearchState(researchState);
        setSelectedResearchGoalTechnologyId(researchState.selectedGoalTechId, { refresh: false });
        editorResearchOverlay.hidden = false;
        updateEditorResearchPanel();
        requestAnimationFrame(() => {
          editorResearchPanel?.querySelector(
            '.editor-research-goal-button.is-selected, .editor-research-goal-button:not(:disabled), .slot-panel-close',
          )?.focus({ preventScroll: true });
        });
        return true;
      });
  }

  function closeEditorResearchPanel({ restoreFocus = false } = {}) {
    if (editorResearchOverlay) {
      editorResearchOverlay.hidden = true;
    }

    const returnFocusButton = getEditorResearchReturnFocusButton();

    if (restoreFocus && returnFocusButton) {
      returnFocusButton.focus({ preventScroll: true });
    }

    setEditorResearchReturnFocusButton(null);
  }

  function applyEditorResearchStateChange(mutator) {
    if (typeof mutator !== "function") {
      return false;
    }

    let researchState = getResearchState();
    const previousSnapshot = JSON.stringify(serializeResearchState(researchState));
    mutator(researchState);
    researchState = normalizeResearchState(researchState);
    setResearchState(researchState);
    setSelectedResearchGoalTechnologyId(researchState.selectedGoalTechId, { refresh: false });
    const nextSnapshot = JSON.stringify(serializeResearchState(researchState));

    if (nextSnapshot === previousSnapshot) {
      updateEditorResearchPanel();
      return false;
    }

    setEditStateDirty(true);
    updateResearchPresentation();
    return true;
  }

  function updateEditInspector() {
    const displayCell = getEditInspectorDisplayCell();
    const resourceMode = getEditorResourceMode(displayCell);
    const activeCell = getActiveCell();
    const displayBuilding = displayCell ? getBuildingAtCell(displayCell.x, displayCell.y) : null;
    const displayVehicle = displayCell ? getVehicleAtCell(displayCell.x, displayCell.y) : null;
    const displayUnit = displayCell ? getUnitAtCell(displayCell.x, displayCell.y) : null;
    const canEditFoodAmounts = Boolean(activeCell?.foodType);
    const canEditBuildingState = Boolean(activeCell && getBuildingAtCell(activeCell.x, activeCell.y));
    const canEditVehicleState = Boolean(activeCell && getVehicleAtCell(activeCell.x, activeCell.y));

    if (!displayCell) {
      if (tileMenuTitle) {
        tileMenuTitle.textContent = "";
      }
      resetTileReadout();
      updateTerrainMenuSelection(null);
      variantMenuOptions?.replaceChildren();
      rebuildFoodMenuOptions(null);
      rebuildBuildingMenuOptions(null);
      rebuildVehicleMenuOptions(null);
      rebuildUnitMenuOptions(null);
      rebuildUnitActionMenuOptions(null);
      setTextContent(editorTerrainLabelElements, formatEditorDropdownLabel("terrain", getEditorLabel("none")));
      setTextContent(editorVisualLabelElements, formatEditorDropdownLabel("visual", getEditorLabel("none")));
      setTextContent(editorFoodLabelElements, formatEditorDropdownLabel("food", getEditorLabel("none")));
      setTextContent(editorBuildingLabelElements, formatEditorDropdownLabel("building", getEditorLabel("none")));
      setTextContent(editorVehicleLabelElements, formatEditorDropdownLabel("vehicle", getEditorLabel("none")));
      setTextContent(editorUnitLabelElements, formatEditorDropdownLabel("unit", getEditorLabel("none")));
      setTextContent(editorUnitActionLabelElements, formatEditorDropdownLabel("action", getEditorLabel("none")));
      setTextContent(editorResourceTitleElements, "");
      setTextContent(editorCurrentLabelElements, strings.editor.current);
      setTextContent(editorTotalLabelElements, strings.editor.total);
      setTextContent(editorCompletionLabelElements, strings.editor.completion);
      setTextContent(editorAbandonedLabelElements, strings.editor.abandoned);
      setHiddenState(editorResourcePanels, false);
      setHiddenState(editorFoodPanels, false);
      setHiddenState(editorBuildingPanels, false);
      setHiddenState(editorVehiclePanels, false);
      setHiddenState(editorResourceTotalFields, true);
      setHiddenState(editorResourceSeparators, true);
      setEditorNumberInputValue(editorResourceCurrentInput, Number.NaN);
      setEditorNumberInputValue(editorResourceTotalInput, Number.NaN);
      setEditorNumberInputValue(editorFoodCurrentInput, Number.NaN);
      setEditorNumberInputValue(editorFoodTotalInput, Number.NaN);
      setEditorNumberInputValue(editorBuildingCompletionInput, Number.NaN);
      setEditorNumberInputValue(editorVehicleCompletionInput, Number.NaN);
      if (editorBuildingAbandonedInput) {
        editorBuildingAbandonedInput.checked = false;
      }
      if (editorVehicleAbandonedInput) {
        editorVehicleAbandonedInput.checked = false;
      }
      setDisabledState(editorDropdownToggleButtons, true);
      setDisabledState(
        [
          editorResourceCurrentInput,
          editorResourceTotalInput,
          editorFoodCurrentInput,
          editorFoodTotalInput,
          editorBuildingCompletionInput,
          editorBuildingAbandonedInput,
          editorVehicleCompletionInput,
          editorVehicleAbandonedInput,
        ].filter(Boolean),
        true,
      );
      closeEditorDropdowns();
      return;
    }

    if (tileMenuTitle) {
      tileMenuTitle.textContent = strings.readouts.tileMenuTitle(displayCell.x, displayCell.y);
    }
    setTileReadout(displayCell);
    updateTerrainMenuSelection(displayCell.type);
    updateVariantMenu(displayCell);
    rebuildFoodMenuOptions(displayCell);
    rebuildBuildingMenuOptions(displayCell);
    rebuildVehicleMenuOptions(displayCell);
    rebuildUnitMenuOptions(displayCell);
    rebuildUnitActionMenuOptions(displayCell);
    setTextContent(editorTerrainLabelElements, formatEditorDropdownLabel("terrain", terrain[displayCell.type].label));
    setTextContent(
      editorVisualLabelElements,
      formatEditorDropdownLabel("visual", getTerrainVariant(displayCell.type, ensureCellVariant(displayCell))?.label || getEditorLabel("none")),
    );
    setTextContent(editorFoodLabelElements, formatEditorDropdownLabel("food", getEditorFoodLabel(displayCell)));
    setTextContent(editorBuildingLabelElements, formatEditorDropdownLabel("building", getEditorBuildingLabel(displayCell)));
    setTextContent(editorVehicleLabelElements, formatEditorDropdownLabel("vehicle", getEditorVehicleLabel(displayCell)));
    setTextContent(editorUnitLabelElements, formatEditorDropdownLabel("unit", getEditorUnitLabel(displayCell)));
    setTextContent(editorUnitActionLabelElements, formatEditorDropdownLabel("action", getEditorUnitActionMenuLabel(displayUnit)));
    setTextContent(editorCurrentLabelElements, strings.editor.current);
    setTextContent(editorTotalLabelElements, strings.editor.total);
    setTextContent(editorCompletionLabelElements, strings.editor.completion);
    setTextContent(editorAbandonedLabelElements, strings.editor.abandoned);
    setHiddenState(editorResourcePanels, false);
    setHiddenState(editorFoodPanels, false);
    setHiddenState(editorBuildingPanels, false);
    setHiddenState(editorVehiclePanels, false);
    setHiddenState(editorResourceTotalFields, !resourceMode?.showTotal);
    setHiddenState(editorResourceSeparators, !resourceMode?.showTotal);
    setTextContent(editorResourceTitleElements, resourceMode?.title || "");
    setEditorNumberInputValue(editorResourceCurrentInput, resourceMode?.current);
    setEditorNumberInputValue(editorResourceTotalInput, resourceMode?.showTotal ? resourceMode?.total : Number.NaN);
    setEditorNumberInputValue(editorFoodCurrentInput, displayCell.foodType ? displayCell.foodAmount : Number.NaN);
    setEditorNumberInputValue(editorFoodTotalInput, displayCell.foodType ? getCellFoodMaxAmount(displayCell) : Number.NaN);
    setEditorNumberInputValue(editorBuildingCompletionInput, displayBuilding ? Math.round(getBuildingCompleteness(displayBuilding) * 100) : 0);
    setEditorNumberInputValue(editorVehicleCompletionInput, displayVehicle ? Math.round(getBuildingCompleteness(displayVehicle) * 100) : 0);
    if (editorBuildingAbandonedInput) {
      editorBuildingAbandonedInput.checked = displayBuilding?.state === "abandoned";
    }
    if (editorVehicleAbandonedInput) {
      editorVehicleAbandonedInput.checked = displayVehicle?.state === "abandoned";
    }

    for (const button of editorDropdownToggleButtons) {
      const dropdownId = button.dataset.editorDropdown;
      let disabled = !activeCell;

      if (dropdownId === "terrain") {
        disabled = !canEditTerrainSelection(activeCell);
      } else if (dropdownId === "visual") {
        disabled = !activeCell;
      } else if (dropdownId === "food") {
        disabled = !canEditFoodSelection(activeCell);
      } else if (dropdownId === "building") {
        disabled = !canEditBuildingSelection(activeCell);
      } else if (dropdownId === "vehicle") {
        disabled = !canEditVehicleSelection(activeCell);
      } else if (dropdownId === "unit") {
        disabled = !activeCell;
      } else if (dropdownId === "unitAction") {
        disabled = !(activeCell && getUnitAtCell(activeCell.x, activeCell.y));
      }

      button.disabled = disabled;
      if (disabled && getOpenDropdownId() === dropdownId) {
        setOpenDropdownId(null);
      }
    }

    updateEditorTerrainMenuAvailability();
    if (variantMenuOptions) {
      setDisabledState([...variantMenuOptions.querySelectorAll(".terrain-option")], !activeCell);
    }
    if (editorResourceCurrentInput) {
      editorResourceCurrentInput.disabled = !activeCell || !resourceMode;
    }
    if (editorResourceTotalInput) {
      editorResourceTotalInput.disabled = true;
    }
    if (editorFoodCurrentInput) {
      editorFoodCurrentInput.disabled = !canEditFoodAmounts;
    }
    if (editorFoodTotalInput) {
      editorFoodTotalInput.disabled = !canEditFoodAmounts;
    }
    if (editorBuildingCompletionInput) {
      editorBuildingCompletionInput.disabled = !canEditBuildingState;
    }
    if (editorBuildingAbandonedInput) {
      editorBuildingAbandonedInput.disabled = !canEditBuildingState;
    }
    if (editorVehicleCompletionInput) {
      editorVehicleCompletionInput.disabled = !canEditVehicleState;
    }
    if (editorVehicleAbandonedInput) {
      editorVehicleAbandonedInput.disabled = !canEditVehicleState;
    }
    updateEditorDropdownMenus();
  }

  function openTileMenu(cell) {
    setActiveCell(cell);
    updateEditInspector();
    getSelectedTerrainButton()?.focus({ preventScroll: true });
    draw();
  }

  function hideTileMenu() {
    if (!getActiveCell()) {
      return;
    }

    setActiveCell(null);
    closeEditorDropdowns();
    updateEditInspector();
    draw();
  }

  function clearEditHoverState() {
    if (!getHoverCell() && !getActiveCell()) {
      updateEditInspector();
      return;
    }

    setHoverCell(null);
    setActiveCell(null);
    updateEditInspector();
  }

  function handleEditCanvasMove(event) {
    const nextHover = pickTile(event.clientX, event.clientY);
    const hoverCell = getHoverCell();
    const changed =
      (!hoverCell && nextHover) ||
      (hoverCell && !nextHover) ||
      (hoverCell &&
        nextHover &&
        (hoverCell.x !== nextHover.x || hoverCell.y !== nextHover.y));

    if (!changed) {
      return;
    }

    setHoverCell(nextHover);
    updateEditInspector();
    draw();
  }

  function handleEditCanvasClick(_event, clickedCell) {
    if (!clickedCell) {
      hideTileMenu();
      return;
    }

    setHoverCell(clickedCell);
    openTileMenu(clickedCell);
  }

  function handleEditCanvasLeave() {
    setHoverCell(null);
    updateEditInspector();
    draw();
  }

  function populateTerrainMenu() {
    if (!terrainMenuOptions) {
      return;
    }

    terrainMenuOptions.replaceChildren();

    for (const [type, spec] of Object.entries(terrain)) {
      const button = document.createElement("button");
      const swatch = document.createElement("span");
      const label = document.createElement("span");

      button.type = "button";
      button.className = "terrain-option";
      button.dataset.terrain = type;
      button.setAttribute("role", "menuitem");
      swatch.className = "terrain-swatch";
      swatch.style.background = spec.top;
      label.textContent = spec.label;
      button.append(swatch, label);
      terrainMenuOptions.append(button);
    }
  }

  function applyEditorVariantSelection(variantId) {
    const activeCell = getActiveCell();

    if (!activeCell) {
      return;
    }

    const previousSnapshot = JSON.stringify(serializeCell(activeCell));
    activeCell.variant = variantId;
    syncCellResourcesWithVariant(activeCell, { seedOnWater01: true });
    invalidateStaticLayer();
    if (JSON.stringify(serializeCell(activeCell)) !== previousSnapshot) {
      setEditStateDirty(true);
    }
    updateEditInspector();
    closeEditorDropdowns();
    draw();
  }

  function bindEvents() {
    if (eventsBound) {
      return;
    }

    eventsBound = true;

    terrainMenuOptions?.addEventListener("click", (event) => {
      const button = event.target instanceof Element
        ? event.target.closest(".terrain-option")
        : null;

      if (!button) {
        return;
      }

      applyTerrainSelection(button.dataset.terrain);
    });

    variantMenuOptions?.addEventListener("click", (event) => {
      const button = event.target instanceof Element
        ? event.target.closest(".terrain-option")
        : null;

      if (!button) {
        return;
      }

      applyEditorVariantSelection(button.dataset.variant);
    });

    foodMenuOptions?.addEventListener("click", (event) => {
      const button = event.target instanceof Element
        ? event.target.closest(".terrain-option")
        : null;

      if (!button) {
        return;
      }

      applyEditorFoodSelection(button.dataset.value || "");
    });

    buildingMenuOptions?.addEventListener("click", (event) => {
      const button = event.target instanceof Element
        ? event.target.closest(".terrain-option")
        : null;

      if (!button) {
        return;
      }

      applyEditorBuildingSelection(button.dataset.value || "");
    });

    vehicleMenuOptions?.addEventListener("click", (event) => {
      const button = event.target instanceof Element
        ? event.target.closest(".terrain-option")
        : null;

      if (!button) {
        return;
      }

      applyEditorVehicleSelection(button.dataset.value || "");
    });

    unitMenuOptions?.addEventListener("click", (event) => {
      const button = event.target instanceof Element
        ? event.target.closest(".terrain-option")
        : null;

      if (!button) {
        return;
      }

      applyEditorUnitSelection(button.dataset.value || "");
    });

    unitActionMenuOptions?.addEventListener("click", (event) => {
      const button = event.target instanceof Element
        ? event.target.closest(".terrain-option")
        : null;

      if (!button) {
        return;
      }

      applyEditorUnitActionSelection(button.dataset.value || "");
    });

    editorResourceCurrentInput?.addEventListener("change", () => {
      applyEditorResourceCurrentValue();
    });

    editorResourceTotalInput?.addEventListener("change", () => {
      applyEditorResourceTotalValue();
    });

    editorFoodCurrentInput?.addEventListener("change", () => {
      applyEditorFoodCurrentValue();
    });

    editorFoodTotalInput?.addEventListener("change", () => {
      applyEditorFoodTotalValue();
    });

    editorBuildingCompletionInput?.addEventListener("change", () => {
      applyEditorBuildingCompletionValue();
    });

    editorBuildingAbandonedInput?.addEventListener("change", () => {
      applyEditorBuildingAbandonedValue();
    });

    editorVehicleCompletionInput?.addEventListener("change", () => {
      applyEditorVehicleCompletionValue();
    });

    editorVehicleAbandonedInput?.addEventListener("change", () => {
      applyEditorVehicleAbandonedValue();
    });

    for (const button of editorDropdownToggleButtons) {
      button.addEventListener("click", () => {
        if (button.disabled) {
          return;
        }

        toggleEditorDropdown(button.dataset.editorDropdown);
      });
    }

    for (const button of openEditorResearchButtons) {
      button.addEventListener("click", () => {
        void openEditorResearchPanel(button);
      });
    }

    for (const button of closeEditorResearchButtons) {
      button.addEventListener("click", () => {
        closeEditorResearchPanel({ restoreFocus: true });
      });
    }

    for (const button of clearEditorResearchGoalButtons) {
      button.addEventListener("click", () => {
        applyEditorResearchStateChange((researchState) => {
          researchState.selectedGoalTechId = null;
        });
      });
    }

    editorResearchOverlay?.addEventListener("click", (event) => {
      if (event.target === editorResearchOverlay) {
        closeEditorResearchPanel({ restoreFocus: true });
      }
    });

    editorResearchList?.addEventListener("click", (event) => {
      const goalButton = event.target instanceof Element
        ? event.target.closest('[data-action="editor-research-select-goal"]')
        : null;

      if (!goalButton || goalButton.disabled) {
        return;
      }

      const technologyId = goalButton.dataset.technologyId || "";

      applyEditorResearchStateChange((researchState) => {
        researchState.selectedGoalTechId = technologyId;
      });
    });

    editorResearchList?.addEventListener("change", (event) => {
      const target = event.target instanceof Element ? event.target : null;
      const discoveredInput = target?.closest('[data-action="editor-research-discovered"]');

      if (discoveredInput instanceof HTMLInputElement) {
        const technologyId = discoveredInput.dataset.technologyId || "";

        applyEditorResearchStateChange((researchState) => {
          const discoveredIds = new Set(
            Array.isArray(researchState.discoveredTechIds) ? researchState.discoveredTechIds : [],
          );
          const nextProgressByTechId =
            researchState.progressByTechId && typeof researchState.progressByTechId === "object"
              ? { ...researchState.progressByTechId }
              : {};

          if (discoveredInput.checked) {
            discoveredIds.add(technologyId);
            delete nextProgressByTechId[technologyId];
          } else {
            discoveredIds.delete(technologyId);
          }

          researchState.discoveredTechIds = [...discoveredIds];
          researchState.progressByTechId = nextProgressByTechId;
        });
        return;
      }

      const progressInput = target?.closest('[data-action="editor-research-progress"]');

      if (!(progressInput instanceof HTMLInputElement)) {
        return;
      }

      const technologyId = progressInput.dataset.technologyId || "";
      const technology = getTechnologyDefinition(technologyId);

      if (!technology) {
        updateEditorResearchPanel();
        return;
      }

      const nextProgress = clampNumber(
        progressInput.value,
        0,
        999999999,
        getTechnologyProgress(technologyId, getResearchState()),
      );
      const technologyCost = clampNonNegativeNumber(technology.cost, 999999999, 0);

      applyEditorResearchStateChange((researchState) => {
        const discoveredIds = new Set(
          Array.isArray(researchState.discoveredTechIds) ? researchState.discoveredTechIds : [],
        );
        const nextProgressByTechId =
          researchState.progressByTechId && typeof researchState.progressByTechId === "object"
            ? { ...researchState.progressByTechId }
            : {};

        discoveredIds.delete(technologyId);

        if (technologyCost > 0 && nextProgress >= technologyCost) {
          discoveredIds.add(technologyId);
          delete nextProgressByTechId[technologyId];
        } else if (nextProgress > 0) {
          nextProgressByTechId[technologyId] = nextProgress;
        } else {
          delete nextProgressByTechId[technologyId];
        }

        researchState.discoveredTechIds = [...discoveredIds];
        researchState.progressByTechId = nextProgressByTechId;
      });
    });
  }

  return {
    populateTerrainMenu,
    bindEvents,
    closeEditorDropdowns,
    updateEditorDropdownMenus,
    updateEditorResearchPanel,
    openEditorResearchPanel,
    closeEditorResearchPanel,
    applyEditorResearchStateChange,
    updateEditInspector,
    openTileMenu,
    hideTileMenu,
    clearEditHoverState,
    handleEditCanvasMove,
    handleEditCanvasClick,
    handleEditCanvasLeave,
    canEditFoodSelection,
    canEditBuildingSelection,
    canEditVehicleSelection,
    getEditorResourceMode,
    getEditorIntegerInputValue,
    getEditorNumberInputValue,
  };
}
