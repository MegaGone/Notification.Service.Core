import { TemplateEntity } from "../../../src/core/template/domain/entities/template.entity";
import { UploadProvider } from "../../../src/core/template/domain/providers/upload.provider";
import { PrimitiveTemplate } from "../../../src/core/template/domain/entities/template.interface";
import { TEMPLATE_TYPE_ENUM } from "../../../src/core/template/domain/constants/template-type.enum";
import { UploadResult } from "../../../src/core/template/domain/providers/upload-response.interface";
import { TemplateRepository } from "../../../src/core/template/domain/repositories/template.repository";
import { UpdateTemplateDto } from "../../../src/core/template/application/update-template/update-template.dto";
import { UpdateTemplateUseCase } from "../../../src/core/template/application/update-template/update-template.use-case";

const templateMock = (overrides?: Partial<PrimitiveTemplate>): PrimitiveTemplate => {
  return {
    enabled: true,
    templateId: "TEMPLATE_001",
    subject: "Test Subject",
    type: TEMPLATE_TYPE_ENUM.EMAIL,
    sender: "no-reply@example.com",
    identificator: "welcome-email",
    fields: ["name", "email", "date"],
    description: "Template Description",
    id: "123e4567-e89b-12d3-a456-426614174000",
    createdAt: new Date("2025-01-01T00:00:00.000Z"),
    updatedAt: new Date("2025-01-02T00:00:00.000Z"),
    ...overrides,
  };
};

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

