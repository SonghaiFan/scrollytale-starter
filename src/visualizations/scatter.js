import * as d3 from "d3";
import {
  applyAxisStyle,
  createSeriesColorScale,
  ensureChartSvg,
  getChartTheme,
} from "./shared.js";

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
    return { update() {} };
  }

  const groupField = series ?? color;
  const groupedKeys = [...new Set(data.map((row) => row[groupField] ?? "Series"))];
  const svg = ensureChartSvg(container);
  const g = svg.append("g");
  const pointsLayer = g.append("g");
  const gx = g.append("g");
  const gy = g.append("g");
  let currentIndex = 0;
  let currentStep = null;

  function draw(activeIndex = 0, activeStep = null) {
    const { width, height, margin } = getDimensions(container);
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    const theme = getChartTheme();
    const activeKeys = resolveFocusKeys(activeStep, groupedKeys, activeIndex);
    const activeKeySet = new Set(activeKeys);
    const colorScale = createSeriesColorScale(groupedKeys);
    const xValues = data.map((row) => row[x]);
    const yValues = data.map((row) => row[y]);
    const xScale = isNumeric(xValues)
      ? d3.scaleLinear().domain(d3.extent(xValues)).nice().range([0, innerWidth])
      : d3.scalePoint().domain(xValues).range([0, innerWidth]).padding(0.5);
    const yScale = isNumeric(yValues)
      ? d3.scaleLinear().domain(d3.extent(yValues)).nice().range([innerHeight, 0])
      : d3.scalePoint().domain(yValues).range([innerHeight, 0]).padding(0.5);
    const transition = svg.transition().duration(450);

    svg.attr("viewBox", `0 0 ${width} ${height}`).style("background", theme.surface);
    g.attr("transform", `translate(${margin.left},${margin.top})`);

    gx.attr("transform", `translate(0,${innerHeight})`).call(
      isNumeric(xValues) ? d3.axisBottom(xScale).ticks(5) : d3.axisBottom(xScale)
    );
    gy.call(isNumeric(yValues) ? d3.axisLeft(yScale).ticks(5) : d3.axisLeft(yScale));
    applyAxisStyle(gx);
    applyAxisStyle(gy);

    pointsLayer
      .selectAll("rect")
      .data(data, (d, index) => d.id ?? `${d[groupField] ?? "Series"}-${index}`)
      .join("rect")
      .attr("fill", (d) => colorScale(d[groupField] ?? "Series"))
      .attr("shape-rendering", "crispEdges")
      .transition(transition)
      .attr("width", (d) =>
        activeKeySet.has(d[groupField] ?? "Series") || groupedKeys.length === 1 ? 10 : 7
      )
      .attr("height", (d) =>
        activeKeySet.has(d[groupField] ?? "Series") || groupedKeys.length === 1 ? 10 : 7
      )
      .attr("x", (d) =>
        xScale(d[x]) -
        (activeKeySet.has(d[groupField] ?? "Series") || groupedKeys.length === 1 ? 5 : 3.5)
      )
      .attr("y", (d) =>
        yScale(d[y]) -
        (activeKeySet.has(d[groupField] ?? "Series") || groupedKeys.length === 1 ? 5 : 3.5)
      )
      .attr("opacity", (d) =>
        activeKeySet.has(d[groupField] ?? "Series") || groupedKeys.length === 1 ? 0.95 : 0.16
      );
  }

  draw(0);

  return {
    update(payload) {
      const next = getUpdatePayload(payload);
      currentIndex = next.index;
      currentStep = next.step;
      draw(next.index, next.step);
    },
    resize() {
      draw(currentIndex, currentStep);
    },
  };
}
