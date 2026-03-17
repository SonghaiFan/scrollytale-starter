import * as d3 from "d3";

export async function loadSources(sourceConfigs) {
  const entries = await Promise.all(
    sourceConfigs.map(async (source) => {
      if (!source?.id || !source?.path) {
        throw new Error("Every data source needs both an id and a path.");
      }

      const rows = await d3.csv(source.path, d3.autoType);
      return [source.id, rows];
    })
  );

  return Object.fromEntries(entries);
}

