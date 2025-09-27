export interface UploadResult {
  success: boolean;
  publicId?: string;
  error?: string;
}

export interface ContentResult {
  success: boolean;
  content?: string;
  error?: string;
}