describe("UpdateTemplateUseCase", () => {
  let useCase: UpdateTemplateUseCase;
  let mockUploadProvider: jest.Mocked<UploadProvider>;
  let mockTemplateRepository: jest.Mocked<TemplateRepository>;

  beforeEach(() => {
    mockUploadProvider = uploadProviderMock();
    mockTemplateRepository = templateRepositoryMock();
    useCase = new UpdateTemplateUseCase(mockUploadProvider, mockTemplateRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("execute", () => {
    it("should successfully update template without file change", async () => {
      const dto: UpdateTemplateDto = {
        identificator: "welcome-email",
        sender: "updated@example.com",
        subject: "Updated Subject",
        description: "Updated Description",
        fields: ["name", "email"],
        filename: "",
      };

      const existingTemplate = templateMock();
      mockTemplateRepository.findByIdentificator.mockResolvedValue(
        TemplateEntity.create(existingTemplate),
      );
      mockTemplateRepository.findByDescription.mockResolvedValue(null);
      mockTemplateRepository.update.mockResolvedValue(true);

      const result = await useCase.execute(dto);

      expect(result.updated).toBe(true);
      expect(mockTemplateRepository.findByIdentificator).toHaveBeenCalledWith("welcome-email");
      expect(mockTemplateRepository.update).toHaveBeenCalledWith("welcome-email", {
        sender: "updated@example.com",
        subject: "Updated Subject",
        description: "Updated Description",
        fields: ["name", "email"],
      });
      expect(mockUploadProvider.upload).not.toHaveBeenCalled();
    });

    it("should successfully update template with file change", async () => {
      const dto: UpdateTemplateDto = {
        identificator: "welcome-email",
        sender: "updated@example.com",
        subject: "Updated Subject",
        description: "Updated Description",
        fields: ["name", "email"],
        filename: "/templates/new-template.html",
      };

      const existingTemplate = templateMock({ templateId: "OLD_TEMPLATE_ID" });
      const uploadResult: UploadResult = {
        success: true,
        publicId: "NEW_TEMPLATE_ID",
      };

      mockTemplateRepository.findByIdentificator.mockResolvedValue(
        TemplateEntity.create(existingTemplate),
      );
      mockTemplateRepository.findByDescription.mockResolvedValue(null);
      mockUploadProvider.upload.mockResolvedValue(uploadResult);
      mockTemplateRepository.update.mockResolvedValue(true);
      mockUploadProvider.deleteById.mockResolvedValue(true);

      const result = await useCase.execute(dto);

      expect(result.updated).toBe(true);
      expect(mockUploadProvider.upload).toHaveBeenCalledWith("/templates/new-template.html");
      expect(mockTemplateRepository.update).toHaveBeenCalledWith("welcome-email", {
        sender: "updated@example.com",
        subject: "Updated Subject",
        description: "Updated Description",
        fields: ["name", "email"],
        templateId: "NEW_TEMPLATE_ID",
      });
      expect(mockUploadProvider.deleteById).toHaveBeenCalledWith("OLD_TEMPLATE_ID");
    });

    it("should throw TemplateNotFoundException when template not found", async () => {
      const dto: UpdateTemplateDto = {
        identificator: "non-existent",
        sender: "test@example.com",
        subject: "Test",
        description: "Test",
        fields: [],
        filename: "",
      };

      mockTemplateRepository.findByIdentificator.mockResolvedValue(null);

      await expect(useCase.execute(dto)).rejects.toThrow("Template non-existent not found.");
      expect(mockTemplateRepository.findByIdentificator).toHaveBeenCalledWith("non-existent");
      expect(mockTemplateRepository.update).not.toHaveBeenCalled();
    });

    it("should throw TemplateAlreadyDisabledException when template is disabled", async () => {
      const dto: UpdateTemplateDto = {
        identificator: "disabled-template",
        sender: "test@example.com",
        subject: "Test",
        description: "Test",
        fields: [],
        filename: "",
      };

      const disabledTemplate = templateMock({ enabled: false });
      mockTemplateRepository.findByIdentificator.mockResolvedValue(
        TemplateEntity.create(disabledTemplate),
      );

      await expect(useCase.execute(dto)).rejects.toThrow("Template already disabled.");
      expect(mockTemplateRepository.findByIdentificator).toHaveBeenCalledTimes(1);
      expect(mockTemplateRepository.update).not.toHaveBeenCalled();
    });

    it("should throw TemplateDuplicatedException when description is duplicated", async () => {
      const dto: UpdateTemplateDto = {
        identificator: "welcome-email",
        sender: "test@example.com",
        subject: "Test",
        description: "Duplicated Description",
        fields: [],
        filename: "",
      };

      const existingTemplate = templateMock({ description: "Original Description" });
      const duplicateTemplate = templateMock({
        identificator: "other-template",
        description: "Duplicated Description",
      });

      mockTemplateRepository.findByIdentificator.mockResolvedValue(
        TemplateEntity.create(existingTemplate),
      );
      mockTemplateRepository.findByDescription.mockResolvedValue(
        TemplateEntity.create(duplicateTemplate),
      );

      await expect(useCase.execute(dto)).rejects.toThrow(
        "Cannot duplicate templates by description.",
      );
      expect(mockTemplateRepository.findByDescription).toHaveBeenCalledWith(
        "Duplicated Description",
      );
      expect(mockTemplateRepository.update).not.toHaveBeenCalled();
    });

    it("should allow same description for same template", async () => {
      const dto: UpdateTemplateDto = {
        identificator: "welcome-email",
        sender: "updated@example.com",
        subject: "Updated Subject",
        description: "Same Description",
        fields: ["name"],
        filename: "",
      };

      const existingTemplate = templateMock({ description: "Same Description" });

      mockTemplateRepository.findByIdentificator.mockResolvedValue(
        TemplateEntity.create(existingTemplate),
      );
      mockTemplateRepository.update.mockResolvedValue(true);

      const result = await useCase.execute(dto);

      expect(result.updated).toBe(true);
      expect(mockTemplateRepository.findByDescription).not.toHaveBeenCalled();
    });

    it("should throw UploadFileException when file upload fails", async () => {
      const dto: UpdateTemplateDto = {
        identificator: "welcome-email",
        sender: "test@example.com",
        subject: "Test",
        description: "Test",
        fields: [],
        filename: "/templates/fail.html",
      };

      const existingTemplate = templateMock();
      const uploadResult: UploadResult = {
        success: false,
        error: "Upload failed",
      };

      mockTemplateRepository.findByIdentificator.mockResolvedValue(
        TemplateEntity.create(existingTemplate),
      );
      mockTemplateRepository.findByDescription.mockResolvedValue(null);
      mockUploadProvider.upload.mockResolvedValue(uploadResult);

      await expect(useCase.execute(dto)).rejects.toThrow("Cannot upload file.");
      expect(mockUploadProvider.upload).toHaveBeenCalledWith("/templates/fail.html");
      expect(mockTemplateRepository.update).not.toHaveBeenCalled();
    });

    it("should rollback new file when repository update fails", async () => {
      const dto: UpdateTemplateDto = {
        identificator: "welcome-email",
        sender: "test@example.com",
        subject: "Test",
        description: "Test",
        fields: [],
        filename: "/templates/new.html",
      };

      const existingTemplate = templateMock({ templateId: "OLD_ID" });
      const uploadResult: UploadResult = {
        success: true,
        publicId: "NEW_ID",
      };

      mockTemplateRepository.findByIdentificator.mockResolvedValue(
        TemplateEntity.create(existingTemplate),
      );
      mockTemplateRepository.findByDescription.mockResolvedValue(null);
      mockUploadProvider.upload.mockResolvedValue(uploadResult);
      mockTemplateRepository.update.mockRejectedValue(new Error("Database error"));
      mockUploadProvider.deleteById.mockResolvedValue(true);

      const result = await useCase.execute(dto);

      expect(result.updated).toBe(false);
      expect(mockUploadProvider.deleteById).toHaveBeenCalledWith("NEW_ID");
      expect(mockUploadProvider.deleteById).not.toHaveBeenCalledWith("OLD_ID");
    });

    it("should rollback new file when repository update returns false", async () => {
      const dto: UpdateTemplateDto = {
        identificator: "welcome-email",
        sender: "test@example.com",
        subject: "Test",
        description: "Test",
        fields: [],
        filename: "/templates/new.html",
      };

      const existingTemplate = templateMock({ templateId: "OLD_ID" });
      const uploadResult: UploadResult = {
        success: true,
        publicId: "NEW_ID",
      };

      mockTemplateRepository.findByIdentificator.mockResolvedValue(
        TemplateEntity.create(existingTemplate),
      );
      mockTemplateRepository.findByDescription.mockResolvedValue(null);
      mockUploadProvider.upload.mockResolvedValue(uploadResult);
      mockTemplateRepository.update.mockResolvedValue(false);
      mockUploadProvider.deleteById.mockResolvedValue(true);

      const result = await useCase.execute(dto);

      expect(result.updated).toBe(false);
      expect(mockUploadProvider.deleteById).toHaveBeenCalledWith("NEW_ID");
    });

    it("should update only provided fields", async () => {
      const dto: UpdateTemplateDto = {
        identificator: "welcome-email",
        sender: "updated@example.com",
        subject: "",
        description: "",
        fields: [],
        filename: "",
      };

      const existingTemplate = templateMock();

      mockTemplateRepository.findByIdentificator.mockResolvedValue(
        TemplateEntity.create(existingTemplate),
      );
      mockTemplateRepository.update.mockResolvedValue(true);

      const result = await useCase.execute(dto);

      expect(result.updated).toBe(true);
      expect(mockTemplateRepository.update).toHaveBeenCalledWith("welcome-email", {
        sender: "updated@example.com",
        fields: [],
      });
    });

    it("should update all fields when all are provided", async () => {
      const dto: UpdateTemplateDto = {
        identificator: "welcome-email",
        sender: "new@example.com",
        subject: "New Subject",
        description: "New Description",
        fields: ["field1", "field2", "field3"],
        filename: "/templates/new.html",
      };

      const existingTemplate = templateMock({ templateId: "OLD_ID" });
      const uploadResult: UploadResult = {
        success: true,
        publicId: "NEW_ID",
      };

      mockTemplateRepository.findByIdentificator.mockResolvedValue(
        TemplateEntity.create(existingTemplate),
      );
      mockTemplateRepository.findByDescription.mockResolvedValue(null);
      mockUploadProvider.upload.mockResolvedValue(uploadResult);
      mockTemplateRepository.update.mockResolvedValue(true);
      mockUploadProvider.deleteById.mockResolvedValue(true);

      const result = await useCase.execute(dto);

      expect(result.updated).toBe(true);
      expect(mockTemplateRepository.update).toHaveBeenCalledWith("welcome-email", {
        sender: "new@example.com",
        subject: "New Subject",
        description: "New Description",
        fields: ["field1", "field2", "field3"],
        templateId: "NEW_ID",
      });
    });
  });

  describe("File Handling", () => {
    it("should not upload file when filename is empty", async () => {
      const dto: UpdateTemplateDto = {
        identificator: "welcome-email",
        sender: "test@example.com",
        subject: "Test",
        description: "Test",
        fields: [],
        filename: "",
      };

      const existingTemplate = templateMock();

      mockTemplateRepository.findByIdentificator.mockResolvedValue(
        TemplateEntity.create(existingTemplate),
      );
      mockTemplateRepository.findByDescription.mockResolvedValue(null);
      mockTemplateRepository.update.mockResolvedValue(true);

      await useCase.execute(dto);

      expect(mockUploadProvider.upload).not.toHaveBeenCalled();
    });

    it("should delete old file only after successful update", async () => {
      const dto: UpdateTemplateDto = {
        identificator: "welcome-email",
        sender: "test@example.com",
        subject: "Test",
        description: "Test",
        fields: [],
        filename: "/templates/new.html",
      };

      const existingTemplate = templateMock({ templateId: "OLD_FILE_ID" });
      const uploadResult: UploadResult = {
        success: true,
        publicId: "NEW_FILE_ID",
      };

      const deleteOrder: string[] = [];

      mockTemplateRepository.findByIdentificator.mockResolvedValue(
        TemplateEntity.create(existingTemplate),
      );
      mockTemplateRepository.findByDescription.mockResolvedValue(null);
      mockUploadProvider.upload.mockResolvedValue(uploadResult);
      mockTemplateRepository.update.mockImplementation(async () => {
        deleteOrder.push("update");
        return true;
      });
      mockUploadProvider.deleteById.mockImplementation(async (id) => {
        deleteOrder.push(`delete-${id}`);
        return true;
      });

      await useCase.execute(dto);

      expect(deleteOrder).toEqual(["update", "delete-OLD_FILE_ID"]);
    });

    it("should handle delete file errors gracefully", async () => {
      const dto: UpdateTemplateDto = {
        identificator: "welcome-email",
        sender: "test@example.com",
        subject: "Test",
        description: "Test",
        fields: [],
        filename: "/templates/new.html",
      };

      const existingTemplate = templateMock({ templateId: "OLD_ID" });
      const uploadResult: UploadResult = {
        success: true,
        publicId: "NEW_ID",
      };

      const consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation();

      mockTemplateRepository.findByIdentificator.mockResolvedValue(
        TemplateEntity.create(existingTemplate),
      );
      mockTemplateRepository.findByDescription.mockResolvedValue(null);
      mockUploadProvider.upload.mockResolvedValue(uploadResult);
      mockTemplateRepository.update.mockResolvedValue(true);
      mockUploadProvider.deleteById.mockRejectedValue(new Error("Delete failed"));

      const result = await useCase.execute(dto);

      expect(result.updated).toBe(true);
      expect(consoleWarnSpy).toHaveBeenCalled();

      consoleWarnSpy.mockRestore();
    });

    it("should handle rollback delete errors gracefully", async () => {
      const dto: UpdateTemplateDto = {
        identificator: "welcome-email",
        sender: "test@example.com",
        subject: "Test",
        description: "Test",
        fields: [],
        filename: "/templates/new.html",
      };

      const existingTemplate = templateMock({ templateId: "OLD_ID" });
      const uploadResult: UploadResult = {
        success: true,
        publicId: "NEW_ID",
      };

      const consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation();

      mockTemplateRepository.findByIdentificator.mockResolvedValue(
        TemplateEntity.create(existingTemplate),
      );
      mockTemplateRepository.findByDescription.mockResolvedValue(null);
      mockUploadProvider.upload.mockResolvedValue(uploadResult);
      mockTemplateRepository.update.mockResolvedValue(false);
      mockUploadProvider.deleteById.mockRejectedValue(new Error("Rollback delete failed"));

      const result = await useCase.execute(dto);

      expect(result.updated).toBe(false);
      expect(consoleWarnSpy).toHaveBeenCalled();

      consoleWarnSpy.mockRestore();
    });
  });

  describe("Description Validation", () => {
    it("should skip description validation when description is empty", async () => {
      const dto: UpdateTemplateDto = {
        identificator: "welcome-email",
        sender: "test@example.com",
        subject: "Test",
        description: "",
        fields: [],
        filename: "",
      };

      const existingTemplate = templateMock();

      mockTemplateRepository.findByIdentificator.mockResolvedValue(
        TemplateEntity.create(existingTemplate),
      );
      mockTemplateRepository.update.mockResolvedValue(true);

      await useCase.execute(dto);

      expect(mockTemplateRepository.findByDescription).not.toHaveBeenCalled();
    });

    it("should skip description validation when description is same as current", async () => {
      const dto: UpdateTemplateDto = {
        identificator: "welcome-email",
        sender: "test@example.com",
        subject: "Test",
        description: "Original Description",
        fields: [],
        filename: "",
      };

      const existingTemplate = templateMock({ description: "Original Description" });

      mockTemplateRepository.findByIdentificator.mockResolvedValue(
        TemplateEntity.create(existingTemplate),
      );
      mockTemplateRepository.update.mockResolvedValue(true);

      await useCase.execute(dto);

      expect(mockTemplateRepository.findByDescription).not.toHaveBeenCalled();
    });

    it("should validate description when it is different from current", async () => {
      const dto: UpdateTemplateDto = {
        identificator: "welcome-email",
        sender: "test@example.com",
        subject: "Test",
        description: "New Description",
        fields: [],
        filename: "",
      };

      const existingTemplate = templateMock({ description: "Old Description" });

      mockTemplateRepository.findByIdentificator.mockResolvedValue(
        TemplateEntity.create(existingTemplate),
      );
      mockTemplateRepository.findByDescription.mockResolvedValue(null);
      mockTemplateRepository.update.mockResolvedValue(true);

      await useCase.execute(dto);

      expect(mockTemplateRepository.findByDescription).toHaveBeenCalledWith("New Description");
    });

    it("should allow description used by same template", async () => {
      const dto: UpdateTemplateDto = {
        identificator: "welcome-email",
        sender: "test@example.com",
        subject: "Test",
        description: "Updated Description",
        fields: [],
        filename: "",
      };

      const existingTemplate = templateMock({
        identificator: "welcome-email",
        description: "Old Description",
      });

      const duplicateCheck = templateMock({
        identificator: "welcome-email",
        description: "Updated Description",
      });

      mockTemplateRepository.findByIdentificator.mockResolvedValue(
        TemplateEntity.create(existingTemplate),
      );
      mockTemplateRepository.findByDescription.mockResolvedValue(
        TemplateEntity.create(duplicateCheck),
      );
      mockTemplateRepository.update.mockResolvedValue(true);

      const result = await useCase.execute(dto);

      expect(result.updated).toBe(true);
    });
  });

  describe("Edge Cases", () => {
    it("should handle special characters in fields", async () => {
      const dto: UpdateTemplateDto = {
        identificator: "welcome-email",
        sender: "test@example.com",
        subject: "Test with émojis 🎉",
        description: "Description with <html> & special chars",
        fields: ["field@1", "field#2", "field$3"],
        filename: "",
      };

      const existingTemplate = templateMock();

      mockTemplateRepository.findByIdentificator.mockResolvedValue(
        TemplateEntity.create(existingTemplate),
      );
      mockTemplateRepository.findByDescription.mockResolvedValue(null);
      mockTemplateRepository.update.mockResolvedValue(true);

      const result = await useCase.execute(dto);

      expect(result.updated).toBe(true);
    });

    it("should handle very long field arrays", async () => {
      const dto: UpdateTemplateDto = {
        identificator: "welcome-email",
        sender: "test@example.com",
        subject: "Test",
        description: "Test",
        fields: Array.from({ length: 100 }, (_, i) => `field${i}`),
        filename: "",
      };

      const existingTemplate = templateMock();

      mockTemplateRepository.findByIdentificator.mockResolvedValue(
        TemplateEntity.create(existingTemplate),
      );
      mockTemplateRepository.findByDescription.mockResolvedValue(null);
      mockTemplateRepository.update.mockResolvedValue(true);

      const result = await useCase.execute(dto);

      expect(result.updated).toBe(true);
      expect(mockTemplateRepository.update).toHaveBeenCalledWith(
        "welcome-email",
        expect.objectContaining({
          fields: expect.arrayContaining([expect.any(String)]),
        }),
      );
    });

    it("should handle template with undefined enabled status", async () => {
      const dto: UpdateTemplateDto = {
        identificator: "template-undefined-enabled",
        sender: "test@example.com",
        subject: "Test",
        description: "Test",
        fields: [],
        filename: "",
      };

      const existingTemplate = templateMock({ enabled: undefined });

      mockTemplateRepository.findByIdentificator.mockResolvedValue(
        TemplateEntity.create(existingTemplate),
      );

      await expect(useCase.execute(dto)).rejects.toThrow("Template already disabled.");
    });
  });
});
