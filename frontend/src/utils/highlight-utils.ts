/**
 * Utility functions for highlighting search terms in text.
 */
import { createElement, Fragment } from "react";

/**
 * Splits text into parts, marking matches of searchTerm.
 * Returns an array of { text: string, isMatch: boolean }
 */
export function getHighlightParts(text: string, searchTerm: string) {
  if (!text || !searchTerm.trim()) {
    return [{ text, isMatch: false }];
  }

  // Escape special regex characters
  const escaped = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const splitRegex = new RegExp(`(${escaped})`, "gi");
  const matchRegex = new RegExp(`^(${escaped})$`, "i");
  const parts = text.split(splitRegex);

  return parts
    .filter((part) => part.length > 0)
    .map((part) => ({
      text: part,
      isMatch: matchRegex.test(part),
    }));
}

/**
 * Returns React JSX element with matched text wrapped in highlight styling.
 */
export function highlightText(text: string, searchTerm: string): React.ReactNode {
  if (!text || !searchTerm.trim()) {
    return text;
  }

  const escaped = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const splitRegex = new RegExp(`(${escaped})`, "gi");
  const matchRegex = new RegExp(`^(${escaped})$`, "i");
  const parts = text.split(splitRegex);

  const children = parts
    .filter((part) => part.length > 0)
    .map((part, idx) =>
      matchRegex.test(part)
        ? createElement("mark", {
            key: idx,
            className: "bg-yellow-400/30 text-yellow-100 font-semibold rounded px-0.5 py-0.5",
          }, part)
        : createElement("span", { key: idx }, part)
    );

  return createElement(Fragment, null, ...children);
}

