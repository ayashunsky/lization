const svgNamespace = "http://www.w3.org/2000/svg";
const resourceColors = {
  stone: "#4c5c68",
  lumber: "#52783e",
  food: "#ad4b37",
};
const populationColor = "#784177";
const happinessColor = "#c18419";
const resourceTypes = Object.keys(resourceColors);
const seriesTypes = [...resourceTypes, "population", "happiness"];
const periodOptions = [100, 365, 1000, "all"];
const plot = { top: 10, height: 182 };

function createSvgElement(tagName, attributes = {}) {
  const element = document.createElementNS(svgNamespace, tagName);
  for (const [name, value] of Object.entries(attributes)) {
    element.setAttribute(name, String(value));
  }
  return element;
}

function niceMaximum(value) {
  if (!(value > 0)) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const normalized = value / magnitude;
  const step = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return step * magnitude;
}

export function reconstructPopulationSeries(events, currentPopulation, startTurn, currentTurn) {
  const relevantEvents = events
    .filter((entry) => entry.turn <= currentTurn)
    .sort((a, b) => a.turn - b.turn);
  const baseline = currentPopulation - relevantEvents.reduce((total, event) => total + event.change, 0);
  let population = baseline;
  const points = [{ turn: startTurn, value: baseline }];

  for (const event of relevantEvents) {
    population += event.change;
    if (event.turn <= startTurn) {
      points[0].value = population;
      continue;
    }
    if (points[points.length - 1].turn === event.turn) {
      points[points.length - 1].value = population;
    } else {
      points.push({ turn: event.turn, value: population });
    }
  }

  if (points[points.length - 1].turn < currentTurn) {
    points.push({ turn: currentTurn, value: currentPopulation });
  }
  return points;
}

