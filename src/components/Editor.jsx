import React, { useEffect, useRef, useState } from "react";

async function request(route, body) {
  const response = await fetch(
    `/__authoring/${route}`,
    body === undefined
      ? {}
      : {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
  );
  const result = await response.json();
  if (!response.ok)
    throw new Error(result.error ?? "Authoring request failed.");
  return result;
}
export function Editor({ onPreview, hidden }) {
  const [source, setSource] = useState("");
  const [baseline, setBaseline] = useState("");
  const [version, setVersion] = useState("");
  const [message, setMessage] = useState("Loading story.mdx…");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const generation = useRef(0);
  const mounted = useRef(true);
  const sourceRef = useRef("");
  const dirty = source !== baseline;

  useEffect(() => {
    mounted.current = true;
    let cancelled = false;
    request("source")
      .then((result) => {
        if (cancelled) return;
        let saved;
        try {
          saved = JSON.parse(sessionStorage.getItem("scrollytale:draft"));
        } catch {
          /* Storage is optional. */
        }
        const restored =
          saved &&
          typeof saved.source === "string" &&
          typeof saved.baseline === "string" &&
          typeof saved.version === "string";
        const draft = restored ? saved.source : result.source;
        sourceRef.current = draft;
        setSource(draft);
        setBaseline(restored ? saved.baseline : result.source);
        setVersion(restored ? saved.version : result.version);
        setMessage(
          restored
            ? "Restored your unsaved draft. Preview or reload the disk version."
            : "Ready to write",
        );
      })
      .catch((reason) => {
        if (!cancelled) setError(reason.message);
      });
    return () => {
      cancelled = true;
      mounted.current = false;
      generation.current++;
    };
  }, []);
  useEffect(() => {
    if (!version) return;
    try {
      if (dirty)
        sessionStorage.setItem(
          "scrollytale:draft",
          JSON.stringify({ source, baseline, version }),
        );
      else sessionStorage.removeItem("scrollytale:draft");
    } catch {
      /* Editing remains available when browser storage is disabled. */
    }
  }, [source, baseline, version, dirty]);
  useEffect(() => {
    if (!import.meta.hot) return;
    const changed = () =>
      setMessage(
        "story.mdx changed on disk. Your draft is preserved; use Reload disk to read it.",
      );
    import.meta.hot.on("scrollytale:source-changed", changed);
    return () => import.meta.hot.off("scrollytale:source-changed", changed);
  }, []);
  useEffect(() => {
    if (!dirty) return;
    const beforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [dirty]);

  function edit(value) {
    generation.current++;
    sourceRef.current = value;
    setSource(value);
    setError("");
    setMessage("Draft changed");
  }
  async function preview(draft = sourceRef.current) {
    const token = ++generation.current;
    setBusy(true);
    setError("");
    setMessage("Compiling MDX…");
    try {
      const result = await request("preview", { source: draft });
      if (!mounted.current || token !== generation.current) return;
      const module = await import(/* @vite-ignore */ result.url);
      if (!mounted.current || token !== generation.current) return;
      if (typeof module.default !== "function")
        throw new Error("The document must export an MDX component.");
      onPreview(module);
      setMessage("Preview updated");
    } catch (reason) {
      if (mounted.current && token === generation.current) {
        setError(reason.message);
        setMessage("Preview kept at the last working document");
      }
    } finally {
      if (mounted.current) setBusy(false);
    }
  }
  async function save() {
    const draft = sourceRef.current;
    setBusy(true);
    setError("");
    setMessage("Saving…");
    try {
      const result = await request("save", { source: draft, version });
      if (!mounted.current) return;
      setVersion(result.version);
      setBaseline(draft);
      setMessage("Saved to story.mdx");
      // Never overwrite newer text or preview it with an older save response.
      if (sourceRef.current === draft) await preview(draft);
    } catch (reason) {
      if (mounted.current) {
        setError(reason.message);
        setMessage("Draft preserved");
      }
    } finally {
      if (mounted.current) setBusy(false);
    }
  }
  async function reloadDisk() {
    if (
      sourceRef.current !== baseline &&
      !window.confirm("Replace your unsaved draft with story.mdx from disk?")
    )
      return;
    const token = ++generation.current;
    setBusy(true);
    try {
      const result = await request("source");
      if (!mounted.current || token !== generation.current) return;
      sourceRef.current = result.source;
      setSource(result.source);
      setBaseline(result.source);
      setVersion(result.version);
      setError("");
      setMessage("Loaded disk version");
      await preview(result.source);
    } catch (reason) {
      if (mounted.current) setError(reason.message);
    } finally {
      if (mounted.current) setBusy(false);
    }
  }
  return (
    <aside className="editor" aria-label="MDX authoring" hidden={hidden}>
      <div className="editor-heading">
        <div>
          <p className="eyebrow">Authoring</p>
          <h2>
            story.mdx <span>{dirty ? "●" : "✓"}</span>
          </h2>
        </div>
        <span className="file-type">MDX</span>
      </div>
      <p className="editor-hint">
        Write Markdown. Import states. Compose a story.
      </p>
      <label className="sr-only" htmlFor="mdx-source">
        MDX source
      </label>
      <textarea
        id="mdx-source"
        spellCheck="false"
        value={source}
        onChange={(event) => edit(event.target.value)}
        disabled={!version}
      />
      <div className="editor-actions">
        <button onClick={() => preview()} disabled={busy || !version}>
          Preview draft
        </button>
        <button
          className="primary"
          onClick={save}
          disabled={busy || !version || !dirty}
        >
          Save file
        </button>
        <button onClick={reloadDisk} disabled={busy || !version}>
          Reload disk
        </button>
      </div>
      <p role="status" className="editor-message">
        {message}
      </p>
      {error ? (
        <pre className="error" role="alert">
          {error}
        </pre>
      ) : null}
      <p className="editor-footnote">
        Local trusted MDX modules · Changes are written only when you save.
      </p>
    </aside>
  );
}
