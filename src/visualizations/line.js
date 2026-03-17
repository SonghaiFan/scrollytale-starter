import * as d3 from "d3";

function getDimensions(container) {
  const bounds = container.getBoundingClientRect();
  return {
    width: Math.max(bounds.width, 320),
    height: Math.max(bounds.height, 360),
    margin: { top: 24, right: 24, bottom: 48, left: 64 },
  };
}

export function renderLineChart({ container, section, data }) {
  const { x, y, series } = section.vis.fields;
  container.innerHTML = "";

  if (!x || !y || !data.length) {
    container.innerHTML = `<div class="figure-card">Line chart needs data and both x/y fields.</div>`;
    return { update() {} };
  }

  const grouped = d3.groups(data, (row) => (series ? row[series] : "Series"));
  const color = d3.scaleOrdinal().domain(grouped.map(([key]) => key)).range(["#2563eb", "#ea580c", "#16a34a", "#7c3aed"]);

  const svg = d3.select(container).append("svg").attr("class", "chart-svg");
  const g = svg.append("g");
  const linesLayer = g.append("g");
  const pointsLayer = g.append("g");
  const gx = g.append("g");
  const gy = g.append("g");
  let currentIndex = 0;

  function draw(activeIndex = 0) {
    const { width, height, margin } = getDimensions(container);
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    const activeKey = grouped[Math.min(activeIndex, grouped.length - 1)]?.[0];

    svg.attr("viewBox", `0 0 ${width} ${height}`);
    g.attr("transform", `translate(${margin.left},${margin.top})`);

    const allX = data.map((row) => row[x]);
    const isNumericX = allX.every((value) => typeof value === "number");
    const xScale = isNumericX
      ? d3.scaleLinear().domain(d3.extent(allX)).range([0, innerWidth])
      : d3.scalePoint().domain(allX).range([0, innerWidth]).padding(0.5);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (row) => Number(row[y]) || 0) ?? 0])
      .nice()
      .range([innerHeight, 0]);

    gx.attr("transform", `translate(0,${innerHeight})`).call(isNumericX ? d3.axisBottom(xScale).ticks(5) : d3.axisBottom(xScale));
    gy.call(d3.axisLeft(yScale).ticks(5));

    const line = d3
      .line()
      .x((row) => xScale(row[x]))
      .y((row) => yScale(Number(row[y]) || 0));

    linesLayer
      .selectAll("path")
      .data(grouped, ([key]) => key)
      .join("path")
      .attr("fill", "none")
      .attr("stroke", ([key]) => color(key))
      .attr("stroke-width", ([key]) => (key === activeKey ? 4 : 2.5))
      .attr("opacity", ([key]) => (key === activeKey || grouped.length === 1 ? 1 : 0.35))
      .attr("d", ([, values]) => line(values));

    const pointData = grouped.flatMap(([key, values]) =>
      values.map((row) => ({
        key,
        x: row[x],
        y: Number(row[y]) || 0,
      }))
    );

    pointsLayer
      .selectAll("circle")
      .data(pointData)
      .join("circle")
      .attr("cx", (d) => xScale(d.x))
      .attr("cy", (d) => yScale(d.y))
      .attr("r", (d) => (d.key === activeKey || grouped.length === 1 ? 4 : 2.5))
      .attr("fill", (d) => color(d.key))
      .attr("opacity", (d) => (d.key === activeKey || grouped.length === 1 ? 1 : 0.45));
  }

  draw(0);
  window.addEventListener("resize", () => draw(currentIndex));

  return {
    update(index) {
      currentIndex = index;
      draw(index);
    },
  };
}
