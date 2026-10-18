// Compare complete native declarations, never only chart type or destination.
// Module identity remains separate: equal specs can belong to different plugins.
export function sameDeclaration(a, b, seen = new WeakMap()) {
  if (Object.is(a, b)) return true;
  if (!a || !b || typeof a !== "object" || typeof b !== "object") return false;
  if (Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)) return false;
  if (a instanceof Date) return Object.is(a.getTime(), b.getTime());
  if (
    !Array.isArray(a) &&
    Object.getPrototypeOf(a) !== Object.prototype &&
    Object.getPrototypeOf(a) !== null
  )
    return false;
  if (seen.has(a)) return seen.get(a) === b;
  seen.set(a, b);
  const keys = Reflect.ownKeys(a);
  if (keys.length !== Reflect.ownKeys(b).length) return false;
  return keys.every(
    (key) => Object.hasOwn(b, key) && sameDeclaration(a[key], b[key], seen),
  );
}

export function retainChartDeclarations(previous, charts) {
  const cache = previous?.cache ?? new WeakMap();
  const specs = charts.map((chart) => {
    if (!cache.has(chart)) cache.set(chart, chart.toSpec());
    return cache.get(chart);
  });
  const modules = charts.map((chart) =>
    typeof chart.chartModule === "function" ? chart.chartModule() : chart,
  );
  if (
    previous &&
    previous.charts.length === charts.length &&
    modules.every((module, index) => module === previous.modules[index]) &&
    sameDeclaration(specs, previous.specs)
  )
    return previous;
  return { charts, specs, modules, cache };
}
