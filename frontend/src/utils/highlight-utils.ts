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
  const regex = new RegExp(`(${escaped})`, "gi");
  const parts = text.split(regex);

  return parts
    .filter((part) => part.length > 0)
    .map((part) => ({
      text: part,
      isMatch: regex.test(part),
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
  const regex = new RegExp(`(${escaped})`, "gi");
  const parts = text.split(regex);

  const children = parts
    .filter((part) => part.length > 0)
    .map((part, idx) =>
      regex.test(part)
        ? createElement("mark", {
            key: idx,
            className: "bg-yellow-400/30 text-yellow-100 font-semibold rounded px-0.5 py-0.5",
          }, part)
        : createElement("span", { key: idx }, part)
    );

  return createElement(Fragment, null, ...children);
}

