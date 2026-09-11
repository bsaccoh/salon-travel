import { ProviderDocument } from '@prisma/client';
import { providerDocumentRepository, ProviderDocumentRepository } from './repository';
import { providerRepository, ProviderRepository } from '../providers/repository';
import { NotFoundError } from '../../common/errors';
import { auditService, AuditContext } from '../audit';
import { UploadDocumentInput } from './schemas';

export class ProviderDocumentsService {
  constructor(
    private readonly repo: ProviderDocumentRepository = providerDocumentRepository,
    private readonly providerRepo: ProviderRepository = providerRepository,
  ) {}

  private async getProviderForUser(userId: string) {
    const provider = await this.providerRepo.findByUserId(userId);
    if (!provider) {
      throw new NotFoundError('Provider profile');
    }
    return provider;
  }

  async listDocuments(userId: string): Promise<ProviderDocument[]> {
    const provider = await this.getProviderForUser(userId);
    return this.repo.listByProvider(provider.id);
  }

  async uploadDocument(
    userId: string,
    input: UploadDocumentInput,
    context: AuditContext,
  ): Promise<ProviderDocument> {
    const provider = await this.getProviderForUser(userId);

    const document = await this.repo.create({
      ...input,
      providerId: provider.id,
    });

    await auditService.log(context, {
      action: 'PROVIDER_DOCUMENT_UPLOADED',
      resource: 'provider_document',
      resourceId: document.id,
      metadata: { type: document.type, fileName: document.fileName, providerId: provider.id },
    });

    return document;
  }

  async deleteDocument(
    userId: string,
    documentId: string,
    context: AuditContext,
  ): Promise<void> {
    const provider = await this.getProviderForUser(userId);
    const document = await this.repo.findById(documentId);

    if (!document || document.providerId !== provider.id) {
      throw new NotFoundError('Document', documentId);
    }

    await this.repo.delete(documentId);

    await auditService.log(context, {
      action: 'PROVIDER_DOCUMENT_DELETED',
      resource: 'provider_document',
      resourceId: documentId,
    });
  }
}

export const providerDocumentsService = new ProviderDocumentsService();
