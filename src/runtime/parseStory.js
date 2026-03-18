import yaml from "js-yaml";

const FRONTMATTER_RE = /^---\n([\s\S]*?)\n---\n*/;
const LEGACY_SECTION_RE = /^##\s+(.+)$/gm;
const SECTION_FRONTMATTER_RE = /^---\n([\s\S]*?)\n---\n*/gm;
const DIRECTIVE_RE =
  /^::(vis|step|annotation)(?:\{([^}]*)\})?[ \t]*\n([\s\S]*?)^::[ \t]*$/gm;
const VIS_CODE_BLOCK_RE = /```(plot|vega-lite|vegalite|vl)\s*\n([\s\S]*?)\n```/gm;

function parseYamlBlock(source) {
  return yaml.load(source) ?? {};
}

function parseFrontmatter(source) {
  const match = source.match(FRONTMATTER_RE);
  if (!match) {
    return { frontmatter: {}, body: source };
  }

  return {
    frontmatter: parseYamlBlock(match[1]),
    body: source.slice(match[0].length),
  };
}

function parseDirectiveAttributes(source = "") {
  const attributes = {};
  const attrRe = /([A-Za-z_][\w-]*)="([^"]*)"/g;

  for (const match of source.matchAll(attrRe)) {
    attributes[match[1]] = match[2];
  }

  return attributes;
}

function normalizeInlineVisConfig(rawVis, rawSectionConfig) {
  const sectionConfig = rawSectionConfig ?? {};
  const attributes = rawVis ?? {};
  const fields = {};
  const fieldKeys = ["x", "y", "series", "color", "group", "label", "value"];

  fieldKeys.forEach((key) => {
    const value = attributes[key] ?? sectionConfig[key];
    if (value != null) {
      fields[key] = value;
    }
  });

  const visType =
    typeof sectionConfig.vis === "string"
      ? sectionConfig.vis
      : sectionConfig.vis?.type ?? sectionConfig.chart ?? attributes.type ?? attributes.chart;

  const dataSource =
    attributes.data ??
    attributes.source ??
    (typeof sectionConfig.data === "string"
      ? sectionConfig.data
      : sectionConfig.vis?.data?.source ?? sectionConfig.data?.source);

  if (!visType && !dataSource && !Object.keys(fields).length) {
    return null;
  }

  return {
    type: visType ?? "html",
    data: {
      source: dataSource ?? null,
    },
    fields,
    options:
      typeof sectionConfig.vis === "object" && sectionConfig.vis?.options
        ? sectionConfig.vis.options
        : {},
  };
}

function normalizeFrameworkVisConfig(rawBlock, rawSectionConfig) {
  if (!rawBlock?.source) {
    return null;
  }

  const sectionConfig = rawSectionConfig ?? {};
  const fields = {};
  const fieldKeys = ["x", "y", "series", "color", "group", "label", "value"];

  fieldKeys.forEach((key) => {
    const value = sectionConfig[key] ?? sectionConfig.vis?.fields?.[key];
    if (value != null) {
      fields[key] = value;
    }
  });

  const visType =
    typeof sectionConfig.vis === "string"
      ? sectionConfig.vis
      : sectionConfig.vis?.type ?? sectionConfig.chart ?? rawBlock.framework;

  const dataSource =
    typeof sectionConfig.data === "string"
      ? sectionConfig.data
      : sectionConfig.vis?.data?.source ?? sectionConfig.data?.source ?? null;

  return {
    type: visType ?? rawBlock.framework,
    data: {
      source: dataSource,
    },
    fields,
    options: {
      ...(typeof sectionConfig.vis === "object" ? sectionConfig.vis?.options ?? {} : {}),
      source: rawBlock.source,
      framework: rawBlock.framework,
    },
  };
}

function mergeVisConfigs(baseConfig, overrideConfig) {
  if (!baseConfig && !overrideConfig) {
    return null;
  }

  if (!baseConfig) {
    return overrideConfig;
  }

  if (!overrideConfig) {
    return baseConfig;
  }

  return {
    ...baseConfig,
    ...overrideConfig,
    data: {
      ...(baseConfig.data ?? {}),
      ...(overrideConfig.data ?? {}),
    },
    fields: {
      ...(baseConfig.fields ?? {}),
      ...(overrideConfig.fields ?? {}),
    },
    options: {
      ...(baseConfig.options ?? {}),
      ...(overrideConfig.options ?? {}),
    },
  };
}

function normalizeVisFramework(language) {
  if (language === "vegalite" || language === "vl") {
    return "vega-lite";
  }

  return language;
}

function extractFrameworkVisBlocks(body) {
  let firstBlock = null;

  const cleanedBody = body.replace(VIS_CODE_BLOCK_RE, (_, rawLanguage = "", rawSource = "") => {
    if (!firstBlock) {
      firstBlock = {
        framework: normalizeVisFramework(rawLanguage.trim().toLowerCase()),
        source: rawSource.trim(),
      };
    }

    return "";
  });

  return {
    body: cleanedBody.replace(/\n{3,}/g, "\n\n").trim(),
    visBlock: firstBlock,
  };
}

