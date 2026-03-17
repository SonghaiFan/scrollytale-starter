import * as d3 from "d3";

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

function createLineChart() {
  let fields = {
    x: null,
    y: null,
    series: null,
  };
  let colorScale = d3
    .scaleOrdinal()
    .range(["#2563eb", "#ea580c", "#16a34a", "#7c3aed"]);
  let dimensions = {
    width: 320,
    height: 360,
    margin: { top: 24, right: 24, bottom: 48, left: 64 },
  };
  let focusKeys = [];
  let transitionMode = "focus";
  let transitionDuration = 450;

  function chart(selection) {
    selection.each(function render(chartData) {
      const svg = d3.select(this);
      const root = svg.selectAll("g.chart-root").data([null]).join("g").attr("class", "chart-root");
      const linesLayer = root.selectAll("g.lines-layer").data([null]).join("g").attr("class", "lines-layer");
      const pointsLayer = root.selectAll("g.points-layer").data([null]).join("g").attr("class", "points-layer");
      const gx = root.selectAll("g.x-axis-layer").data([null]).join("g").attr("class", "x-axis-layer");
      const gy = root.selectAll("g.y-axis-layer").data([null]).join("g").attr("class", "y-axis-layer");

      const { x, y, series } = fields;
      const { width, height, margin } = dimensions;
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;
      const grouped = d3.groups(chartData, (row) => (series ? row[series] : "Series"));
      const groupedKeys = grouped.map(([key]) => key);
      const activeKeys = focusKeys.length ? focusKeys : groupedKeys.slice(0, 1);
      const activeKeySet = new Set(activeKeys);
      const transition = svg.transition().duration(transitionDuration);

      svg.attr("viewBox", `0 0 ${width} ${height}`);
      root.attr("transform", `translate(${margin.left},${margin.top})`);
      colorScale.domain(groupedKeys);

      const allX = chartData.map((row) => row[x]);
      const isNumericX = allX.every((value) => typeof value === "number");
      const xScale = isNumericX
        ? d3.scaleLinear().domain(d3.extent(allX)).range([0, innerWidth])
        : d3.scalePoint().domain(allX).range([0, innerWidth]).padding(0.5);

      const yScale = d3
        .scaleLinear()
        .domain([0, d3.max(chartData, (row) => Number(row[y]) || 0) ?? 0])
        .nice()
        .range([innerHeight, 0]);

      gx
        .attr("transform", `translate(0,${innerHeight})`)
        .transition(transition)
        .call(isNumericX ? d3.axisBottom(xScale).ticks(5) : d3.axisBottom(xScale));

      gy.transition(transition).call(d3.axisLeft(yScale).ticks(5));

      const line = d3
        .line()
        .x((row) => xScale(row[x]))
        .y((row) => yScale(Number(row[y]) || 0));

      linesLayer
        .selectAll("path")
        .data(grouped, ([key]) => key)
        .join("path")
        .attr("fill", "none")
        .attr("stroke", ([key]) => colorScale(key))
        .attr("d", ([, values]) => line(values))
        .transition(transition)
        .attr("stroke-width", ([key]) =>
          transitionMode === "focus" && !(activeKeySet.has(key) || grouped.length === 1) ? 2.25 : 4
        )
        .attr("opacity", ([key]) =>
          transitionMode === "focus" && !(activeKeySet.has(key) || grouped.length === 1) ? 0.18 : 1
        );

      const pointData = grouped.flatMap(([key, values]) =>
        values.map((row) => ({
          key,
          x: row[x],
          y: Number(row[y]) || 0,
        }))
      );

      pointsLayer
        .selectAll("circle")
        .data(pointData, (d) => `${d.key}-${d.x}`)
        .join("circle")
        .attr("cx", (d) => xScale(d.x))
        .attr("cy", (d) => yScale(d.y))
        .attr("fill", (d) => colorScale(d.key))
        .transition(transition)
        .attr("r", (d) =>
          transitionMode === "focus" && !(activeKeySet.has(d.key) || grouped.length === 1) ? 2.5 : 4
        )
        .attr("opacity", (d) =>
          transitionMode === "focus" && !(activeKeySet.has(d.key) || grouped.length === 1) ? 0.2 : 1
        );
    });
  }

  chart.fields = function setFields(nextFields) {
    if (!arguments.length) return fields;
    fields = {
      ...fields,
      ...nextFields,
    };
    return chart;
  };

  chart.colorScale = function setColorScale(nextScale) {
    if (!arguments.length) return colorScale;
    colorScale = nextScale;
    return chart;
  };

  chart.dimensions = function setDimensions(nextDimensions) {
    if (!arguments.length) return dimensions;
    dimensions = nextDimensions;
    return chart;
  };

  chart.focusKeys = function setFocusKeys(nextKeys) {
    if (!arguments.length) return focusKeys;
    focusKeys = Array.isArray(nextKeys) ? nextKeys : [];
    return chart;
  };

  chart.transitionMode = function setTransitionMode(nextMode) {
    if (!arguments.length) return transitionMode;
    transitionMode = nextMode || "focus";
    return chart;
  };

  chart.transitionDuration = function setTransitionDuration(nextDuration) {
    if (!arguments.length) return transitionDuration;
    transitionDuration = Number.isFinite(nextDuration) ? nextDuration : transitionDuration;
    return chart;
  };

  return chart;
}

export function renderLineChart({ container, section, data }) {
  const { x, y, series } = section.vis.fields;
  container.innerHTML = "";

  if (!x || !y || !data.length) {
    container.innerHTML = `<div class="figure-card">Line chart needs data and both x/y fields.</div>`;
    return { update() {} };
  }

  const groupedKeys = d3.groups(data, (row) => (series ? row[series] : "Series")).map(([key]) => key);
  const svg = d3.select(container).append("svg").attr("class", "chart-svg");
  const chart = createLineChart().fields({ x, y, series });
  let currentIndex = 0;
  let currentStep = null;

  function render(payload) {
    const next = getUpdatePayload(payload);
    const dimensions = getDimensions(container);
    const focus = resolveFocusKeys(next.step, groupedKeys, next.index);

    currentIndex = next.index;
    currentStep = next.step;

    svg.datum(data).call(
      chart
        .dimensions(dimensions)
        .focusKeys(focus)
        .transitionMode(next.step?.transition ?? "focus")
    );
  }

  render(0);
  window.addEventListener("resize", () => render({ index: currentIndex, step: currentStep }));

  return {
    update(payload) {
      render(payload);
    },
  };
}
