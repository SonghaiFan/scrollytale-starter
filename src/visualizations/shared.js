import * as d3 from "d3";

function readVar(name, fallback) {
  if (typeof window === "undefined") {
    return fallback;
  }

  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}

export function getChartPalette() {
  return [
    readVar("--chart-series-1", "#2457d6"),
    readVar("--chart-series-2", "#ff5a36"),
    readVar("--chart-series-3", "#f0c419"),
    readVar("--chart-series-4", "#111111"),
    readVar("--chart-series-5", "#efb7cf"),
    readVar("--chart-series-6", "#2d9d78"),
  ];
}

export function createSeriesColorScale(keys) {
  return d3.scaleOrdinal().domain(keys).range(getChartPalette());
}

export function getChartTheme() {
  return {
    ink: readVar("--chart-ink", "#111111"),
    mutedInk: readVar("--chart-muted-ink", "rgba(17, 17, 17, 0.45)"),
    grid: readVar("--chart-grid", "rgba(17, 17, 17, 0.14)"),
    axis: readVar("--chart-axis", "#111111"),
    surface: readVar("--chart-surface", "transparent"),
    frame: readVar("--chart-frame", "rgba(17, 17, 17, 0.08)"),
  };
}

export function applyAxisStyle(axisLayer) {
  const theme = getChartTheme();
  axisLayer
    .selectAll("path,line")
    .attr("stroke", theme.axis)
    .attr("stroke-width", 1)
    .attr("shape-rendering", "crispEdges")
    .attr("opacity", 0.32);
  axisLayer
    .selectAll("text")
    .attr("fill", theme.ink)
    .style("font-family", '"Roboto Mono", ui-monospace, monospace')
    .style("font-size", "11px");
}

export function ensureChartSvg(container) {
  return d3
    .select(container)
    .selectAll("svg.chart-svg")
    .data([null])
    .join("svg")
    .attr("class", "chart-svg");
}
