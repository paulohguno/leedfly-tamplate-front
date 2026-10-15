import type { CSSProperties } from "react";

export function cx(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function step(index: number): CSSProperties {
  return { "--i": index } as CSSProperties;
}
