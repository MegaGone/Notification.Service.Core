import { TemplateEntity } from "../../../src/core/template/domain/entities/template.entity";
import { SmtpProvider } from "../../../src/core/notification/domain/providers/smtp.provider";
import { UploadProvider } from "../../../src/core/template/domain/providers/upload.provider";
import { ResponseStatus } from "../../../src/core/shared/domain/entities/response-status.model";
import { PrimitiveTemplate } from "../../../src/core/template/domain/entities/template.interface";
import { TEMPLATE_TYPE_ENUM } from "../../../src/core/template/domain/constants/template-type.enum";
import { ContentResult } from "../../../src/core/template/domain/providers/upload-response.interface";
import { SmtpResponse } from "../../../src/core/notification/domain/providers/smtp-response.interface";
import {
  SendNotificationOrchestratorDto,
  SendNotificationOrchestratorResponseDto,
} from "../../../src/core/notification/application/send-email-orchestrator/send-email-orchestrator.dto";
import { TemplateRepository } from "../../../src/core/template/domain/repositories/template.repository";
import { NOTIFICATION_STATE_ENUM } from "../../../src/core/notification/domain/constants/notification-state.enum";
import { SendEmailOrchestrator } from "../../../src/core/notification/application/send-email-orchestrator/send-email.orchestrator";
import { StoreNotificationLogDto } from "../../../src/core/notification/application/store-notification-log/store-notification-log.dto";
import { StoreNotificationLogUseCase } from "../../../src/core/notification/application/store-notification-log/store-notification-log.use-case";

interface MockedSmtpProvider {
  SendEmailWithTemplate: jest.MockedFunction<
    (
      sender: string,
      subject: string,
      recipients: string | Array<string>,
      template: string,
    ) => Promise<SmtpResponse>
  >;
}

interface MockedUploadProvider {
  getContentById: jest.MockedFunction<(publicId: string) => Promise<ContentResult>>;
  findById: jest.MockedFunction<(id: string) => Promise<unknown>>;
  deleteById: jest.MockedFunction<(id: string) => Promise<boolean>>;
  upload: jest.MockedFunction<(path: string) => Promise<any>>;
}

interface MockedTemplateRepository {
  findByIdentificator: jest.MockedFunction<
    (identificator: string) => Promise<TemplateEntity | null>
  >;
  findByDescription: jest.MockedFunction<(description: string) => Promise<TemplateEntity | null>>;
  store: jest.MockedFunction<(template: TemplateEntity) => Promise<TemplateEntity>>;
  update: jest.MockedFunction<
    (identificator: string, template: Partial<PrimitiveTemplate>) => Promise<boolean>
  >;
  disable: jest.MockedFunction<(identificator: string) => Promise<boolean>>;
  findPaginated: jest.MockedFunction<
    (
      page: number,
      pageSize: number,
      enabled?: boolean,
    ) => Promise<{ count: number; records: Array<TemplateEntity> }>
  >;
}

interface MockedStoreNotificationLogUseCase {
  execute: jest.MockedFunction<(dto: StoreNotificationLogDto) => Promise<void>>;
}

const smtpProviderMock = (): MockedSmtpProvider => ({
  SendEmailWithTemplate: jest.fn(),
});

const uploadProviderMock = (): MockedUploadProvider => ({
  getContentById: jest.fn(),
  findById: jest.fn(),
  deleteById: jest.fn(),
  upload: jest.fn(),
});

const templateRepositoryMock = (): MockedTemplateRepository => ({
  findByIdentificator: jest.fn(),
  findByDescription: jest.fn(),
  store: jest.fn(),
  update: jest.fn(),
  disable: jest.fn(),
  findPaginated: jest.fn(),
});

const storeNotificationLogUseCaseMock = (): MockedStoreNotificationLogUseCase => ({
  execute: jest.fn(),
});

const sendNotificationOrchestratorDtoMock = (
  overrides?: Partial<SendNotificationOrchestratorDto>,
): SendNotificationOrchestratorDto => ({
  templateID: "welcome-email-template",
  fields: {
    name: "John Doe",
    email: "john.doe@example.com",
    date: "2025-01-15",
  },
  recipients: ["user@example.com"],
  ...overrides,
});

