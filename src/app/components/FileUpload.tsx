"use client"

import { useCallback } from "react"
import { useDropzone } from "react-dropzone"

interface FileUploadProps {
  onFileUpload: (file: File) => void
  isProcessing: boolean
}

export default function FileUpload({ onFileUpload, isProcessing }: FileUploadProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileUpload(acceptedFiles[0])
      }
    },
    [onFileUpload],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/epub+zip": [".epub"],
    },
    multiple: false,
    disabled: isProcessing,
  })

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-2xl p-8 md:p-12 text-center mb-8 cursor-pointer transition-all duration-300 bg-matrix-primary/5 ${
        isDragActive
          ? "border-matrix-primary bg-matrix-primary/20 scale-105"
          : "border-matrix-primary/30 hover:border-matrix-primary hover:bg-matrix-primary/10 hover:scale-[1.01]"
      } ${isProcessing ? "cursor-not-allowed opacity-60 animate-pulse" : ""}`}
    >
      <input {...getInputProps()} />
      {isProcessing ? (
        <div>
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-matrix-primary border-t-transparent mb-4"></div>
          <p className="text-matrix-primary text-lg font-medium">Processing book...</p>
        </div>
      ) : isDragActive ? (
        <p className="text-matrix-primary text-lg font-medium">Drop the file here...</p>
      ) : (
        <>
          <p className="text-matrix-primary text-lg font-medium mb-2">
            Drag & drop a book here, or click to select
          </p>
          <p className="text-matrix-light text-sm opacity-80">
            Supports PDF and EPUB formats
          </p>
          <div className="mt-4 flex items-center justify-center gap-4 text-xs text-matrix-light/60">
            <span className="px-3 py-1 bg-matrix-primary/10 rounded border border-matrix-primary/20">
              .pdf
            </span>
            <span className="px-3 py-1 bg-matrix-primary/10 rounded border border-matrix-primary/20">
              .epub
            </span>
          </div>
        </>
      )}
    </div>
  )
}