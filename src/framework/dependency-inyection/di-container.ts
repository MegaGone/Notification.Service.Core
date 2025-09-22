import { LoggerClient } from "../logger/logger.client";

// DATABASE
import { DatabaseManager } from "../database/database.manager";
import { DatasourceInterface } from "../database/datasource/datasource.interface";

// SERVICES
import { FileSystemService } from "../../core/shared/infrastructure/services/file-system.service";

// USE CASES
import { FindTemplatesPaginatedUseCase } from "../../core/template/application/find-templates-paginated";
import { StoreTemplateUseCase } from "../../core/template/application/store-template/store-template.use-case";
import { FindTemplateByIdentificatorUseCase } from "src/core/template/application/find-template-by-identificator";
import { DisableTemplateUseCase } from "../../core/template/application/disable-template/disable-template.use-case";

// PROVIDERS
import { UploadProvider } from "../../core/template/domain/providers/upload.provider";
import { CloudinaryUploadProvider } from "../../core/template/infrastructure/providers/cloudinary-upload.provider";

// REPOSITORIES
import { TemplateRepository } from "../../core/template/domain/repositories/template.repository";
import { MongoTemplateEntity } from "../../core/template/infrastructure/entities/template.mongo-entity";
import { MongoTemplateRepository } from "../../core/template/infrastructure/repositories/mongo-template.repository";

export class DIContainer {
  private static _instance: DIContainer;

  private _logger!: LoggerClient;
  private _datasource!: DatasourceInterface;
  private _databaseManager!: DatabaseManager;

  // Services
  private _fileSystemService!: FileSystemService;

  // Providers
  private _uploadProvider!: UploadProvider;

  // Repositories
  private _templateRepository!: TemplateRepository;

  // Use Cases
  private _storeTemplateUseCase!: StoreTemplateUseCase;
  private _disableTemplateUseCase!: DisableTemplateUseCase;
  private _findTemplatesPaginatedUseCase!: FindTemplatesPaginatedUseCase;
  private _findTemplateByIdentificatorUseCase!: FindTemplateByIdentificatorUseCase;

  private constructor() {
    this.initLogger();
    this.initDatabase();
    this.initServices();
    this.initProviders();
    this.initRepositories();
    this.initUseCases();
  }

  public static getInstance(): DIContainer {
    if (!DIContainer._instance) DIContainer._instance = new DIContainer();

    return DIContainer._instance;
  }

  private initLogger(): void {
    this._logger = new LoggerClient();
  }

  private async initDatabase(): Promise<void> {
    this._databaseManager = new DatabaseManager();
    this._datasource = await this._databaseManager.init();
  }

  public get logger(): LoggerClient {
    return this._logger;
  }

  public get datasource(): DatasourceInterface {
    return this._datasource;
  }

  private initServices(): void {
    this._fileSystemService = new FileSystemService();
  }

  private initProviders(): void {
    this._uploadProvider = new CloudinaryUploadProvider(this._fileSystemService);
  }

  private initRepositories(): void {
    this._templateRepository = new MongoTemplateRepository(MongoTemplateEntity);
  }

  private initUseCases(): void {
    this._storeTemplateUseCase = new StoreTemplateUseCase(
      this._uploadProvider,
      this._templateRepository,
    );

    this._disableTemplateUseCase = new DisableTemplateUseCase(
      this._uploadProvider,
      this._templateRepository,
    );

    this._findTemplatesPaginatedUseCase = new FindTemplatesPaginatedUseCase(
      this._templateRepository,
    );

    this._findTemplateByIdentificatorUseCase = new FindTemplateByIdentificatorUseCase(
      this._templateRepository,
    );
  }

  // Getters for services
  public get fileSystemService(): FileSystemService {
    return this._fileSystemService;
  }

  // Getters for providers
  public get uploadProvider(): UploadProvider {
    return this._uploadProvider;
  }

  // Getters for repositories
  public get templateRepository(): TemplateRepository {
    return this._templateRepository;
  }

  // Getters for use cases
  public get storeTemplateUseCase(): StoreTemplateUseCase {
    return this._storeTemplateUseCase;
  }

  public get disableTemplateUseCase(): DisableTemplateUseCase {
    return this._disableTemplateUseCase;
  }

  public get findTemplatesPaginatedUseCase(): FindTemplatesPaginatedUseCase {
    return this._findTemplatesPaginatedUseCase;
  }

  public get findTemplateByIdentificatorUseCase(): FindTemplateByIdentificatorUseCase {
    return this._findTemplateByIdentificatorUseCase;
  }
}
