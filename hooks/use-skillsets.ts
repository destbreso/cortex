"use client";

import { useState, useCallback, useEffect } from "react";

export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  template: string;
  variables: string[];
  category: "general" | "coding" | "creative" | "analysis" | "custom";
}

export interface Skillset {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  knowledgeBase: string; // markdown content
  promptTemplates: PromptTemplate[];
  category: string;
  createdAt?: string;
  updatedAt?: string;
}

const ACTIVE_KEY = "ollama-active-skillset";

export function useSkillsets() {
  const [skillsets, setSkillsets] = useState<Skillset[]>([]);
  const [activeSkillsetId, setActiveSkillsetId] = useState<string | null>(
    () => {
      if (typeof window !== "undefined") {
        return localStorage.getItem(ACTIVE_KEY) || null;
      }
      return null;
    },
  );
  const [isLoading, setIsLoading] = useState(false);

  const loadSkillsets = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/skillsets");
      if (res.ok) {
        const data = await res.json();
        setSkillsets(data);
      }
    } catch {
      // DB not available
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSkillsets();
  }, [loadSkillsets]);

  const createSkillset = useCallback(
    async (data: Omit<Skillset, "id" | "createdAt" | "updatedAt">) => {
      const res = await fetch("/api/skillsets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const created = await res.json();
        setSkillsets((prev) => [...prev, created]);
        return created as Skillset;
      }
      return null;
    },
    [],
  );

  const updateSkillset = useCallback(
    async (
      id: string,
      data: Partial<Omit<Skillset, "id" | "createdAt" | "updatedAt">>,
    ) => {
      const res = await fetch(`/api/skillsets/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const updated = await res.json();
        setSkillsets((prev) => prev.map((s) => (s.id === id ? updated : s)));
        return updated as Skillset;
      }
      return null;
    },
    [],
  );

  const deleteSkillset = useCallback(
    async (id: string) => {
      await fetch(`/api/skillsets/${id}`, { method: "DELETE" });
      setSkillsets((prev) => prev.filter((s) => s.id !== id));
      if (activeSkillsetId === id) {
        setActiveSkillsetId(null);
        localStorage.removeItem(ACTIVE_KEY);
      }
    },
    [activeSkillsetId],
  );

  const setActive = useCallback((id: string | null) => {
    setActiveSkillsetId(id);
    if (id) {
      localStorage.setItem(ACTIVE_KEY, id);
    } else {
      localStorage.removeItem(ACTIVE_KEY);
    }
  }, []);

  const activeSkillset = skillsets.find((s) => s.id === activeSkillsetId) ?? null;

  // Build the full system message from active skillset
  const buildSystemMessage = useCallback((): string | null => {
    if (!activeSkillset) return null;
    const parts: string[] = [];
    if (activeSkillset.systemPrompt) {
      parts.push(activeSkillset.systemPrompt);
    }
    if (activeSkillset.knowledgeBase) {
      parts.push(
        `\n---\nBase de conocimientos de referencia:\n\n${activeSkillset.knowledgeBase}`,
      );
    }
    return parts.length > 0 ? parts.join("\n") : null;
  }, [activeSkillset]);

  return {
    skillsets,
    isLoading,
    activeSkillset,
    activeSkillsetId,
    setActive,
    createSkillset,
    updateSkillset,
    deleteSkillset,
    loadSkillsets,
    buildSystemMessage,
  };
}
