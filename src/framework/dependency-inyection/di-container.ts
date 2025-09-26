import { LoggerClient } from "../logger/logger.client";

// DATABASE
import { DatabaseManager } from "../database/database.manager";
import { DatasourceInterface } from "../database/datasource/datasource.interface";

// SERVICES
import { FileSystemService } from "../../core/shared/infrastructure/services/file-system.service";

// USE CASES
import { UpdateTemplateUseCase } from "src/core/template/application/update-template";
import { FindTemplatesPaginatedUseCase } from "../../core/template/application/find-templates-paginated";
import { StoreTemplateUseCase } from "../../core/template/application/store-template/store-template.use-case";
import { FindTemplateByIdentificatorUseCase } from "src/core/template/application/find-template-by-identificator";
import { DisableTemplateUseCase } from "../../core/template/application/disable-template/disable-template.use-case";

import { SendEmailOrchestrator } from "src/core/notification/application/send-email-orchestrator";
import { StoreNotificationLogUseCase } from "../../core/notification/application/store-notification-log/store-notification-log.use-case";

// PROVIDERS
import { SmtpProvider } from "src/core/notification/domain/providers/smtp.provider";
import { UploadProvider } from "../../core/template/domain/providers/upload.provider";
import { ResendSmtpProvider } from "../../core/notification/infrastructure/providers/resend-smtp.provider";
import { CloudinaryUploadProvider } from "../../core/template/infrastructure/providers/cloudinary-upload.provider";

// REPOSITORIES
import { TemplateRepository } from "../../core/template/domain/repositories/template.repository";
import { MongoTemplateEntity } from "../../core/template/infrastructure/entities/template.mongo-entity";
import { NotificationRepository } from "src/core/notification/domain/repositories/notification.repository";
import { MongoTemplateRepository } from "../../core/template/infrastructure/repositories/mongo-template.repository";
import { MongoNotificationEntity } from "../../core/notification/infrastructure/entities/notification.mongo-entity";
import { MongoNotificationRepository } from "../../core/notification/infrastructure/repositories/mongo-notification.repository";

export class DIContainer {
  private static _instance: DIContainer;

  private _logger!: LoggerClient;
  private _datasource!: DatasourceInterface;
  private _databaseManager!: DatabaseManager;

  // Services
  private _fileSystemService!: FileSystemService;

  // Providers
  private _smtpProvider!: SmtpProvider;
  private _uploadProvider!: UploadProvider;

  // Repositories
  private _templateRepository!: TemplateRepository;
  private _notificationRepository!: NotificationRepository;

  // Use Cases
  private _storeTemplateUseCase!: StoreTemplateUseCase;
  private _updateTemplateUseCase!: UpdateTemplateUseCase;
  private _disableTemplateUseCase!: DisableTemplateUseCase;
  private _findTemplatesPaginatedUseCase!: FindTemplatesPaginatedUseCase;
  private _findTemplateByIdentificatorUseCase!: FindTemplateByIdentificatorUseCase;

  private _sendEmailNotificationUseCase!: SendEmailOrchestrator;
  private _storeNotificationLogUseCase!: StoreNotificationLogUseCase;

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
    this._smtpProvider = new ResendSmtpProvider();
  }

  private initRepositories(): void {
    this._templateRepository = new MongoTemplateRepository(MongoTemplateEntity);
    this._notificationRepository = new MongoNotificationRepository(MongoNotificationEntity);
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

    this._updateTemplateUseCase = new UpdateTemplateUseCase(
      this._uploadProvider,
      this._templateRepository,
    );

    // NOTIFICATION
    this._storeNotificationLogUseCase = new StoreNotificationLogUseCase(
      this._notificationRepository,
    );

    this._sendEmailNotificationUseCase = new SendEmailOrchestrator(
      this._smtpProvider,
      this._uploadProvider,
      this._templateRepository,
      this._storeNotificationLogUseCase,
    );
  }

  // Getters for services
  public get fileSystemService(): FileSystemService {
    return this._fileSystemService;
  }

  // Getters for providers
  public get smtpProvider(): SmtpProvider {
    return this._smtpProvider;
  }

  public get uploadProvider(): UploadProvider {
    return this._uploadProvider;
  }

  // Getters for repositories
  public get templateRepository(): TemplateRepository {
    return this._templateRepository;
  }

  public get notificationRepository(): NotificationRepository {
    return this._notificationRepository;
  }

  // Getters for use cases
  public get storeTemplateUseCase(): StoreTemplateUseCase {
    return this._storeTemplateUseCase;
  }

  public get updateTemplateUseCase(): UpdateTemplateUseCase {
    return this._updateTemplateUseCase;
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

  public get storeNotificationLogUseCase(): StoreNotificationLogUseCase {
    return this._storeNotificationLogUseCase;
  }

  public get sendEmailNotificationUseCase(): SendEmailOrchestrator {
    return this._sendEmailNotificationUseCase;
  }
}
