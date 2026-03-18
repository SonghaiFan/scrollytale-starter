import { renderMarkerSpanForVisType } from "../app/navMarkers.js";

function renderBody(markdown, body) {
  return body ? `<div class="body-copy">${markdown.render(body)}</div>` : "";
}

export function renderVisContainer({ section, markdown }) {
  const element = document.createElement("section");
  element.className = "section-shell section-vis-container";
  element.id = section.id;

  element.innerHTML = `
    <div class="vis-container-stage">
      <div class="section-figure section-figure-wide vis-container-figure"></div>
      <div class="section-copy vis-container-copy">
        <p class="eyebrow eyebrow-marker">${renderMarkerSpanForVisType(section.vis.type, "eyebrow-ui-marker")}</p>
        <h2>${section.headline}</h2>
        ${section.dek ? `<p class="dek">${section.dek}</p>` : ""}
        ${section.copy.summary ? `<p class="summary">${section.copy.summary}</p>` : ""}
        ${renderBody(markdown, section.body)}
      </div>
    </div>
  `;

  return {
    element,
    figure: element.querySelector(".section-figure"),
    steps: [],
  };
}
