"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useThemeTransition } from "@/components/theme-transition";
import { useConfig } from "@/hooks/use-config";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const { triggerTransition } = useThemeTransition();
  const { updateConfig } = useConfig();
  // Avoid hydration mismatch — only render icon after mount
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === "dark";

  const handleToggle = () => {
    const next = isDark ? "light" : "dark";
    triggerTransition(() => {
      setTheme(next); // next-themes — immediate DOM class swap
      updateConfig({ theme: next }); // persist to config / DB
    });
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      title={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      className="relative"
    >
      {mounted ? (
        isDark ? (
          <Sun className="h-4 w-4" />
        ) : (
          <Moon className="h-4 w-4" />
        )
      ) : (
        // SSR placeholder — same size to avoid layout shift
        <span className="h-4 w-4 inline-block" />
      )}
      <span className="sr-only">Cambiar tema</span>
    </Button>
  );
}
