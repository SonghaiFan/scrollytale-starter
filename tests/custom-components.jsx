import React from "react";
export function Scrolly({ children }) {
  return <section data-testid="custom-scrolly">{children}</section>;
}
export function Step({ children }) {
  return <article data-testid="custom-step">{children}</article>;
}