function extractLeadingHeading(body) {
  const trimmed = body.trim();
  const headingMatch = trimmed.match(/^(#{1,6})\s+(.+?)\s*(?:\n+|$)/);

  if (!headingMatch) {
    return {
      headline: null,
      body: trimmed,
    };
  }

  return {
    headline: headingMatch[2].trim(),
    body: trimmed.slice(headingMatch[0].length).trim(),
  };
}

function extractBodyDirectives(body, baseConfig = {}) {
  let visConfig = null;
  const steps = [];
  const annotations = [];

  const cleanedBody = body.replace(
    DIRECTIVE_RE,
    (_, type, attrSource = "", rawContent = "") => {
      const content = rawContent.trim();

      if (type === "vis") {
        visConfig = mergeVisConfigs(
          visConfig,
          normalizeInlineVisConfig(parseDirectiveAttributes(attrSource), baseConfig)
        );
      }

      if (type === "step" && content) {
        const extractedStep = extractFrameworkVisBlocks(content);
        steps.push({
          ...parseDirectiveAttributes(attrSource),
          body: extractedStep.body,
          ...(extractedStep.visBlock
            ? {
                vis: {
                  type: extractedStep.visBlock.framework,
                  source: extractedStep.visBlock.source,
                },
              }
            : {}),
        });
      }

      if (type === "annotation" && content) {
        annotations.push(content);
      }

      return "";
    }
  );

  const extractedBody = extractFrameworkVisBlocks(cleanedBody.replace(/\n{3,}/g, "\n\n").trim());

  return {
    body: extractedBody.body,
    visConfig,
    visBlock: extractedBody.visBlock,
    steps,
    annotations,
  };
}

function splitLegacySections(body) {
  const matches = [...body.matchAll(LEGACY_SECTION_RE)];

  return matches.map((match, index) => {
    const title = match[1].trim();
    const start = match.index + match[0].length;
    const end = index + 1 < matches.length ? matches[index + 1].index : body.length;
    const raw = body.slice(start, end).trim();

    return { title, raw };
  });
}

function parseLegacySection(section) {
  const blockMatch = section.raw.match(/^```yaml\s*\n([\s\S]*?)\n```\s*([\s\S]*)$/);

  if (!blockMatch) {
    return {
      title: section.title,
      config: {},
      body: section.raw.trim(),
      raw: section.raw.trim(),
    };
  }

  return {
    title: section.title,
    config: parseYamlBlock(blockMatch[1]),
    body: blockMatch[2].trim(),
    raw: [`## ${section.title}`, "", "```yaml", blockMatch[1], "```", "", blockMatch[2].trim()]
      .filter(Boolean)
      .join("\n"),
  };
}

function splitFrontmatterSections(body) {
  const source = body.trim();
  if (!source.startsWith("---\n")) {
    return [];
  }

  const matches = [...source.matchAll(SECTION_FRONTMATTER_RE)];
  if (!matches.length) {
    return [];
  }

  return matches.map((match, index) => {
    const config = parseYamlBlock(match[1]);
    const start = match.index + match[0].length;
    const end = index + 1 < matches.length ? matches[index + 1].index : source.length;
    const rawBody = source.slice(start, end).trim();

    return { config, rawConfig: match[1].trim(), rawBody };
  });
}

function parseFrontmatterSection(section, index) {
  const baseConfig = section.config ?? {};
  const extracted = extractBodyDirectives(section.rawBody, baseConfig);
  const heading = extractLeadingHeading(extracted.body);
  const baseVis = normalizeInlineVisConfig({}, baseConfig);
  const blockVis = normalizeFrameworkVisConfig(extracted.visBlock, baseConfig);
  const mergedVis = mergeVisConfigs(mergeVisConfigs(baseVis, extracted.visConfig), blockVis);
  const existingCopy = baseConfig.copy ?? {};

  const config = {
    ...baseConfig,
    headline: baseConfig.headline ?? heading.headline,
    vis: mergedVis ?? baseConfig.vis,
    copy: {
      ...existingCopy,
      steps: extracted.steps.length
        ? [...(Array.isArray(existingCopy.steps) ? existingCopy.steps : []), ...extracted.steps]
        : existingCopy.steps,
      annotations: extracted.annotations.length
        ? [
            ...(Array.isArray(existingCopy.annotations) ? existingCopy.annotations : []),
            ...extracted.annotations,
          ]
        : existingCopy.annotations,
    },
  };

  const title =
    baseConfig.title ??
    baseConfig.headline ??
    heading.headline ??
    baseConfig.id ??
    `Section ${index + 1}`;

  return {
    title,
    config,
    body: heading.body,
    raw: ["---", section.rawConfig, "---", "", section.rawBody.trim()].filter(Boolean).join("\n"),
  };
}

export function parseStory(source) {
  const { frontmatter, body } = parseFrontmatter(source);
  const frontmatterSections = splitFrontmatterSections(body);

  const sections = frontmatterSections.length
    ? frontmatterSections.map(parseFrontmatterSection)
    : splitLegacySections(body).map(parseLegacySection);

  return {
    frontmatter,
    sections,
  };
}
