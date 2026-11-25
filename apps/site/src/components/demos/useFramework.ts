import { useEffect, useState } from "react";
import { frameworks, type Framework } from "./code";

// Starlight's synced tabs, so the code under a demo and the tabs on the page
// always show the same framework, here and on the next page.
const TABS = 'starlight-tabs[data-sync-key="framework"] [role="tab"]';
const STORAGE = "starlight-synced-tabs__framework";

const read = (key: string) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};
const isFramework = (value: string | null | undefined): value is Framework =>
  frameworks.includes(value as Framework);

export function useFramework(): [Framework, (next: Framework) => void] {
  const [framework, setFramework] = useState<Framework>("React");

  useEffect(() => {
    const saved = read(STORAGE);
    if (read("glimmer-stack") === "js") setFramework("JavaScript");
    else if (isFramework(saved)) setFramework(saved);

    const onClick = (e: MouseEvent) => {
      const label = (e.target as Element).closest(TABS)?.textContent?.trim();
      if (isFramework(label)) setFramework(label);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return [
    framework,
    (next) => {
      setFramework(next);
      // Clicking the page's own tab switches and remembers it. JavaScript has none.
      const tab = [...document.querySelectorAll<HTMLElement>(TABS)].find((t) => t.textContent?.trim() === next);
      tab?.click();
    },
  ];
}
