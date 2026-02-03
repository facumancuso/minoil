
"use client";

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, X, File as FileIcon } from 'lucide-react';
import { Button } from './button';
import { getFileIcon } from '@/lib/utils';

const ACCEPTED_FILE_TYPES = {
    'application/pdf': ['.pdf'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    'application/vnd.ms-excel': ['.xls'],
};

interface FileUploadDndProps {
  onFilesChange: (files: File[]) => void;
}

export function FileUploadDnd({ onFilesChange }: FileUploadDndProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[], fileRejections: any[]) => {
    setError(null);
    if (fileRejections.length > 0) {
        const firstError = fileRejections[0].errors[0];
        setError(`Error: ${firstError.message}. Solo se permiten archivos PDF, Word o Excel.`);
        return;
    }

    const newFiles = [...files, ...acceptedFiles];
    setFiles(newFiles);
    onFilesChange(newFiles);
  }, [files, onFilesChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
  });

  const removeFile = (fileToRemove: File) => {
    const newFiles = files.filter(file => file !== fileToRemove);
    setFiles(newFiles);
    onFilesChange(newFiles);
  };
  
  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  return (
    <div className="w-full space-y-4">
      <div
        {...getRootProps()}
        className={`flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
          isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
        }`}
      >
        <input {...getInputProps()} />
        <UploadCloud className="w-8 h-8 text-muted-foreground mb-2" />
        {isDragActive ? (
          <p className="text-primary font-semibold">Suelta los archivos aquí...</p>
        ) : (
          <p className="text-muted-foreground text-sm text-center">
            Arrastra y suelta los informes aquí, o <span className="font-semibold text-primary">haz clic para buscar</span>
          </p>
        )}
        <p className="text-xs text-muted-foreground/80 mt-1">Soportados: PDF, Word, Excel</p>
      </div>

      {error && (
        <div className="text-destructive text-sm font-medium">{error}</div>
      )}

      {files.length > 0 && (
        <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Archivos adjuntos:</h4>
            <ul className="space-y-2">
                {files.map((file, index) => (
                    <li key={index} className="flex items-center justify-between p-2 border rounded-md bg-background">
                        <div className="flex items-center gap-3">
                           {getFileIcon(file.type, 'h-6 w-6 text-primary')}
                           <div className="flex flex-col">
                               <span className="text-sm font-medium">{file.name}</span>
                               <span className="text-xs text-muted-foreground">{formatBytes(file.size)}</span>
                           </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => removeFile(file)} className="h-7 w-7">
                            <X className="h-4 w-4" />
                        </Button>
                    </li>
                ))}
            </ul>
        </div>
      )}
    </div>
  );
}
