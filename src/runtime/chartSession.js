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
  let playing = false;
  let pendingPlay;
  function seek(value) {
    if (!Number.isFinite(value))
      throw new Error("Chart position must be finite.");
    playing = false;
    pendingPlay = undefined;
    latestPosition = Math.max(0, Math.min(states.length - 1, value));
    if (disposed || !controller || latestPosition === lastApplied) return;
    controller.progress(states.length === 1 ? 1 : latestPosition);
    lastApplied = latestPosition;
    mount.dataset.position = String(latestPosition);
  }
  function playTo(value, duration = 800) {
    if (!Number.isFinite(value) || !Number.isFinite(duration) || duration < 0)
      throw new Error("Playback destination and duration must be finite; duration must be nonnegative.");
    if (disposed) return;
    const to = Math.max(0, Math.min(states.length - 1, value));
    if (!controller) {
      pendingPlay = { to, duration };
      return;
    }
    if (states.length === 1) return seek(0);
    playing = true;
    lastApplied = undefined;
    controller.play({ to, duration });
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
      const queued = pendingPlay;
      seek(latestPosition);
      if (queued) playTo(queued.to, queued.duration);
      onReady?.();
    })
    .catch((error) => {
      if (!disposed) onError?.(error);
    });
  return {
    ready,
    seek,
    playTo,
    get value() { return controller?.value ?? latestPosition; },
    resize() {
      if (disposed || !controller) return;
      controller.resize();
      if (playing) return;
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
