import { Provider, ProviderDocument, Service, DocumentType } from '@prisma/client';
import { ValidationError } from '../../common/errors';

export interface VerificationCheckResult {
  isEligible: boolean;
  missingFields: string[];
  missingDocuments: DocumentType[];
  hasActiveService: boolean;
  errors: string[];
}

export const REQUIRED_VERIFICATION_DOCUMENTS: DocumentType[] = [
  DocumentType.business_registration,
  DocumentType.tax_id,
  DocumentType.id_document,
];

/**
 * Validate that a provider meets all requirements before submitting for verification.
 */
export function validateVerificationPreconditions(
  provider: Provider,
  documents: ProviderDocument[],
  services: Service[],
): VerificationCheckResult {
  const missingFields: string[] = [];
  const errors: string[] = [];

  // 1. Profile completeness check
  if (!provider.businessName?.trim()) missingFields.push('businessName');
  if (!provider.category) missingFields.push('category');
  if (!provider.description?.trim()) missingFields.push('description');
  if (!provider.phone?.trim()) missingFields.push('phone');
  if (!provider.address?.trim()) missingFields.push('address');
  if (!provider.city?.trim()) missingFields.push('city');

  if (missingFields.length > 0) {
    errors.push(`Missing required profile fields: ${missingFields.join(', ')}`);
  }

  // 2. Required documents check
  const uploadedDocTypes = new Set(
    documents.filter((d) => d.status !== 'rejected').map((d) => d.type),
  );

  const missingDocuments = REQUIRED_VERIFICATION_DOCUMENTS.filter(
    (docType) => !uploadedDocTypes.has(docType),
  );

  if (missingDocuments.length > 0) {
    errors.push(`Missing required verification documents: ${missingDocuments.join(', ')}`);
  }

  // 3. At least one active service check
  const hasActiveService = services.some((s) => s.isActive && !s.deletedAt);
  if (!hasActiveService) {
    errors.push('Provider must have at least one active service before submitting verification');
  }

  const isEligible = errors.length === 0;

  return {
    isEligible,
    missingFields,
    missingDocuments,
    hasActiveService,
    errors,
  };
}

/**
 * Asserts verification preconditions or throws ValidationError.
 */
export function assertVerificationPreconditions(
  provider: Provider,
  documents: ProviderDocument[],
  services: Service[],
): void {
  const check = validateVerificationPreconditions(provider, documents, services);
  if (!check.isEligible) {
    throw new ValidationError(
      'Provider does not meet verification requirements',
      check.errors.map((msg) => ({ field: 'verification', message: msg, code: 'PRECONDITION_FAILED' })),
    );
  }
}
