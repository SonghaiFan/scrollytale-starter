import { renderMarkerSpanForKind } from "../app/navMarkers.js";

function renderBody(markdown, body) {
  return body ? `<div class="body-copy">${markdown.render(body)}</div>` : "";
}

export function renderHero({ section, markdown }) {
  const element = document.createElement("section");
  element.className = "story-section is-hero";
  element.id = section.id;

  element.innerHTML = `
    <div class="section-content">
      <header class="hero-header">
        <p class="eyebrow eyebrow-marker">${renderMarkerSpanForKind("section", "eyebrow-ui-marker")}</p>
        <h2 class="hero-headline">${section.headline}</h2>
        ${section.dek ? `<p class="dek hero-dek">${section.dek}</p>` : ""}
        ${section.copy.summary ? `<p class="summary">${section.copy.summary}</p>` : ""}
        ${renderBody(markdown, section.body)}
      </header>
      <div class="hero-scroll-cue" aria-hidden="true">
        <span class="hero-scroll-label">scroll</span>
        <span class="hero-scroll-line"></span>
      </div>
    </div>
    <div class="section-media"></div>
  `;

  return {
    element,
    figure: element.querySelector(".section-media"),
    steps: [],
  };
}
