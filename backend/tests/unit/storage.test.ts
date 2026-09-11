import { storageService } from '../../src/modules/storage/service';

describe('Storage Module Unit Tests', () => {
  describe('StorageService.uploadBase64', () => {
    it('should upload a base64 encoded document image and return valid URL', async () => {
      const sampleBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      
      const result = await storageService.uploadBase64({
        fileName: 'test-license.png',
        mimeType: 'image/png',
        base64Data: sampleBase64,
        folder: 'documents',
      });

      expect(result).toBeDefined();
      expect(result.url).toContain('/uploads/documents/');
      expect(result.fileName).toBe('test-license.png');
      expect(result.mimeType).toBe('image/png');
      expect(result.fileSize).toBeGreaterThan(0);
      expect(result.key).toContain('documents/');
    });

    it('should upload a base64 encoded PDF document', async () => {
      const rawPdfBase64 = Buffer.from('%PDF-1.4 sample pdf content').toString('base64');
      
      const result = await storageService.uploadBase64({
        fileName: 'business_reg_2026.pdf',
        mimeType: 'application/pdf',
        base64Data: rawPdfBase64,
        folder: 'documents',
      });

      expect(result).toBeDefined();
      expect(result.url).toContain('/uploads/documents/');
      expect(result.fileName).toBe('business_reg_2026.pdf');
      expect(result.mimeType).toBe('application/pdf');
    });

    it('should generate presigned URL for direct upload', async () => {
      const result = await storageService.generatePresignedUrl({
        fileName: 'passport_scan.jpg',
        mimeType: 'image/jpeg',
        fileSize: 204800,
        folder: 'documents',
      });

      expect(result).toBeDefined();
      expect(result.uploadUrl).toBeDefined();
      expect(result.fileUrl).toContain('/uploads/documents/');
      expect(result.headers['Content-Type']).toBe('image/jpeg');
      expect(result.expiresInSeconds).toBe(3600);
    });
  });
});
