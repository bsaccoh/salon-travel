import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { DirectUploadInput, PresignedUrlInput, MAX_FILE_SIZE_BYTES } from './schemas';
import { BadRequestError } from '../../common/errors';
import { env } from '../../config/env';

export interface FileUploadResult {
  url: string;
  key: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

export interface PresignedUrlResult {
  uploadUrl: string;
  fileUrl: string;
  key: string;
  headers: Record<string, string>;
  expiresInSeconds: number;
}

export class StorageService {
  private readonly uploadsDir: string;

  constructor() {
    // Base uploads directory relative to project root
    this.uploadsDir = path.join(process.cwd(), 'uploads');
    this.ensureDirectoryExists(this.uploadsDir);
  }

  private ensureDirectoryExists(dir: string): void {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  private sanitizeFilename(fileName: string): string {
    return fileName.replace(/[^a-zA-Z0-9._-]/g, '_').toLowerCase();
  }

  async uploadBase64(input: DirectUploadInput): Promise<FileUploadResult> {
    const { fileName, mimeType, base64Data, folder } = input;

    // Remove base64 data URL prefix if present (e.g. data:image/png;base64,...)
    const cleanBase64 = base64Data.replace(/^data:[a-zA-Z0-9\/+.-]+;base64,/, '');
    const buffer = Buffer.from(cleanBase64, 'base64');

    if (buffer.length > MAX_FILE_SIZE_BYTES) {
      throw new BadRequestError(`File size (${Math.round(buffer.length / 1024 / 1024)}MB) exceeds maximum 10MB limit`);
    }

    const folderDir = path.join(this.uploadsDir, folder);
    this.ensureDirectoryExists(folderDir);

    const fileId = crypto.randomUUID();
    const cleanName = this.sanitizeFilename(fileName);
    const storedFileName = `${fileId}-${cleanName}`;
    const filePath = path.join(folderDir, storedFileName);

    await fs.promises.writeFile(filePath, buffer);

    const key = `${folder}/${storedFileName}`;
    const baseUrl = env.API_BASE_URL || `http://localhost:${env.PORT || 4000}`;
    const url = `${baseUrl}/uploads/${key}`;

    return {
      url,
      key,
      fileName,
      fileSize: buffer.length,
      mimeType,
    };
  }

  async generatePresignedUrl(input: PresignedUrlInput): Promise<PresignedUrlResult> {
    const { fileName, mimeType, folder } = input;
    const fileId = crypto.randomUUID();
    const cleanName = this.sanitizeFilename(fileName);
    const storedFileName = `${fileId}-${cleanName}`;
    const key = `${folder}/${storedFileName}`;

    const baseUrl = env.API_BASE_URL || `http://localhost:${env.PORT || 4000}`;
    const fileUrl = `${baseUrl}/uploads/${key}`;
    const uploadUrl = `${baseUrl}/v1/storage/upload`;

    return {
      uploadUrl,
      fileUrl,
      key,
      headers: {
        'Content-Type': mimeType,
      },
      expiresInSeconds: 3600,
    };
  }
}

export const storageService = new StorageService();
