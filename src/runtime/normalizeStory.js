const SUPPORTED_LAYOUTS = new Set([
  "hero",
  "scrolly-left",
  "scrolly-right",
  "full-width",
]);

const SUPPORTED_VIS = new Set(["html", "bar", "line", "unit"]);
const SUPPORTED_STRUCTURE = new Set(["linear"]);

function slugify(value) {
  return String(value ?? "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeSection(section, index, warnings) {
  const config = section.config ?? {};
  const requestedLayout = config.layout ?? "full-width";
  const requestedVis = config.vis?.type ?? "html";
  const id = config.id ?? (slugify(section.title) || `section-${index + 1}`);
  const summary = config.copy?.summary ?? "";
  const steps = Array.isArray(config.copy?.steps) ? config.copy.steps : [];

  if (!SUPPORTED_LAYOUTS.has(requestedLayout)) {
    warnings.push(
      `Section "${section.title}" requested unsupported layout "${requestedLayout}". Falling back to "full-width".`
    );
  }

  if (!SUPPORTED_VIS.has(requestedVis)) {
    warnings.push(
      `Section "${section.title}" requested unsupported vis "${requestedVis}". Falling back to "html".`
    );
  }

  return {
    id,
    title: section.title,
    body: section.body,
    headline: config.headline ?? section.title,
    dek: config.dek ?? "",
    layout: SUPPORTED_LAYOUTS.has(requestedLayout) ? requestedLayout : "full-width",
    scene: config.scene ?? "observation",
    action: {
      trigger: config.action?.trigger ?? "scroll",
    },
    transition: {
      type: config.transition?.type ?? "none",
    },
    vis: {
      type: SUPPORTED_VIS.has(requestedVis) ? requestedVis : "html",
      data: {
        source: config.vis?.data?.source ?? null,
      },
      fields: config.vis?.fields ?? {},
      options: config.vis?.options ?? {},
    },
    copy: {
      summary,
      steps: steps.length ? steps : summary ? [summary] : [],
      annotations: Array.isArray(config.copy?.annotations) ? config.copy.annotations : [],
    },
  };
}

export function normalizeStory(parsed) {
  const warnings = [];
  const frontmatter = parsed.frontmatter ?? {};
  const structure = frontmatter.structure ?? "linear";

  if (!SUPPORTED_STRUCTURE.has(structure)) {
    warnings.push(`Unsupported structure "${structure}". Falling back to "linear".`);
  }

  return {
    title: frontmatter.title ?? "Untitled Scrollytale",
    structure: SUPPORTED_STRUCTURE.has(structure) ? structure : "linear",
    data: {
      sources: Array.isArray(frontmatter.data?.sources) ? frontmatter.data.sources : [],
    },
    customStyle: frontmatter.custom_style ?? "./src/styles/custom.css",
    sections: parsed.sections.map((section, index) => normalizeSection(section, index, warnings)),
    warnings,
  };
}
