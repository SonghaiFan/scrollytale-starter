import { renderMarkerSpanForKind } from "../app/navMarkers.js";

function renderBody(markdown, body) {
  return body ? `<div class="body-copy">${markdown.render(body)}</div>` : "";
}

export function renderHero({ section, markdown }) {
  const element = document.createElement("section");
  element.className = "section-shell section-hero";
  element.id = section.id;

  element.innerHTML = `
    <div class="section-copy">
      <p class="eyebrow eyebrow-marker">${renderMarkerSpanForKind("section", "eyebrow-ui-marker")}</p>
      <h2>${section.headline}</h2>
      ${section.dek ? `<p class="dek">${section.dek}</p>` : ""}
      ${section.copy.summary ? `<p class="summary">${section.copy.summary}</p>` : ""}
      ${renderBody(markdown, section.body)}
      <div class="scroll-downs" aria-hidden="true">
        <div class="mousey">
          <div class="scroller"></div>
        </div>
      </div>
    </div>
    <div class="section-figure"></div>
  `;

  return {
    element,
    figure: element.querySelector(".section-figure"),
    steps: [],
  };
}
