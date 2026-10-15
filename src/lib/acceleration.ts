"use client";

import { useSyncExternalStore } from "react";

const SOFTWARE_RENDERER = /swiftshader|llvmpipe|software|basic render|microsoft basic/i;

export type AccelerationState = "checking" | "available" | "unavailable";

let cache: AccelerationState | null = null;

const noopSubscribe = () => () => {};
const readClient = (): AccelerationState => (cache ??= detect() ? "available" : "unavailable");
const readServer = (): AccelerationState => "checking";

export function useAcceleration(): AccelerationState {
  return useSyncExternalStore(noopSubscribe, readClient, readServer);
}

function detect(): boolean {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    const gl = (canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;
    if (!gl) return false;

    const extension = gl.getExtension("WEBGL_debug_renderer_info");
    const renderer = String(
      extension ? gl.getParameter(extension.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER),
    );

    return !SOFTWARE_RENDERER.test(renderer);
  } catch {
    return false;
  }
}
