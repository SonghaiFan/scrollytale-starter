import * as aq from "arquero";

function getSourceType(path) {
  const value = String(path ?? "").toLowerCase();

  if (value.endsWith(".json")) {
    return "json";
  }

  return "csv";
}

export async function loadSources(sourceConfigs) {
  const entries = await Promise.all(
    sourceConfigs.map(async (source) => {
      if (!source?.id || !source?.path) {
        throw new Error("Every data source needs both an id and a path.");
      }

      const sourceType = getSourceType(source.path);
      const table =
        sourceType === "json"
          ? await aq.loadJSON(source.path)
          : await aq.loadCSV(source.path, { autoType: true });

      return [source.id, table.objects()];
    })
  );

  return Object.fromEntries(entries);
}
