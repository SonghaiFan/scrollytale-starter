function iconPath(filename) {
  return `/design-space/icons/${filename}`;
}

export const DESIGN_SPACE = {
  structure: {
    families: ["linear", "non-linear"],
    patterns: [
      { id: "magazine", family: "linear", label: "Magazine" },
      { id: "tail", family: "linear", label: "Tail" },
      { id: "toe", family: "linear", label: "Toe" },
      { id: "burger", family: "linear", label: "Burger" },
      { id: "parallel", family: "non-linear", label: "Parallel" },
      { id: "bypass", family: "non-linear", label: "Bypass" },
      { id: "branch", family: "non-linear", label: "Branch" },
      { id: "merge", family: "non-linear", label: "Merge" },
    ],
  },
  layout: {
    axes: ["vertical", "horizontal"],
    bindings: ["float-to-text", "fixed-to-text"],
    containers: ["text-container", "vis-container"],
    overlaps: ["text-over-vis", "vis-over-text"],
    presets: {
      hero: {
        axis: "vertical",
        binding: "fixed-to-text",
        container: "text-container",
        overlap: "text-over-vis",
      },
      "scrolly-left": {
        axis: "vertical",
        binding: "float-to-text",
        container: "vis-container",
        overlap: null,
      },
      "scrolly-right": {
        axis: "vertical",
        binding: "float-to-text",
        container: "vis-container",
        overlap: null,
      },
      "full-width": {
        axis: "vertical",
        binding: "fixed-to-text",
        container: "text-container",
        overlap: null,
      },
    },
  },
  transition: {
    scenes: [
      { id: "focus", label: "Focus", icon: iconPath("p2-icon-focus.png") },
      { id: "guide", label: "Guide", icon: iconPath("p2-icon-guide.png") },
      { id: "granularity", label: "Granularity", icon: iconPath("p2-icon-granularity.png") },
      { id: "observation", label: "Observation", icon: iconPath("p2-icon-observation.png") },
    ],
    segues: [
      {
        id: "point-to-line",
        label: "Point to Line",
        icon: iconPath("p2-icon-point-to-line.png"),
      },
      {
        id: "line-to-area",
        label: "Line to Area",
        icon: iconPath("p2-icon-line-to-area.png"),
      },
      { id: "morph", label: "Morph", icon: iconPath("p2-icon-morph.png") },
      {
        id: "division-merge",
        label: "Division / Merge",
        icon: iconPath("p2-icon-merge.png"),
      },
      { id: "pack-unpack", label: "Pack / Unpack", icon: iconPath("p2-icon-unpack.png") },
    ],
  },
  action: {
    affordances: [
      { id: "header", label: "Header", icon: iconPath("p2-icon-header.png") },
      { id: "in-line", label: "In-line", icon: iconPath("p2-icon-in-line.png") },
      { id: "tooltip", label: "Tooltip", icon: iconPath("p2-icon-tooltip.png") },
    ],
    triggers: [
      { id: "enter", label: "Enter", icon: iconPath("p2-icon-enter.png") },
      { id: "exit", label: "Exit", icon: iconPath("p2-icon-exit.png") },
      { id: "step", label: "Step", icon: iconPath("p2-icon-step.png") },
      { id: "scroll", label: "Scroll", icon: iconPath("p2-icon-scroll.png") },
    ],
  },
};

export const STARTER_SUPPORT = {
  structure: {
    linear: "supported",
    "non-linear": "metadata",
    parallel: "metadata",
    bypass: "metadata",
    branch: "metadata",
    merge: "metadata",
  },
  layout: {
    hero: "supported",
    "scrolly-left": "supported",
    "scrolly-right": "supported",
    "full-width": "supported",
    "scrolly-overlay": "planned",
  },
  transition: {
    focus: "supported",
    guide: "supported",
    granularity: "metadata",
    observation: "supported",
    "point-to-line": "metadata",
    "line-to-area": "metadata",
    morph: "metadata",
    "division-merge": "metadata",
    "pack-unpack": "metadata",
  },
  action: {
    header: "planned",
    "in-line": "planned",
    tooltip: "planned",
    enter: "metadata",
    exit: "metadata",
    step: "supported",
    scroll: "supported",
  },
};

export const KNOWN_STRUCTURE_FAMILIES = new Set(DESIGN_SPACE.structure.families);
export const KNOWN_STRUCTURE_PATTERNS = new Set(
  DESIGN_SPACE.structure.patterns.map((pattern) => pattern.id)
);
export const KNOWN_LAYOUT_AXES = new Set(DESIGN_SPACE.layout.axes);
export const KNOWN_LAYOUT_BINDINGS = new Set(DESIGN_SPACE.layout.bindings);
export const KNOWN_LAYOUT_CONTAINERS = new Set(DESIGN_SPACE.layout.containers);
export const KNOWN_LAYOUT_OVERLAPS = new Set(DESIGN_SPACE.layout.overlaps);
export const KNOWN_SCENES = new Set(DESIGN_SPACE.transition.scenes.map((scene) => scene.id));
export const KNOWN_SEGUES = new Set(DESIGN_SPACE.transition.segues.map((segue) => segue.id));
export const KNOWN_ACTION_AFFORDANCES = new Set(
  DESIGN_SPACE.action.affordances.map((action) => action.id)
);
export const KNOWN_ACTION_TRIGGERS = new Set(
  DESIGN_SPACE.action.triggers.map((trigger) => trigger.id)
);

export function getStructureFamilyFromPattern(pattern) {
  return DESIGN_SPACE.structure.patterns.find((item) => item.id === pattern)?.family ?? null;
}

export function getLayoutPresetMetadata(preset) {
  return DESIGN_SPACE.layout.presets[preset] ?? null;
}
