// app/components/upload/DocumentUploaderConvex.tsx
'use client';

import { useState, useRef } from 'react';
import { useAction, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';

interface DocumentUploaderProps {
  userId: Id<"users">;
  bookingId?: string;
  documentType: string;
  label: string;
  acceptedFileTypes?: string;
  maxSizeMB?: number;
  onUploadComplete?: (documentId: Id<"documents">) => void;
  onUploadError?: (error: string) => void;
}

export default function DocumentUploaderConvex({
  userId,
  bookingId,
  documentType,
  label,
  acceptedFileTypes = "image/*,application/pdf",
  maxSizeMB = 10,
  onUploadComplete,
  onUploadError,
}: DocumentUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // TODO: Implement storage functionality when Convex storage functions are available
  // const generateUploadUrl = useAction(api.storage.generateUploadUrl);
  // const recordDocument = useMutation(api.storage.recordUploadedDocument);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      onUploadError?.(`File size must be less than ${maxSizeMB}MB`);
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // TODO: Replace with actual Convex storage implementation when available
      // Simulate upload progress for UI demonstration
      setUploadProgress(30);
      await new Promise(resolve => setTimeout(resolve, 500));
      setUploadProgress(60);
      await new Promise(resolve => setTimeout(resolve, 500));
      setUploadProgress(80);
      await new Promise(resolve => setTimeout(resolve, 500));
      setUploadProgress(100);

      // Placeholder implementation - would normally upload to Convex storage
      console.warn('Document upload functionality not implemented - storage API unavailable');
      onUploadError?.('Document upload not yet implemented. Storage functions are not available.');
      return;

    } catch (error) {
      console.error('Upload error:', error);
      onUploadError?.(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedFileTypes}
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />

      <div
        onClick={triggerFileSelect}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          uploading
            ? 'border-blue-300 bg-blue-50'
            : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
        }`}
      >
        {uploading ? (
          <div className="space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <div className="text-sm text-gray-600">
              Uploading {label}...
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="mx-auto w-12 h-12 text-gray-400">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Upload {label}</p>
              <p className="text-xs text-gray-500 mt-1">
                Click to select file or drag and drop
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Max size: {maxSizeMB}MB
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}