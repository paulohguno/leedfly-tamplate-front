"use client";

import { useSyncExternalStore, type MouseEvent } from "react";
import { flushSync } from "react-dom";
import { Button } from "@/components/ui";
import { useReducedMotion } from "@/lib/motion";

const THEME_KEY = "leedfly.theme";

export const THEME_SCRIPT = `(function(){try{if(localStorage.getItem("${THEME_KEY}")==="light"){document.documentElement.dataset.theme="light"}}catch(e){}})()`;

type Theme = "dark" | "light";

const REVEAL_DURATION = 560;

function subscribeTheme(onChange: () => void) {
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === "attributes" && mutation.attributeName === "data-theme") {
        onChange();
      }
    }
  });

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });

  window.addEventListener("storage", onChange);

  return () => {
    observer.disconnect();
    window.removeEventListener("storage", onChange);
  };
}

function getThemeSnapshot(): Theme {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

function getThemeServerSnapshot(): Theme {
  return "dark";
}

export function ThemeToggler() {
  const theme = useSyncExternalStore(subscribeTheme, getThemeSnapshot, getThemeServerSnapshot);
  const reduced = useReducedMotion();

  function apply(next: Theme) {
    if (next === "light") document.documentElement.dataset.theme = "light";
    else delete document.documentElement.dataset.theme;

    try {
      window.localStorage.setItem(THEME_KEY, next);
    } catch {}
  }

  function toggle(event: MouseEvent<HTMLButtonElement>) {
    const next: Theme = theme === "dark" ? "light" : "dark";
    const root = document.documentElement;

    if (reduced || typeof document.startViewTransition !== "function") {
      apply(next);
      return;
    }

    const box = event.currentTarget.getBoundingClientRect();
    const x = box.left + box.width / 2;
    const y = box.top + box.height / 2;
    const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

    root.dataset.transition = "theme";
    const transition = document.startViewTransition(() => {
      flushSync(() => apply(next));
    });

    transition.ready
      .then(() => {
        root.animate(
          {
            clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`],
          },
          {
            duration: REVEAL_DURATION,
            easing: "cubic-bezier(0.32, 0.72, 0, 1)",
            pseudoElement: "::view-transition-new(root)",
          },
        );
      })
      .catch(() => {});

    transition.finished.finally(() => {
      delete root.dataset.transition;
    });
  }

  const label = theme === "dark" ? "Tema claro" : "Tema escuro";

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggle}
      aria-label={`Mudar para ${label.toLowerCase()}`}
      title={label}
      className="w-8 justify-center px-0!"
    >
      <ThemeDisk light={theme === "light"} />
    </Button>
  );
}

function ThemeDisk({ light }: { light: boolean }) {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden
      className="size-3.5 transition-transform duration-500 ease-fluid"
      style={{ transform: `rotate(${light ? 180 : 0}deg)` }}
    >
      <circle cx="8" cy="8" r="6.25" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 1.75a6.25 6.25 0 0 1 0 12.5z" fill="currentColor" />
    </svg>
  );
}
