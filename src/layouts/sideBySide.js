import { renderMarkerSpanForVisType } from "../app/navMarkers.js";

function renderBody(markdown, body) {
  return body ? `<div class="body-copy">${markdown.render(body)}</div>` : "";
}

export function renderSideBySide({ section, markdown }) {
  const element = document.createElement("section");
  element.className = "section-shell section-side-by-side";
  element.id = section.id;

  element.innerHTML = `
    <div class="section-copy side-by-side-copy">
      <p class="eyebrow eyebrow-marker">${renderMarkerSpanForVisType(section.vis.type, "eyebrow-ui-marker")}</p>
      <h2>${section.headline}</h2>
      ${section.dek ? `<p class="dek">${section.dek}</p>` : ""}
      ${section.copy.summary ? `<p class="summary">${section.copy.summary}</p>` : ""}
      ${renderBody(markdown, section.body)}
    </div>
    <div class="section-figure section-figure-wide side-by-side-figure"></div>
  `;

  return {
    element,
    figure: element.querySelector(".section-figure"),
    steps: [],
  };
}
