import * as aq from "arquero";
import * as d3 from "d3";

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

function getActiveIndex(payload) {
  return typeof payload === "number" ? payload : Number(payload?.index) || 0;
}

function resolveFocusKeys(step, groupedKeys, fallbackIndex, totalSteps) {
  const focusValue = step?.focus;
  if (typeof focusValue !== "string" || !focusValue.trim()) {
    const chunkSize = Math.max(1, Math.ceil(groupedKeys.length / Math.max(totalSteps, 1)));
    const highlightStart = fallbackIndex * chunkSize;
    return groupedKeys.slice(highlightStart, highlightStart + chunkSize);
  }

  const tokens = focusValue
    .split(",")
    .map((token) => token.trim())
    .filter(Boolean);

  if (!tokens.length) {
    return [];
  }

  if (tokens.some((token) => /^(all|\*)$/i.test(token))) {
    return groupedKeys;
  }

  return tokens
    .map((token) => {
      const lowered = token.toLowerCase();
      return groupedKeys.find((key) => String(key).toLowerCase() === lowered);
    })
    .filter(Boolean);
}

export function renderBarChart({ container, section, data }) {
  const { x, y } = section.vis.fields;
  container.innerHTML = "";

  if (!x || !y || !data.length) {
    container.innerHTML = `<div class="figure-card">Bar chart needs data and both x/y fields.</div>`;
    return { update() {}, resize() {} };
  }

  const grouped = aq
    .from(data)
    .groupby(x)
    .rollup({ value: aq.op.sum(y) })
    .rename({ [x]: "key" })
    .orderby(aq.desc("value"))
    .objects();

  let currentIndex = 0;
  let currentStep = null;
  let renderToken = 0;

  async function draw(activeIndex = 0, activeStep = null) {
    const { width, height, margin } = getDimensions(container);
    const theme = getChartTheme();
    const groupedKeys = grouped.map((d) => d.key);
    const activeKeys = resolveFocusKeys(
      activeStep,
      groupedKeys,
      activeIndex,
      section.copy.steps.length
    );
    const activeKeySet = new Set(activeKeys);
    const colorScale = createSeriesColorScale(groupedKeys);
    const token = ++renderToken;

    try {
      const Plot = await loadPlotModule();
      if (token !== renderToken) {
        return;
      }

      const plotData = grouped.map((row) => {
        const isActive = activeKeySet.size === 0 || activeKeySet.has(row.key);
        return {
          ...row,
          __fill: isActive ? colorScale(row.key) : theme.mutedInk,
          __opacity: isActive ? 1 : 0.24,
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
          domain: grouped.map((row) => row.key),
        },
        y: {
          label: null,
          ticks: 5,
          grid: false,
        },
        marks: [
          Plot.barY(plotData, {
            x: "key",
            y: "value",
            fill: "__fill",
            fillOpacity: "__opacity",
            insetLeft: 2,
            insetRight: 2,
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
        error instanceof Error ? error.message : "Unknown bar render error."
      );
    }
  }

  draw(0);

  return {
    update(payload) {
      const index = getActiveIndex(payload);
      currentIndex = index;
      currentStep = typeof payload === "number" ? null : payload?.step ?? null;
      void draw(index, currentStep);
    },
    resize() {
      void draw(currentIndex, currentStep);
    },
    destroy() {
      renderToken += 1;
    },
  };
}
