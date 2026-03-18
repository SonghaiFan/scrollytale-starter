import { renderMarkerSpanForVisType } from "../app/navMarkers.js";

function renderStep(markdown, step, index, visType) {
  const content = typeof step === "string" ? step : step?.body ?? "";

  return `
    <div class="step${index === 0 ? " is-active" : ""}" data-step-index="${index}">
      <div class="step-inner">
        ${renderMarkerSpanForVisType(visType, "step-marker")}
        <div class="step-content">${markdown.render(content)}</div>
      </div>
    </div>
  `;
}

function renderBody(markdown, body) {
  return body ? `<div class="body-copy">${markdown.render(body)}</div>` : "";
}

export function renderScrollyTop({ section, markdown }) {
  const element = document.createElement("section");
  element.className = "section-shell section-scrolly section-scrolly-top";
  element.id = section.id;

  element.innerHTML = `
    <div class="section-copy scrolly-copy">
      <div class="scrolly-strip">
        <article class="scrolly-intro-card is-active">
          <div class="scrolly-intro">
            <p class="eyebrow eyebrow-marker">${renderMarkerSpanForVisType(section.vis.type, "eyebrow-ui-marker")}</p>
            <h2>${section.headline}</h2>
            ${section.dek ? `<p class="dek">${section.dek}</p>` : ""}
            ${renderBody(markdown, section.body)}
          </div>
        </article>
        <div class="steps">
          ${section.copy.steps.map((step, index) => renderStep(markdown, step, index, section.vis.type)).join("")}
        </div>
      </div>
    </div>
    <div class="section-figure sticky-figure"></div>
  `;

  return {
    element,
    figure: element.querySelector(".section-figure"),
    steps: [...element.querySelectorAll(".step")],
    strip: element.querySelector(".scrolly-strip"),
    narrativeCards: [
      element.querySelector(".scrolly-intro-card"),
      ...element.querySelectorAll(".step"),
    ].filter(Boolean),
  };
}
