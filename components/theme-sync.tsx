"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { useConfig } from "@/hooks/use-config";

/**
 * Bridges config.theme → next-themes, but only AFTER the initial load.
 * On mount, next-themes already restores the correct theme from its own
 * localStorage key ("theme"). We must NOT overwrite it with the default
 * config value while useConfig is still hydrating.
 *
 * Flow:
 *  1. First render: config.theme = defaultConfig.theme → skip (isLoading or first settle)
 *  2. Config fully loaded → record that value as "baseline", still skip
 *  3. config.theme changes again (user toggled via settings, import, etc.) → setTheme()
 */
export function ThemeSync() {
  const { setTheme } = useTheme();
  const { config, isLoading } = useConfig();
  const hasSettled = useRef(false);
  const prevTheme = useRef<string | null>(null);

  useEffect(() => {
    // While config is loading, do nothing
    if (isLoading) return;

    // First time config is fully loaded — just record it, don't override next-themes
    if (!hasSettled.current) {
      hasSettled.current = true;
      prevTheme.current = config.theme;
      return;
    }

    // Only sync if theme actually changed from the settled value
    if (config.theme !== prevTheme.current) {
      prevTheme.current = config.theme;
      if (config.theme === "auto") {
        setTheme("system");
      } else {
        setTheme(config.theme);
      }
    }
  }, [config.theme, isLoading, setTheme]);

  return null;
}
