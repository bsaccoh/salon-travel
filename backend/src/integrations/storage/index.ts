export interface UploadOptions {
  key: string;
  body: Buffer | Uint8Array | string;
  contentType: string;
  metadata?: Record<string, string>;
  isPublic?: boolean;
}

export interface StorageProvider {
  upload(options: UploadOptions): Promise<{ url: string; key: string }>;
  getSignedUrl(key: string, expiresInSeconds?: number): Promise<string>;
  delete(key: string): Promise<void>;
}

export class MockStorageProvider implements StorageProvider {
  async upload(options: UploadOptions): Promise<{ url: string; key: string }> {
    return {
      url: `https://mock-storage.salonetravel.com/${options.key}`,
      key: options.key,
    };
  }

  async getSignedUrl(key: string, _expiresInSeconds = 3600): Promise<string> {
    return `https://mock-storage.salonetravel.com/${key}?signed=true`;
  }

  async delete(_key: string): Promise<void> {
    // No-op for mock
  }
}
