import React from "react";
import { Scrolly, Step } from "./components/story.jsx";

function StoryDocument({ children }) {
  return <div className="mdx-document">{children}</div>;
}
const components = { Scrolly, Step, wrapper: StoryDocument };
// MDX's provider hook supplies defaults; lexical imports and components props still win.
export function useMDXComponents() {
  return components;
}