export function createBookStockpileChartApi({
  getHistory,
  getCurrentTurn,
  getResourceLabel,
  getLanguage,
  formatTurnDate,
  getPopulationEvents,
  getPopulation,
}) {
  const state = { period: 365, visible: new Set(seriesTypes) };

  function renderChart(widget) {
    const chart = widget.querySelector(".book-stockpile-chart-plot");
    if (!chart) return;

    const turn = Math.max(1, getCurrentTurn());
    const startTurn = state.period === "all" ? 1 : Math.max(1, turn - state.period + 1);
    const endTurn = Math.max(startTurn + 1, turn);
    const samples = getHistory().filter((entry) => entry.turn >= startTurn && entry.turn <= turn);
    const activeTypes = resourceTypes.filter((type) => state.visible.has(type));
    const showPopulation = state.visible.has("population");
    const showHappiness = state.visible.has("happiness");
    const happinessSamples = showHappiness ? samples.filter((entry) => Number.isFinite(entry.happiness)) : [];
    const populationPoints = showPopulation
      ? reconstructPopulationSeries(getPopulationEvents(), getPopulation(), startTurn, turn)
      : [];
    let highestValue = 0;
    for (const entry of samples) {
      for (const type of activeTypes) {
        highestValue = Math.max(highestValue, entry[type]);
      }
    }
    const yMaximum = niceMaximum(highestValue);
    const highestPopulation = populationPoints.reduce((highest, point) => Math.max(highest, point.value), 0);
    const populationMaximum = Math.max(4, Math.ceil(highestPopulation / 4) * 4);
    const highestHappiness = happinessSamples.reduce((highest, point) => Math.max(highest, point.happiness), 0);
    const happinessMaximum = niceMaximum(highestHappiness);
    const language = getLanguage();
    const formatNumber = new Intl.NumberFormat(language, { maximumFractionDigits: 2 });
    const left = activeTypes.length > 0 ? Math.max(36, formatNumber.format(yMaximum).length * 6 + 9) : 12;
    const populationAxisWidth = showPopulation ? Math.max(30, formatNumber.format(populationMaximum).length * 6 + 12) : 0;
    const happinessAxisWidth = showHappiness ? Math.max(30, formatNumber.format(happinessMaximum).length * 6 + 12) : 0;
    const right = populationAxisWidth + happinessAxisWidth || 10;
    const width = 320 - left - right;
    const x = (sampleTurn) => left + (sampleTurn - startTurn) / (endTurn - startTurn) * width;
    const y = (value) => plot.top + plot.height - value / yMaximum * plot.height;
    const populationY = (value) => plot.top + plot.height - value / populationMaximum * plot.height;
    const happinessY = (value) => plot.top + plot.height - value / happinessMaximum * plot.height;
    const svg = createSvgElement("svg", {
      viewBox: "0 0 320 220",
      role: "img",
      "aria-label": widget.dataset.chartLabel || "",
      preserveAspectRatio: "xMidYMid meet",
    });

    for (let index = 0; index <= 4; index += 1) {
      const position = plot.top + plot.height * (1 - index / 4);
      svg.append(createSvgElement("line", {
        x1: left, y1: position, x2: left + width, y2: position,
        class: index === 0 ? "book-stockpile-axis" : "book-stockpile-grid",
      }));
      if (activeTypes.length > 0) {
        const label = createSvgElement("text", {
          x: left - 5, y: position + 3, "text-anchor": "end", class: "book-stockpile-tick",
        });
        label.textContent = formatNumber.format(yMaximum * index / 4);
        svg.append(label);
      }
      if (showPopulation) {
        const label = createSvgElement("text", {
          x: left + width + 5, y: position + 3, class: "book-stockpile-tick book-stockpile-population-tick",
        });
        label.textContent = formatNumber.format(populationMaximum * index / 4);
        svg.append(label);
      }
      if (showHappiness) {
        const label = createSvgElement("text", {
          x: left + width + populationAxisWidth + 5, y: position + 3,
          class: "book-stockpile-tick book-stockpile-happiness-tick",
        });
        label.textContent = formatNumber.format(happinessMaximum * index / 4);
        svg.append(label);
      }
    }

    if (activeTypes.length > 0) {
      svg.append(createSvgElement("line", {
        x1: left, y1: plot.top, x2: left, y2: plot.top + plot.height,
        class: "book-stockpile-axis",
      }));
    }
    if (showPopulation) {
      svg.append(createSvgElement("line", {
        x1: left + width, y1: plot.top, x2: left + width, y2: plot.top + plot.height,
        class: "book-stockpile-population-axis",
      }));
    }
    if (showHappiness) {
      svg.append(createSvgElement("line", {
        x1: left + width + populationAxisWidth, y1: plot.top,
        x2: left + width + populationAxisWidth, y2: plot.top + plot.height,
        class: "book-stockpile-happiness-axis",
      }));
    }

    const labeledTurns = new Set();
    for (const fraction of [0, 0.5, 1]) {
      const value = Math.round(startTurn + fraction * (endTurn - startTurn));
      if (value > turn || labeledTurns.has(value)) continue;
      labeledTurns.add(value);
      const label = createSvgElement("text", {
        x: x(value), y: plot.top + plot.height + 17,
        "text-anchor": fraction === 0 ? "start" : fraction === 1 ? "end" : "middle",
        class: "book-stockpile-tick",
      });
      label.textContent = formatTurnDate(value);
      svg.append(label);
    }

    for (const type of activeTypes) {
      if (samples.length === 0) break;
      const path = createSvgElement("path", {
        d: samples.map((entry, index) => `${index === 0 ? "M" : "L"}${x(entry.turn).toFixed(2)} ${y(entry[type]).toFixed(2)}`).join(" "),
        stroke: resourceColors[type],
        class: "book-stockpile-series",
      });
      svg.append(path);

      if (samples.length <= 40) {
        for (const entry of samples) {
          const marker = createSvgElement("circle", {
            cx: x(entry.turn), cy: y(entry[type]), r: 2.4,
            fill: resourceColors[type], class: "book-stockpile-point",
          });
          const title = createSvgElement("title");
          title.textContent = `${getResourceLabel(type)}: ${formatNumber.format(entry[type])} (${formatTurnDate(entry.turn)})`;
          marker.append(title);
          svg.append(marker);
        }
      }
    }

    if (showPopulation && populationPoints.length > 0) {
      const pathParts = [`M${x(populationPoints[0].turn).toFixed(2)} ${populationY(populationPoints[0].value).toFixed(2)}`];
      for (let index = 1; index < populationPoints.length; index += 1) {
        const point = populationPoints[index];
        pathParts.push(`H${x(point.turn).toFixed(2)}`, `V${populationY(point.value).toFixed(2)}`);
      }
      const path = createSvgElement("path", {
        d: pathParts.join(" "), stroke: populationColor, class: "book-stockpile-series",
      });
      svg.append(path);
      if (populationPoints.length <= 40) {
        for (const point of populationPoints) {
          const marker = createSvgElement("circle", {
            cx: x(point.turn), cy: populationY(point.value), r: 2.4,
            fill: populationColor, class: "book-stockpile-point",
          });
          const title = createSvgElement("title");
          title.textContent = `${widget.dataset.populationLabel || ""}: ${formatNumber.format(point.value)} (${formatTurnDate(point.turn)})`;
          marker.append(title);
          svg.append(marker);
        }
      }
    }

    if (happinessSamples.length > 0) {
      svg.append(createSvgElement("path", {
        d: happinessSamples.map((entry, index) =>
          `${index === 0 ? "M" : "L"}${x(entry.turn).toFixed(2)} ${happinessY(entry.happiness).toFixed(2)}`).join(" "),
        stroke: happinessColor,
        class: "book-stockpile-series",
      }));
      if (happinessSamples.length <= 40) {
        for (const entry of happinessSamples) {
          const marker = createSvgElement("circle", {
            cx: x(entry.turn), cy: happinessY(entry.happiness), r: 2.4,
            fill: happinessColor, class: "book-stockpile-point",
          });
          const title = createSvgElement("title");
          title.textContent = `${widget.dataset.happinessLabel || ""}: ${formatNumber.format(entry.happiness)}% (${formatTurnDate(entry.turn)})`;
          marker.append(title);
          svg.append(marker);
        }
      }
    }

    if ((samples.length === 0 && !showPopulation) || (activeTypes.length === 0 && !showPopulation && happinessSamples.length === 0)) {
      const emptyMessage = createSvgElement("text", {
        x: left + width / 2, y: plot.top + plot.height / 2,
        "text-anchor": "middle", class: "book-stockpile-empty",
      });
      emptyMessage.textContent = state.visible.size === 0 ? widget.dataset.noSeriesLabel || "" : widget.dataset.noDataLabel || "";
      svg.append(emptyMessage);
    }

    chart.replaceChildren(svg);
  }

  function refreshCharts() {
    for (const widget of document.querySelectorAll('[data-book-widget="stockpile-chart"]')) {
      const select = widget.querySelector(".book-stockpile-period");
      if (!select) continue;
      select.value = String(state.period);
      for (const input of widget.querySelectorAll('.book-stockpile-series-toggle input')) {
        input.checked = state.visible.has(input.value);
      }
      renderChart(widget);
    }
  }

  function enhanceWidget(widget) {
    widget.classList.add("book-stockpile-chart");
    const periodControl = document.createElement("label");
    periodControl.className = "book-stockpile-period-control";
    periodControl.textContent = widget.dataset.periodLabel || "";
    const select = document.createElement("select");
    select.className = "book-stockpile-period";
    for (const period of periodOptions) {
      const option = document.createElement("option");
      option.value = String(period);
      option.textContent = period === "all"
        ? widget.dataset.allLabel || ""
        : `${period} ${widget.dataset.daysLabel || ""}`;
      select.append(option);
    }
    select.value = String(state.period);
    select.addEventListener("change", () => {
      state.period = select.value === "all" ? "all" : Number(select.value);
      refreshCharts();
    });
    periodControl.append(select);

    const toggles = document.createElement("div");
    toggles.className = "book-stockpile-series-toggles";
    for (const type of seriesTypes) {
      const label = document.createElement("label");
      label.className = "book-stockpile-series-toggle";
      label.style.setProperty("--series-color", resourceColors[type] || (type === "happiness" ? happinessColor : populationColor));
      const input = document.createElement("input");
      input.type = "checkbox";
      input.value = type;
      input.checked = state.visible.has(type);
      input.addEventListener("change", () => {
        if (input.checked) state.visible.add(type);
        else state.visible.delete(type);
        refreshCharts();
      });
      const name = document.createElement("span");
      name.textContent = type === "population"
        ? widget.dataset.populationLabel || ""
        : type === "happiness" ? widget.dataset.happinessLabel || "" : getResourceLabel(type);
      label.append(input, name);
      toggles.append(label);
    }

    const chart = document.createElement("div");
    chart.className = "book-stockpile-chart-plot";
    widget.replaceChildren(periodControl, chart, toggles);
    renderChart(widget);
  }

  return { enhanceWidget, refreshCharts };
}
