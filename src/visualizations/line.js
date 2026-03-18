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

function compareValues(left, right, numeric) {
  if (numeric) {
    return Number(left) - Number(right);
  }

  return String(left).localeCompare(String(right));
}

export function renderLineChart({ container, section, data }) {
  const { x, y, series } = section.vis.fields;
  container.innerHTML = "";

  if (!x || !y || !data.length) {
    container.innerHTML = `<div class="figure-card">Line chart needs data and both x/y fields.</div>`;
    return { update() {}, resize() {} };
  }

  const sortedData = aq
    .from(data)
    .orderby(series ? [series, x] : [x])
    .objects();
  const groupedKeys = [
    ...new Set(sortedData.map((row) => (series ? row[series] : "Series"))),
  ];
  let currentIndex = 0;
  let currentStep = null;
  let renderToken = 0;

  async function draw(payload) {
    const next = getUpdatePayload(payload);
    const { width, height, margin } = getDimensions(container);
    const theme = getChartTheme();
    const focus = resolveFocusKeys(next.step, groupedKeys, next.index);
    const activeKeySet = new Set(focus);
    const colorScale = createSeriesColorScale(groupedKeys);
    const allX = sortedData.map((row) => row[x]);
    const numericX = isNumeric(allX);
    const transitionMode = next.step?.transition ?? "focus";
    const allActive = groupedKeys.length <= 1 || transitionMode !== "focus";
    const token = ++renderToken;

    currentIndex = next.index;
    currentStep = next.step;

    try {
      const Plot = await loadPlotModule();
      if (token !== renderToken) {
        return;
      }

      const plotData = sortedData
        .map((row, index) => {
          const key = series ? row[series] : "Series";
          const isActive = allActive || activeKeySet.has(key);
          return {
            ...row,
            __index: index,
            __group: key,
            __stroke: colorScale(key),
            __strokeOpacity: isActive ? 1 : 0.15,
            __strokeWidth: isActive ? 3.5 : 2,
            __fill: colorScale(key),
            __fillOpacity: isActive ? 1 : 0.18,
            __r: isActive ? 3.5 : 2.5,
          };
        })
        .sort((left, right) => {
          if (left.__group !== right.__group) {
            return String(left.__group).localeCompare(String(right.__group));
          }

          const byX = compareValues(left[x], right[x], numericX);
          if (byX !== 0) {
            return byX;
          }

          return left.__index - right.__index;
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
          ticks: numericX ? 5 : undefined,
          grid: false,
        },
        y: {
          label: null,
          ticks: 5,
          grid: false,
        },
        marks: [
          Plot.line(plotData, {
            x,
            y,
            z: "__group",
            stroke: "__stroke",
            strokeOpacity: "__strokeOpacity",
            strokeWidth: "__strokeWidth",
          }),
          Plot.dot(plotData, {
            x,
            y,
            fill: "__fill",
            fillOpacity: "__fillOpacity",
            r: "__r",
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
        error instanceof Error ? error.message : "Unknown line render error."
      );
    }
  }

  draw(0);

  return {
    update(payload) {
      void draw(payload);
    },
    resize() {
      void draw({ index: currentIndex, step: currentStep });
    },
    destroy() {
      renderToken += 1;
    },
  };
}
