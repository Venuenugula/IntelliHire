"use client";

import { uploadJobDescription } from "@/lib/api";
import { useCallback, useRef, useState } from "react";

const ACCEPTED_FORMATS = ["LinkedIn Job", "Indeed", "PDF", "DOCX", "Plain Text"];

const FILE_ACCEPT =
  ".pdf,.docx,.txt,text/plain,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

interface CreateRoleFormProps {
  title: string;
  description: string;
  loading: boolean;
  error: string;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

function UploadIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
      />
    </svg>
  );
}

function titleFromFilename(filename: string): string {
  return filename
    .replace(/\.[^.]+$/, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function CreateRoleForm({
  title,
  description,
  loading,
  error,
  onTitleChange,
  onDescriptionChange,
  onSubmit,
}: CreateRoleFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [dropHint, setDropHint] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [fileError, setFileError] = useState("");

  const handleFile = useCallback(
    async (file: File) => {
      setFileError("");
      setDropHint("");

      const lower = file.name.toLowerCase();
      const isPdf = lower.endsWith(".pdf") || file.type === "application/pdf";
      const isDocx =
        lower.endsWith(".docx") ||
        file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
      const isText = file.type.startsWith("text/") || lower.endsWith(".txt");

      try {
        if (isText) {
          const text = await file.text();
          onDescriptionChange(text);
          if (!title.trim()) onTitleChange(titleFromFilename(file.name));
          setDropHint(`Loaded ${file.name}`);
          return;
        }

        if (isPdf || isDocx) {
          setExtracting(true);
          setDropHint(`Extracting text from ${file.name}…`);
          const result = await uploadJobDescription(file);
          const text = result.document.cleaned_text || result.document.raw_text;
          if (!text.trim()) {
            throw new Error("No text could be extracted from this file.");
          }
          onDescriptionChange(text);
          if (!title.trim()) onTitleChange(titleFromFilename(file.name));
          setDropHint(`Extracted text from ${file.name}`);
          return;
        }

        setFileError("Supported formats: PDF, DOCX, or plain text.");
      } catch (err) {
        setFileError(err instanceof Error ? err.message : "Failed to read file");
        setDropHint("");
      } finally {
        setExtracting(false);
      }
    },
    [onDescriptionChange, onTitleChange, title],
  );

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files?.length) return;
      void handleFile(files[0]);
    },
    [handleFile],
  );

  return (
    <form onSubmit={onSubmit} className="cr-surface">
      <div>
        <label htmlFor="job-title" className="cr-label">
          Job Title
        </label>
        <input
          id="job-title"
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className="cr-input cr-input--title"
          placeholder="Backend Engineer"
          required
        />
      </div>

      <div className="mt-6">
        <label htmlFor="job-description" className="cr-label">
          Job Description
        </label>
        <textarea
          id="job-description"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          className="cr-input cr-input--description"
          placeholder="Paste a complete job description here..."
          required
        />

        <div className="cr-accepted">
          <strong>Accepted</strong>
          {ACCEPTED_FORMATS.map((format) => (
            <span key={format}>• {format}</span>
          ))}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept={FILE_ACCEPT}
          className="sr-only"
          onChange={(e) => handleFiles(e.target.files)}
        />

        <div
          role="button"
          tabIndex={0}
          aria-busy={extracting}
          className={`cr-dropzone ${dragActive ? "cr-dropzone--active" : ""} ${extracting ? "cr-dropzone--loading" : ""}`}
          onClick={() => !extracting && fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if (extracting) return;
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          onDragEnter={(e) => {
            e.preventDefault();
            if (!extracting) setDragActive(true);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            if (!extracting) setDragActive(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setDragActive(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            if (!extracting) handleFiles(e.dataTransfer.files);
          }}
        >
          <span className="cr-dropzone__icon">
            <UploadIcon />
          </span>
          <p className="cr-dropzone__title">
            {extracting ? "Extracting text…" : "Drop a Job Description"}
          </p>
          <p className="cr-dropzone__hint">or paste text above · PDF, DOCX, and plain text supported</p>
          {dropHint && <p className="cr-dropzone__hint cr-dropzone__hint--success">{dropHint}</p>}
        </div>

        {fileError && <p className="cr-error">{fileError}</p>}
      </div>

      {error && <p className="cr-error">{error}</p>}

      <button type="submit" disabled={loading || extracting} className="cr-btn-primary">
        {loading ? "Generating..." : "Generate Role DNA →"}
      </button>
    </form>
  );
}
