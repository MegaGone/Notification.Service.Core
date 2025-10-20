import { TemplateEntity } from "../../../src/core/template/domain/entities/template.entity";
import { UploadProvider } from "../../../src/core/template/domain/providers/upload.provider";
import { PrimitiveTemplate } from "../../../src/core/template/domain/entities/template.interface";
import { TEMPLATE_TYPE_ENUM } from "../../../src/core/template/domain/constants/template-type.enum";
import { UploadResult } from "../../../src/core/template/domain/providers/upload-response.interface";
import { TemplateRepository } from "../../../src/core/template/domain/repositories/template.repository";
import { StoreTemplateDto } from "../../../src/core/template/application/store-template/store-template.dto";
import { StoreTemplateUseCase } from "../../../src/core/template/application/store-template/store-template.use-case";

const uploadProviderMock = (): jest.Mocked<UploadProvider> => {
  return {
    upload: jest.fn(),
    findById: jest.fn(),
    deleteById: jest.fn(),
    getContentById: jest.fn(),
  };
};

const templateRepositoryMock = (): jest.Mocked<TemplateRepository> => {
  return {
    store: jest.fn(),
    update: jest.fn(),
    disable: jest.fn(),
    findPaginated: jest.fn(),
    findByDescription: jest.fn(),
    findByIdentificator: jest.fn(),
  };
};

