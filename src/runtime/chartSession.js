// Each prepared controller owns a private mount; async replacements never paint into the live chart.
export function createChartSession({ host, states, sequence, transition, chartStyle, onReady, onPreparing, onError }) {
  let disposed = false;
  let generation = 0;
  let current;
  let selectedStyle = chartStyle;
  let latestPosition = 0;
  let lastApplied;
  let playback;
  let pending;
  const mounts = new Set();
  const clamp = value => Math.max(0, Math.min(states.length - 1, value));
  function remove(slot) {
    if (slot.removed) return;
    slot.removed = true;
    slot.controller?.destroy();
    slot.mount.remove();
    mounts.delete(slot);
  }
  function seek(value) {
    if (!Number.isFinite(value)) throw new Error("Chart position must be finite.");
    playback = undefined;
    latestPosition = clamp(value);
    if (disposed || !current || latestPosition === lastApplied) return;
    current.controller.progress(states.length === 1 ? 1 : latestPosition);
    lastApplied = latestPosition;
    current.mount.dataset.position = String(latestPosition);
  }
  function playTo(value, duration = 800) {
    if (!Number.isFinite(value) || !Number.isFinite(duration) || duration < 0)
      throw new Error("Playback destination and duration must be finite; duration must be nonnegative.");
    if (disposed) return;
    if (states.length === 1) return seek(0);
    playback = { to: clamp(value), duration };
    lastApplied = undefined;
    current?.controller.play(playback);
  }
  function prepare(style) {
    const token = ++generation;
    const mount = document.createElement("div");
    mount.className = "chart-mount";
    // Retain the visible chart while its successor is compiled at the same dimensions.
    mount.style.visibility = "hidden";
    mount.style.position = "absolute";
    mount.style.inset = "0";
    const slot = { mount, controller: undefined, removed: false };
    mounts.add(slot);
    host.append(mount);
    onPreparing?.();
    return Promise.resolve().then(async () => {
      if (disposed || token !== generation) { remove(slot); return; }
      const options = { target: mount, width: "auto", height: "auto", ...(style === undefined ? {} : { chartStyle: style }) };
      const next = await (states.length === 1
        ? transition(states[0], states[0], options)
        : sequence(states, options));
      if (disposed || token !== generation) {
        next.destroy();
        remove(slot);
        return;
      }
      slot.controller = next;
      if (current) next.resize();
      const value = states.length === 1 ? 0 : current?.controller.value ?? latestPosition;
      next.progress(states.length === 1 ? 1 : value);
      if (playback && value !== playback.to) next.play(playback);
      const previous = current;
      current = slot;
      latestPosition = value;
      lastApplied = playback ? undefined : value;
      mount.dataset.position = String(value);
      mount.style.visibility = "";
      mount.style.position = "";
      mount.style.inset = "";
      if (previous) remove(previous);
      onReady?.();
    }).catch(error => {
      remove(slot);
      if (!disposed && token === generation) onError?.(error);
    });
  }
  pending = prepare(chartStyle);
  return {
    get ready() { return pending; },
    seek,
    playTo,
    get value() { return states.length === 1 ? 0 : current?.controller.value ?? latestPosition; },
    setChartStyle(style) {
      if (disposed || style === selectedStyle) return pending;
      selectedStyle = style;
      pending = prepare(style);
      return pending;
    },
    resize() {
      if (disposed || !current) return;
      current.controller.resize();
      if (playback) return;
      lastApplied = undefined;
      seek(latestPosition);
    },
    destroy() {
      if (disposed) return;
      disposed = true;
      for (const slot of [...mounts]) remove(slot);
    },
  };
}
