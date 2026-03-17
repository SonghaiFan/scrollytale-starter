import * as d3 from "d3";

function getDimensions(container) {
  const bounds = container.getBoundingClientRect();
  return {
    width: Math.max(bounds.width, 320),
    height: Math.max(bounds.height, 360),
  };
}

export function renderUnitChart({ container, section, data }) {
  const colorField = section.vis.fields.color;
  container.innerHTML = "";

  if (!data.length) {
    container.innerHTML = `<div class="figure-card">Unit chart needs row-level data.</div>`;
    return { update() {} };
  }

  const limited = data.slice(0, 120).map((row, index) => ({
    ...row,
    __id: row.id ?? index,
  }));

  const svg = d3.select(container).append("svg").attr("class", "chart-svg");
  const g = svg.append("g");
  const colors = d3
    .scaleOrdinal()
    .domain([...new Set(limited.map((row) => row[colorField] ?? "default"))])
    .range(["#2563eb", "#0f766e", "#ea580c", "#7c3aed", "#d97706"]);
  let currentIndex = 0;

  function draw(activeIndex = 0) {
    const { width, height } = getDimensions(container);
    const columns = width < 640 ? 8 : 12;
    const size = Math.min(width / columns, 32);
    const rows = Math.ceil(limited.length / columns);
    const activeCount = Math.max(
      1,
      Math.ceil(((activeIndex + 1) / Math.max(section.copy.steps.length, 1)) * limited.length)
    );

    svg.attr("viewBox", `0 0 ${width} ${Math.max(height, rows * (size + 8) + 32)}`);
    g.attr("transform", "translate(16,16)");

    g.selectAll("circle")
      .data(limited, (d) => d.__id)
      .join("circle")
      .attr("cx", (_, index) => (index % columns) * size + size / 2)
      .attr("cy", (_, index) => Math.floor(index / columns) * size + size / 2)
      .attr("r", Math.max(size * 0.32, 5))
      .attr("fill", (d) => colors(d[colorField] ?? "default"))
      .attr("opacity", (_, index) => (index < activeCount ? 0.95 : 0.18));
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
