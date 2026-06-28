import { Capacitor } from "@capacitor/core";

let impl: ((style: "Light" | "Medium" | "Heavy") => void) | null = null;

async function load() {
  if (impl) return impl;
  if (Capacitor.getPlatform() === "web") {
    impl = () => {};
    return impl;
  }
  try {
    const mod = await import("@capacitor/haptics");
    impl = (style) => {
      mod.Haptics.impact({ style: mod.ImpactStyle[style] }).catch(() => {});
    };
  } catch {
    impl = () => {};
  }
  return impl;
}

export function tapHaptic(style: "Light" | "Medium" | "Heavy" = "Light") {
  void load().then((fn) => fn(style));
}
