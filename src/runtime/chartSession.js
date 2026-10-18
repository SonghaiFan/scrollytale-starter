// Every session owns a distinct DOM mount. Stale async work can never paint into its replacement.
export function createChartSession({
  host,
  states,
  sequence,
  transition,
  onReady,
  onError,
}) {
  const mount = document.createElement("div");
  mount.className = "chart-mount";
  host.append(mount);
  let disposed = false;
  let controller;
  let latestPosition = 0;
  let lastApplied;
  function seek(value) {
    if (!Number.isFinite(value))
      throw new Error("Chart position must be finite.");
    latestPosition = Math.max(0, Math.min(states.length - 1, value));
    if (disposed || !controller || latestPosition === lastApplied) return;
    controller.progress(states.length === 1 ? 1 : latestPosition);
    lastApplied = latestPosition;
    mount.dataset.position = String(latestPosition);
  }
  const ready = Promise.resolve()
    .then(async () => {
      if (disposed) return;
      const options = { target: mount, width: "auto", height: "auto" };
      const next = await (states.length === 1
        ? transition(states[0], states[0], options)
        : sequence(states, options));
      if (disposed) {
        next.destroy();
        return;
      }
      controller = next;
      seek(latestPosition);
      onReady?.();
    })
    .catch((error) => {
      if (!disposed) onError?.(error);
    });
  return {
    ready,
    seek,
    resize() {
      if (disposed || !controller) return;
      controller.resize();
      lastApplied = undefined;
      seek(latestPosition);
    },
    destroy() {
      if (disposed) return;
      disposed = true;
      controller?.destroy();
      mount.remove();
    },
  };
}
