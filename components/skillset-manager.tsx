"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Trash2,
  Pencil,
  Upload,
  FileText,
  Check,
  X,
  BookOpen,
  Zap,
  ChevronDown,
  ChevronRight,
  BookTemplate,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Skillset, PromptTemplate } from "@/hooks/use-skillsets";

interface SkillsetManagerProps {
  skillsets: Skillset[];
  activeSkillsetId: string | null;
  onSetActive: (id: string | null) => void;
  onCreate: (
    data: Omit<Skillset, "id" | "createdAt" | "updatedAt">,
  ) => Promise<Skillset | null>;
  onUpdate: (
    id: string,
    data: Partial<Omit<Skillset, "id" | "createdAt" | "updatedAt">>,
  ) => Promise<Skillset | null>;
  onDelete: (id: string) => Promise<void>;
}

export function SkillsetManager({
  skillsets,
  activeSkillsetId,
  onSetActive,
  onCreate,
  onUpdate,
  onDelete,
}: SkillsetManagerProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-foreground">Skillsets</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Perfiles de IA con prompt de sistema y base de conocimientos
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-1 text-xs"
          onClick={() => setIsCreating(true)}
        >
          <Plus className="h-3.5 w-3.5" />
          Nuevo
        </Button>
      </div>

      {/* Create form */}
      {isCreating && (
        <SkillsetForm
          onSave={async (data) => {
            await onCreate(data);
            setIsCreating(false);
          }}
          onCancel={() => setIsCreating(false)}
        />
      )}

      {/* List */}
      {skillsets.length === 0 && !isCreating && (
        <div className="text-center py-8 text-xs text-muted-foreground/60">
          <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-30" />
          <p>Sin skillsets creados</p>
          <p className="mt-1">
            Crea uno para dar contexto y personalidad a tus conversaciones
          </p>
        </div>
      )}

      <div className="space-y-2">
        {skillsets.map((s) => {
          const isActive = s.id === activeSkillsetId;
          const isEditing = editingId === s.id;
          const isExpanded = expandedId === s.id;

          if (isEditing) {
            return (
              <SkillsetForm
                key={s.id}
                initial={s}
                onSave={async (data) => {
                  await onUpdate(s.id, data);
                  setEditingId(null);
                }}
                onCancel={() => setEditingId(null)}
              />
            );
          }

          return (
            <div
              key={s.id}
              className={cn(
                "rounded-xl p-3 transition-all",
                isActive
                  ? "bg-primary/8 ring-1 ring-primary/20"
                  : "bg-muted/30 hover:bg-muted/50",
              )}
            >
              <div className="flex items-start gap-2">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : s.id)}
                  className="mt-0.5 text-muted-foreground/50 hover:text-foreground"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground truncate">
                      {s.name}
                    </span>
                    {s.knowledgeBase && (
                      <FileText className="h-3 w-3 text-muted-foreground/40 shrink-0" />
                    )}
                    {s.promptTemplates && s.promptTemplates.length > 0 && (
                      <span
                        className="text-[10px] text-muted-foreground/40 shrink-0"
                        title="Plantillas"
                      >
                        <BookTemplate className="h-3 w-3 inline -mt-0.5" />{" "}
                        {s.promptTemplates.length}
                      </span>
                    )}
                    <span className="text-[10px] text-muted-foreground/40 bg-muted/50 rounded px-1.5 py-0.5 shrink-0">
                      {s.category}
                    </span>
                  </div>
                  {s.description && (
                    <p className="text-xs text-muted-foreground/60 mt-0.5 truncate">
                      {s.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    className={cn(
                      "h-7 text-xs gap-1",
                      isActive && "bg-primary text-primary-foreground",
                    )}
                    onClick={() => onSetActive(isActive ? null : s.id)}
                  >
                    {isActive ? (
                      <>
                        <Check className="h-3 w-3" />
                        Activo
                      </>
                    ) : (
                      <>
                        <Zap className="h-3 w-3" />
                        Usar
                      </>
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setEditingId(s.id)}
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive/60 hover:text-destructive"
                    onClick={() => onDelete(s.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <div className="mt-3 ml-6 space-y-2 text-xs">
                  {s.systemPrompt && (
                    <div>
                      <p className="text-muted-foreground/50 font-medium mb-1">
                        Prompt de sistema
                      </p>
                      <div className="bg-background/60 rounded-lg p-2.5 text-foreground/80 whitespace-pre-wrap max-h-40 overflow-y-auto leading-relaxed">
                        {s.systemPrompt}
                      </div>
                    </div>
                  )}
                  {s.knowledgeBase && (
                    <div>
                      <p className="text-muted-foreground/50 font-medium mb-1">
                        Base de conocimientos (
                        {Math.ceil(s.knowledgeBase.length / 1024)} KB)
                      </p>
                      <div className="bg-background/60 rounded-lg p-2.5 text-foreground/80 whitespace-pre-wrap max-h-40 overflow-y-auto leading-relaxed font-mono text-[11px]">
                        {s.knowledgeBase.slice(0, 2000)}
                        {s.knowledgeBase.length > 2000 && (
                          <span className="text-muted-foreground/40">
                            {"\n"}… ({s.knowledgeBase.length - 2000} caracteres
                            más)
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  {s.promptTemplates && s.promptTemplates.length > 0 && (
                    <div>
                      <p className="text-muted-foreground/50 font-medium mb-1">
                        Plantillas ({s.promptTemplates.length})
                      </p>
                      <div className="space-y-1">
                        {s.promptTemplates.map((t) => (
                          <div
                            key={t.id}
                            className="bg-background/60 rounded-lg px-2.5 py-1.5 flex items-center gap-2"
                          >
                            <BookTemplate className="h-3 w-3 text-muted-foreground/40 shrink-0" />
                            <span className="text-foreground/80 truncate">
                              {t.name}
                            </span>
                            {t.variables.length > 0 && (
                              <span className="text-muted-foreground/40 text-[10px] shrink-0">
                                {t.variables.map((v) => `{${v}}`).join(" ")}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Create / Edit form ──────────────────────────────────────────────── */

function SkillsetForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Skillset;
  onSave: (
    data: Omit<Skillset, "id" | "createdAt" | "updatedAt">,
  ) => Promise<void>;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [systemPrompt, setSystemPrompt] = useState(initial?.systemPrompt ?? "");
  const [knowledgeBase, setKnowledgeBase] = useState(
    initial?.knowledgeBase ?? "",
  );
  const [promptTemplates, setPromptTemplates] = useState<PromptTemplate[]>(
    initial?.promptTemplates ?? [],
  );
  const [category, setCategory] = useState(initial?.category ?? "custom");
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Template form state
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [tplName, setTplName] = useState("");
  const [tplDesc, setTplDesc] = useState("");
  const [tplTemplate, setTplTemplate] = useState("");
  const [tplCategory, setTplCategory] =
    useState<PromptTemplate["category"]>("general");

  const extractVariables = (template: string): string[] => {
    const matches = template.match(/\{([^}]+)\}/g);
    return matches ? [...new Set(matches.map((m) => m.slice(1, -1)))] : [];
  };

  const addTemplate = () => {
    if (!tplName.trim() || !tplTemplate.trim()) return;
    const newTpl: PromptTemplate = {
      id: Date.now().toString(),
      name: tplName.trim(),
      description: tplDesc.trim(),
      template: tplTemplate.trim(),
      variables: extractVariables(tplTemplate),
      category: tplCategory,
    };
    setPromptTemplates((prev) => [...prev, newTpl]);
    setTplName("");
    setTplDesc("");
    setTplTemplate("");
    setTplCategory("general");
    setShowTemplateForm(false);
  };

  const removeTemplate = (id: string) => {
    setPromptTemplates((prev) => prev.filter((t) => t.id !== id));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setKnowledgeBase((prev) => (prev ? `${prev}\n\n---\n\n${text}` : text));
    };
    reader.readAsText(file);
    // Reset so same file can be re-uploaded
    e.target.value = "";
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    await onSave({
      name: name.trim(),
      description: description.trim(),
      systemPrompt: systemPrompt.trim(),
      knowledgeBase: knowledgeBase.trim(),
      promptTemplates,
      category,
    });
    setSaving(false);
  };

  return (
    <div className="bg-card rounded-xl p-4 shadow-sm space-y-3 ring-1 ring-primary/10">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">
          {initial ? "Editar Skillset" : "Nuevo Skillset"}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={onCancel}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="grid grid-cols-[1fr_auto] gap-2">
        <Input
          placeholder="Nombre del skillset"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="text-sm h-9"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="h-9 rounded-md bg-input px-2 text-xs text-foreground"
        >
          <option value="custom">Custom</option>
          <option value="coding">Coding</option>
          <option value="creative">Creativo</option>
          <option value="analysis">Análisis</option>
          <option value="general">General</option>
        </select>
      </div>

      <Input
        placeholder="Descripción breve (opcional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="text-sm h-9"
      />

      <div>
        <label className="text-xs text-muted-foreground font-medium mb-1 block">
          Prompt de sistema
        </label>
        <textarea
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          placeholder="Instrucciones que definen el comportamiento del modelo…"
          rows={4}
          className="w-full resize-none bg-input rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/30 leading-relaxed"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs text-muted-foreground font-medium">
            Base de conocimientos
          </label>
          <div className="flex items-center gap-1">
            {knowledgeBase && (
              <span className="text-[10px] text-muted-foreground/40">
                {Math.ceil(knowledgeBase.length / 1024)} KB
              </span>
            )}
            <input
              ref={fileRef}
              type="file"
              accept=".md,.txt,.markdown"
              className="hidden"
              onChange={handleFileUpload}
            />
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-[11px] gap-1 text-muted-foreground/60"
              onClick={() => fileRef.current?.click()}
            >
              <Upload className="h-3 w-3" />
              Subir .md
            </Button>
          </div>
        </div>
        <textarea
          value={knowledgeBase}
          onChange={(e) => setKnowledgeBase(e.target.value)}
          placeholder="Pega o sube contenido markdown como referencia para el modelo…"
          rows={5}
          className="w-full resize-none bg-input rounded-lg px-3 py-2 text-xs font-mono text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/30 leading-relaxed"
        />
      </div>

      {/* Prompt templates section */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs text-muted-foreground font-medium">
            Plantillas rápidas
          </label>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-[11px] gap-1 text-muted-foreground/60"
            onClick={() => setShowTemplateForm(!showTemplateForm)}
          >
            <Plus className="h-3 w-3" />
            Añadir
          </Button>
        </div>

        {/* Template list */}
        {promptTemplates.length > 0 && (
          <div className="space-y-1 mb-2">
            {promptTemplates.map((t) => (
              <div
                key={t.id}
                className="flex items-center gap-2 bg-input rounded-lg px-2.5 py-1.5 group"
              >
                <BookTemplate className="h-3 w-3 text-muted-foreground/40 shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-xs text-foreground/80 truncate block">
                    {t.name}
                  </span>
                  {t.variables.length > 0 && (
                    <span className="text-[10px] text-muted-foreground/40">
                      {t.variables.map((v) => `{${v}}`).join(" ")}
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-muted-foreground/30">
                  {t.category}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 opacity-0 group-hover:opacity-100 text-destructive/60 hover:text-destructive"
                  onClick={() => removeTemplate(t.id)}
                >
                  <Trash2 className="h-2.5 w-2.5" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* New template form (inline) */}
        {showTemplateForm && (
          <div className="bg-input rounded-lg p-2.5 space-y-2">
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <Input
                placeholder="Nombre de la plantilla"
                value={tplName}
                onChange={(e) => setTplName(e.target.value)}
                className="text-xs h-7"
              />
              <select
                value={tplCategory}
                onChange={(e) =>
                  setTplCategory(e.target.value as PromptTemplate["category"])
                }
                className="h-7 rounded-md bg-background px-2 text-[11px] text-foreground"
              >
                <option value="general">General</option>
                <option value="coding">Coding</option>
                <option value="creative">Creativo</option>
                <option value="analysis">Análisis</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <Input
              placeholder="Descripción (opcional)"
              value={tplDesc}
              onChange={(e) => setTplDesc(e.target.value)}
              className="text-xs h-7"
            />
            <textarea
              value={tplTemplate}
              onChange={(e) => setTplTemplate(e.target.value)}
              placeholder="Texto de la plantilla — usa {variable} para parámetros"
              rows={2}
              className="w-full resize-none bg-background rounded-lg px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/30"
            />
            {tplTemplate && extractVariables(tplTemplate).length > 0 && (
              <div className="flex items-center gap-1 flex-wrap">
                <span className="text-[10px] text-muted-foreground/40">
                  Variables:
                </span>
                {extractVariables(tplTemplate).map((v) => (
                  <span
                    key={v}
                    className="text-[10px] bg-primary/10 text-primary rounded px-1.5 py-0.5"
                  >
                    {`{${v}}`}
                  </span>
                ))}
              </div>
            )}
            <div className="flex justify-end gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-[11px]"
                onClick={() => setShowTemplateForm(false)}
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                className="h-6 text-[11px]"
                onClick={addTemplate}
                disabled={!tplName.trim() || !tplTemplate.trim()}
              >
                Añadir
              </Button>
            </div>
          </div>
        )}

        {promptTemplates.length === 0 && !showTemplateForm && (
          <p className="text-[10px] text-muted-foreground/30 italic">
            Sin plantillas — añade prompts rápidos con variables {"{así}"}
          </p>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={!name.trim() || saving}
          className="gap-1"
        >
          {saving ? "Guardando…" : initial ? "Guardar" : "Crear"}
        </Button>
      </div>
    </div>
  );
}
