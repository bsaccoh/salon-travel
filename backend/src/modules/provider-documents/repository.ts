import { prisma } from '../../config/database';
import { ProviderDocument, DocumentStatus } from '@prisma/client';
import { UploadDocumentInput } from './schemas';

export class ProviderDocumentRepository {
  async findById(id: string): Promise<ProviderDocument | null> {
    return prisma.providerDocument.findUnique({
      where: { id },
    });
  }

  async listByProvider(providerId: string): Promise<ProviderDocument[]> {
    return prisma.providerDocument.findMany({
      where: { providerId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: UploadDocumentInput & { providerId: string }): Promise<ProviderDocument> {
    return prisma.providerDocument.create({
      data: {
        providerId: data.providerId,
        type: data.type,
        status: DocumentStatus.pending,
        fileName: data.fileName,
        fileSize: data.fileSize,
        mimeType: data.mimeType,
        fileUrl: data.fileUrl,
      },
    });
  }

  async delete(id: string): Promise<ProviderDocument> {
    return prisma.providerDocument.delete({
      where: { id },
    });
  }
}

export const providerDocumentRepository = new ProviderDocumentRepository();
