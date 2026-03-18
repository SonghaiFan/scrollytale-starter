import { renderMarkerSpanForVisType } from "../app/navMarkers.js";
import { renderStep } from "./renderStep.js";

export function renderScrollyOverlay({ section, markdown }) {
  const element = document.createElement("section");
  element.className = "story-section is-scrolly is-overlay";
  element.id = section.id;

  element.innerHTML = `
    <div class="section-content scrolly-intro">
      <p class="eyebrow eyebrow-marker">${renderMarkerSpanForVisType(section.vis.type, "eyebrow-ui-marker")}</p>
      <h2>${section.headline}</h2>
      ${section.dek ? `<p class="dek">${section.dek}</p>` : ""}
      ${section.body ? `<div class="body-copy">${markdown.render(section.body)}</div>` : ""}
    </div>
    <div class="scrolly-main is-overlay">
      <div class="section-media sticky-figure"></div>
      <div class="section-content scrolly-text">
        <div class="steps">
          ${section.copy.steps.map((step, index) => renderStep(markdown, step, index, section.vis.type)).join("")}
        </div>
      </div>
    </div>
  `;

  return {
    element,
    figure: element.querySelector(".section-media"),
    steps: [...element.querySelectorAll(".step")],
  };
}
