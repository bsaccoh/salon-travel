'use client';

import React, { useState } from 'react';
import { ProviderSidebar } from '@/components/dashboard/provider-sidebar';
import { FileCheck, Upload, Loader2, Plus, X, Trash2, ExternalLink, FileText } from 'lucide-react';
import { useMyDocuments, useUploadDocument, useDeleteDocument } from '@/hooks/use-providers';
import { ErrorState } from '@/components/ui/error-state';
import { FileDropzone } from '@/components/ui/file-dropzone';

const DOCUMENT_TYPES = [
  { value: 'business_registration', label: 'Business Registration' },
  { value: 'tax_id', label: 'Tax ID (NRA Clearance)' },
  { value: 'insurance', label: 'Insurance Certificate' },
  { value: 'permit', label: 'Operating Permit / License' },
  { value: 'id_document', label: 'Government ID / Passport' },
  { value: 'other', label: 'Other Support Document' },
];

export default function ProviderDocumentsPage() {
  const { data: documents, isLoading, error, refetch } = useMyDocuments();
  const uploadDoc = useUploadDocument();
  const deleteDoc = useDeleteDocument();
  const [showForm, setShowForm] = useState(false);
  const [documentType, setDocumentType] = useState('business_registration');

  const handleDropzoneSuccess = (fileResult: {
    url: string;
    key: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
  }) => {
    uploadDoc.mutate(
      {
        type: documentType,
        fileName: fileResult.fileName,
        fileSize: fileResult.fileSize,
        mimeType: fileResult.mimeType,
        fileUrl: fileResult.url,
      },
      {
        onSuccess: () => {
          setShowForm(false);
        },
      },
    );
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this document?')) {
      deleteDoc.mutate(id);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <ProviderSidebar />
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-text flex items-center gap-2">
              <FileCheck className="w-6 h-6 text-primary" /> Business Documents
            </h1>
            <p className="text-xs text-text-muted mt-1">
              Upload and manage compliance documents required for provider verification.
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-primary text-white hover:bg-primary-dark transition-colors"
          >
            {showForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            {showForm ? 'Cancel' : 'Upload Document'}
          </button>
        </div>

        {showForm && (
          <div className="rounded-2xl border border-border bg-surface shadow-card p-6 mb-6 space-y-4">
            <h3 className="text-sm font-bold text-text">Upload Compliance Document</h3>
            
            <div className="max-w-xs">
              <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1.5">
                Select Document Category
              </label>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary/30 font-medium"
              >
                {DOCUMENT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <FileDropzone
              folder="documents"
              acceptedTypes={['application/pdf', 'image/jpeg', 'image/png', 'image/webp']}
              maxSizeMB={10}
              label="Document File"
              description="Drop your certified PDF or clear scan (JPEG, PNG, up to 10MB)"
              onUploadSuccess={handleDropzoneSuccess}
            />

            {uploadDoc.isPending && (
              <div className="flex items-center gap-2 text-xs text-primary font-bold">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving document to compliance profile...</span>
              </div>
            )}

            {uploadDoc.isError && (
              <p className="text-xs text-danger font-medium">
                Failed to save document. Please try again.
              </p>
            )}
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-primary">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : error ? (
          <ErrorState onRetry={() => refetch()} />
        ) : (documents || []).length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-surface shadow-card p-12 text-center">
            <Upload className="w-10 h-10 text-text-muted mx-auto mb-3" />
            <h3 className="text-base font-bold text-text mb-1">No documents uploaded yet</h3>
            <p className="text-xs text-text-muted max-w-md mx-auto mb-4">
              Upload your business registration, insurance certificates, and other required documents to complete verification.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-primary text-white hover:bg-primary-dark transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Upload Your First Document
            </button>
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-surface shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-background/50">
                    <th className="text-left px-6 py-3 font-bold text-text-muted uppercase tracking-wider">Document</th>
                    <th className="text-left px-6 py-3 font-bold text-text-muted uppercase tracking-wider">Type</th>
                    <th className="text-left px-6 py-3 font-bold text-text-muted uppercase tracking-wider">Status</th>
                    <th className="text-left px-6 py-3 font-bold text-text-muted uppercase tracking-wider">Uploaded</th>
                    <th className="text-right px-6 py-3 font-bold text-text-muted uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(documents || []).map((doc: any) => (
                    <tr key={doc.id} className="border-b border-border/50 hover:bg-background/30 transition-colors">
                      <td className="px-6 py-4 font-bold text-text">{doc.name || doc.fileName}</td>
                      <td className="px-6 py-4 text-text-muted capitalize">{(doc.type || '').replace(/_/g, ' ')}</td>
                      <td className="px-6 py-4">
                        <span className={`text-[11px] font-bold uppercase px-2 py-0.5 rounded-full ${doc.status === 'approved' ? 'bg-success/10 text-success' : doc.status === 'rejected' ? 'bg-danger/10 text-danger' : 'bg-warning/10 text-warning'}`}>
                          {doc.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-text-muted">{new Date(doc.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {doc.fileUrl && (
                            <a
                              href={doc.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg text-text-muted hover:text-primary hover:bg-primary/10 transition-colors"
                              title="View document"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                          <button
                            onClick={() => handleDelete(doc.id)}
                            disabled={deleteDoc.isPending}
                            className="p-1.5 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 transition-colors"
                            title="Delete document"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
