"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { BookOpen, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Skillset } from "@/hooks/use-skillsets";

interface SkillsetSelectorProps {
  skillsets: Skillset[];
  activeSkillsetId: string | null;
  onSetActive: (id: string | null) => void;
}

export function SkillsetSelector({
  skillsets,
  activeSkillsetId,
  onSetActive,
}: SkillsetSelectorProps) {
  const active = skillsets.find((s) => s.id === activeSkillsetId);

  if (skillsets.length === 0) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="h-7 px-2 text-xs text-muted-foreground/60 gap-1"
        title="Sin skillsets (crea uno en Configuración)"
        disabled
      >
        <BookOpen className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Skillsets</span>
      </Button>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-7 px-2 text-xs gap-1 transition-colors",
            active
              ? "text-primary"
              : "text-muted-foreground/60 hover:text-foreground",
          )}
          title={active ? `Skillset: ${active.name}` : "Seleccionar skillset"}
        >
          <BookOpen className="h-3.5 w-3.5" />
          <span className="hidden sm:inline max-w-[100px] truncate">
            {active ? active.name : "Skillset"}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-56 p-1"
        side="top"
        align="start"
        sideOffset={8}
      >
        <div className="space-y-0.5">
          {/* Clear option */}
          {active && (
            <button
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs text-muted-foreground hover:bg-muted/60 transition-colors"
              onClick={() => onSetActive(null)}
            >
              <X className="h-3 w-3" />
              Sin skillset
            </button>
          )}
          {skillsets.map((s) => {
            const isActive = s.id === activeSkillsetId;
            return (
              <button
                key={s.id}
                className={cn(
                  "w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs transition-colors text-left",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-foreground hover:bg-muted/60",
                )}
                onClick={() => onSetActive(isActive ? null : s.id)}
              >
                {isActive ? (
                  <Check className="h-3 w-3 shrink-0" />
                ) : (
                  <BookOpen className="h-3 w-3 shrink-0 opacity-40" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="truncate font-medium">{s.name}</p>
                  {s.description && (
                    <p className="truncate text-[10px] text-muted-foreground/50">
                      {s.description}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
