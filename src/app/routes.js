function trimTrailingSlash(pathname) {
  if (!pathname || pathname === "/") {
    return "/";
  }

  return pathname.replace(/\/+$/, "") || "/";
}

export function getRouteState(pathname = window.location.pathname) {
  const normalized = trimTrailingSlash(pathname);

  if (normalized.endsWith("/authoring")) {
    const basePath = normalized.slice(0, -"/authoring".length) || "/";
    return {
      mode: "authoring",
      basePath,
    };
  }

  return {
    mode: "presenting",
    basePath: normalized,
  };
}

export function getModeHref(basePath, mode) {
  const normalizedBase = trimTrailingSlash(basePath);

  if (mode === "authoring") {
    return normalizedBase === "/" ? "/authoring" : `${normalizedBase}/authoring`;
  }

  return normalizedBase === "/" ? "/" : `${normalizedBase}/`;
}
