function renderBody(markdown, body) {
  return body ? `<div class="body-copy">${markdown.render(body)}</div>` : "";
}

function shouldRenderFigure(section) {
  const hasSource = Boolean(section.vis?.data?.source);
  const hasFields = Boolean(Object.keys(section.vis?.fields ?? {}).length);
  const hasNonHtmlVis = section.vis?.type && section.vis.type !== "html";

  return hasSource || hasFields || hasNonHtmlVis;
}

export function renderChapter({ section, markdown }) {
  const element = document.createElement("section");
  const hasFigure = shouldRenderFigure(section);
  element.className = `section-shell section-chapter${hasFigure ? " section-chapter-with-figure" : ""}`;
  element.id = section.id;

  element.innerHTML = `
    <div class="section-copy">
      <p class="eyebrow">${section.scene}</p>
      <h2>${section.headline}</h2>
      ${section.dek ? `<p class="dek">${section.dek}</p>` : ""}
      ${section.copy.summary ? `<p class="summary">${section.copy.summary}</p>` : ""}
      ${renderBody(markdown, section.body)}
    </div>
    ${hasFigure ? '<div class="section-figure section-figure-wide"></div>' : ""}
  `;

  return {
    element,
    figure: hasFigure ? element.querySelector(".section-figure") : null,
    steps: [],
  };
}
