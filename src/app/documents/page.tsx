"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Upload,
  File,
  Image,
  X,
  Trash2,
} from "lucide-react";
import { useLocalState } from "@/lib/useLocalState";
import type { Doc } from "@/lib/data";

export default function DocumentsPage() {
  const [docs, setDocs] = useLocalState<Doc[]>("documents", []);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const selectedDoc = docs.find((d) => d.id === selectedDocId) || null;

  const addFiles = useCallback((files: File[]) => {
    if (files.length === 0) return;
    const newDocs: Doc[] = files.map((file, i) => ({
      id: Date.now().toString() + i,
      name: file.name,
      type: file.type.includes("image") ? "image" : "pdf",
      size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
      uploadedAt: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    }));
    setDocs((prev) => [...newDocs, ...prev]);
  }, [setDocs]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(Array.from(e.dataTransfer.files));
  }, [addFiles]);

  const handleBrowseClick = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.accept = ".pdf,.jpg,.jpeg,.png,.doc,.docx";
    input.onchange = () => {
      if (input.files) addFiles(Array.from(input.files));
    };
    input.click();
  }, [addFiles]);

  const removeDoc = (id: string) => {
    setDocs((prev) => prev.filter((d) => d.id !== id));
    if (selectedDocId === id) setSelectedDocId(null);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-memoir-text flex items-center gap-2">
          <FileText size={24} className="text-memoir-primary" />
          Documents
        </h1>
        <p className="text-sm text-memoir-text-muted mt-1">
          Upload and keep track of your medical documents
        </p>
      </div>

      {/* Upload area */}
      <div
        className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer mb-6 ${
          isDragging
            ? "border-memoir-primary bg-memoir-primary-lighter/20"
            : "border-memoir-border hover:border-memoir-primary/50 hover:bg-memoir-cream-dark/30"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleBrowseClick}
      >
        <Upload
          size={36}
          className={`mx-auto mb-3 ${
            isDragging ? "text-memoir-primary" : "text-memoir-text-muted"
          }`}
        />
        <p className="text-sm font-medium text-memoir-text mb-1">
          {isDragging ? "Drop files here" : "Drag & drop files here"}
        </p>
        <p className="text-xs text-memoir-text-muted">
          or click to browse • PDF, JPG, PNG, DOC up to 10MB
        </p>
      </div>

      {/* Documents list */}
      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-3">
          {docs.length === 0 ? (
            <div className="card p-10 text-center">
              <FileText size={40} className="text-memoir-sand-dark mx-auto mb-3" />
              <p className="text-sm text-memoir-text-muted">
                No documents uploaded yet
              </p>
            </div>
          ) : (
            docs.map((doc, i) => (
              <motion.div
                key={doc.id}
                className={`card p-4 flex items-center gap-4 cursor-pointer transition-all ${
                  selectedDoc?.id === doc.id
                    ? "ring-2 ring-memoir-primary/30"
                    : ""
                }`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setSelectedDocId(doc.id)}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor:
                      doc.type === "image" ? "#D4A96A18" : "#6B8DAE18",
                    color: doc.type === "image" ? "#D4A96A" : "#6B8DAE",
                  }}
                >
                  {doc.type === "image" ? (
                    <Image size={18} />
                  ) : (
                    <File size={18} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-memoir-text truncate">
                    {doc.name}
                  </div>
                  <div className="text-xs text-memoir-text-muted">
                    {doc.size} • {doc.uploadedAt}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeDoc(doc.id);
                  }}
                  className="p-1.5 rounded-lg hover:bg-memoir-sand transition-colors"
                >
                  <Trash2 size={14} className="text-memoir-text-muted" />
                </button>
              </motion.div>
            ))
          )}
        </div>

        {/* Details panel */}
        <AnimatePresence>
          {selectedDoc && (
            <motion.div
              className="card p-5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-memoir-text">
                  Document Details
                </h3>
                <button
                  onClick={() => setSelectedDocId(null)}
                  className="p-1 rounded-lg hover:bg-memoir-sand transition-colors"
                >
                  <X size={14} className="text-memoir-text-muted" />
                </button>
              </div>
              <p className="text-xs font-medium text-memoir-text mb-1 truncate">
                {selectedDoc.name}
              </p>
              <p className="text-xs text-memoir-text-muted">
                {selectedDoc.size} • Uploaded {selectedDoc.uploadedAt}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
