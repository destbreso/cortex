"use client";

import { useState, useEffect, useCallback } from "react";

export interface SessionSummary {
  id: string;
  title: string;
  modelName: string;
  createdAt: string;
  updatedAt: string;
  _count: { messages: number };
}

/**
 * Hook for managing chat sessions.
 * Only activates when DB mode is available.
 */
export function useSessions() {
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDbMode, setIsDbMode] = useState(false);

  useEffect(() => {
    fetch("/api/db-status")
      .then((r) => r.json())
      .then(({ enabled }) => {
        setIsDbMode(!!enabled);
        if (enabled) loadSessions();
      })
      .catch(() => {});
  }, []);

  const loadSessions = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/sessions");
      if (res.ok) setSessions(await res.json());
    } catch {
      // silently ignore
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteSession = useCallback(async (id: string) => {
    await fetch(`/api/sessions/${id}`, { method: "DELETE" });
    setSessions((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const renameSession = useCallback(async (id: string, title: string) => {
    await fetch(`/api/sessions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, title } : s)));
  }, []);

  return {
    sessions,
    isLoading,
    isDbMode,
    loadSessions,
    deleteSession,
    renameSession,
  };
}