const templateEntityMock = (overrides?: Partial<PrimitiveTemplate>): TemplateEntity => {
  const primitiveData: PrimitiveTemplate = {
    id: "template-uuid-123",
    type: TEMPLATE_TYPE_ENUM.EMAIL,
    sender: "no-reply@example.com",
    subject: "Welcome to our platform",
    description: "Welcome email template",
    templateId: "cloudinary-template-id-123",
    identificator: "welcome-email-template",
    fields: ["name", "email", "date"],
    enabled: true,
    createdAt: new Date("2025-01-01T00:00:00.000Z"),
    updatedAt: new Date("2025-01-02T00:00:00.000Z"),
    ...overrides,
  };
  return TemplateEntity.create(primitiveData);
};

const contentResultMock = (overrides?: Partial<ContentResult>): ContentResult => ({
  success: true,
  content: "<html><body>Hello {{name}}, welcome to our platform!</body></html>",
  ...overrides,
});

const smtpResponseMock = (overrides?: Partial<SmtpResponse>): SmtpResponse => ({
  status: NOTIFICATION_STATE_ENUM.SENT,
  response: "Email sent successfully",
  emailId: "email-id-123",
  ...overrides,
});

describe("SendEmailOrchestrator", () => {
  let orchestrator: SendEmailOrchestrator;
  let mockSmtpProvider: MockedSmtpProvider;
  let mockUploadProvider: MockedUploadProvider;
  let mockTemplateRepository: MockedTemplateRepository;
  let mockStoreNotificationLogUseCase: MockedStoreNotificationLogUseCase;

  beforeEach(() => {
    mockSmtpProvider = smtpProviderMock();
    mockUploadProvider = uploadProviderMock();
    mockTemplateRepository = templateRepositoryMock();
    mockStoreNotificationLogUseCase = storeNotificationLogUseCaseMock();

    orchestrator = new SendEmailOrchestrator(
      mockSmtpProvider as unknown as SmtpProvider,
      mockUploadProvider as unknown as UploadProvider,
      mockTemplateRepository as unknown as TemplateRepository,
      mockStoreNotificationLogUseCase as unknown as StoreNotificationLogUseCase,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("execute - success cases", () => {
    it("should send email successfully with all valid data", async () => {
      const dto = sendNotificationOrchestratorDtoMock();
      const template = templateEntityMock();
      const contentResult = contentResultMock();
      const smtpResponse = smtpResponseMock();

      mockTemplateRepository.findByIdentificator.mockResolvedValue(template);
      mockUploadProvider.getContentById.mockResolvedValue(contentResult);
      mockSmtpProvider.SendEmailWithTemplate.mockResolvedValue(smtpResponse);
      mockStoreNotificationLogUseCase.execute.mockResolvedValue();

      const result = await orchestrator.execute(dto);

      expect(result).toBeInstanceOf(SendNotificationOrchestratorResponseDto);
      expect(result.sended).toBe(true);

      expect(mockTemplateRepository.findByIdentificator).toHaveBeenCalledWith(dto.templateID);
      expect(mockUploadProvider.getContentById).toHaveBeenCalledWith("cloudinary-template-id-123");
      expect(mockSmtpProvider.SendEmailWithTemplate).toHaveBeenCalledWith(
        "no-reply@example.com",
        "Welcome to our platform",
        dto.recipients,
        expect.stringContaining("Hello John Doe, welcome to our platform!"),
      );
      expect(mockStoreNotificationLogUseCase.execute).toHaveBeenCalledWith({
        response: "Email sent successfully",
        templateID: dto.templateID,
        status: NOTIFICATION_STATE_ENUM.SENT,
        recipients: dto.recipients,
        responseException: undefined,
      });
    });

    it("should handle single recipient as string", async () => {
      const dto = sendNotificationOrchestratorDtoMock({
        recipients: "single-user@example.com",
      });
      const template = templateEntityMock();
      const contentResult = contentResultMock();
      const smtpResponse = smtpResponseMock();

      mockTemplateRepository.findByIdentificator.mockResolvedValue(template);
      mockUploadProvider.getContentById.mockResolvedValue(contentResult);
      mockSmtpProvider.SendEmailWithTemplate.mockResolvedValue(smtpResponse);
      mockStoreNotificationLogUseCase.execute.mockResolvedValue();

      const result = await orchestrator.execute(dto);

      expect(result.sended).toBe(true);
      expect(mockSmtpProvider.SendEmailWithTemplate).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        "single-user@example.com",
        expect.any(String),
      );
    });

    it("should handle multiple recipients as array", async () => {
      const recipients = ["user1@example.com", "user2@example.com", "admin@example.com"];
      const dto = sendNotificationOrchestratorDtoMock({ recipients });
      const template = templateEntityMock();
      const contentResult = contentResultMock();
      const smtpResponse = smtpResponseMock();

      mockTemplateRepository.findByIdentificator.mockResolvedValue(template);
      mockUploadProvider.getContentById.mockResolvedValue(contentResult);
      mockSmtpProvider.SendEmailWithTemplate.mockResolvedValue(smtpResponse);
      mockStoreNotificationLogUseCase.execute.mockResolvedValue();

      const result = await orchestrator.execute(dto);

      expect(result.sended).toBe(true);
      expect(mockSmtpProvider.SendEmailWithTemplate).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        recipients,
        expect.any(String),
      );
    });

    it("should handle complex field replacements", async () => {
      const dto = sendNotificationOrchestratorDtoMock({
        fields: {
          name: "María José",
          email: "maria.jose@example.com",
          company: "Tech Corp",
          date: "2025-03-15",
          amount: 1500.5,
        },
      });
      const template = templateEntityMock({
        fields: ["name", "email", "company", "date", "amount"],
      });
      const contentResult = contentResultMock({
        content:
          "<html><body>Hello {{name}} from {{company}}, your payment of ${{amount}} is due on {{date}}.</body></html>",
      });
      const smtpResponse = smtpResponseMock();

      mockTemplateRepository.findByIdentificator.mockResolvedValue(template);
      mockUploadProvider.getContentById.mockResolvedValue(contentResult);
      mockSmtpProvider.SendEmailWithTemplate.mockResolvedValue(smtpResponse);
      mockStoreNotificationLogUseCase.execute.mockResolvedValue();

      const result = await orchestrator.execute(dto);

      expect(result.sended).toBe(true);
      expect(mockSmtpProvider.SendEmailWithTemplate).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.any(Object),
        expect.stringContaining(
          "Hello María José from Tech Corp, your payment of $1500.5 is due on 2025-03-15.",
        ),
      );
    });
  });

  describe("execute - error cases", () => {
    it("should throw TemplateNotFoundException when template not found", async () => {
      const dto = sendNotificationOrchestratorDtoMock();

      mockTemplateRepository.findByIdentificator.mockResolvedValue(null);

      await expect(orchestrator.execute(dto)).rejects.toThrow(ResponseStatus);
      expect(mockTemplateRepository.findByIdentificator).toHaveBeenCalledWith(dto.templateID);
      expect(mockUploadProvider.getContentById).not.toHaveBeenCalled();
      expect(mockSmtpProvider.SendEmailWithTemplate).not.toHaveBeenCalled();
    });

    it("should throw TemplateAlreadyDisabledException when template is disabled", async () => {
      const dto = sendNotificationOrchestratorDtoMock();
      const disabledTemplate = templateEntityMock({ enabled: false });

      mockTemplateRepository.findByIdentificator.mockResolvedValue(disabledTemplate);

      await expect(orchestrator.execute(dto)).rejects.toThrow(ResponseStatus);
      expect(mockUploadProvider.getContentById).not.toHaveBeenCalled();
      expect(mockSmtpProvider.SendEmailWithTemplate).not.toHaveBeenCalled();
    });

    it("should return false and log error when upload provider fails", async () => {
      const dto = sendNotificationOrchestratorDtoMock();
      const template = templateEntityMock();
      const failedContentResult = contentResultMock({
        success: false,
        content: undefined,
        error: "File not found in cloud storage",
      });

      mockTemplateRepository.findByIdentificator.mockResolvedValue(template);
      mockUploadProvider.getContentById.mockResolvedValue(failedContentResult);
      mockStoreNotificationLogUseCase.execute.mockResolvedValue();

      const result = await orchestrator.execute(dto);

      expect(result.sended).toBe(false);
      expect(mockStoreNotificationLogUseCase.execute).toHaveBeenCalledWith({
        response: "",
        templateID: dto.templateID,
        recipients: dto.recipients,
        responseException: "File not found in cloud storage",
        status: NOTIFICATION_STATE_ENUM.PROVIDER_FAILURE,
      });
      expect(mockSmtpProvider.SendEmailWithTemplate).not.toHaveBeenCalled();
    });

    it("should throw FieldsNotValidException when required fields are missing", async () => {
      const dto = sendNotificationOrchestratorDtoMock({
        fields: {
          name: "John Doe",
        },
      });
      const template = templateEntityMock({
        fields: ["name", "email", "date"],
      });
      const contentResult = contentResultMock();

      mockTemplateRepository.findByIdentificator.mockResolvedValue(template);
      mockUploadProvider.getContentById.mockResolvedValue(contentResult);

      await expect(orchestrator.execute(dto)).rejects.toThrow(ResponseStatus);
      expect(mockSmtpProvider.SendEmailWithTemplate).not.toHaveBeenCalled();
    });

    it("should throw FieldsNotValidException when fields have null values", async () => {
      const dto = sendNotificationOrchestratorDtoMock({
        fields: {
          name: "John Doe",
          email: null,
          date: "2025-01-15",
        },
      });
      const template = templateEntityMock();
      const contentResult = contentResultMock();

      mockTemplateRepository.findByIdentificator.mockResolvedValue(template);
      mockUploadProvider.getContentById.mockResolvedValue(contentResult);

      await expect(orchestrator.execute(dto)).rejects.toThrow(ResponseStatus);
    });

    it("should handle SMTP provider failures gracefully", async () => {
      const dto = sendNotificationOrchestratorDtoMock();
      const template = templateEntityMock();
      const contentResult = contentResultMock();
      const failedSmtpResponse = smtpResponseMock({
        status: NOTIFICATION_STATE_ENUM.PROVIDER_FAILURE,
        response: "",
        responseException: "SMTP server connection failed",
      });

      mockTemplateRepository.findByIdentificator.mockResolvedValue(template);
      mockUploadProvider.getContentById.mockResolvedValue(contentResult);
      mockSmtpProvider.SendEmailWithTemplate.mockResolvedValue(failedSmtpResponse);
      mockStoreNotificationLogUseCase.execute.mockResolvedValue();

      const result = await orchestrator.execute(dto);

      expect(result.sended).toBe(false);
      expect(mockStoreNotificationLogUseCase.execute).toHaveBeenCalledWith({
        response: "",
        templateID: dto.templateID,
        status: NOTIFICATION_STATE_ENUM.PROVIDER_FAILURE,
        recipients: dto.recipients,
        responseException: "SMTP server connection failed",
      });
    });
  });

  describe("field validation", () => {
    it("should validate that all required fields are present", async () => {
      const dto = sendNotificationOrchestratorDtoMock({
        fields: {
          name: "John Doe",
          email: "john@example.com",
          date: "2025-01-15",
        },
      });
      const template = templateEntityMock({
        fields: ["name", "email", "date"],
      });
      const contentResult = contentResultMock();
      const smtpResponse = smtpResponseMock();

      mockTemplateRepository.findByIdentificator.mockResolvedValue(template);
      mockUploadProvider.getContentById.mockResolvedValue(contentResult);
      mockSmtpProvider.SendEmailWithTemplate.mockResolvedValue(smtpResponse);
      mockStoreNotificationLogUseCase.execute.mockResolvedValue();

      const result = await orchestrator.execute(dto);

      expect(result.sended).toBe(true);
    });

    it("should handle empty string fields as valid", async () => {
      const dto = sendNotificationOrchestratorDtoMock({
        fields: {
          name: "",
          email: "john@example.com",
          date: "2025-01-15",
        },
      });
      const template = templateEntityMock();
      const contentResult = contentResultMock();
      const smtpResponse = smtpResponseMock();

      mockTemplateRepository.findByIdentificator.mockResolvedValue(template);
      mockUploadProvider.getContentById.mockResolvedValue(contentResult);
      mockSmtpProvider.SendEmailWithTemplate.mockResolvedValue(smtpResponse);
      mockStoreNotificationLogUseCase.execute.mockResolvedValue();

      const result = await orchestrator.execute(dto);

      expect(result.sended).toBe(true);
    });

    it("should handle zero values as valid", async () => {
      const dto = sendNotificationOrchestratorDtoMock({
        fields: {
          name: "John Doe",
          email: "john@example.com",
          amount: 0,
        },
      });
      const template = templateEntityMock({
        fields: ["name", "email", "amount"],
      });
      const contentResult = contentResultMock();
      const smtpResponse = smtpResponseMock();

      mockTemplateRepository.findByIdentificator.mockResolvedValue(template);
      mockUploadProvider.getContentById.mockResolvedValue(contentResult);
      mockSmtpProvider.SendEmailWithTemplate.mockResolvedValue(smtpResponse);
      mockStoreNotificationLogUseCase.execute.mockResolvedValue();

      const result = await orchestrator.execute(dto);

      expect(result.sended).toBe(true);
    });

    it("should reject undefined fields", async () => {
      const dto = sendNotificationOrchestratorDtoMock({
        fields: {
          name: "John Doe",
          email: undefined,
          date: "2025-01-15",
        },
      });
      const template = templateEntityMock();
      const contentResult = contentResultMock();

      mockTemplateRepository.findByIdentificator.mockResolvedValue(template);
      mockUploadProvider.getContentById.mockResolvedValue(contentResult);

      await expect(orchestrator.execute(dto)).rejects.toThrow(ResponseStatus);
    });
  });

  describe("integration scenarios", () => {
    it("should handle complete workflow with all dependencies", async () => {
      const dto = sendNotificationOrchestratorDtoMock({
        templateID: "integration-test-template",
        fields: {
          customerName: "Alice Johnson",
          orderNumber: "ORD-12345",
          totalAmount: 299.99,
        },
        recipients: ["alice.johnson@example.com", "support@company.com"],
      });

      const template = templateEntityMock({
        identificator: "integration-test-template",
        fields: ["customerName", "orderNumber", "totalAmount"],
        sender: "orders@company.com",
        subject: "Order Confirmation #{{orderNumber}}",
      });

      const contentResult = contentResultMock({
        content:
          "<html><body>Dear {{customerName}}, your order {{orderNumber}} for ${{totalAmount}} has been confirmed.</body></html>",
      });

      const smtpResponse = smtpResponseMock({
        status: NOTIFICATION_STATE_ENUM.SENT,
        response: "Message queued successfully",
        emailId: "msg_abc123def456",
      });

      mockTemplateRepository.findByIdentificator.mockResolvedValue(template);
      mockUploadProvider.getContentById.mockResolvedValue(contentResult);
      mockSmtpProvider.SendEmailWithTemplate.mockResolvedValue(smtpResponse);
      mockStoreNotificationLogUseCase.execute.mockResolvedValue();

      const result = await orchestrator.execute(dto);

      expect(result.sended).toBe(true);

      expect(mockSmtpProvider.SendEmailWithTemplate).toHaveBeenCalledWith(
        "orders@company.com",
        "Order Confirmation #{{orderNumber}}",
        ["alice.johnson@example.com", "support@company.com"],
        expect.stringContaining(
          "Dear Alice Johnson, your order ORD-12345 for $299.99 has been confirmed.",
        ),
      );

      expect(mockStoreNotificationLogUseCase.execute).toHaveBeenCalledWith({
        response: "Message queued successfully",
        templateID: "integration-test-template",
        status: NOTIFICATION_STATE_ENUM.SENT,
        recipients: ["alice.johnson@example.com", "support@company.com"],
        responseException: undefined,
      });
    });

    it("should handle concurrent executions", async () => {
      const dto1 = sendNotificationOrchestratorDtoMock({ templateID: "template-1" });
      const dto2 = sendNotificationOrchestratorDtoMock({ templateID: "template-2" });
      const dto3 = sendNotificationOrchestratorDtoMock({ templateID: "template-3" });

      const template1 = templateEntityMock({ identificator: "template-1" });
      const template2 = templateEntityMock({ identificator: "template-2" });
      const template3 = templateEntityMock({ identificator: "template-3" });

      const contentResult = contentResultMock();
      const smtpResponse = smtpResponseMock();

      mockTemplateRepository.findByIdentificator
        .mockResolvedValueOnce(template1)
        .mockResolvedValueOnce(template2)
        .mockResolvedValueOnce(template3);
      mockUploadProvider.getContentById.mockResolvedValue(contentResult);
      mockSmtpProvider.SendEmailWithTemplate.mockResolvedValue(smtpResponse);
      mockStoreNotificationLogUseCase.execute.mockResolvedValue();

      const results = await Promise.all([
        orchestrator.execute(dto1),
        orchestrator.execute(dto2),
        orchestrator.execute(dto3),
      ]);

      expect(results).toHaveLength(3);
      expect(results.every((result) => result.sended)).toBe(true);
      expect(mockTemplateRepository.findByIdentificator).toHaveBeenCalledTimes(3);
      expect(mockSmtpProvider.SendEmailWithTemplate).toHaveBeenCalledTimes(3);
      expect(mockStoreNotificationLogUseCase.execute).toHaveBeenCalledTimes(3);
    });
  });

  describe("edge cases", () => {
    it("should handle empty recipients array", async () => {
      const dto = sendNotificationOrchestratorDtoMock({
        recipients: [],
      });
      const template = templateEntityMock();
      const contentResult = contentResultMock();
      const smtpResponse = smtpResponseMock();

      mockTemplateRepository.findByIdentificator.mockResolvedValue(template);
      mockUploadProvider.getContentById.mockResolvedValue(contentResult);
      mockSmtpProvider.SendEmailWithTemplate.mockResolvedValue(smtpResponse);
      mockStoreNotificationLogUseCase.execute.mockResolvedValue();

      const result = await orchestrator.execute(dto);

      expect(result.sended).toBe(true);
      expect(mockSmtpProvider.SendEmailWithTemplate).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        [],
        expect.any(String),
      );
    });

    it("should handle templates with no required fields", async () => {
      const dto = sendNotificationOrchestratorDtoMock({
        fields: {},
      });
      const template = templateEntityMock({
        fields: [],
      });
      const contentResult = contentResultMock({
        content: "<html><body>Static content with no variables</body></html>",
      });
      const smtpResponse = smtpResponseMock();

      mockTemplateRepository.findByIdentificator.mockResolvedValue(template);
      mockUploadProvider.getContentById.mockResolvedValue(contentResult);
      mockSmtpProvider.SendEmailWithTemplate.mockResolvedValue(smtpResponse);
      mockStoreNotificationLogUseCase.execute.mockResolvedValue();

      const result = await orchestrator.execute(dto);

      expect(result.sended).toBe(true);
    });

    it("should handle very long template IDs", async () => {
      const longTemplateID = "a".repeat(255);
      const dto = sendNotificationOrchestratorDtoMock({
        templateID: longTemplateID,
      });
      const template = templateEntityMock({
        identificator: longTemplateID,
      });
      const contentResult = contentResultMock();
      const smtpResponse = smtpResponseMock();

      mockTemplateRepository.findByIdentificator.mockResolvedValue(template);
      mockUploadProvider.getContentById.mockResolvedValue(contentResult);
      mockSmtpProvider.SendEmailWithTemplate.mockResolvedValue(smtpResponse);
      mockStoreNotificationLogUseCase.execute.mockResolvedValue();

      const result = await orchestrator.execute(dto);

      expect(result.sended).toBe(true);
      expect(mockTemplateRepository.findByIdentificator).toHaveBeenCalledWith(longTemplateID);
    });
  });
});
