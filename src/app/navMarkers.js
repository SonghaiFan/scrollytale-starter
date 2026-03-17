export function getMarkerKindForVisType(visType) {
  return visType === "html" ? "section" : "step";
}

export function renderMarkerSpanForKind(kind, className = "ui-marker") {
  return `<span class="${className} is-${kind}" aria-hidden="true"></span>`;
}

export function renderMarkerSpanForVisType(visType, className = "ui-marker") {
  return `<span class="${className} is-${getMarkerKindForVisType(visType)}" aria-hidden="true"></span>`;
}
