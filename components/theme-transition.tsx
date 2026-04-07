"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
} from "react";

// Grid dimensions — larger = more dramatic, smaller = finer mosaic
const COLS = 18;
const ROWS = 12;
const TOTAL = COLS * ROWS;

const SQUARE_DURATION = 320; // ms — how long each square takes to disappear
const DELAY_SPREAD = 540; // ms — max random delay before a square starts
const THEME_CHANGE_AT = 55; // ms — apply new theme while squares still cover screen
const CLEANUP_AT = SQUARE_DURATION + DELAY_SPREAD + 200;

interface Square {
  id: number;
  delay: number;
}

interface ThemeTransitionContextValue {
  /** Call with a fn that applies the new theme. The fn runs ~55ms after the overlay appears. */
  triggerTransition: (applyTheme: () => void) => void;
}

const ThemeTransitionContext = createContext<ThemeTransitionContextValue>({
  triggerTransition: (fn) => fn(),
});

export function useThemeTransition() {
  return useContext(ThemeTransitionContext);
}

export function ThemeTransitionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [overlay, setOverlay] = useState<{
    squares: Square[];
    color: string;
  } | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerTransition = useCallback((applyTheme: () => void) => {
    // Read the current bg color from the CSS variable (before theme changes)
    const rawBg = getComputedStyle(document.documentElement)
      .getPropertyValue("--background")
      .trim();
    const color =
      rawBg ||
      (document.documentElement.classList.contains("dark")
        ? "oklch(0.09 0 0)"
        : "oklch(1 0 0)");

    // Shuffle square indices so they don't crumble in grid order
    const indices = Array.from({ length: TOTAL }, (_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    const squares: Square[] = indices.map((id, order) => ({
      id,
      // Stagger based on shuffled order so it looks organic
      delay: Math.floor((order / TOTAL) * DELAY_SPREAD + Math.random() * 60),
    }));

    setOverlay({ squares, color });

    // Swap theme while squares are still covering the screen
    setTimeout(applyTheme, THEME_CHANGE_AT);

    // Remove overlay after all squares have animated out
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setOverlay(null), CLEANUP_AT);
  }, []);

  return (
    <ThemeTransitionContext.Provider value={{ triggerTransition }}>
      {children}
      {overlay && (
        <div
          aria-hidden
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            pointerEvents: "none",
            overflow: "hidden",
          }}
        >
          {overlay.squares.map((sq) => {
            const col = sq.id % COLS;
            const row = Math.floor(sq.id / COLS);
            return (
              <div
                key={sq.id}
                style={{
                  position: "absolute",
                  // +1px prevents hairline gaps caused by sub-pixel rendering
                  left: `calc(${(col / COLS) * 100}% - 0.5px)`,
                  top: `calc(${(row / ROWS) * 100}% - 0.5px)`,
                  width: `calc(${100 / COLS}% + 1px)`,
                  height: `calc(${100 / ROWS}% + 1px)`,
                  backgroundColor: overlay.color,
                  animationName: "squareCrumble",
                  animationDuration: `${SQUARE_DURATION}ms`,
                  animationDelay: `${sq.delay}ms`,
                  animationFillMode: "both",
                  animationTimingFunction: "cubic-bezier(0.4, 0, 0.8, 1)",
                }}
              />
            );
          })}
        </div>
      )}
    </ThemeTransitionContext.Provider>
  );
}
