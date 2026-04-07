"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  X,
  Trash2,
  MessageSquare,
  BarChart3,
  Plus,
  Pencil,
  Check,
  Database,
  WifiOff,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ExportChat } from "./export-chat";
import { useConfig } from "@/hooks/use-config";
import type { SessionSummary } from "@/hooks/use-sessions";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onClearChat: () => void;
  messages: Message[];
  sessions: SessionSummary[];
  isDbMode: boolean;
  activeSessionId: string | null;
  isLoadingSessions: boolean;
  onLoadSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
  onRenameSession: (id: string, title: string) => void;
}

function SessionItem({
  session,
  isActive,
  onLoad,
  onDelete,
  onRename,
}: {
  session: SessionSummary;
  isActive: boolean;
  onLoad: () => void;
  onDelete: () => void;
  onRename: (title: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(session.title);

  const commitRename = () => {
    if (draft.trim() && draft !== session.title) onRename(draft.trim());
    setEditing(false);
  };

  return (
    <div
      className={cn(
        "group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors",
        isActive
          ? "bg-primary/10 text-primary"
          : "hover:bg-muted/60 text-sidebar-foreground/80",
      )}
      onClick={() => !editing && onLoad()}
    >
      <MessageSquare className="h-3.5 w-3.5 shrink-0 opacity-60" />

      {editing ? (
        <Input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commitRename}
          onKeyDown={(e) => {
            if (e.key === "Enter") commitRename();
            if (e.key === "Escape") setEditing(false);
          }}
          className="h-5 text-xs px-1 py-0 flex-1"
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <span className="flex-1 text-xs truncate">{session.title}</span>
      )}

      <span className="text-[10px] opacity-40 shrink-0">
        {session._count.messages}
      </span>

      <div className="hidden group-hover:flex items-center gap-0.5 shrink-0">
        <button
          className="p-0.5 rounded hover:bg-muted/80"
          onClick={(e) => {
            e.stopPropagation();
            setEditing(true);
            setDraft(session.title);
          }}
        >
          {editing ? (
            <Check className="h-3 w-3" />
          ) : (
            <Pencil className="h-3 w-3 opacity-60" />
          )}
        </button>
        <button
          className="p-0.5 rounded hover:bg-destructive/20 hover:text-destructive"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Trash2 className="h-3 w-3 opacity-60" />
        </button>
      </div>
    </div>
  );
}

export function Sidebar({
  isOpen,
  onClose,
  onClearChat,
  messages,
  sessions,
  isDbMode,
  activeSessionId,
  isLoadingSessions,
  onLoadSession,
  onDeleteSession,
  onRenameSession,
}: SidebarProps) {
  const [statsOpen, setStatsOpen] = useState(false);
  const { config } = useConfig();

  const userMessages = messages.filter((m) => m.role === "user").length;
  const assistantMessages = messages.filter(
    (m) => m.role === "assistant",
  ).length;
  const totalTokensEstimate = messages.reduce(
    (acc, msg) => acc + Math.ceil(msg.content.length / 4),
    0,
  );
  const lastMessage = messages[messages.length - 1];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <div
        className={cn(
          "fixed left-0 top-0 h-full w-72 bg-sidebar z-50 transform transition-transform duration-200 ease-in-out flex flex-col",
          "shadow-[4px_0_16px_rgba(0,0,0,0.06)] dark:shadow-[4px_0_16px_rgba(0,0,0,0.3)]",
          "md:relative md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Header — matches main header h-14 */}
        <div className="flex items-center justify-between px-4 h-14 shrink-0">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-sidebar-foreground">
              Conversaciones
            </h2>
            {isDbMode ? (
              <span className="flex items-center gap-1 text-[10px] text-emerald-500 bg-emerald-500/10 rounded-full px-2 py-0.5">
                <Database className="h-2.5 w-2.5" />
                DB
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground bg-muted/50 rounded-full px-2 py-0.5">
                <WifiOff className="h-2.5 w-2.5" />
                Local
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-sidebar-foreground/60 hover:text-sidebar-foreground"
              onClick={onClearChat}
              title="Nueva conversación"
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="md:hidden h-7 w-7"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Sessions list — scrollable */}
        <div className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5 min-h-0">
          {isDbMode ? (
            <>
              {isLoadingSessions && (
                <p className="text-xs text-sidebar-foreground/40 px-3 py-2">
                  Cargando...
                </p>
              )}
              {!isLoadingSessions && sessions.length === 0 && (
                <p className="text-xs text-sidebar-foreground/40 px-3 py-8 text-center">
                  Sin conversaciones guardadas
                </p>
              )}
              {sessions.map((s) => (
                <SessionItem
                  key={s.id}
                  session={s}
                  isActive={s.id === activeSessionId}
                  onLoad={() => onLoadSession(s.id)}
                  onDelete={() => onDeleteSession(s.id)}
                  onRename={(title) => onRenameSession(s.id, title)}
                />
              ))}
            </>
          ) : (
            <p className="text-xs text-sidebar-foreground/40 px-3 py-8 text-center">
              Conecta una base de datos para guardar conversaciones
            </p>
          )}
        </div>

        {/* Bottom section — stats + actions */}
        <div className="shrink-0 px-3 pb-3 pt-2 space-y-2">
          {/* Stats collapsible */}
          {messages.length > 0 && (
            <div>
              <button
                className="w-full flex items-center gap-2 text-xs font-medium text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors mb-1"
                onClick={() => setStatsOpen((v) => !v)}
              >
                <BarChart3 className="h-3.5 w-3.5" />
                Estadísticas
                {statsOpen ? (
                  <ChevronDown className="h-3 w-3 ml-auto" />
                ) : (
                  <ChevronRight className="h-3 w-3 ml-auto" />
                )}
              </button>

              {statsOpen && (
                <div className="bg-muted/30 rounded-lg p-3 text-xs text-sidebar-foreground/60 space-y-1">
                  <div className="flex justify-between">
                    <span>Mensajes</span>
                    <span className="text-sidebar-foreground">
                      {messages.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tú / IA</span>
                    <span className="text-sidebar-foreground">
                      {userMessages} / {assistantMessages}
                    </span>
                  </div>
                  {config.showTokenCount && (
                    <div className="flex justify-between">
                      <span>Tokens ~</span>
                      <span className="text-sidebar-foreground">
                        {totalTokensEstimate}
                      </span>
                    </div>
                  )}
                  {messages.length > 1 && lastMessage && (
                    <div className="flex justify-between">
                      <span>Duración</span>
                      <span className="text-sidebar-foreground">
                        {Math.round(
                          (lastMessage.timestamp.getTime() -
                            messages[0].timestamp.getTime()) /
                            60000,
                        )}{" "}
                        min
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="space-y-1">
            {!isDbMode && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2 text-xs text-sidebar-foreground/60 hover:text-sidebar-foreground"
                onClick={onClearChat}
                disabled={messages.length === 0}
              >
                <Plus className="h-3.5 w-3.5" />
                Nueva conversación
              </Button>
            )}
            <ExportChat messages={messages} />
          </div>

          {/* Config summary */}
          <div className="bg-muted/20 rounded-lg p-2.5 text-[11px] text-sidebar-foreground/50 space-y-0.5">
            <div className="flex justify-between">
              <span>Temp</span>
              <span>{config.modelConfig.temperature}</span>
            </div>
            <div className="flex justify-between">
              <span>Top P</span>
              <span>{config.modelConfig.top_p}</span>
            </div>
            <div className="flex justify-between">
              <span>Contexto</span>
              <span>{config.modelConfig.num_ctx} tk</span>
            </div>
          </div>

          <p className="text-[10px] text-sidebar-foreground/30 text-center">
            Ollama Interface v2.0
          </p>
        </div>
      </div>
    </>
  );
}
