import { useRef, useState, useCallback } from "react";
import { Plus, X, Paperclip, Upload, FileText, Loader2, Link, FolderOpen } from "lucide-react";
import type { PageProps } from "./types";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const inputClass =
  "w-full px-3 py-2.5 rounded-md border border-[hsl(var(--glass-border))] bg-[hsl(220_14%_9%)] text-[hsl(var(--foreground))] font-mono-tech text-sm placeholder:text-[hsl(var(--muted-foreground)/0.5)] focus:outline-none focus:border-[hsl(var(--glow-cyan)/0.5)] focus:shadow-[0_0_8px_hsl(var(--glow-cyan)/0.15)] transition-all duration-200";

const textareaClass =
  "w-full px-3 py-2.5 rounded-md border border-[hsl(var(--glass-border))] bg-[hsl(220_14%_9%)] text-[hsl(var(--foreground))] font-mono-tech text-sm placeholder:text-[hsl(var(--muted-foreground)/0.5)] focus:outline-none focus:border-[hsl(var(--glow-cyan)/0.5)] focus:shadow-[0_0_8px_hsl(var(--glow-cyan)/0.15)] transition-all duration-200 resize-none";

export default function PageProject({ data, onChange }: PageProps) {
  const p = data.project;
  const isExisting = data.routing.build_target === "production";
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const set = (field: string, value: unknown) => onChange("project", { [field]: value });

  const addLink = () => set("links", [...p.links, ""]);
  const removeLink = (i: number) => set("links", p.links.filter((_, idx) => idx !== i));
  const updateLink = (i: number, val: string) => {
    const updated = [...p.links];
    updated[i] = val;
    set("links", updated);
  };

  const uploadFiles = useCallback(async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setUploadError(null);
    try {
      const formData = new FormData();
      Array.from(files).forEach((f) => formData.append("files", f));

      const res = await fetch("/api/uploads", { method: "POST", body: formData });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Upload failed");
      }
      const uploaded = await res.json();
      set("attachments", [...(p.attachments || []), ...uploaded]);
    } catch (err: any) {
      setUploadError(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  }, [p.attachments]);

  const removeAttachment = async (id: string) => {
    try {
      await fetch(`/api/uploads/${id}`, { method: "DELETE" });
    } catch {}
    set("attachments", (p.attachments || []).filter((a: any) => a.id !== id));
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      uploadFiles(e.dataTransfer.files);
    }
  }, [uploadFiles]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-1 flex items-center gap-2">
          <FolderOpen className="w-5 h-5 text-[hsl(var(--glow-cyan))]" />
          Project Basics
        </h2>
        <p className="text-sm text-[hsl(var(--muted-foreground))] ml-7">
          Define your project identity and what you want to build.
        </p>
      </div>

      <div className="space-y-1.5">
        <label className="text-system-label">Project Name *</label>
        <input
          type="text"
          value={p.project_name}
          onChange={(e) => set("project_name", e.target.value)}
          placeholder="my-awesome-project"
          className={inputClass}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-system-label">Project Description *</label>
        <textarea
          value={p.problem_statement}
          onChange={(e) => set("problem_statement", e.target.value)}
          placeholder="Describe your project — what it does, what problem it solves, and what you want to build."
          rows={4}
          className={textareaClass}
        />

        <div
          className={`relative mt-3 rounded-lg border-2 border-dashed transition-all duration-200 ${
            dragOver
              ? "border-[hsl(var(--glow-cyan)/0.5)] bg-[hsl(var(--glow-cyan)/0.05)] shadow-[0_0_16px_hsl(var(--glow-cyan)/0.1)]"
              : "border-[hsl(var(--glass-border))] hover:border-[hsl(var(--glow-cyan)/0.3)] hover:shadow-[0_0_8px_hsl(var(--glow-cyan)/0.06)]"
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.txt,.zip,.doc,.docx,.md,.csv,.json,.xml,.rtf"
            onChange={(e) => { if (e.target.files) uploadFiles(e.target.files); e.target.value = ""; }}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full flex flex-col items-center justify-center gap-1.5 px-4 py-5 text-sm transition-colors"
          >
            {uploading ? (
              <Loader2 className="w-5 h-5 animate-spin text-[hsl(var(--glow-cyan))]" />
            ) : (
              <Upload className="w-5 h-5 text-[hsl(var(--muted-foreground))]" />
            )}
            <span className={uploading ? "text-[hsl(var(--glow-cyan))]" : "text-[hsl(var(--muted-foreground))]"}>
              {uploading ? "Uploading..." : "Drop files here or click to attach"}
            </span>
            <span className="text-xs text-[hsl(var(--muted-foreground)/0.5)] font-mono-tech">
              PDF, TXT, ZIP, DOC, MD, CSV, JSON
            </span>
          </button>
        </div>

        {uploadError && (
          <div className="mt-2 px-3 py-2 rounded-md border border-[hsl(var(--glow-red)/0.3)] bg-[hsl(var(--glow-red)/0.05)] text-xs text-[hsl(var(--glow-red))]">
            {uploadError}
          </div>
        )}

        {p.attachments && p.attachments.length > 0 && (
          <div className="mt-3 space-y-1.5">
            {p.attachments.map((att: any) => (
              <div
                key={att.id}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-md border border-[hsl(var(--glass-border))] bg-[hsl(220_14%_9%)] text-sm group transition-all duration-200 hover:border-[hsl(var(--glow-cyan)/0.2)]"
              >
                <FileText className="w-4 h-4 text-[hsl(var(--glow-cyan)/0.6)] shrink-0" />
                <a
                  href={`/api/uploads/${att.id}`}
                  download={att.originalName}
                  className="flex-1 truncate text-[hsl(var(--foreground))] hover:text-[hsl(var(--glow-cyan))] transition-colors font-mono-tech text-xs"
                >
                  {att.originalName}
                </a>
                <span className="text-xs text-[hsl(var(--muted-foreground))] shrink-0 font-mono-tech">
                  {formatFileSize(att.size)}
                </span>
                <button
                  type="button"
                  onClick={() => removeAttachment(att.id)}
                  className="p-1 rounded text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--glow-red))] hover:bg-[hsl(var(--glow-red)/0.1)] transition-all opacity-0 group-hover:opacity-100"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        <label className="text-system-label">Overview / One-Liner</label>
        <textarea
          value={p.overview}
          onChange={(e) => set("overview", e.target.value)}
          placeholder="A brief description of the project..."
          rows={2}
          className={textareaClass}
        />
      </div>

      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-system-label flex items-center gap-1.5">
            <Link className="w-3 h-3" />
            Reference Links
          </label>
          <button
            type="button"
            onClick={addLink}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs text-[hsl(var(--glow-cyan))] border border-[hsl(var(--glow-cyan)/0.2)] bg-[hsl(var(--glow-cyan)/0.05)] hover:bg-[hsl(var(--glow-cyan)/0.1)] hover:border-[hsl(var(--glow-cyan)/0.3)] transition-all duration-200"
          >
            <Plus className="w-3 h-3" /> Add link
          </button>
        </div>
        {p.links.map((link, i) => (
          <div key={i} className="flex gap-2 items-center">
            <input
              type="url"
              value={link}
              onChange={(e) => updateLink(i, e.target.value)}
              placeholder="https://..."
              className={`flex-1 ${inputClass}`}
            />
            <button
              type="button"
              onClick={() => removeLink(i)}
              className="p-2 rounded-md border border-[hsl(var(--glass-border))] bg-[hsl(220_14%_9%)] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--glow-red))] hover:border-[hsl(var(--glow-red)/0.3)] hover:bg-[hsl(var(--glow-red)/0.05)] transition-all duration-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
        {p.links.length === 0 && (
          <p className="text-xs text-[hsl(var(--muted-foreground)/0.4)] italic pl-1">No links added yet</p>
        )}
      </div>

      {isExisting && (
        <div className="space-y-4 border-t border-[hsl(var(--glass-border))] pt-5 mt-5">
          <p className="text-system-label text-[hsl(var(--glow-cyan))]">
            Existing Project Details
          </p>

          <div className="space-y-1.5">
            <label className="text-system-label">Repository Link</label>
            <input
              type="url"
              value={p.existing_repo}
              onChange={(e) => set("existing_repo", e.target.value)}
              placeholder="https://github.com/..."
              className={inputClass}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-system-label">Current State Summary</label>
            <textarea
              value={p.existing_state}
              onChange={(e) => set("existing_state", e.target.value)}
              placeholder="Describe the current state of the project..."
              rows={3}
              className={textareaClass}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-system-label">Must Not Change</label>
            <textarea
              value={p.must_not_change}
              onChange={(e) => set("must_not_change", e.target.value)}
              placeholder="List things that should not be modified..."
              rows={2}
              className={textareaClass}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-system-label">Known Issues</label>
            <textarea
              value={p.known_issues}
              onChange={(e) => set("known_issues", e.target.value)}
              placeholder="Any known bugs or technical debt..."
              rows={2}
              className={textareaClass}
            />
          </div>
        </div>
      )}
    </div>
  );
}
