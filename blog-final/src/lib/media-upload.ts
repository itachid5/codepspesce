export const MEDIA_UPLOAD_URL = process.env.MEDIA_API_URL ?? "https://bot-api-j75j.onrender.com/api/cloudinary/upload";

export type MediaUploadResponse = {
  secure_url: string;
  public_id: string;
  resource_type: string;
  format: string;
  bytes: number;
  original_filename: string;
  asset_id: string;
  width?: number;
  height?: number;
};
