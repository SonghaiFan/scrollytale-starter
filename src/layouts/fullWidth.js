function renderBody(markdown, body) {
  return body ? `<div class="body-copy">${markdown.render(body)}</div>` : "";
}

export function renderFullWidth({ section, markdown }) {
  const element = document.createElement("section");
  element.className = "section-shell section-full-width";
  element.id = section.id;

  element.innerHTML = `
    <div class="section-copy">
      <p class="eyebrow">${section.scene}</p>
      <h2>${section.headline}</h2>
      ${section.dek ? `<p class="dek">${section.dek}</p>` : ""}
      ${section.copy.summary ? `<p class="summary">${section.copy.summary}</p>` : ""}
      ${renderBody(markdown, section.body)}
    </div>
    <div class="section-figure section-figure-wide"></div>
  `;

  return {
    element,
    figure: element.querySelector(".section-figure"),
    steps: [],
  };
}

