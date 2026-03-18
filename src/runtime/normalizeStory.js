import {
  KNOWN_ACTION_AFFORDANCES,
  KNOWN_ACTION_TRIGGERS,
  KNOWN_LAYOUT_AXES,
  KNOWN_LAYOUT_BINDINGS,
  KNOWN_LAYOUT_CONTAINERS,
  KNOWN_LAYOUT_OVERLAPS,
  KNOWN_SCENES,
  KNOWN_SEGUES,
  KNOWN_STRUCTURE_FAMILIES,
  KNOWN_STRUCTURE_PATTERNS,
  STARTER_SUPPORT,
  getLayoutPresetMetadata,
  getStructureFamilyFromPattern,
} from "./designSpace.js";

const SUPPORTED_LAYOUTS = new Set([
  "chapter",
  "side-by-side",
  "vis-container",
  "hero",
  "scrolly-bottom",
  "scrolly-left",
  "scrolly-overlay",
  "scrolly-right",
  "scrolly-top",
  "full-width",
]);

const SUPPORTED_VIS = new Set(["html", "bar", "line", "scatter", "unit"]);
const SUPPORTED_LAYOUT_NAMES = new Set([
  "float-to-text",
  "fixed-to-text",
  "text-container",
  "vis-container",
  "text-over-vis",
]);

const LAYOUT_NAME_ALIASES = {
  "text-container": {
    preset: "chapter",
    axis: "vertical",
    binding: "fixed-to-text",
    container: "text-container",
    overlap: null,
  },
  "text-over-vis": {
    preset: "scrolly-overlay",
    axis: "vertical",
    binding: "float-to-text",
    container: "vis-container",
    overlap: "text-over-vis",
  },
  "vis-container": {
    preset: "vis-container",
    axis: "vertical",
    binding: "fixed-to-text",
    container: "vis-container",
    overlap: null,
  },
};

const STARTER_LAYOUT_DEFAULTS = {
  "side-by-side": {
    axis: "horizontal",
    binding: "fixed-to-text",
    container: "vis-container",
    overlap: null,
  },
};

const HORIZONTAL_FLOW_LAYOUTS = new Set(["scrolly-bottom", "scrolly-top"]);
const HORIZONTAL_FLOW_EQUIVALENTS = {
  "scrolly-left": "scrolly-top",
  "scrolly-right": "scrolly-bottom",
};
const VERTICAL_FLOW_EQUIVALENTS = {
  "scrolly-bottom": "scrolly-right",
  "scrolly-top": "scrolly-left",
};

