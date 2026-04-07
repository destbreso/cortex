"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Check, Plus, Trash2, Drama } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Personality } from "@/types/config";

interface PersonalitySelectorProps {
  personalities: Personality[];
  activePersonalityId: string;
  onSelect: (id: string) => void;
  onAdd: (personality: Omit<Personality, "id">) => void;
  onDelete: (id: string) => void;
}

export function PersonalitySelector({
  personalities,
  activePersonalityId,
  onSelect,
  onAdd,
  onDelete,
}: PersonalitySelectorProps) {
  const [open, setOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newIcon, setNewIcon] = useState("🤖");
  const [newPrompt, setNewPrompt] = useState("");

  const active = personalities.find((p) => p.id === activePersonalityId);

  const handleAdd = () => {
    if (!newName.trim() || !newPrompt.trim()) return;
    onAdd({
      name: newName.trim(),
      icon: newIcon || "🤖",
      prompt: newPrompt.trim(),
    });
    setNewName("");
    setNewIcon("🤖");
    setNewPrompt("");
    setShowForm(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-7 px-2 text-xs gap-1 transition-colors",
            active && active.id !== "neutral"
              ? "text-primary"
              : "text-muted-foreground/60 hover:text-foreground",
          )}
          title={`Personalidad: ${active?.name ?? "Neutral"}`}
        >
          <span className="text-sm leading-none">{active?.icon ?? "⚪"}</span>
          <span className="hidden sm:inline max-w-[80px] truncate">
            {active?.name ?? "Neutral"}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-72 p-1 z-50"
        side="top"
        align="start"
        sideOffset={8}
      >
        <div className="px-2.5 py-1.5 text-[10px] font-medium text-muted-foreground/50 uppercase tracking-wider">
          Personalidad
        </div>

        <div className="max-h-[280px] overflow-y-auto space-y-0.5">
          {personalities.map((p) => {
            const isActive = p.id === activePersonalityId;
            return (
              <div
                key={p.id}
                className={cn(
                  "flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs transition-colors group",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-foreground hover:bg-muted/60",
                )}
              >
                <button
                  className="flex items-center gap-2 flex-1 min-w-0 text-left"
                  onClick={() => {
                    onSelect(p.id);
                    setOpen(false);
                  }}
                >
                  <span className="text-sm leading-none shrink-0">
                    {p.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium">{p.name}</p>
                    {p.prompt && (
                      <p className="truncate text-[10px] text-muted-foreground/50 mt-0.5">
                        {p.prompt.slice(0, 60)}…
                      </p>
                    )}
                  </div>
                  {isActive && <Check className="h-3 w-3 shrink-0" />}
                </button>
                {!p.isBuiltIn && (
                  <button
                    className="h-5 w-5 flex items-center justify-center rounded opacity-0 group-hover:opacity-100 text-destructive/60 hover:text-destructive hover:bg-destructive/10 transition-all shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(p.id);
                    }}
                    title="Eliminar personalidad"
                  >
                    <Trash2 className="h-2.5 w-2.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Create new */}
        {showForm ? (
          <div className="border-t border-border/30 mt-1 pt-2 px-2 pb-1 space-y-1.5">
            <div className="flex gap-1.5">
              <Input
                value={newIcon}
                onChange={(e) => setNewIcon(e.target.value)}
                className="w-10 h-7 text-center text-sm px-1"
                maxLength={2}
              />
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Nombre"
                className="h-7 text-xs flex-1"
              />
            </div>
            <textarea
              value={newPrompt}
              onChange={(e) => setNewPrompt(e.target.value)}
              placeholder="Instrucciones de personalidad…"
              rows={3}
              className="w-full resize-none bg-input rounded-md px-2 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/30"
            />
            <div className="flex justify-end gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-[11px]"
                onClick={() => setShowForm(false)}
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                className="h-6 text-[11px]"
                onClick={handleAdd}
                disabled={!newName.trim() || !newPrompt.trim()}
              >
                Crear
              </Button>
            </div>
          </div>
        ) : (
          <button
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs text-muted-foreground/60 hover:bg-muted/60 hover:text-foreground transition-colors mt-0.5 border-t border-border/30 pt-2"
            onClick={() => setShowForm(true)}
          >
            <Plus className="h-3 w-3" />
            Nueva personalidad
          </button>
        )}
      </PopoverContent>
    </Popover>
  );
}
