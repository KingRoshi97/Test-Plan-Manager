import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { 
  ChevronRight, ChevronLeft, Plus, Trash2, Upload, Loader2, FolderArchive,
  CheckCircle, XCircle, X, Package, AlertTriangle, File, HelpCircle
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { WizardFlow, WizardStep, FieldSpec, FieldGroup } from "@/lib/wizard/flows";
import type { WizardDraft, ProjectPackageStatus } from "@/lib/wizard/draft";
import { setNestedValue, getNestedValue, validateDraftForMode } from "@/lib/wizard/draft";
import type { Mode } from "@/lib/wizard/flows";

interface DynamicWizardProps {
  flow: WizardFlow;
  draft: WizardDraft;
  onDraftChange: (draft: WizardDraft) => void;
  currentStepIndex: number;
  onStepChange: (index: number) => void;
  projectPackage: ProjectPackageStatus | null;
  onProjectPackageUpload: (file: File) => void;
  onProjectPackageRemove: () => void;
  isPackageProcessing: boolean;
  isPackageReady: boolean;
  mode: Mode;
  onSubmit: () => void;
  isSubmitting: boolean;
  activeStepId?: string;
  hideInternalNav?: boolean;
}

function FieldHelp({ field }: { field: FieldSpec }) {
  if (!field.help && (!field.examples || field.examples.length === 0)) return null;

  return (
    <div className="mt-1.5 space-y-1">
      {field.help && (
        <p className="text-xs text-muted-foreground">{field.help}</p>
      )}
      {field.examples && field.examples.length > 0 && (
        <div className="text-xs text-muted-foreground">
          <span className="font-medium">Examples:</span>{" "}
          <span className="italic">{field.examples.slice(0, 2).join(" • ")}</span>
        </div>
      )}
    </div>
  );
}

function ListField({ 
  field, 
  value, 
  onChange 
}: { 
  field: FieldSpec; 
  value: string[]; 
  onChange: (value: string[]) => void;
}) {
  const [inputValue, setInputValue] = useState("");

  const addItem = () => {
    if (inputValue.trim()) {
      onChange([...value, inputValue.trim()]);
      setInputValue("");
    }
  };

  const removeItem = (index: number) => {
    const newValue = [...value];
    newValue.splice(index, 1);
    onChange(newValue);
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={field.placeholder || "Add item..."}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addItem();
            }
          }}
          data-testid={`input-${field.key}`}
        />
        <Button type="button" variant="outline" size="icon" onClick={addItem} data-testid={`button-add-${field.key}`}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((item, index) => (
            <Badge key={index} variant="secondary" className="gap-1 pr-1">
              {item}
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="ml-1 rounded-full p-0.5 hover:bg-muted"
                data-testid={`button-remove-${field.key}-${index}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
      <FieldHelp field={field} />
    </div>
  );
}

function ChipsField({ 
  field, 
  value, 
  onChange 
}: { 
  field: FieldSpec; 
  value: string[]; 
  onChange: (value: string[]) => void;
}) {
  const toggleOption = (option: string) => {
    if (value.includes(option)) {
      onChange(value.filter(v => v !== option));
    } else {
      onChange([...value, option]);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {field.options?.map((option) => (
          <Badge
            key={option}
            variant={value.includes(option) ? "default" : "outline"}
            className={`cursor-pointer transition-all ${
              value.includes(option) ? "bg-amber-500" : "hover:border-amber-500"
            }`}
            onClick={() => toggleOption(option)}
            data-testid={`chip-${field.key}-${option}`}
          >
            {option}
          </Badge>
        ))}
      </div>
      <FieldHelp field={field} />
    </div>
  );
}

function DynamicField({ 
  field, 
  value, 
  onChange 
}: { 
  field: FieldSpec; 
  value: any; 
  onChange: (value: any) => void;
}) {
  switch (field.ui) {
    case "text":
      return (
        <div>
          <Input
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            data-testid={`input-${field.key}`}
          />
          <FieldHelp field={field} />
        </div>
      );

    case "textarea":
      return (
        <div>
          <Textarea
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            className="min-h-24"
            data-testid={`textarea-${field.key}`}
          />
          <FieldHelp field={field} />
        </div>
      );

    case "select":
      return (
        <div>
          <Select value={value || ""} onValueChange={onChange}>
            <SelectTrigger data-testid={`select-${field.key}`}>
              <SelectValue placeholder={field.placeholder || "Select..."} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldHelp field={field} />
        </div>
      );

    case "toggle":
      return (
        <div className="flex items-center gap-2">
          <Switch
            checked={!!value}
            onCheckedChange={onChange}
            data-testid={`toggle-${field.key}`}
          />
          <FieldHelp field={field} />
        </div>
      );

    case "list":
      return (
        <ListField
          field={field}
          value={Array.isArray(value) ? value : []}
          onChange={onChange}
        />
      );

    case "chips":
      return (
        <ChipsField
          field={field}
          value={Array.isArray(value) ? value : []}
          onChange={onChange}
        />
      );

    case "file_docs":
      // This is handled separately by DocUploader in the parent component
      // The renderField function doesn't have access to upload handlers
      return null;

    case "file_zip":
      // This is handled separately by ZipUploader in the parent component
      return null;

    default:
      return (
        <Input
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          data-testid={`input-${field.key}`}
        />
      );
  }
}

interface ZipUploaderProps {
  projectPackage: ProjectPackageStatus | null;
  onUpload: (file: File) => void;
  onRemove: () => void;
  isProcessing: boolean;
  isReady: boolean;
  required?: boolean;
}

function ZipUploader({ projectPackage, onUpload, onRemove, isProcessing, isReady, required }: ZipUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files[0]?.name.endsWith('.zip')) {
      onUpload(e.dataTransfer.files[0]);
    }
  }, [onUpload]);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (!projectPackage) {
    return (
      <div className="space-y-2">
        <div
          className={`rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
            isDragging 
              ? "border-amber-500 bg-amber-500/5" 
              : "border-muted-foreground/25 hover:border-muted-foreground/50"
          }`}
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
          data-testid="drop-zone-zip"
        >
          <input
            type="file"
            ref={inputRef}
            className="hidden"
            accept=".zip"
            onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])}
            data-testid="input-zip-upload"
          />
          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
              <p className="text-sm text-muted-foreground">Uploading...</p>
            </div>
          ) : (
            <>
              <FolderArchive className="mx-auto h-8 w-8 text-amber-500" />
              <p className="mt-2 text-sm text-muted-foreground">
                Drag and drop your project ZIP file
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => inputRef.current?.click()}
                data-testid="button-browse-zip"
              >
                Browse ZIP File
              </Button>
            </>
          )}
        </div>
        {required && (
          <p className="text-xs text-amber-500">
            A project ZIP is required for this mode.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-lg border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-amber-500" />
          <span className="font-medium">{projectPackage.filename}</span>
          <Badge variant="secondary" className="text-xs">
            {formatFileSize(projectPackage.sizeBytes)}
          </Badge>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemove}
          disabled={isProcessing}
          data-testid="button-remove-zip"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1.5">
          {projectPackage.scanState === "scanned" ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : projectPackage.scanState === "failed" ? (
            <XCircle className="h-4 w-4 text-red-500" />
          ) : (
            <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
          )}
          <span className={projectPackage.scanState === "failed" ? "text-red-500" : ""}>
            {projectPackage.scanState === "scanned" ? "Scanned" :
             projectPackage.scanState === "failed" ? "Scan Failed" :
             projectPackage.scanState === "scanning" ? "Scanning..." : "Queued"}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {projectPackage.indexState === "indexed" ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : projectPackage.indexState === "failed" ? (
            <XCircle className="h-4 w-4 text-red-500" />
          ) : (
            <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
          )}
          <span className={projectPackage.indexState === "failed" ? "text-red-500" : ""}>
            {projectPackage.indexState === "indexed" ? "Indexed" :
             projectPackage.indexState === "failed" ? "Index Failed" :
             projectPackage.indexState === "indexing" ? "Indexing..." : "Queued"}
          </span>
        </div>
      </div>

      {(projectPackage.errorCode || projectPackage.errorMessage) && (
        <div className="flex items-start gap-2 rounded-md bg-red-500/10 p-3 text-sm text-red-500">
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
          <div>
            {projectPackage.errorCode && (
              <span className="font-mono text-xs mr-2">[{projectPackage.errorCode}]</span>
            )}
            {projectPackage.errorMessage}
          </div>
        </div>
      )}

      {isReady && projectPackage.summaryJson && (
        <div className="rounded-md bg-muted/50 p-3 space-y-2">
          <div className="grid grid-cols-2 gap-2 text-sm">
            {projectPackage.summaryJson.framework && (
              <div>
                <span className="text-muted-foreground">Framework:</span>{" "}
                <span className="font-medium">{projectPackage.summaryJson.framework}</span>
              </div>
            )}
            {projectPackage.summaryJson.packageManager && (
              <div>
                <span className="text-muted-foreground">Package Manager:</span>{" "}
                <span className="font-medium">{projectPackage.summaryJson.packageManager}</span>
              </div>
            )}
            {projectPackage.summaryJson.fileCount && (
              <div>
                <span className="text-muted-foreground">Files:</span>{" "}
                <span className="font-medium">{projectPackage.summaryJson.fileCount}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface DocFile {
  id: string;
  name: string;
  size: number;
  objectPath: string;
  mimeType: string;
}

interface DocUploaderProps {
  docUploadIds: string[];
  docs: DocFile[];
  onDocsChange: (ids: string[], docs: DocFile[]) => void;
  field: FieldSpec;
}

function DocUploader({ docUploadIds, docs, onDocsChange, field }: DocUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedDocs, setUploadedDocs] = useState<DocFile[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleFileUpload = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const allowedTypes = [
      "application/pdf",
      "text/plain",
      "text/markdown",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];
    const allowedExtensions = [".pdf", ".txt", ".md", ".doc", ".docx"];
    
    const validFiles = fileArray.filter(f => 
      allowedTypes.includes(f.type) || 
      allowedExtensions.some(ext => f.name.toLowerCase().endsWith(ext))
    );

    if (validFiles.length === 0) return;

    setIsUploading(true);
    const newDocs: DocFile[] = [];

    try {
      for (const file of validFiles) {
        // Request presigned URL
        const urlRes = await fetch("/api/uploads/request-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: file.name,
            size: file.size,
            contentType: file.type || "application/octet-stream"
          })
        });

        if (!urlRes.ok) {
          console.error("Failed to get upload URL");
          continue;
        }

        const { uploadURL, objectPath } = await urlRes.json();

        // Upload file directly to presigned URL
        const uploadRes = await fetch(uploadURL, {
          method: "PUT",
          body: file,
          headers: {
            "Content-Type": file.type || "application/octet-stream"
          }
        });

        if (!uploadRes.ok) {
          console.error("Failed to upload file");
          continue;
        }

        // Generate a unique ID for this doc
        const docId = `doc_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        newDocs.push({
          id: docId,
          name: file.name,
          size: file.size,
          objectPath,
          mimeType: file.type || "application/octet-stream"
        });
      }

      if (newDocs.length > 0) {
        setUploadedDocs(prev => [...prev, ...newDocs]);
        const allDocs = [...docs, ...newDocs];
        onDocsChange([...docUploadIds, ...newDocs.map(d => d.id)], allDocs);
      }
    } catch (error) {
      console.error("Error uploading documents:", error);
    } finally {
      setIsUploading(false);
    }
  }, [docUploadIds, docs, onDocsChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
  }, [handleFileUpload]);

  const removeDoc = useCallback((docId: string) => {
    setUploadedDocs(prev => prev.filter(d => d.id !== docId));
    const filteredDocs = docs.filter(d => d.id !== docId);
    onDocsChange(docUploadIds.filter(id => id !== docId), filteredDocs);
  }, [docUploadIds, docs, onDocsChange]);

  return (
    <div className="space-y-3">
      <div
        className={`rounded-lg border-2 border-dashed p-4 text-center transition-colors ${
          isDragging 
            ? "border-amber-500 bg-amber-500/5" 
            : "border-muted-foreground/25 hover:border-muted-foreground/50"
        }`}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
        data-testid="drop-zone-docs"
      >
        <input
          type="file"
          ref={inputRef}
          className="hidden"
          multiple
          accept=".pdf,.txt,.md,.doc,.docx"
          onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
          data-testid="input-doc-upload"
        />
        {isUploading ? (
          <div className="flex flex-col items-center gap-2 py-2">
            <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
            <p className="text-sm text-muted-foreground">Uploading...</p>
          </div>
        ) : (
          <>
            <File className="mx-auto h-6 w-6 text-amber-500" />
            <p className="mt-2 text-sm text-muted-foreground">
              Drag and drop PDFs, docs, or text files
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => inputRef.current?.click()}
              data-testid="button-browse-docs"
            >
              Browse Files
            </Button>
          </>
        )}
      </div>

      {field.help && (
        <p className="text-xs text-muted-foreground">{field.help}</p>
      )}

      {uploadedDocs.length > 0 && (
        <div className="space-y-2">
          {uploadedDocs.map((doc) => (
            <div 
              key={doc.id}
              className="flex items-center justify-between rounded-md border p-2"
            >
              <div className="flex items-center gap-2">
                <File className="h-4 w-4 text-amber-500" />
                <span className="text-sm font-medium truncate max-w-[200px]">{doc.name}</span>
                <Badge variant="secondary" className="text-xs">
                  {formatFileSize(doc.size)}
                </Badge>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeDoc(doc.id)}
                data-testid={`button-remove-doc-${doc.id}`}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StepContent({
  step,
  draft,
  onFieldChange,
  projectPackage,
  onProjectPackageUpload,
  onProjectPackageRemove,
  isPackageProcessing,
  isPackageReady
}: {
  step: WizardStep;
  draft: WizardDraft;
  onFieldChange: (key: string, value: any) => void;
  projectPackage: ProjectPackageStatus | null;
  onProjectPackageUpload: (file: File) => void;
  onProjectPackageRemove: () => void;
  isPackageProcessing: boolean;
  isPackageReady: boolean;
}) {
  return (
    <div className="space-y-6">
      {step.description && (
        <p className="text-sm text-muted-foreground">{step.description}</p>
      )}
      
      {step.fieldGroups.map((group) => (
        <div key={group.id} className="space-y-4">
          {group.title && (
            <div>
              <h4 className="font-medium">{group.title}</h4>
              {group.description && (
                <p className="text-sm text-muted-foreground">{group.description}</p>
              )}
            </div>
          )}
          
          {group.fields.map((field) => {
            if (field.ui === "file_zip") {
              return (
                <div key={field.key} className="space-y-2">
                  <Label>
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                  <ZipUploader
                    projectPackage={projectPackage}
                    onUpload={onProjectPackageUpload}
                    onRemove={onProjectPackageRemove}
                    isProcessing={isPackageProcessing}
                    isReady={isPackageReady}
                    required={field.required}
                  />
                </div>
              );
            }

            if (field.ui === "file_docs") {
              const currentIds = getNestedValue(draft as any, field.key) || [];
              const currentDocs = draft.uploads?.docs || [];
              return (
                <div key={field.key} className="space-y-2">
                  <Label>
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                  <DocUploader
                    docUploadIds={Array.isArray(currentIds) ? currentIds : []}
                    docs={currentDocs}
                    onDocsChange={(ids, docs) => {
                      onFieldChange(field.key, ids);
                      onFieldChange("uploads.docs", docs);
                    }}
                    field={field}
                  />
                </div>
              );
            }

            const value = getNestedValue(draft as any, field.key);
            
            return (
              <div key={field.key} className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  {field.label}
                  {field.required && <span className="text-red-500">*</span>}
                  {field.help && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-xs">
                        <p>{field.help}</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </Label>
                <DynamicField
                  field={field}
                  value={value}
                  onChange={(newValue) => onFieldChange(field.key, newValue)}
                />
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function ReviewStep({ draft, mode, onFieldChange }: { draft: WizardDraft; mode: Mode; onFieldChange: (key: string, value: any) => void }) {
  const validation = validateDraftForMode(draft, mode);

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Verify your input before generating the bundle.
      </p>

      {!validation.valid && (
        <div className="rounded-md bg-red-500/10 border border-red-500/20 p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
            <div>
              <p className="font-medium text-red-500">Missing required fields:</p>
              <ul className="list-disc list-inside text-sm text-red-400 mt-1">
                {validation.errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-lg border p-4 space-y-4 text-sm">
        <div>
          <p className="text-xs font-medium text-muted-foreground">PROJECT NAME</p>
          <p className="font-medium">{draft.project.name || "(not set)"}</p>
        </div>
        
        <div>
          <p className="text-xs font-medium text-muted-foreground">DESCRIPTION</p>
          <p>{draft.project.oneLiner || draft.intent.summary || "(not set)"}</p>
        </div>

        {draft.features.p0.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">P0 FEATURES</p>
            <div className="flex flex-wrap gap-1">
              {draft.features.p0.map((f, i) => (
                <Badge key={i} variant="default" className="bg-amber-500">{f}</Badge>
              ))}
            </div>
          </div>
        )}

        {draft.users.roles.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">USER ROLES</p>
            <div className="flex flex-wrap gap-1">
              {draft.users.roles.map((r, i) => (
                <Badge key={i} variant="secondary">{r}</Badge>
              ))}
            </div>
          </div>
        )}

        {(draft.tech.frontend || draft.tech.backend || draft.tech.database) && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">TECH STACK</p>
            <div className="flex flex-wrap gap-1">
              {draft.tech.frontend && <Badge variant="outline">FE: {draft.tech.frontend}</Badge>}
              {draft.tech.backend && <Badge variant="outline">BE: {draft.tech.backend}</Badge>}
              {draft.tech.database && <Badge variant="outline">DB: {draft.tech.database}</Badge>}
            </div>
          </div>
        )}

        {draft.library.packageName && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">LIBRARY</p>
            <p>Package: {draft.library.packageName}</p>
            {draft.library.exports.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Exports: {draft.library.exports.join(", ")}
              </p>
            )}
          </div>
        )}

        {draft.automation.triggers.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">AUTOMATION</p>
            <p className="text-xs">Triggers: {draft.automation.triggers.join(", ")}</p>
            {draft.automation.actions.length > 0 && (
              <p className="text-xs">Actions: {draft.automation.actions.join(", ")}</p>
            )}
          </div>
        )}

        {draft.game.engine && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">GAME</p>
            <p className="text-xs">Engine: {draft.game.engine}</p>
            {draft.game.platform.length > 0 && (
              <p className="text-xs">Platforms: {draft.game.platform.join(", ")}</p>
            )}
          </div>
        )}

        {draft.uploads?.docs && draft.uploads.docs.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">REFERENCE DOCUMENTS</p>
            <p className="text-sm text-muted-foreground">
              {draft.uploads.docs.length} document{draft.uploads.docs.length !== 1 ? "s" : ""} uploaded for context
            </p>
            <div className="flex flex-wrap gap-1 mt-1">
              {draft.uploads.docs.slice(0, 5).map((doc, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  {doc.name}
                </Badge>
              ))}
              {draft.uploads.docs.length > 5 && (
                <Badge variant="outline" className="text-xs">
                  +{draft.uploads.docs.length - 5} more
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="rounded-lg border p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Automatic Delivery</p>
            <p className="text-xs text-muted-foreground">Create a delivery target when assembly completes</p>
          </div>
          <Switch
            checked={draft.delivery.enabled}
            onCheckedChange={(checked) => onFieldChange("delivery.enabled", checked)}
            data-testid="switch-delivery-enabled"
          />
        </div>

        {draft.delivery.enabled && (
          <div className="space-y-4 pt-2 border-t">
            <div className="space-y-2">
              <Label className="text-xs">Delivery Type</Label>
              <Select
                value={draft.delivery.type}
                onValueChange={(v) => onFieldChange("delivery.type", v)}
              >
                <SelectTrigger data-testid="select-delivery-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pull">Pull (Signed URL)</SelectItem>
                  <SelectItem value="webhook">Webhook</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {draft.delivery.type === "pull" && (
              <p className="text-xs text-muted-foreground">
                A signed download URL will be created when the kit is ready.
              </p>
            )}

            {draft.delivery.type === "webhook" && (
              <>
                <div className="space-y-2">
                  <Label className="text-xs">Webhook URL *</Label>
                  <Input
                    type="url"
                    placeholder="https://example.com/webhook"
                    value={draft.delivery.webhookUrl || ""}
                    onChange={(e) => onFieldChange("delivery.webhookUrl", e.target.value)}
                    data-testid="input-delivery-webhook-url"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Webhook Secret *</Label>
                  <Input
                    type="password"
                    placeholder="Your secret for HMAC signature verification"
                    value={draft.delivery.webhookSecret || ""}
                    onChange={(e) => onFieldChange("delivery.webhookSecret", e.target.value)}
                    data-testid="input-delivery-webhook-secret"
                  />
                  <p className="text-xs text-muted-foreground">
                    Used to sign webhook payloads with HMAC-SHA256
                  </p>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function DynamicWizard({
  flow,
  draft,
  onDraftChange,
  currentStepIndex,
  onStepChange,
  projectPackage,
  onProjectPackageUpload,
  onProjectPackageRemove,
  isPackageProcessing,
  isPackageReady,
  mode,
  onSubmit,
  isSubmitting,
  activeStepId,
  hideInternalNav
}: DynamicWizardProps) {
  const resolvedStepIndex = activeStepId 
    ? flow.steps.findIndex(s => s.id === activeStepId) 
    : currentStepIndex;
  const safeIndex = resolvedStepIndex >= 0 ? resolvedStepIndex : currentStepIndex;
  
  const currentStep = flow.steps[safeIndex];
  const isLastStep = safeIndex === flow.steps.length - 1;
  const isReviewStep = currentStep?.id === "review";

  const handleFieldChange = useCallback((key: string, value: any) => {
    const newDraft = { ...draft } as any;
    setNestedValue(newDraft, key, value);
    onDraftChange(newDraft);
  }, [draft, onDraftChange]);

  const handleNext = () => {
    if (currentStepIndex < flow.steps.length - 1) {
      onStepChange(currentStepIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      onStepChange(currentStepIndex - 1);
    }
  };

  const canProceed = () => {
    if (currentStep?.id === "upload") {
      const zipFieldRequired = currentStep.fieldGroups
        .flatMap(g => g.fields)
        .some(f => f.ui === "file_zip" && f.required);
      if (zipFieldRequired && !isPackageReady) {
        return false;
      }
    }
    return true;
  };

  const validation = validateDraftForMode(draft, mode);

  if (!currentStep) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No wizard step available for this section.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!hideInternalNav && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {flow.steps.map((step, index) => (
            <button
              key={step.id}
              type="button"
              onClick={() => onStepChange(index)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-all ${
                index === safeIndex
                  ? "bg-amber-500 text-white"
                  : index < safeIndex
                  ? "bg-amber-500/20 text-amber-500"
                  : "bg-muted text-muted-foreground"
              }`}
              data-testid={`step-${step.id}`}
            >
              <span className="font-medium">{index + 1}</span>
              <span>{step.title}</span>
            </button>
          ))}
        </div>
      )}

      <div className={hideInternalNav ? "" : "min-h-[300px]"}>
        {!hideInternalNav && (
          <h3 className="text-lg font-semibold mb-4">{currentStep.title}</h3>
        )}
        
        {isReviewStep ? (
          <ReviewStep draft={draft} mode={mode} onFieldChange={handleFieldChange} />
        ) : (
          <StepContent
            step={currentStep}
            draft={draft}
            onFieldChange={handleFieldChange}
            projectPackage={projectPackage}
            onProjectPackageUpload={onProjectPackageUpload}
            onProjectPackageRemove={onProjectPackageRemove}
            isPackageProcessing={isPackageProcessing}
            isPackageReady={isPackageReady}
          />
        )}
      </div>

      {!hideInternalNav && (
        <div className="flex justify-between pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrev}
            disabled={safeIndex === 0}
            data-testid="button-prev-step"
          >
            <ChevronLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          
          {isLastStep ? (
            <Button
              type="button"
              onClick={onSubmit}
              disabled={isSubmitting || !validation.valid}
              className="btn-axiom-cta"
              data-testid="button-generate"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  Generate Kit
                  <ChevronRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleNext}
              disabled={!canProceed()}
              className="btn-axiom-cta"
              data-testid="button-next-step"
            >
              Next: {flow.steps[safeIndex + 1]?.title}
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export type { ProjectPackageStatus };
