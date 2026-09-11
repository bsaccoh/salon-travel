import { ProviderDocument } from '@prisma/client';

export interface PresentedProviderDocument {
  id: string;
  providerId: string;
  type: string;
  fileUrl: string;
  fileName: string | null;
  fileSizeBytes: number | null;
  mimeType: string | null;
  status: string;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export function providerDocumentPresenter(doc: ProviderDocument | any): PresentedProviderDocument {
  return {
    id: doc.id,
    providerId: doc.providerId,
    type: doc.type,
    fileUrl: doc.fileUrl,
    fileName: doc.fileName || null,
    fileSizeBytes: doc.fileSizeBytes ? Number(doc.fileSizeBytes) : null,
    mimeType: doc.mimeType || null,
    status: doc.status,
    expiresAt: doc.expiresAt || null,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export function providerDocumentListPresenter(items: (ProviderDocument | any)[]): PresentedProviderDocument[] {
  return items.map(providerDocumentPresenter);
}