describe("StoreTemplateUseCase", () => {
  let useCase: StoreTemplateUseCase;
  let mockUploadProvider: jest.Mocked<UploadProvider>;
  let mockTemplateRepository: jest.Mocked<TemplateRepository>;

  beforeEach(() => {
    mockUploadProvider = uploadProviderMock();
    mockTemplateRepository = templateRepositoryMock();
    useCase = new StoreTemplateUseCase(mockUploadProvider, mockTemplateRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("execute", () => {
    it("should successfully store a new template", async () => {
      const dto: StoreTemplateDto = {
        type: TEMPLATE_TYPE_ENUM.EMAIL,
        sender: "no-reply@example.com",
        subject: "Welcome Email",
        description: "Welcome email template",
        filename: "/templates/welcome.html",
        fields: ["name", "email"],
      };

      const uploadResult: UploadResult = {
        success: true,
        publicId: "TEMPLATE_123",
      };

      const storedTemplate: PrimitiveTemplate = {
        ...dto,
        templateId: "TEMPLATE_123",
        identificator: "welcome-email-123",
        enabled: true,
        id: "uuid-123",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockTemplateRepository.findByDescription.mockResolvedValue(null);
      mockUploadProvider.upload.mockResolvedValue(uploadResult);
      mockTemplateRepository.store.mockResolvedValue(TemplateEntity.create(storedTemplate));

      const result = await useCase.execute(dto);

      expect(result.stored).toBe(true);
      expect(result.id).toBe("welcome-email-123");
      expect(mockTemplateRepository.findByDescription).toHaveBeenCalledWith(
        "Welcome email template",
      );
      expect(mockUploadProvider.upload).toHaveBeenCalledWith("/templates/welcome.html");
      expect(mockTemplateRepository.store).toHaveBeenCalledTimes(1);
    });

    it("should throw TemplateTypeNotAllowedException when type is invalid", async () => {
      const dto: StoreTemplateDto = {
        type: 999 as TEMPLATE_TYPE_ENUM, // Invalid type
        sender: "test@example.com",
        subject: "Test",
        description: "Test template",
        filename: "/templates/test.html",
        fields: [],
      };

      await expect(useCase.execute(dto)).rejects.toThrow("Template type not allowed.");
      expect(mockTemplateRepository.findByDescription).not.toHaveBeenCalled();
      expect(mockUploadProvider.upload).not.toHaveBeenCalled();
      expect(mockTemplateRepository.store).not.toHaveBeenCalled();
    });

    it("should throw TemplateDuplicatedException when description already exists", async () => {
      const dto: StoreTemplateDto = {
        type: TEMPLATE_TYPE_ENUM.EMAIL,
        sender: "test@example.com",
        subject: "Test",
        description: "Existing template description",
        filename: "/templates/test.html",
        fields: [],
      };

      const existingTemplate: PrimitiveTemplate = {
        id: "existing-id",
        type: TEMPLATE_TYPE_ENUM.EMAIL,
        sender: "test@example.com",
        subject: "Test",
        description: "Existing template description",
        templateId: "EXISTING_123",
        identificator: "existing-template",
        fields: [],
        enabled: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockTemplateRepository.findByDescription.mockResolvedValue(
        TemplateEntity.create(existingTemplate),
      );

      await expect(useCase.execute(dto)).rejects.toThrow(
        "Cannot duplicate templates by description.",
      );
      expect(mockTemplateRepository.findByDescription).toHaveBeenCalledWith(
        "Existing template description",
      );
      expect(mockUploadProvider.upload).not.toHaveBeenCalled();
      expect(mockTemplateRepository.store).not.toHaveBeenCalled();
    });

    it("should throw UploadFileException when upload fails", async () => {
      const dto: StoreTemplateDto = {
        type: TEMPLATE_TYPE_ENUM.EMAIL,
        sender: "test@example.com",
        subject: "Test",
        description: "Test template",
        filename: "/templates/test.html",
        fields: [],
      };

      const uploadResult: UploadResult = {
        success: false,
        error: "Upload failed",
      };

      mockTemplateRepository.findByDescription.mockResolvedValue(null);
      mockUploadProvider.upload.mockResolvedValue(uploadResult);

      await expect(useCase.execute(dto)).rejects.toThrow("Cannot upload file.");
      expect(mockTemplateRepository.findByDescription).toHaveBeenCalledTimes(1);
      expect(mockUploadProvider.upload).toHaveBeenCalledTimes(1);
      expect(mockTemplateRepository.store).not.toHaveBeenCalled();
    });

    it("should throw UploadFileException when publicId is missing", async () => {
      const dto: StoreTemplateDto = {
        type: TEMPLATE_TYPE_ENUM.EMAIL,
        sender: "test@example.com",
        subject: "Test",
        description: "Test template",
        filename: "/templates/test.html",
        fields: [],
      };

      const uploadResult: UploadResult = {
        success: true,
        publicId: undefined,
      };

      mockTemplateRepository.findByDescription.mockResolvedValue(null);
      mockUploadProvider.upload.mockResolvedValue(uploadResult);

      await expect(useCase.execute(dto)).rejects.toThrow("Cannot upload file.");
      expect(mockTemplateRepository.store).not.toHaveBeenCalled();
    });

    it("should store EMAIL type template", async () => {
      const dto: StoreTemplateDto = {
        type: TEMPLATE_TYPE_ENUM.EMAIL,
        sender: "email@example.com",
        subject: "Email Template",
        description: "Email template description",
        filename: "/templates/email.html",
        fields: ["field1"],
      };

      const uploadResult: UploadResult = {
        success: true,
        publicId: "EMAIL_TEMPLATE_001",
      };

      const storedTemplate: PrimitiveTemplate = {
        ...dto,
        templateId: "EMAIL_TEMPLATE_001",
        identificator: "email-template-001",
        enabled: true,
        id: "uuid-001",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockTemplateRepository.findByDescription.mockResolvedValue(null);
      mockUploadProvider.upload.mockResolvedValue(uploadResult);
      mockTemplateRepository.store.mockResolvedValue(TemplateEntity.create(storedTemplate));

      const result = await useCase.execute(dto);

      expect(result.stored).toBe(true);
      expect(result.id).toBe("email-template-001");
    });

    it("should store SMS type template", async () => {
      const dto: StoreTemplateDto = {
        type: TEMPLATE_TYPE_ENUM.SMS,
        sender: "SMS_SENDER",
        subject: "SMS Template",
        description: "SMS template description",
        filename: "/templates/sms.txt",
        fields: ["phone"],
      };

      const uploadResult: UploadResult = {
        success: true,
        publicId: "SMS_TEMPLATE_001",
      };

      const storedTemplate: PrimitiveTemplate = {
        ...dto,
        templateId: "SMS_TEMPLATE_001",
        identificator: "sms-template-001",
        enabled: true,
        id: "uuid-002",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockTemplateRepository.findByDescription.mockResolvedValue(null);
      mockUploadProvider.upload.mockResolvedValue(uploadResult);
      mockTemplateRepository.store.mockResolvedValue(TemplateEntity.create(storedTemplate));

      const result = await useCase.execute(dto);

      expect(result.stored).toBe(true);
      expect(result.id).toBe("sms-template-001");
    });

    it("should store template with empty fields array", async () => {
      const dto: StoreTemplateDto = {
        type: TEMPLATE_TYPE_ENUM.EMAIL,
        sender: "test@example.com",
        subject: "Test",
        description: "Template with no fields",
        filename: "/templates/nofields.html",
        fields: [],
      };

      const uploadResult: UploadResult = {
        success: true,
        publicId: "TEMPLATE_NO_FIELDS",
      };

      const storedTemplate: PrimitiveTemplate = {
        ...dto,
        templateId: "TEMPLATE_NO_FIELDS",
        identificator: "no-fields-template",
        enabled: true,
        id: "uuid-003",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockTemplateRepository.findByDescription.mockResolvedValue(null);
      mockUploadProvider.upload.mockResolvedValue(uploadResult);
      mockTemplateRepository.store.mockResolvedValue(TemplateEntity.create(storedTemplate));

      const result = await useCase.execute(dto);

      expect(result.stored).toBe(true);
    });

    it("should store template with multiple fields", async () => {
      const dto: StoreTemplateDto = {
        type: TEMPLATE_TYPE_ENUM.EMAIL,
        sender: "test@example.com",
        subject: "Test",
        description: "Template with multiple fields",
        filename: "/templates/multifield.html",
        fields: ["name", "email", "phone", "address", "city"],
      };

      const uploadResult: UploadResult = {
        success: true,
        publicId: "TEMPLATE_MULTI_FIELDS",
      };

      const storedTemplate: PrimitiveTemplate = {
        ...dto,
        templateId: "TEMPLATE_MULTI_FIELDS",
        identificator: "multi-fields-template",
        enabled: true,
        id: "uuid-004",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockTemplateRepository.findByDescription.mockResolvedValue(null);
      mockUploadProvider.upload.mockResolvedValue(uploadResult);
      mockTemplateRepository.store.mockResolvedValue(TemplateEntity.create(storedTemplate));

      const result = await useCase.execute(dto);

      expect(result.stored).toBe(true);
    });

    it("should return stored false when template has no identificator", async () => {
      const dto: StoreTemplateDto = {
        type: TEMPLATE_TYPE_ENUM.EMAIL,
        sender: "test@example.com",
        subject: "Test",
        description: "Test template",
        filename: "/templates/test.html",
        fields: [],
      };

      const uploadResult: UploadResult = {
        success: true,
        publicId: "TEMPLATE_001",
      };

      const storedTemplate: PrimitiveTemplate = {
        ...dto,
        templateId: "TEMPLATE_001",
        identificator: undefined,
        enabled: true,
        id: "uuid-005",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockTemplateRepository.findByDescription.mockResolvedValue(null);
      mockUploadProvider.upload.mockResolvedValue(uploadResult);
      mockTemplateRepository.store.mockResolvedValue(TemplateEntity.create(storedTemplate));

      const result = await useCase.execute(dto);

      expect(result.stored).toBe(false);
      expect(result.id).toBe("");
    });

    it("should pass templateId to repository from upload result", async () => {
      const dto: StoreTemplateDto = {
        type: TEMPLATE_TYPE_ENUM.EMAIL,
        sender: "test@example.com",
        subject: "Test",
        description: "Test template",
        filename: "/templates/test.html",
        fields: [],
      };

      const uploadResult: UploadResult = {
        success: true,
        publicId: "SPECIFIC_PUBLIC_ID_123",
      };

      const storedTemplate: PrimitiveTemplate = {
        ...dto,
        templateId: "SPECIFIC_PUBLIC_ID_123",
        identificator: "test-template",
        enabled: true,
        id: "uuid-006",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockTemplateRepository.findByDescription.mockResolvedValue(null);
      mockUploadProvider.upload.mockResolvedValue(uploadResult);
      mockTemplateRepository.store.mockResolvedValue(TemplateEntity.create(storedTemplate));

      await useCase.execute(dto);

      expect(mockTemplateRepository.store).toHaveBeenCalledWith(
        expect.objectContaining({
          _attributes: expect.objectContaining({
            templateId: "SPECIFIC_PUBLIC_ID_123",
          }),
        }),
      );
    });
  });

  describe("Integration Flow", () => {
    it("should execute all steps in correct order for successful store", async () => {
      const dto: StoreTemplateDto = {
        type: TEMPLATE_TYPE_ENUM.EMAIL,
        sender: "test@example.com",
        subject: "Test",
        description: "Test template",
        filename: "/templates/test.html",
        fields: [],
      };

      const uploadResult: UploadResult = {
        success: true,
        publicId: "TEMPLATE_001",
      };

      const storedTemplate: PrimitiveTemplate = {
        ...dto,
        templateId: "TEMPLATE_001",
        identificator: "test-template",
        enabled: true,
        id: "uuid-007",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const callOrder: string[] = [];

      mockTemplateRepository.findByDescription.mockImplementation(async () => {
        callOrder.push("findByDescription");
        return null;
      });

      mockUploadProvider.upload.mockImplementation(async () => {
        callOrder.push("upload");
        return uploadResult;
      });

      mockTemplateRepository.store.mockImplementation(async () => {
        callOrder.push("store");
        return TemplateEntity.create(storedTemplate);
      });

      await useCase.execute(dto);

      expect(callOrder).toEqual(["findByDescription", "upload", "store"]);
    });

    it("should stop execution after type validation if type is invalid", async () => {
      const dto: StoreTemplateDto = {
        type: 999 as TEMPLATE_TYPE_ENUM,
        sender: "test@example.com",
        subject: "Test",
        description: "Test template",
        filename: "/templates/test.html",
        fields: [],
      };

      const callOrder: string[] = [];

      mockTemplateRepository.findByDescription.mockImplementation(async () => {
        callOrder.push("findByDescription");
        return null;
      });

      mockUploadProvider.upload.mockImplementation(async () => {
        callOrder.push("upload");
        return { success: true, publicId: "TEST" };
      });

      await expect(useCase.execute(dto)).rejects.toThrow();
      expect(callOrder).toEqual([]);
    });

    it("should stop execution after findByDescription if duplicate found", async () => {
      const dto: StoreTemplateDto = {
        type: TEMPLATE_TYPE_ENUM.EMAIL,
        sender: "test@example.com",
        subject: "Test",
        description: "Duplicate template",
        filename: "/templates/test.html",
        fields: [],
      };

      const existingTemplate: PrimitiveTemplate = {
        id: "existing-id",
        type: TEMPLATE_TYPE_ENUM.EMAIL,
        sender: "test@example.com",
        subject: "Test",
        description: "Duplicate template",
        templateId: "EXISTING",
        identificator: "existing",
        fields: [],
        enabled: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const callOrder: string[] = [];

      mockTemplateRepository.findByDescription.mockImplementation(async () => {
        callOrder.push("findByDescription");
        return TemplateEntity.create(existingTemplate);
      });

      mockUploadProvider.upload.mockImplementation(async () => {
        callOrder.push("upload");
        return { success: true, publicId: "TEST" };
      });

      mockTemplateRepository.store.mockImplementation(async () => {
        callOrder.push("store");
        return TemplateEntity.create(existingTemplate);
      });

      await expect(useCase.execute(dto)).rejects.toThrow();
      expect(callOrder).toEqual(["findByDescription"]);
    });

    it("should stop execution after upload if upload fails", async () => {
      const dto: StoreTemplateDto = {
        type: TEMPLATE_TYPE_ENUM.EMAIL,
        sender: "test@example.com",
        subject: "Test",
        description: "Test template",
        filename: "/templates/test.html",
        fields: [],
      };

      const callOrder: string[] = [];

      mockTemplateRepository.findByDescription.mockImplementation(async () => {
        callOrder.push("findByDescription");
        return null;
      });

      mockUploadProvider.upload.mockImplementation(async () => {
        callOrder.push("upload");
        return { success: false };
      });

      mockTemplateRepository.store.mockImplementation(async () => {
        callOrder.push("store");
        return TemplateEntity.create({
          ...dto,
          templateId: "TEST",
          identificator: "test",
          enabled: true,
          id: "uuid",
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      });

      await expect(useCase.execute(dto)).rejects.toThrow();
      expect(callOrder).toEqual(["findByDescription", "upload"]);
    });
  });

  describe("Edge Cases", () => {
    it("should handle special characters in description", async () => {
      const dto: StoreTemplateDto = {
        type: TEMPLATE_TYPE_ENUM.EMAIL,
        sender: "test@example.com",
        subject: "Test",
        description: "Template with special chars !@#$%^&*()",
        filename: "/templates/test.html",
        fields: [],
      };

      const uploadResult: UploadResult = {
        success: true,
        publicId: "TEMPLATE_SPECIAL",
      };

      const storedTemplate: PrimitiveTemplate = {
        ...dto,
        templateId: "TEMPLATE_SPECIAL",
        identificator: "special-template",
        enabled: true,
        id: "uuid-008",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockTemplateRepository.findByDescription.mockResolvedValue(null);
      mockUploadProvider.upload.mockResolvedValue(uploadResult);
      mockTemplateRepository.store.mockResolvedValue(TemplateEntity.create(storedTemplate));

      const result = await useCase.execute(dto);

      expect(result.stored).toBe(true);
      expect(mockTemplateRepository.findByDescription).toHaveBeenCalledWith(
        "Template with special chars !@#$%^&*()",
      );
    });

    it("should handle very long description", async () => {
      const longDescription = "a".repeat(1000);
      const dto: StoreTemplateDto = {
        type: TEMPLATE_TYPE_ENUM.EMAIL,
        sender: "test@example.com",
        subject: "Test",
        description: longDescription,
        filename: "/templates/test.html",
        fields: [],
      };

      const uploadResult: UploadResult = {
        success: true,
        publicId: "TEMPLATE_LONG",
      };

      const storedTemplate: PrimitiveTemplate = {
        ...dto,
        templateId: "TEMPLATE_LONG",
        identificator: "long-template",
        enabled: true,
        id: "uuid-009",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockTemplateRepository.findByDescription.mockResolvedValue(null);
      mockUploadProvider.upload.mockResolvedValue(uploadResult);
      mockTemplateRepository.store.mockResolvedValue(TemplateEntity.create(storedTemplate));

      const result = await useCase.execute(dto);

      expect(result.stored).toBe(true);
    });

    it("should handle filename with different extensions", async () => {
      const dto: StoreTemplateDto = {
        type: TEMPLATE_TYPE_ENUM.EMAIL,
        sender: "test@example.com",
        subject: "Test",
        description: "Template with .txt extension",
        filename: "/templates/template.txt",
        fields: [],
      };

      const uploadResult: UploadResult = {
        success: true,
        publicId: "TEMPLATE_TXT",
      };

      const storedTemplate: PrimitiveTemplate = {
        ...dto,
        templateId: "TEMPLATE_TXT",
        identificator: "txt-template",
        enabled: true,
        id: "uuid-010",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockTemplateRepository.findByDescription.mockResolvedValue(null);
      mockUploadProvider.upload.mockResolvedValue(uploadResult);
      mockTemplateRepository.store.mockResolvedValue(TemplateEntity.create(storedTemplate));

      const result = await useCase.execute(dto);

      expect(result.stored).toBe(true);
      expect(mockUploadProvider.upload).toHaveBeenCalledWith("/templates/template.txt");
    });

    it("should handle email sender with special format", async () => {
      const dto: StoreTemplateDto = {
        type: TEMPLATE_TYPE_ENUM.EMAIL,
        sender: "no-reply+test@company.co.uk",
        subject: "Test",
        description: "Special sender template",
        filename: "/templates/test.html",
        fields: [],
      };

      const uploadResult: UploadResult = {
        success: true,
        publicId: "TEMPLATE_SENDER",
      };

      const storedTemplate: PrimitiveTemplate = {
        ...dto,
        templateId: "TEMPLATE_SENDER",
        identificator: "special-sender",
        enabled: true,
        id: "uuid-011",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockTemplateRepository.findByDescription.mockResolvedValue(null);
      mockUploadProvider.upload.mockResolvedValue(uploadResult);
      mockTemplateRepository.store.mockResolvedValue(TemplateEntity.create(storedTemplate));

      const result = await useCase.execute(dto);

      expect(result.stored).toBe(true);
    });
  });
});
