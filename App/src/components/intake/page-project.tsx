import { useRef, useState, useCallback } from "react";
import { Plus, X, Paperclip, Upload, FileText, Loader2 } from "lucide-react";
import type { PageProps } from "./types";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

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
        <h2 className="text-xl font-semibold text-[hsl(var(--foreground))] mb-1">Project Basics</h2>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Define your project identity and what you want to build.
        </p>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">Project Name *</label>
        <input
          type="text"
          value={p.project_name}
          onChange={(e) => set("project_name", e.target.value)}
          placeholder="my-awesome-project"
          className="w-full px-3 py-2 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">Project Description *</label>
        <textarea
          value={p.problem_statement}
          onChange={(e) => set("problem_statement", e.target.value)}
          placeholder="Describe your project — what it does, what problem it solves, and what you want to build."
          rows={4}
          className="w-full px-3 py-2 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] resize-none"
        />

        <div
          className={`relative mt-2 rounded-md border-2 border-dashed transition-colors ${
            dragOver
              ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.05)]"
              : "border-[hsl(var(--border))] hover:border-[hsl(var(--muted-foreground))]"
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
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
          >
            {uploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Paperclip className="w-4 h-4" />
            )}
            <span>{uploading ? "Uploading..." : "Attach files"}</span>
            <span className="text-xs opacity-60 ml-1">PDF, TXT, ZIP, DOC, MD, CSV</span>
          </button>
        </div>

        {uploadError && (
          <p className="mt-1 text-xs text-red-600">{uploadError}</p>
        )}

        {p.attachments && p.attachments.length > 0 && (
          <div className="mt-2 space-y-1">
            {p.attachments.map((att: any) => (
              <div
                key={att.id}
                className="flex items-center gap-2 px-3 py-2 rounded-md bg-[hsl(var(--muted))] text-sm group"
              >
                <FileText className="w-4 h-4 text-[hsl(var(--muted-foreground))] shrink-0" />
                <a
                  href={`/api/uploads/${att.id}`}
                  download={att.originalName}
                  className="flex-1 truncate text-[hsl(var(--foreground))] hover:underline"
                >
                  {att.originalName}
                </a>
                <span className="text-xs text-[hsl(var(--muted-foreground))] shrink-0">
                  {formatFileSize(att.size)}
                </span>
                <button
                  type="button"
                  onClick={() => removeAttachment(att.id)}
                  className="p-1 rounded text-[hsl(var(--muted-foreground))] hover:text-red-500 hover:bg-red-50 transition opacity-0 group-hover:opacity-100"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">Overview / One-Liner</label>
        <textarea
          value={p.overview}
          onChange={(e) => set("overview", e.target.value)}
          placeholder="A brief description of the project..."
          rows={2}
          className="w-full px-3 py-2 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] resize-none"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Reference Links</label>
          <button
            type="button"
            onClick={addLink}
            className="flex items-center gap-1 text-xs text-[hsl(var(--primary))] hover:underline"
          >
            <Plus className="w-3 h-3" /> Add link
          </button>
        </div>
        {p.links.map((link, i) => (
          <div key={i} className="flex gap-2">
            <input
              type="url"
              value={link}
              onChange={(e) => updateLink(i, e.target.value)}
              placeholder="https://..."
              className="flex-1 px-3 py-2 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
            />
            <button
              type="button"
              onClick={() => removeLink(i)}
              className="p-2 rounded-md text-[hsl(var(--muted-foreground))] hover:text-red-500 hover:bg-red-50 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {isExisting && (
        <div className="space-y-4 border-t border-[hsl(var(--border))] pt-4 mt-4">
          <p className="text-sm font-medium text-[hsl(var(--primary))]">
            Existing Project Details
          </p>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Repository Link</label>
            <input
              type="url"
              value={p.existing_repo}
              onChange={(e) => set("existing_repo", e.target.value)}
              placeholder="https://github.com/..."
              className="w-full px-3 py-2 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Current State Summary</label>
            <textarea
              value={p.existing_state}
              onChange={(e) => set("existing_state", e.target.value)}
              placeholder="Describe the current state of the project..."
              rows={3}
              className="w-full px-3 py-2 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Must Not Change</label>
            <textarea
              value={p.must_not_change}
              onChange={(e) => set("must_not_change", e.target.value)}
              placeholder="List things that should not be modified..."
              rows={2}
              className="w-full px-3 py-2 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Known Issues</label>
            <textarea
              value={p.known_issues}
              onChange={(e) => set("known_issues", e.target.value)}
              placeholder="Any known bugs or technical debt..."
              rows={2}
              className="w-full px-3 py-2 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] resize-none"
            />
          </div>
        </div>
      )}
    </div>
  );
}
