"use client";

import { useState, useEffect } from "react";

/**
 * Detects if DB mode is enabled.
 * On the client we check via a lightweight API probe so the hook works
 * in both SSR and CSR contexts without exposing env vars to the browser.
 */
export function useDbMode() {
  const [isDbMode, setIsDbMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/db-status")
      .then((r) => r.json())
      .then((data) => {
        setIsDbMode(!!data.enabled);
      })
      .catch(() => setIsDbMode(false))
      .finally(() => setIsLoading(false));
  }, []);

  return { isDbMode, isLoading };
}
