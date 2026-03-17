function renderStep(step, index) {
  return `
    <div class="step${index === 0 ? " is-active" : ""}" data-step-index="${index}">
      <p>${step}</p>
    </div>
  `;
}

function renderBody(markdown, body) {
  return body ? `<div class="body-copy">${markdown.render(body)}</div>` : "";
}

export function renderScrollyRight({ section, markdown }) {
  const element = document.createElement("section");
  element.className = "section-shell section-scrolly section-scrolly-right";
  element.id = section.id;

  element.innerHTML = `
    <div class="section-copy scrolly-copy">
      <p class="eyebrow">${section.scene}</p>
      <h2>${section.headline}</h2>
      ${section.dek ? `<p class="dek">${section.dek}</p>` : ""}
      ${renderBody(markdown, section.body)}
      <div class="steps">
        ${section.copy.steps.map(renderStep).join("")}
      </div>
    </div>
    <div class="section-figure sticky-figure"></div>
  `;

  return {
    element,
    figure: element.querySelector(".section-figure"),
    steps: [...element.querySelectorAll(".step")],
  };
}

