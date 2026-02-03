import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { FileText, FileCode, FileUp } from "lucide-react";
import React from "react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getFileIcon(fileType: string, className?: string) {
    if (fileType.includes('pdf')) {
        return React.createElement(FileText, { className });
    }
    if (fileType.includes('word')) {
        return React.createElement(FileText, { className });
    }
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) {
        return React.createElement(FileCode, { className });
    }
    return React.createElement(FileUp, { className });
}
