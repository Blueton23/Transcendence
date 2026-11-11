import { useState, type KeyboardEvent } from "react";

export function useListKeyboard<T>(items: T[], onPick: (item: T) => void) {
  const [activeIndex, setActiveIndex] = useState(-1);

  function handleKeyDown(e: KeyboardEvent) {
    if (items.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % items.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? items.length - 1 : i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      onPick(items[activeIndex >= 0 ? activeIndex : 0]);
      setActiveIndex(-1);
    }
  }

  return { activeIndex, handleKeyDown, reset: () => setActiveIndex(-1) };
}
