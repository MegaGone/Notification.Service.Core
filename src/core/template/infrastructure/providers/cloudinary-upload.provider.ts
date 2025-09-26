import {
  CLOUDINARY_SECURE,
  CLOUDINARY_API_KEY,
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_SECRET,
  CLOUDINARY_OUTPUT_DIRECTORY,
} from "src/configuration/cloudinary.configuration";
import { UploadProvider } from "../../domain/providers/upload.provider";
import { MULTER_DIRECTORY } from "src/configuration/multer.configuration";
import { ConfigOptions, UploadApiResponse, v2 as cloudinary } from "cloudinary";
import { FileSystemService } from "../../../shared/infrastructure/services/file-system.service";
import { NOTIFICATION_STATE_ENUM } from "src/core/notification/domain/constants/notification-state.enum";

export class CloudinaryUploadProvider implements UploadProvider {
  private readonly _client: typeof cloudinary;
  private readonly _resourceType = "raw" as const;
  private readonly _deleteSuccessStatus = "ok" as const;
  private readonly _fileSystemService: FileSystemService;

  constructor(private readonly fileSystemService: FileSystemService) {
    this._client = cloudinary;
    this._fileSystemService = fileSystemService;
    this._initializeCloudinaryConfig();
  }

  private _initializeCloudinaryConfig(): void {
    this._client.config({
      secure: CLOUDINARY_SECURE,
      api_key: CLOUDINARY_API_KEY,
      api_secret: CLOUDINARY_API_SECRET,
      cloud_name: CLOUDINARY_CLOUD_NAME,
    } as ConfigOptions);
  }

  public async upload(path: string): Promise<string> {
    try {
      const temporalPath = this._fileSystemService.resolvePath(MULTER_DIRECTORY + "/" + path);
      const uploadResult = await this._uploadFileToCloudinary(temporalPath);
      await this._fileSystemService.deleteFile(temporalPath);

      return uploadResult.public_id;
    } catch (error) {
      console.log(`[ERROR][SERVICE][CLOUDINARY][UPLOAD] ${JSON.stringify(error)}`);
      return "";
    }
  }

  private async _uploadFileToCloudinary(temporalPath: string): Promise<UploadApiResponse> {
    return await this._client.uploader.upload(temporalPath, {
      resource_type: this._resourceType,
      folder: CLOUDINARY_OUTPUT_DIRECTORY,
    });
  }

  public async findById(id: string): Promise<unknown> {
    try {
      return await this._client.api.resource(id, {
        resource_type: this._resourceType,
      });
    } catch (error) {
      console.log(`[ERROR][SERVICE][CLOUDINARY][FIND_BY_ID] ${JSON.stringify(error)}`);
      return undefined;
    }
  }

  public async deleteById(id: string): Promise<boolean> {
    try {
      const result = await this._client.uploader.destroy(id, {
        resource_type: this._resourceType,
      });
      return this._isDeleteOperationSuccessful(result);
    } catch (error) {
      console.log(`[ERROR][SERVICE][CLOUDINARY][DELETE_BY_ID] ${JSON.stringify(error)}`);
      return false;
    }
  }

  public async getContentById(publicId: string): Promise<{ content: string; exception?: string }> {
    try {
      const remoteFile = this._client.url(publicId, {
        secure: true,
        resource_type: this._resourceType,
      });

      const response = await fetch(remoteFile);
      if (!response.ok)
        return {
          content: "",
          exception: `[CLOUDINARY] File not found ${publicId}`,
        };

      const content = await response.text();
      return { content };
    } catch (error) {
      console.log(`[ERROR][SERVICE][CLOUDINARY][GET_CONTENT_BY_ID] ${JSON.stringify(error)}`);
      return {
        content: "",
        exception: `[CLOUDINARY] ${JSON.stringify(error)}`,
      };
    }
  }

  private _isDeleteOperationSuccessful(result: any): boolean {
    return result?.result === this._deleteSuccessStatus;
  }
}
