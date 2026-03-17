import yaml from "js-yaml";

function parseFrontmatter(source) {
  const match = source.match(/^---\n([\s\S]*?)\n---\n*/);
  if (!match) {
    return { frontmatter: {}, body: source };
  }

  return {
    frontmatter: yaml.load(match[1]) ?? {},
    body: source.slice(match[0].length),
  };
}

function splitSections(body) {
  const matches = [...body.matchAll(/^##\s+(.+)$/gm)];

  return matches.map((match, index) => {
    const title = match[1].trim();
    const start = match.index + match[0].length;
    const end = index + 1 < matches.length ? matches[index + 1].index : body.length;
    const raw = body.slice(start, end).trim();
    return { title, raw };
  });
}

function parseSectionContent(section) {
  const blockMatch = section.raw.match(/^```yaml\s*\n([\s\S]*?)\n```\s*([\s\S]*)$/);

  if (!blockMatch) {
    return {
      title: section.title,
      config: {},
      body: section.raw.trim(),
    };
  }

  return {
    title: section.title,
    config: yaml.load(blockMatch[1]) ?? {},
    body: blockMatch[2].trim(),
  };
}

export function parseStory(source) {
  const { frontmatter, body } = parseFrontmatter(source);
  const sections = splitSections(body).map(parseSectionContent);

  return {
    frontmatter,
    sections,
  };
}

