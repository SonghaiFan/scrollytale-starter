import { createSeriesColorScale, getChartTheme } from "./shared.js";
import { loadPlotModule, renderFrameworkError } from "./frameworkShared.js";

function getDimensions(container) {
  const bounds = container.getBoundingClientRect();
  return {
    width: Math.max(bounds.width, 320),
    height: Math.max(bounds.height, 360),
    margin: { top: 24, right: 24, bottom: 48, left: 64 },
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

function resolveFocusKeys(step, groupedKeys, fallbackIndex) {
  const focusValue = step?.focus;
  if (typeof focusValue !== "string" || !focusValue.trim()) {
    return [groupedKeys[Math.min(fallbackIndex, groupedKeys.length - 1)]].filter(Boolean);
  }

  const tokens = focusValue
    .split(",")
    .map((token) => token.trim())
    .filter(Boolean);

  if (!tokens.length) {
    return [groupedKeys[Math.min(fallbackIndex, groupedKeys.length - 1)]].filter(Boolean);
  }

  if (tokens.some((token) => /^(all|\*)$/i.test(token))) {
    return groupedKeys;
  }

  const matches = tokens
    .map((token) => {
      const lowered = token.toLowerCase();
      return groupedKeys.find((key) => String(key).toLowerCase() === lowered);
    })
    .filter(Boolean);

  return matches.length
    ? matches
    : [groupedKeys[Math.min(fallbackIndex, groupedKeys.length - 1)]].filter(Boolean);
}

function isNumeric(values) {
  return values.every((value) => typeof value === "number");
}

export function renderScatterChart({ container, section, data }) {
  const { x, y, series, color } = section.vis.fields;
  container.innerHTML = "";

  if (!x || !y || !data.length) {
    container.innerHTML = `<div class="figure-card">Scatter chart needs data and both x/y fields.</div>`;
    return { update() {}, resize() {} };
  }

  const groupField = series ?? color;
  const groupedKeys = [...new Set(data.map((row) => row[groupField] ?? "Series"))];
  let currentIndex = 0;
  let currentStep = null;
  let renderToken = 0;

  async function draw(activeIndex = 0, activeStep = null) {
    const { width, height, margin } = getDimensions(container);
    const theme = getChartTheme();
    const activeKeys = resolveFocusKeys(activeStep, groupedKeys, activeIndex);
    const activeKeySet = new Set(activeKeys);
    const colorScale = createSeriesColorScale(groupedKeys);
    const xValues = data.map((row) => row[x]);
    const yValues = data.map((row) => row[y]);
    const allActive = groupedKeys.length <= 1;
    const token = ++renderToken;

    try {
      const Plot = await loadPlotModule();
      if (token !== renderToken) {
        return;
      }

      const plotData = data.map((row, index) => {
        const key = row[groupField] ?? "Series";
        const isActive = allActive || activeKeySet.has(key);
        return {
          ...row,
          __id: row.id ?? `${key}-${index}`,
          __group: key,
          __fill: colorScale(key),
          __opacity: isActive ? 0.95 : 0.16,
          __r: isActive ? 5 : 3.5,
        };
      });

      const plot = Plot.plot({
        width,
        height,
        marginTop: margin.top,
        marginRight: margin.right,
        marginBottom: margin.bottom,
        marginLeft: margin.left,
        className: "chart-plot",
        style: {
          background: theme.surface,
          color: theme.ink,
          fontFamily: '"Roboto Mono", ui-monospace, monospace',
          fontSize: "11px",
        },
        x: {
          label: null,
          ticks: isNumeric(xValues) ? 5 : undefined,
          grid: false,
        },
        y: {
          label: null,
          ticks: isNumeric(yValues) ? 5 : undefined,
          grid: false,
        },
        marks: [
          Plot.dot(plotData, {
            x,
            y,
            fill: "__fill",
            fillOpacity: "__opacity",
            r: "__r",
            symbol: "square",
            stroke: null,
          }),
        ],
      });

      plot.classList.add("chart-svg");
      if (token !== renderToken) {
        return;
      }
      container.replaceChildren(plot);
    } catch (error) {
      renderFrameworkError(
        container,
        error instanceof Error ? error.message : "Unknown scatter render error."
      );
    }
  }

  draw(0);

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
