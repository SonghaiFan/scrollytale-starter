import { renderMarkerSpanForVisType } from "../app/navMarkers.js";
import { renderStep } from "./renderStep.js";

export function renderScrollyLeft({ section, markdown }) {
  const element = document.createElement("section");
  element.className = "section-shell section-scrolly section-scrolly-left";
  element.id = section.id;

  element.innerHTML = `
    <div class="section-copy section-scrolly-intro">
      <p class="eyebrow eyebrow-marker">${renderMarkerSpanForVisType(section.vis.type, "eyebrow-ui-marker")}</p>
      <h2>${section.headline}</h2>
      ${section.dek ? `<p class="dek">${section.dek}</p>` : ""}
      ${section.body ? `<div class="body-copy">${markdown.render(section.body)}</div>` : ""}
    </div>
    <div class="section-scrolly-body">
      <div class="section-figure sticky-figure"></div>
      <div class="scrolly-copy">
        <div class="steps">
          ${section.copy.steps.map((step, index) => renderStep(markdown, step, index, section.vis.type)).join("")}
        </div>
      </div>
    </div>
  `;

  return {
    element,
    figure: element.querySelector(".section-figure"),
    steps: [...element.querySelectorAll(".step")],
  };
}
