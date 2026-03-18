import { createSeriesColorScale, getChartTheme } from "./shared.js";
import { loadPlotModule, renderFrameworkError } from "./frameworkShared.js";

function getDimensions(container) {
  const bounds = container.getBoundingClientRect();
  return {
    width: Math.max(bounds.width, 320),
    height: Math.max(bounds.height, 360),
    margin: { top: 20, right: 20, bottom: 20, left: 20 },
  };
}

function getUpdatePayload(payload) {
  if (typeof payload === "number") {
    return {
      index: payload,
      step: null,
    };
  }

  return {
    index: Number(payload?.index) || 0,
    step: payload?.step ?? null,
  };
}

function resolveFocusKeys(step, groupedKeys) {
  const focusValue = step?.focus;
  if (typeof focusValue !== "string" || !focusValue.trim()) {
    return groupedKeys;
  }

  const tokens = focusValue
    .split(",")
    .map((token) => token.trim())
    .filter(Boolean);

  if (!tokens.length || tokens.some((token) => /^(all|\*)$/i.test(token))) {
    return groupedKeys;
  }

  const matches = tokens
    .map((token) => {
      const lowered = token.toLowerCase();
      return groupedKeys.find((key) => String(key).toLowerCase() === lowered);
    })
    .filter(Boolean);

  return matches.length ? matches : groupedKeys;
}

function computeColumns(width, total) {
  const preferredColumns = Math.min(12, total);
  const minCellSize = width < 480 ? 34 : width < 900 ? 38 : 42;
  const fitColumns = Math.max(1, Math.floor(width / minCellSize));
  return Math.max(1, Math.min(preferredColumns, fitColumns));
}

export function renderUnitChart({ container, section, data }) {
  const colorField = section.vis.fields.color;
  container.innerHTML = "";

  if (!data.length) {
    container.innerHTML = `<div class="figure-card">Unit chart needs row-level data.</div>`;
    return { update() {}, resize() {} };
  }

  const limited = data.slice(0, 160).map((row, index) => ({
    ...row,
    __id: row.id ?? index + 1,
    __group: row[colorField] ?? "default",
  }));
  const groupKeys = [...new Set(limited.map((row) => row.__group))];
  const colors = createSeriesColorScale(groupKeys);
  let currentIndex = 0;
  let currentStep = null;
  let renderToken = 0;

  async function draw(activeIndex = 0, activeStep = null) {
    const { width, height, margin } = getDimensions(container);
    const innerWidth = Math.max(1, width - margin.left - margin.right);
    const innerHeight = Math.max(1, height - margin.top - margin.bottom);
    const columns = computeColumns(innerWidth, limited.length);
    const rows = Math.max(1, Math.ceil(limited.length / Math.max(columns, 1)));
    const cellSize = Math.max(1, Math.floor(Math.min(innerWidth / columns, innerHeight / rows)));
    const plotWidth = margin.left + margin.right + cellSize * columns;
    const plotHeight = margin.top + margin.bottom + cellSize * rows;
    const activeCount = Math.max(
      1,
      Math.ceil(((activeIndex + 1) / Math.max(section.copy.steps.length, 1)) * limited.length)
    );
    const activeGroups = new Set(resolveFocusKeys(activeStep, groupKeys));
    const theme = getChartTheme();
    const token = ++renderToken;

    try {
      const Plot = await loadPlotModule();
      if (token !== renderToken) {
        return;
      }

      const plotData = limited.map((row, index) => {
        const isVisible = index < activeCount;
        const isFocused = activeGroups.has(row.__group);
        const rowIndex = Math.floor(index / columns);
        return {
          ...row,
          __col: index % columns,
          __row: rows - 1 - rowIndex,
          __fill: colors(row.__group),
          __opacity: !isVisible ? 0.08 : isFocused ? 1 : 0.18,
        };
      });

      const plot = Plot.plot({
        width: plotWidth,
        height: plotHeight,
        marginTop: margin.top,
        marginRight: margin.right,
        marginBottom: margin.bottom,
        marginLeft: margin.left,
        className: "chart-plot",
        style: {
          background: theme.surface,
          color: theme.ink,
        },
        x: {
          axis: null,
          label: null,
          domain: Array.from({ length: columns }, (_, index) => index),
          padding: 0.12,
        },
        y: {
          axis: null,
          label: null,
          domain: Array.from({ length: rows }, (_, index) => index),
          padding: 0.12,
        },
        marks: [
          Plot.cell(plotData, {
            x: "__col",
            y: "__row",
            fill: "__fill",
            fillOpacity: "__opacity",
            inset: 3,
            stroke: null,
          }),
        ],
      });

      plot.classList.add("chart-svg");
      plot.style.width = `${plotWidth}px`;
      plot.style.height = `${plotHeight}px`;
      plot.style.maxWidth = "100%";

      const frame = document.createElement("div");
      frame.className = "figure-card figure-card-html";
      frame.style.display = "grid";
      frame.style.placeItems = "center";
      frame.style.width = "100%";
      frame.style.height = "100%";
      frame.style.padding = "0";
      frame.append(plot);

      if (token !== renderToken) {
        return;
      }
      container.replaceChildren(frame);
    } catch (error) {
      renderFrameworkError(
        container,
        error instanceof Error ? error.message : "Unknown unit render error."
      );
    }
  }

  draw(0, null);

  return {
    update(payload) {
      const next = getUpdatePayload(payload);
      currentIndex = next.index;
      currentStep = next.step;
      void draw(next.index, next.step);
    },
    resize() {
      void draw(currentIndex, currentStep);
    },
    destroy() {
      renderToken += 1;
    },
  };
}
