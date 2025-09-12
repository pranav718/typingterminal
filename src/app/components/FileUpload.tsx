'use client'

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  isProcessing: boolean;
}

export default function FileUpload({ onFileUpload, isProcessing }: FileUploadProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileUpload(acceptedFiles[0]);
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: false,
    disabled: isProcessing
  });

  return (
    <div
      {...getRootProps()}
      className={`upload-zone ${isDragActive ? 'drag-active' : ''} ${isProcessing ? 'processing' : ''}`}
    >
      <input {...getInputProps()} />
      {isProcessing ? (
        <p>Processing PDF...</p>
      ) : isDragActive ? (
        <p>Drop the PDF here...</p>
      ) : (
        <>
          <p>Drag & drop a PDF book here, or click to select</p>
          <p className="upload-hint">We'll extract readable passages for your typing practice</p>
        </>
      )}
    </div>
  );
}