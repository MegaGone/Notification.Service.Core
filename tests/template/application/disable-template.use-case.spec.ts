import { TemplateEntity } from "../../../src/core/template/domain/entities/template.entity";
import { UploadProvider } from "../../../src/core/template/domain/providers/upload.provider";
import { PrimitiveTemplate } from "../../../src/core/template/domain/entities/template.interface";
import { TEMPLATE_TYPE_ENUM } from "../../../src/core/template/domain/constants/template-type.enum";
import { TemplateRepository } from "../../../src/core/template/domain/repositories/template.repository";
import { DisableTemplateDto } from "../../../src/core/template/application/disable-template/disable-template.dto";
import { DisableTemplateUseCase } from "../../../src/core/template/application/disable-template/disable-template.use-case";

const templateMock = ((): PrimitiveTemplate => {
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
  };
})();

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

describe("DisableTemplateUseCase", () => {
  let useCase: DisableTemplateUseCase;
  let mockUploadProvider: jest.Mocked<UploadProvider>;
  let mockTemplateRepository: jest.Mocked<TemplateRepository>;

  beforeEach(() => {
    mockUploadProvider = uploadProviderMock();
    mockTemplateRepository = templateRepositoryMock();

    useCase = new DisableTemplateUseCase(mockUploadProvider, mockTemplateRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("execute", () => {
    it("should successfully disable a template", async () => {
      const dto: DisableTemplateDto = {
        identificator: "welcome-email",
      };

      const templateEntity = TemplateEntity.create(templateMock);

      mockTemplateRepository.findByIdentificator.mockResolvedValue(templateEntity);
      mockUploadProvider.deleteById.mockResolvedValue(true);
      mockTemplateRepository.disable.mockResolvedValue(true);

      const result = await useCase.execute(dto);

      // Assert
      expect(result).toEqual({ disabled: true });
      expect(mockTemplateRepository.findByIdentificator).toHaveBeenCalledWith("welcome-email");
      expect(mockTemplateRepository.findByIdentificator).toHaveBeenCalledTimes(1);
      expect(mockUploadProvider.deleteById).toHaveBeenCalledWith("TEMPLATE_001");
      expect(mockUploadProvider.deleteById).toHaveBeenCalledTimes(1);
      expect(mockTemplateRepository.disable).toHaveBeenCalledWith("welcome-email");
      expect(mockTemplateRepository.disable).toHaveBeenCalledTimes(1);
    });

    it("should return disabled false when repository disable returns false", async () => {
      // Arrange
      const dto: DisableTemplateDto = {
        identificator: "test-template",
      };

      const templateEntity = TemplateEntity.create(templateMock);

      mockTemplateRepository.findByIdentificator.mockResolvedValue(templateEntity);
      mockUploadProvider.deleteById.mockResolvedValue(true);
      mockTemplateRepository.disable.mockResolvedValue(false);

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result).toEqual({ disabled: false });
      expect(mockTemplateRepository.disable).toHaveBeenCalledTimes(1);
    });

    it("should throw TemplateNotFoundException when template is not found", async () => {
      // Arrange
      const dto: DisableTemplateDto = {
        identificator: "non-existent-template",
      };

      mockTemplateRepository.findByIdentificator.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(dto)).rejects.toThrow(
        "Template non-existent-template not found.",
      );
      expect(mockTemplateRepository.findByIdentificator).toHaveBeenCalledWith(
        "non-existent-template",
      );
      expect(mockTemplateRepository.findByIdentificator).toHaveBeenCalledTimes(1);
      expect(mockUploadProvider.deleteById).not.toHaveBeenCalled();
      expect(mockTemplateRepository.disable).not.toHaveBeenCalled();
    });

    it("should throw TemplateAlreadyDisabledException when template is already disabled", async () => {
      // Arrange
      const dto: DisableTemplateDto = {
        identificator: "disabled-template",
      };

      const disabledTemplate = TemplateEntity.create({
        ...templateMock,
        enabled: false,
      });

      mockTemplateRepository.findByIdentificator.mockResolvedValue(disabledTemplate);

      // Act & Assert
      await expect(useCase.execute(dto)).rejects.toThrow("Template already disabled.");
      expect(mockTemplateRepository.findByIdentificator).toHaveBeenCalledTimes(1);
      expect(mockUploadProvider.deleteById).not.toHaveBeenCalled();
      expect(mockTemplateRepository.disable).not.toHaveBeenCalled();
    });

    it("should throw UploadFileException when upload provider fails to delete", async () => {
      // Arrange
      const dto: DisableTemplateDto = {
        identificator: "welcome-email",
      };

      const templateEntity = TemplateEntity.create(templateMock);

      mockTemplateRepository.findByIdentificator.mockResolvedValue(templateEntity);
      mockUploadProvider.deleteById.mockResolvedValue(false);

      // Act & Assert
      await expect(useCase.execute(dto)).rejects.toThrow("Cannot upload file.");
      expect(mockTemplateRepository.findByIdentificator).toHaveBeenCalledTimes(1);
      expect(mockUploadProvider.deleteById).toHaveBeenCalledWith("TEMPLATE_001");
      expect(mockUploadProvider.deleteById).toHaveBeenCalledTimes(1);
      expect(mockTemplateRepository.disable).not.toHaveBeenCalled();
    });

    it("should handle when template enabled is undefined", async () => {
      // Arrange
      const dto: DisableTemplateDto = {
        identificator: "template-without-enabled",
      };

      const templateWithoutEnabled = TemplateEntity.create({
        ...templateMock,
        enabled: undefined,
      });

      mockTemplateRepository.findByIdentificator.mockResolvedValue(templateWithoutEnabled);

      // Act & Assert
      await expect(useCase.execute(dto)).rejects.toThrow("Template already disabled.");
      expect(mockTemplateRepository.findByIdentificator).toHaveBeenCalledTimes(1);
      expect(mockUploadProvider.deleteById).not.toHaveBeenCalled();
      expect(mockTemplateRepository.disable).not.toHaveBeenCalled();
    });

    it("should use the correct templateId from the found template", async () => {
      // Arrange
      const dto: DisableTemplateDto = {
        identificator: "custom-template",
      };

      const customTemplate = TemplateEntity.create({
        ...templateMock,
        templateId: "CUSTOM_ID_12345",
      });

      mockTemplateRepository.findByIdentificator.mockResolvedValue(customTemplate);
      mockUploadProvider.deleteById.mockResolvedValue(true);
      mockTemplateRepository.disable.mockResolvedValue(true);

      // Act
      await useCase.execute(dto);

      // Assert
      expect(mockUploadProvider.deleteById).toHaveBeenCalledWith("CUSTOM_ID_12345");
    });

    it("should call disable with the correct identificator from template", async () => {
      // Arrange
      const dto: DisableTemplateDto = {
        identificator: "my-template-id",
      };

      const customTemplate = TemplateEntity.create({
        ...templateMock,
        identificator: "my-template-id",
      });

      mockTemplateRepository.findByIdentificator.mockResolvedValue(customTemplate);
      mockUploadProvider.deleteById.mockResolvedValue(true);
      mockTemplateRepository.disable.mockResolvedValue(true);

      // Act
      await useCase.execute(dto);

      // Assert
      expect(mockTemplateRepository.disable).toHaveBeenCalledWith("my-template-id");
    });
  });

  describe("Integration flow", () => {
    it("should execute all steps in correct order for successful disable", async () => {
      // Arrange
      const dto: DisableTemplateDto = {
        identificator: "welcome-email",
      };

      const templateEntity = TemplateEntity.create(templateMock);
      const callOrder: string[] = [];

      mockTemplateRepository.findByIdentificator.mockImplementation(async (id) => {
        callOrder.push("findByIdentificator");
        return templateEntity;
      });

      mockUploadProvider.deleteById.mockImplementation(async (id) => {
        callOrder.push("deleteById");
        return true;
      });

      mockTemplateRepository.disable.mockImplementation(async (id) => {
        callOrder.push("disable");
        return true;
      });

      // Act
      await useCase.execute(dto);

      // Assert
      expect(callOrder).toEqual(["findByIdentificator", "deleteById", "disable"]);
    });

    it("should stop execution after findByIdentificator if template not found", async () => {
      // Arrange
      const dto: DisableTemplateDto = {
        identificator: "non-existent",
      };

      const callOrder: string[] = [];

      mockTemplateRepository.findByIdentificator.mockImplementation(async (id) => {
        callOrder.push("findByIdentificator");
        return null;
      });

      mockUploadProvider.deleteById.mockImplementation(async (id) => {
        callOrder.push("deleteById");
        return true;
      });

      mockTemplateRepository.disable.mockImplementation(async (id) => {
        callOrder.push("disable");
        return true;
      });

      // Act & Assert
      await expect(useCase.execute(dto)).rejects.toThrow();
      expect(callOrder).toEqual(["findByIdentificator"]);
    });

    it("should stop execution before deleteById if template is already disabled", async () => {
      // Arrange
      const dto: DisableTemplateDto = {
        identificator: "disabled-template",
      };

      const disabledTemplate = TemplateEntity.create({
        ...templateMock,
        enabled: false,
      });

      const callOrder: string[] = [];

      mockTemplateRepository.findByIdentificator.mockImplementation(async (id) => {
        callOrder.push("findByIdentificator");
        return disabledTemplate;
      });

      mockUploadProvider.deleteById.mockImplementation(async (id) => {
        callOrder.push("deleteById");
        return true;
      });

      mockTemplateRepository.disable.mockImplementation(async (id) => {
        callOrder.push("disable");
        return true;
      });

      // Act & Assert
      await expect(useCase.execute(dto)).rejects.toThrow();
      expect(callOrder).toEqual(["findByIdentificator"]);
    });

    it("should stop execution before disable if upload provider fails", async () => {
      // Arrange
      const dto: DisableTemplateDto = {
        identificator: "welcome-email",
      };

      const templateEntity = TemplateEntity.create(templateMock);
      const callOrder: string[] = [];

      mockTemplateRepository.findByIdentificator.mockImplementation(async (id) => {
        callOrder.push("findByIdentificator");
        return templateEntity;
      });

      mockUploadProvider.deleteById.mockImplementation(async (id) => {
        callOrder.push("deleteById");
        return false;
      });

      mockTemplateRepository.disable.mockImplementation(async (id) => {
        callOrder.push("disable");
        return true;
      });

      // Act & Assert
      await expect(useCase.execute(dto)).rejects.toThrow();
      expect(callOrder).toEqual(["findByIdentificator", "deleteById"]);
    });
  });

  describe("Edge Cases", () => {
    it("should handle templates with special characters in identificator", async () => {
      // Arrange
      const dto: DisableTemplateDto = {
        identificator: "template-with-special-chars-!@#$%",
      };

      const templateEntity = TemplateEntity.create({
        ...templateMock,
        identificator: "template-with-special-chars-!@#$%",
      });

      mockTemplateRepository.findByIdentificator.mockResolvedValue(templateEntity);
      mockUploadProvider.deleteById.mockResolvedValue(true);
      mockTemplateRepository.disable.mockResolvedValue(true);

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.disabled).toBe(true);
      expect(mockTemplateRepository.findByIdentificator).toHaveBeenCalledWith(
        "template-with-special-chars-!@#$%",
      );
    });

    it("should handle templates with very long identificator", async () => {
      // Arrange
      const longIdentificator = "a".repeat(1000);
      const dto: DisableTemplateDto = {
        identificator: longIdentificator,
      };

      const templateEntity = TemplateEntity.create({
        ...templateMock,
        identificator: longIdentificator,
      });

      mockTemplateRepository.findByIdentificator.mockResolvedValue(templateEntity);
      mockUploadProvider.deleteById.mockResolvedValue(true);
      mockTemplateRepository.disable.mockResolvedValue(true);

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.disabled).toBe(true);
      expect(mockTemplateRepository.findByIdentificator).toHaveBeenCalledWith(longIdentificator);
    });

    it("should handle templates with empty string templateId", async () => {
      // Arrange
      const dto: DisableTemplateDto = {
        identificator: "template-empty-id",
      };

      const templateEntity = TemplateEntity.create({
        ...templateMock,
        templateId: "",
      });

      mockTemplateRepository.findByIdentificator.mockResolvedValue(templateEntity);
      mockUploadProvider.deleteById.mockResolvedValue(true);
      mockTemplateRepository.disable.mockResolvedValue(true);

      // Act
      await useCase.execute(dto);

      // Assert
      expect(mockUploadProvider.deleteById).toHaveBeenCalledWith("");
    });

    it("should handle SMS template type", async () => {
      // Arrange
      const dto: DisableTemplateDto = {
        identificator: "sms-template",
      };

      const smsTemplate = TemplateEntity.create({
        ...templateMock,
        type: TEMPLATE_TYPE_ENUM.SMS,
      });

      mockTemplateRepository.findByIdentificator.mockResolvedValue(smsTemplate);
      mockUploadProvider.deleteById.mockResolvedValue(true);
      mockTemplateRepository.disable.mockResolvedValue(true);

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.disabled).toBe(true);
    });
  });
});
