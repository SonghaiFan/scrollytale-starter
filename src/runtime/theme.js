export function getStoredTheme() {
  return localStorage.getItem("theme") ?? "light";
}

export function applyTheme(theme) {
  const nextTheme = theme === "dark" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", nextTheme);
  localStorage.setItem("theme", nextTheme);
  return nextTheme;
}
