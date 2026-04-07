"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BookTemplate as Template, Search } from "lucide-react";
import type { PromptTemplate } from "@/hooks/use-skillsets";

interface PromptTemplatesSelectorProps {
  templates: PromptTemplate[];
  onSelectTemplate: (template: string) => void;
}

export function PromptTemplatesSelector({
  templates,
  onSelectTemplate,
}: PromptTemplatesSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedTemplate, setSelectedTemplate] =
    useState<PromptTemplate | null>(null);
  const [variables, setVariables] = useState<Record<string, string>>({});

  const filteredTemplates = templates.filter(
    (template) =>
      template.name.toLowerCase().includes(search.toLowerCase()) ||
      template.description.toLowerCase().includes(search.toLowerCase()) ||
      template.category.toLowerCase().includes(search.toLowerCase()),
  );

  const handleTemplateSelect = (template: PromptTemplate) => {
    setSelectedTemplate(template);
    const initialVariables: Record<string, string> = {};
    template.variables.forEach((variable) => {
      initialVariables[variable] = "";
    });
    setVariables(initialVariables);
  };

  const handleUseTemplate = () => {
    if (!selectedTemplate) return;

    let finalPrompt = selectedTemplate.template;
    Object.entries(variables).forEach(([key, value]) => {
      finalPrompt = finalPrompt.replace(new RegExp(`\\{${key}\\}`, "g"), value);
    });

    onSelectTemplate(finalPrompt);
    setOpen(false);
    setSelectedTemplate(null);
    setVariables({});
  };

  const groupedTemplates = filteredTemplates.reduce(
    (acc, template) => {
      if (!acc[template.category]) {
        acc[template.category] = [];
      }
      acc[template.category].push(template);
      return acc;
    },
    {} as Record<string, PromptTemplate[]>,
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs gap-1 text-muted-foreground/60 hover:text-foreground"
          disabled={templates.length === 0}
          title={
            templates.length === 0
              ? "El skillset activo no tiene plantillas"
              : "Plantillas rápidas"
          }
        >
          <Template className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Plantillas</span>
          {templates.length > 0 && (
            <span className="text-[10px] text-muted-foreground/40">
              {templates.length}
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Plantillas de Prompts</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar plantillas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {selectedTemplate ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {selectedTemplate.name}
                  <Button
                    variant="outline"
                    onClick={() => setSelectedTemplate(null)}
                  >
                    Volver
                  </Button>
                </CardTitle>
                <CardDescription>
                  {selectedTemplate.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-muted rounded-lg">
                  <pre className="text-sm whitespace-pre-wrap">
                    {selectedTemplate.template}
                  </pre>
                </div>

                {selectedTemplate.variables.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium">Variables:</h4>
                    {selectedTemplate.variables.map((variable) => (
                      <div key={variable} className="space-y-1">
                        <Label htmlFor={variable}>{variable}</Label>
                        <Input
                          id={variable}
                          value={variables[variable] || ""}
                          onChange={(e) =>
                            setVariables({
                              ...variables,
                              [variable]: e.target.value,
                            })
                          }
                          placeholder={`Ingresa valor para ${variable}`}
                        />
                      </div>
                    ))}
                  </div>
                )}

                <Button onClick={handleUseTemplate} className="w-full">
                  Usar Plantilla
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedTemplates).map(([category, templates]) => (
                <div key={category} className="space-y-3">
                  <h3 className="font-semibold capitalize">{category}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {templates.map((template) => (
                      <Card
                        key={template.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleTemplateSelect(template)}
                      >
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base flex items-center justify-between">
                            {template.name}
                            <Badge variant="secondary">
                              {template.category}
                            </Badge>
                          </CardTitle>
                          <CardDescription className="text-sm">
                            {template.description}
                          </CardDescription>
                        </CardHeader>
                        {template.variables.length > 0 && (
                          <CardContent className="pt-0">
                            <div className="flex gap-1 flex-wrap">
                              {template.variables.map((variable) => (
                                <Badge
                                  key={variable}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {variable}
                                </Badge>
                              ))}
                            </div>
                          </CardContent>
                        )}
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
