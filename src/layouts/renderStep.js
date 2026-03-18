import { getMarkerKindForVisType } from "../app/navMarkers.js";

function renderStepEyebrow(step) {
  if (typeof step !== "object" || step === null) return "";
  if (step.focus) {
    return `<p class="step-eyebrow step-eyebrow-focus">focus · ${step.focus}</p>`;
  }
  if (step.filter) {
    return `<p class="step-eyebrow step-eyebrow-filter">filter · ${step.filter}</p>`;
  }
  return "";
}

export function renderStep(markdown, step, index, visType) {
  const content = typeof step === "string" ? step : step?.body ?? "";
  const markerKind = getMarkerKindForVisType(visType);
  const eyebrow = renderStepEyebrow(step);

  return `
    <div class="step step-marker-${markerKind}${index === 0 ? " is-active" : ""}" data-step-index="${index}">
      <div class="step-inner">
        ${eyebrow}
        <div class="step-content">${markdown.render(content)}</div>
      </div>
    </div>
  `;
}
