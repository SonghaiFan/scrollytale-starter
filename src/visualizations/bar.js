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
    return { update() {} };
  }

  const grouped = d3
    .rollups(
      data,
      (values) => d3.sum(values, (row) => Number(row[y]) || 0),
      (row) => row[x]
    )
    .map(([key, value]) => ({ key, value }))
    .sort((a, b) => d3.descending(a.value, b.value));

  const svg = ensureChartSvg(container);
  const g = svg.append("g");
  const bars = g.append("g");
  const gx = g.append("g");
  const gy = g.append("g");
  let currentIndex = 0;
  let currentStep = null;

  function draw(activeIndex = 0, activeStep = null) {
    const { width, height, margin } = getDimensions(container);
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
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
    const transition = svg.transition().duration(450);

    svg.attr("viewBox", `0 0 ${width} ${height}`).style("background", theme.surface);
    g.attr("transform", `translate(${margin.left},${margin.top})`);

    const xScale = d3
      .scaleBand()
      .domain(grouped.map((d) => d.key))
      .range([0, innerWidth])
      .padding(0.18);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(grouped, (d) => d.value) ?? 0])
      .nice()
      .range([innerHeight, 0]);

    gx.attr("transform", `translate(0,${innerHeight})`).call(d3.axisBottom(xScale));
    gy.call(d3.axisLeft(yScale).ticks(5));
    applyAxisStyle(gx);
    applyAxisStyle(gy);

    gx.selectAll("text")
      .attr("transform", "rotate(18)")
      .style("text-anchor", "start");

    bars
      .selectAll("rect")
      .data(grouped, (d) => d.key)
      .join("rect")
      .attr("x", (d) => xScale(d.key))
      .attr("y", (d) => yScale(d.value))
      .attr("width", xScale.bandwidth())
      .attr("height", (d) => innerHeight - yScale(d.value))
      .attr("shape-rendering", "crispEdges")
      .transition(transition)
      .attr("fill", (d) =>
        activeKeySet.size === 0 || activeKeySet.has(d.key)
          ? colorScale(d.key)
          : theme.mutedInk
      )
      .attr("opacity", (d) =>
        activeKeySet.size === 0 || activeKeySet.has(d.key) ? 1 : 0.24
      );
  }

  draw(0);

  return {
    update(payload) {
      const index = getActiveIndex(payload);
      currentIndex = index;
      currentStep = typeof payload === "number" ? null : payload?.step ?? null;
      draw(index, currentStep);
    },
    resize() {
      draw(currentIndex, currentStep);
    },
  };
}
