"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";
import { useConfig } from "@/hooks/use-config";

/**
 * Invisible component that keeps next-themes in sync with config.theme.
 * Mount it once inside the app (page.tsx).
 */
export function ThemeSync() {
  const { setTheme } = useTheme();
  const { config } = useConfig();

  useEffect(() => {
    if (config.theme === "auto") {
      setTheme("system");
    } else {
      setTheme(config.theme);
    }
  }, [config.theme, setTheme]);

  return null;
}
