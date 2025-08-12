// app/components/upload/DocumentUpload.tsx
'use client';

import { useState, useRef } from 'react';
import { uploadDocument } from '../../lib/s3/upload';

interface DocumentUploadProps {
  bookingId: string;
  onUploadSuccess: (documentUrl: string, documentType: string) => void;
  onUploadError: (error: string) => void;
  allowedTypes?: string[];
  maxFileSize?: number; // in MB
}

interface UploadingFile {
  file: File;
  progress: number;
  status: 'uploading' | 'complete' | 'error';
  error?: string;
  url?: string;
}

const DOCUMENT_TYPES = [
  { value: 'commercial_invoice', label: 'Commercial Invoice' },
  { value: 'packing_list', label: 'Packing List' },
  { value: 'customs_declaration', label: 'Customs Declaration' },
  { value: 'photo_id', label: 'Photo ID' },
  { value: 'authorization_letter', label: 'Authorization Letter' },
  { value: 'other', label: 'Other Document' },
];

export default function DocumentUpload({ 
  bookingId, 
  onUploadSuccess, 
  onUploadError, 
  allowedTypes = ['pdf', 'jpg', 'jpeg', 'png'],
  maxFileSize = 10 
}: DocumentUploadProps) {
  const [uploadingFiles, setUploadingFiles] = useState<Map<string, UploadingFile>>(new Map());
  const [selectedDocType, setSelectedDocType] = useState('commercial_invoice');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (!fileExtension || !allowedTypes.includes(fileExtension)) {
      return `File type not allowed. Supported types: ${allowedTypes.join(', ')}`;
    }
    
    if (file.size > maxFileSize * 1024 * 1024) {
      return `File size exceeds ${maxFileSize}MB limit`;
    }
    
    return null;
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    for (const file of Array.from(files)) {
      const fileId = `${Date.now()}-${file.name}`;
      const validationError = validateFile(file);
      
      if (validationError) {
        onUploadError(`${file.name}: ${validationError}`);
        continue;
      }

      // Add to uploading files
      setUploadingFiles(prev => new Map(prev.set(fileId, {
        file,
        progress: 0,
        status: 'uploading'
      })));

      try {
        // Upload the file
        const uploadResult = await uploadDocument(
          file, 
          bookingId, 
          selectedDocType,
          (progress) => {
            setUploadingFiles(prev => {
              const updated = new Map(prev);
              const current = updated.get(fileId);
              if (current) {
                updated.set(fileId, { ...current, progress });
              }
              return updated;
            });
          }
        );

        // Update status to complete
        setUploadingFiles(prev => {
          const updated = new Map(prev);
          updated.set(fileId, {
            file,
            progress: 100,
            status: 'complete',
            url: uploadResult.url
          });
          return updated;
        });

        onUploadSuccess(uploadResult.url, selectedDocType);

      } catch (error) {
        console.error('Upload error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Upload failed';
        
        setUploadingFiles(prev => {
          const updated = new Map(prev);
          updated.set(fileId, {
            file,
            progress: 0,
            status: 'error',
            error: errorMessage
          });
          return updated;
        });

        onUploadError(`${file.name}: ${errorMessage}`);
      }
    }

    // Clear the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (fileId: string) => {
    setUploadingFiles(prev => {
      const updated = new Map(prev);
      updated.delete(fileId);
      return updated;
    });
  };

  return (
    <div className="bg-white shadow-md rounded px-6 py-4">
      <h3 className="text-lg font-bold mb-4">Upload Documents</h3>
      
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Document Type
        </label>
        <select
          value={selectedDocType}
          onChange={(e) => setSelectedDocType(e.target.value)}
          className="shadow border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:shadow-outline"
        >
          {DOCUMENT_TYPES.map(type => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={allowedTypes.map(type => `.${type}`).join(',')}
          onChange={handleFileSelect}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full border-2 border-dashed border-gray-300 hover:border-blue-400 rounded-lg py-6 px-4 text-center transition-colors"
        >
          <div className="text-gray-600">
            <svg className="mx-auto h-8 w-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-sm">
              <span className="font-medium text-blue-600">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500">
              {allowedTypes.join(', ').toUpperCase()} up to {maxFileSize}MB
            </p>
          </div>
        </button>
      </div>

      {/* Upload Progress */}
      {uploadingFiles.size > 0 && (
        <div className="space-y-2">
          {Array.from(uploadingFiles.entries()).map(([fileId, fileData]) => (
            <div key={fileId} className="border rounded p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium truncate">{fileData.file.name}</span>
                <button
                  onClick={() => removeFile(fileId)}
                  className="text-gray-400 hover:text-red-500"
                >
                  ×
                </button>
              </div>
              
              {fileData.status === 'uploading' && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${fileData.progress}%` }}
                  />
                </div>
              )}
              
              {fileData.status === 'complete' && (
                <div className="text-green-600 text-sm flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Upload complete
                </div>
              )}
              
              {fileData.status === 'error' && (
                <div className="text-red-600 text-sm flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {fileData.error}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500">
        <p>Required documents may include:</p>
        <ul className="list-disc list-inside mt-1 space-y-1">
          <li>Commercial invoice for all shipments</li>
          <li>Packing list with detailed item descriptions</li>
          <li>Customs declaration (if required by destination)</li>
          <li>Photo ID for personal effects shipments</li>
        </ul>
      </div>
    </div>
  );
}