function slugify(value) {
  return String(value ?? "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeTokenList(value) {
  if (value == null) {
    return [];
  }

  return Array.isArray(value) ? value.filter(Boolean) : [value];
}

function normalizeSourceEntry(entry) {
  if (!entry) {
    return null;
  }

  if (entry.id && entry.path) {
    return {
      id: entry.id,
      path: entry.path,
    };
  }

  const pairs = Object.entries(entry);
  if (pairs.length !== 1) {
    return null;
  }

  const [id, path] = pairs[0];
  if (!id || !path) {
    return null;
  }

  return { id, path };
}

function normalizeDataSources(frontmatter, warnings) {
  const dataConfig = frontmatter.data;

  if (Array.isArray(dataConfig?.sources)) {
    return dataConfig.sources
      .map(normalizeSourceEntry)
      .filter(Boolean);
  }

  if (dataConfig && !Array.isArray(dataConfig) && !("sources" in dataConfig)) {
    return Object.entries(dataConfig)
      .filter(([, path]) => typeof path === "string" && path)
      .map(([id, path]) => ({ id, path }));
  }

  if (Array.isArray(dataConfig)) {
    return dataConfig.map(normalizeSourceEntry).filter(Boolean);
  }

  if (dataConfig?.sources) {
    warnings.push("Some data sources could not be normalized. Use either `data.sources`, `data: { id: path }`, or `data: - id: path`.");
  }

  return [];
}

function normalizeChrome(frontmatter) {
  const chrome = frontmatter.chrome ?? {};

  if (chrome === true) {
    return {
      bottomNav: true,
      themeToggle: true,
    };
  }

  return {
    bottomNav: Boolean(chrome.bottom_nav ?? chrome.bottomNav),
    themeToggle: Boolean(chrome.theme_toggle ?? chrome.themeToggle),
  };
}

function normalizeStructure(rawStructure, warnings) {
  if (rawStructure == null) {
    return {
      family: "linear",
      pattern: "burger",
      runtimeSupport: STARTER_SUPPORT.structure.linear,
    };
  }

  const structure =
    typeof rawStructure === "string" ? { family: rawStructure } : { ...rawStructure };

  const pattern = structure.pattern ?? null;
  const inferredFamily = pattern ? getStructureFamilyFromPattern(pattern) : null;
  const family = structure.family ?? inferredFamily ?? "linear";

  if (!KNOWN_STRUCTURE_FAMILIES.has(family)) {
    warnings.push(`Unsupported structure family "${family}". Falling back to "linear".`);

    return {
      family: "linear",
      pattern: "burger",
      runtimeSupport: STARTER_SUPPORT.structure.linear,
    };
  }

  if (pattern && !KNOWN_STRUCTURE_PATTERNS.has(pattern)) {
    warnings.push(`Unknown structure pattern "${pattern}". Ignoring it.`);
  }

  const runtimeSupport = STARTER_SUPPORT.structure[pattern] ?? STARTER_SUPPORT.structure[family];

  if (runtimeSupport && runtimeSupport !== "supported") {
    warnings.push(
      `Structure "${pattern ?? family}" is stored as design-space metadata, but the starter still renders a linear page flow.`
    );
  }

  return {
    family,
    pattern: pattern && KNOWN_STRUCTURE_PATTERNS.has(pattern) ? pattern : null,
    runtimeSupport: runtimeSupport ?? "metadata",
  };
}

function normalizeLayoutMetadata(rawLayout, warnings, title) {
  const layoutConfig =
    typeof rawLayout === "string"
      ? { preset: rawLayout, name: SUPPORTED_LAYOUT_NAMES.has(rawLayout) ? rawLayout : null }
      : rawLayout ?? {};
  const layoutName = layoutConfig.name ?? null;
  const side = layoutConfig.side === "left" ? "left" : "right";
  const nameAlias = layoutName ? LAYOUT_NAME_ALIASES[layoutName] ?? null : null;

  let requestedLayout = layoutConfig.preset ?? "chapter";

  if (layoutName === "float-to-text" || layoutName === "fixed-to-text") {
    requestedLayout = side === "left" ? "scrolly-left" : "scrolly-right";
  } else if (nameAlias) {
    requestedLayout = nameAlias.preset;
  }

  const defaults = getLayoutPresetMetadata(requestedLayout) ?? STARTER_LAYOUT_DEFAULTS[requestedLayout] ?? {};

  if (!SUPPORTED_LAYOUTS.has(requestedLayout)) {
    warnings.push(
      `Section "${title}" requested unsupported layout "${requestedLayout}". Falling back to "chapter".`
    );
  }

  const preset = SUPPORTED_LAYOUTS.has(requestedLayout) ? requestedLayout : "chapter";
  const axis = layoutConfig.axis ?? nameAlias?.axis ?? defaults.axis ?? "vertical";
  const binding =
    layoutConfig.binding ??
    (layoutName === "float-to-text"
      ? "float-to-text"
      : layoutName === "fixed-to-text"
        ? "fixed-to-text"
        : nameAlias?.binding ?? defaults.binding ?? "fixed-to-text");
  const container = layoutConfig.container ?? nameAlias?.container ?? defaults.container ?? "text-container";
  const overlap = layoutConfig.overlap ?? nameAlias?.overlap ?? defaults.overlap ?? null;

  if (layoutName && !SUPPORTED_LAYOUT_NAMES.has(layoutName)) {
    warnings.push(`Section "${title}" declared unknown layout name "${layoutName}". Ignoring it.`);
  }

  if (layoutName === "float-to-text" || layoutName === "fixed-to-text") {
    warnings.push(
      `Section "${title}" uses layout name "${layoutName}" and is currently rendered as "${preset}" using side "${side}".`
    );
  }

  if (!KNOWN_LAYOUT_AXES.has(axis)) {
    warnings.push(`Section "${title}" declared unknown layout axis "${axis}".`);
  }

  if (!KNOWN_LAYOUT_BINDINGS.has(binding)) {
    warnings.push(`Section "${title}" declared unknown layout binding "${binding}".`);
  }

  if (!KNOWN_LAYOUT_CONTAINERS.has(container)) {
    warnings.push(`Section "${title}" declared unknown layout container "${container}".`);
  }

  if (overlap != null && !KNOWN_LAYOUT_OVERLAPS.has(overlap)) {
    warnings.push(`Section "${title}" declared unknown layout overlap "${overlap}".`);
  }

  return {
    name: layoutName,
    preset,
    side: layoutName === "float-to-text" || layoutName === "fixed-to-text" ? side : null,
    axis,
    binding,
    container,
    overlap,
    runtimeSupport: STARTER_SUPPORT.layout[preset] ?? "planned",
  };
}

function normalizeScene(requestedScene, warnings, title) {
  const scene = requestedScene ?? "observation";

  if (!KNOWN_SCENES.has(scene)) {
    warnings.push(`Section "${title}" declared unknown scene "${scene}". Falling back to "observation".`);
    return "observation";
  }

  return scene;
}

function normalizeSegue(value, warnings, title) {
  if (value == null) {
    return null;
  }

  if (!KNOWN_SEGUES.has(value)) {
    warnings.push(`Section "${title}" declared unknown segue "${value}". Ignoring it.`);
    return null;
  }

  return value;
}

function normalizeActionAffordances(value, warnings, title) {
  const affordances = normalizeTokenList(value);

  affordances.forEach((affordance) => {
    if (!KNOWN_ACTION_AFFORDANCES.has(affordance)) {
      warnings.push(`Section "${title}" declared unknown action affordance "${affordance}".`);
    }
  });

  return affordances.filter((affordance) => KNOWN_ACTION_AFFORDANCES.has(affordance));
}

function normalizeActionTrigger(value, warnings, title, hasSteps) {
  const trigger = value ?? (hasSteps ? "step" : "scroll");

  if (!KNOWN_ACTION_TRIGGERS.has(trigger)) {
    warnings.push(
      `Section "${title}" declared unknown action trigger "${trigger}". Falling back to "${hasSteps ? "step" : "scroll"}".`
    );
    return hasSteps ? "step" : "scroll";
  }

  return trigger;
}

function normalizeStepEntry(entry) {
  if (typeof entry === "string") {
    return {
      body: entry,
    };
  }

  if (!entry || typeof entry !== "object") {
    return null;
  }

  const body =
    typeof entry.body === "string"
      ? entry.body
      : typeof entry.text === "string"
        ? entry.text
        : "";

  if (!body.trim()) {
    return null;
  }

  const normalized = {
    body,
  };

  Object.entries(entry).forEach(([key, value]) => {
    if (key === "body" || key === "text" || value == null || value === "") {
      return;
    }

    normalized[key] = value;
  });

  return normalized;
}

function normalizeSection(section, index, warnings) {
  const config = section.config ?? {};
  const layoutMeta = normalizeLayoutMetadata(config.layout, warnings, section.title);
  const chapterFlow = config.chapter?.flow ?? null;
  const requestedVis = config.vis?.type ?? "html";
  const id = config.id ?? (slugify(section.title) || `section-${index + 1}`);
  const summary = config.copy?.summary ?? "";
  const steps = Array.isArray(config.copy?.steps)
    ? config.copy.steps.map(normalizeStepEntry).filter(Boolean)
    : [];
  const hasSteps = steps.length > 0;
  const scene = normalizeScene(config.scene, warnings, section.title);
  const trigger = normalizeActionTrigger(config.action?.trigger, warnings, section.title, hasSteps);
  const affordances = normalizeActionAffordances(
    config.action?.affordance ?? config.action?.affordances,
    warnings,
    section.title
  );
  const segue = normalizeSegue(config.transition?.segue, warnings, section.title);
  const layoutAxis = chapterFlow ?? layoutMeta.axis;

  if (chapterFlow != null && !KNOWN_LAYOUT_AXES.has(chapterFlow)) {
    warnings.push(`Section "${section.title}" declared unknown chapter flow "${chapterFlow}".`);
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
    raw: section.raw ?? "",
    headline: config.headline ?? section.title,
    dek: config.dek ?? "",
    layout: layoutMeta.preset,
    chapter: {
      flow: KNOWN_LAYOUT_AXES.has(layoutAxis) ? layoutAxis : layoutMeta.axis,
      explicitFlow: KNOWN_LAYOUT_AXES.has(chapterFlow) ? chapterFlow : null,
      isAnchor: false,
    },
    scene,
    action: {
      trigger,
      affordances,
    },
    transition: {
      type: config.transition?.type ?? (hasSteps ? "step" : "none"),
      segue,
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
      steps,
      annotations: Array.isArray(config.copy?.annotations) ? config.copy.annotations : [],
    },
    designSpace: {
      layout: {
        ...layoutMeta,
        axis: KNOWN_LAYOUT_AXES.has(layoutAxis) ? layoutAxis : layoutMeta.axis,
      },
      transition: {
        scene,
        segue,
      },
      action: {
        trigger,
        affordances,
      },
      chapter: {
        flow: KNOWN_LAYOUT_AXES.has(layoutAxis) ? layoutAxis : layoutMeta.axis,
      },
    },
  };
}

function resolveLayoutForFlow(section, warnings) {
  const flow = section.chapter?.flow ?? "vertical";
  let layout = section.layout;

  if (flow === "horizontal" && HORIZONTAL_FLOW_EQUIVALENTS[layout]) {
    const nextLayout = HORIZONTAL_FLOW_EQUIVALENTS[layout];
    warnings.push(
      `Section "${section.title}" uses "${layout}" inside a horizontal chapter. Use "${nextLayout}" for horizontal-flow scrolly sections.`
    );
    layout = nextLayout;
  }

  if (flow !== "horizontal" && HORIZONTAL_FLOW_LAYOUTS.has(layout)) {
    const nextLayout = VERTICAL_FLOW_EQUIVALENTS[layout];
    warnings.push(
      `Section "${section.title}" uses "${layout}" outside a horizontal chapter. Falling back to "${nextLayout}".`
    );
    layout = nextLayout;
  }

  const layoutMeta = getLayoutPresetMetadata(layout) ?? section.designSpace.layout;

  return {
    ...section,
    layout,
    designSpace: {
      ...section.designSpace,
      layout: {
        ...section.designSpace.layout,
        ...layoutMeta,
        preset: layout,
        axis: flow === "horizontal" ? "horizontal" : layoutMeta.axis ?? section.designSpace.layout.axis,
      },
      chapter: {
        flow,
      },
    },
  };
}

function applyChapterFlow(sections, warnings) {
  let currentFlow = "vertical";

  return sections.map((section) => {
    const explicitFlow = section.chapter?.explicitFlow ?? null;

    if (explicitFlow) {
      currentFlow = explicitFlow;
    }

    const withFlow = {
      ...section,
      chapter: {
        flow: currentFlow,
        explicitFlow,
        isAnchor: Boolean(explicitFlow),
      },
      designSpace: {
        ...section.designSpace,
        layout: {
          ...section.designSpace.layout,
          axis: currentFlow,
        },
        chapter: {
          flow: currentFlow,
        },
      },
    };

    return resolveLayoutForFlow(withFlow, warnings);
  });
}

export function normalizeStory(parsed) {
  const warnings = [];
  const frontmatter = parsed.frontmatter ?? {};
  const structureMeta = normalizeStructure(frontmatter.structure, warnings);

  return {
    title: frontmatter.title ?? "Untitled Scrollytale",
    structure: structureMeta.family,
    data: {
      sources: normalizeDataSources(frontmatter, warnings),
    },
    customStyle: frontmatter.custom_style ?? "./src/styles/custom.css",
    chrome: normalizeChrome(frontmatter),
    designSpace: {
      structure: structureMeta,
    },
    sections: applyChapterFlow(
      parsed.sections.map((section, index) => normalizeSection(section, index, warnings)),
      warnings
    ),
    warnings,
  };
}
