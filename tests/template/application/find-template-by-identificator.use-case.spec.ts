import { TemplateEntity } from "../../../src/core/template/domain/entities/template.entity";
import { PrimitiveTemplate } from "../../../src/core/template/domain/entities/template.interface";
import { TEMPLATE_TYPE_ENUM } from "../../../src/core/template/domain/constants/template-type.enum";
import { TemplateRepository } from "../../../src/core/template/domain/repositories/template.repository";
import { FindTemplateByIdentificatorDto } from "../../../src/core/template/application/find-template-by-identificator/find-template-by-identificator.dto";
import { FindTemplateByIdentificatorUseCase } from "../../../src/core/template/application/find-template-by-identificator/find-template-by-identificator.use-case";

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

describe("FindTemplateByIdentificatorUseCase", () => {
  let useCase: FindTemplateByIdentificatorUseCase;
  let mockTemplateRepository: jest.Mocked<TemplateRepository>;

  beforeEach(() => {
    mockTemplateRepository = templateRepositoryMock();
    useCase = new FindTemplateByIdentificatorUseCase(mockTemplateRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("execute", () => {
    it("should successfully find and return a template by identificator", async () => {
      const dto: FindTemplateByIdentificatorDto = {
        identificator: "welcome-email",
      };

      const templateEntity = TemplateEntity.create(templateMock);
      mockTemplateRepository.findByIdentificator.mockResolvedValue(templateEntity);

      const result = await useCase.execute(dto);

      expect(result).toEqual({ template: templateMock });
      expect(result.template).toHaveProperty("id", templateMock.id);
      expect(result.template).toHaveProperty("identificator", "welcome-email");
      expect(result.template).toHaveProperty("subject", "Test Subject");
      expect(mockTemplateRepository.findByIdentificator).toHaveBeenCalledWith("welcome-email");
      expect(mockTemplateRepository.findByIdentificator).toHaveBeenCalledTimes(1);
    });

    it("should return template with all properties", async () => {
      const dto: FindTemplateByIdentificatorDto = {
        identificator: "test-template",
      };

      const templateEntity = TemplateEntity.create(templateMock);
      mockTemplateRepository.findByIdentificator.mockResolvedValue(templateEntity);

      const result = await useCase.execute(dto);

      expect(result.template).toMatchObject({
        id: templateMock.id,
        type: templateMock.type,
        sender: templateMock.sender,
        subject: templateMock.subject,
        description: templateMock.description,
        templateId: templateMock.templateId,
        identificator: templateMock.identificator,
        fields: templateMock.fields,
        enabled: templateMock.enabled,
        createdAt: templateMock.createdAt,
        updatedAt: templateMock.updatedAt,
      });
    });

    it("should throw TemplateNotFoundException when template is not found", async () => {
      const dto: FindTemplateByIdentificatorDto = {
        identificator: "non-existent-template",
      };

      mockTemplateRepository.findByIdentificator.mockResolvedValue(null);

      await expect(useCase.execute(dto)).rejects.toThrow(
        "Template non-existent-template not found.",
      );
      expect(mockTemplateRepository.findByIdentificator).toHaveBeenCalledWith(
        "non-existent-template",
      );
      expect(mockTemplateRepository.findByIdentificator).toHaveBeenCalledTimes(1);
    });

    it("should find template with different identificator", async () => {
      const dto: FindTemplateByIdentificatorDto = {
        identificator: "password-reset-email",
      };

      const customTemplate = TemplateEntity.create({
        ...templateMock,
        identificator: "password-reset-email",
        subject: "Password Reset Request",
      });

      mockTemplateRepository.findByIdentificator.mockResolvedValue(customTemplate);

      const result = await useCase.execute(dto);

      expect(result.template.identificator).toBe("password-reset-email");
      expect(result.template.subject).toBe("Password Reset Request");
      expect(mockTemplateRepository.findByIdentificator).toHaveBeenCalledWith(
        "password-reset-email",
      );
    });

    it("should return template with EMAIL type", async () => {
      const dto: FindTemplateByIdentificatorDto = {
        identificator: "email-template",
      };

      const emailTemplate = TemplateEntity.create({
        ...templateMock,
        type: TEMPLATE_TYPE_ENUM.EMAIL,
      });

      mockTemplateRepository.findByIdentificator.mockResolvedValue(emailTemplate);

      const result = await useCase.execute(dto);

      expect(result.template.type).toBe(TEMPLATE_TYPE_ENUM.EMAIL);
    });

    it("should return template with SMS type", async () => {
      const dto: FindTemplateByIdentificatorDto = {
        identificator: "sms-template",
      };

      const smsTemplate = TemplateEntity.create({
        ...templateMock,
        type: TEMPLATE_TYPE_ENUM.SMS,
      });

      mockTemplateRepository.findByIdentificator.mockResolvedValue(smsTemplate);

      const result = await useCase.execute(dto);

      expect(result.template.type).toBe(TEMPLATE_TYPE_ENUM.SMS);
    });

    it("should return disabled template", async () => {
      const dto: FindTemplateByIdentificatorDto = {
        identificator: "disabled-template",
      };

      const disabledTemplate = TemplateEntity.create({
        ...templateMock,
        enabled: false,
      });

      mockTemplateRepository.findByIdentificator.mockResolvedValue(disabledTemplate);

      const result = await useCase.execute(dto);

      expect(result.template.enabled).toBe(false);
    });

    it("should return template with empty fields array", async () => {
      const dto: FindTemplateByIdentificatorDto = {
        identificator: "no-fields-template",
      };

      const noFieldsTemplate = TemplateEntity.create({
        ...templateMock,
        fields: [],
      });

      mockTemplateRepository.findByIdentificator.mockResolvedValue(noFieldsTemplate);

      const result = await useCase.execute(dto);

      expect(result.template.fields).toEqual([]);
      expect(result.template.fields.length).toBe(0);
    });

    it("should return template with multiple fields", async () => {
      const dto: FindTemplateByIdentificatorDto = {
        identificator: "multi-field-template",
      };

      const fields = ["field1", "field2", "field3", "field4", "field5"];
      const multiFieldTemplate = TemplateEntity.create({
        ...templateMock,
        fields: fields,
      });

      mockTemplateRepository.findByIdentificator.mockResolvedValue(multiFieldTemplate);

      const result = await useCase.execute(dto);

      expect(result.template.fields).toEqual(fields);
      expect(result.template.fields.length).toBe(5);
    });

    it("should return template without optional fields", async () => {
      const dto: FindTemplateByIdentificatorDto = {
        identificator: "minimal-template",
      };

      const minimalTemplate = TemplateEntity.create({
        type: TEMPLATE_TYPE_ENUM.EMAIL,
        sender: "test@example.com",
        subject: "Test",
        description: "Test",
        templateId: "TEST_001",
        fields: [],
      });

      mockTemplateRepository.findByIdentificator.mockResolvedValue(minimalTemplate);

      const result = await useCase.execute(dto);

      expect(result.template.id).toBeUndefined();
      expect(result.template.identificator).toBeUndefined();
      expect(result.template.enabled).toBeUndefined();
      expect(result.template.createdAt).toBeUndefined();
      expect(result.template.updatedAt).toBeUndefined();
    });
  });

  describe("Edge Cases", () => {
    it("should handle identificator with special characters", async () => {
      const dto: FindTemplateByIdentificatorDto = {
        identificator: "template-with-special-chars-!@#$%",
      };

      const specialTemplate = TemplateEntity.create({
        ...templateMock,
        identificator: "template-with-special-chars-!@#$%",
      });

      mockTemplateRepository.findByIdentificator.mockResolvedValue(specialTemplate);

      const result = await useCase.execute(dto);

      expect(result.template.identificator).toBe("template-with-special-chars-!@#$%");
      expect(mockTemplateRepository.findByIdentificator).toHaveBeenCalledWith(
        "template-with-special-chars-!@#$%",
      );
    });

    it("should handle very long identificator", async () => {
      const longIdentificator = "a".repeat(1000);
      const dto: FindTemplateByIdentificatorDto = {
        identificator: longIdentificator,
      };

      const longIdTemplate = TemplateEntity.create({
        ...templateMock,
        identificator: longIdentificator,
      });

      mockTemplateRepository.findByIdentificator.mockResolvedValue(longIdTemplate);

      const result = await useCase.execute(dto);

      expect(result.template.identificator).toBe(longIdentificator);
      expect(result.template.identificator?.length).toBe(1000);
    });

    it("should handle identificator with hyphens and underscores", async () => {
      const dto: FindTemplateByIdentificatorDto = {
        identificator: "my-template_with_mixed-separators_123",
      };

      const mixedTemplate = TemplateEntity.create({
        ...templateMock,
        identificator: "my-template_with_mixed-separators_123",
      });

      mockTemplateRepository.findByIdentificator.mockResolvedValue(mixedTemplate);

      const result = await useCase.execute(dto);

      expect(result.template.identificator).toBe("my-template_with_mixed-separators_123");
    });

    it("should handle identificator with numbers only", async () => {
      const dto: FindTemplateByIdentificatorDto = {
        identificator: "12345",
      };

      const numericTemplate = TemplateEntity.create({
        ...templateMock,
        identificator: "12345",
      });

      mockTemplateRepository.findByIdentificator.mockResolvedValue(numericTemplate);

      const result = await useCase.execute(dto);

      expect(result.template.identificator).toBe("12345");
    });

    it("should handle identificator with uppercase letters", async () => {
      const dto: FindTemplateByIdentificatorDto = {
        identificator: "WELCOME-EMAIL-TEMPLATE",
      };

      const uppercaseTemplate = TemplateEntity.create({
        ...templateMock,
        identificator: "WELCOME-EMAIL-TEMPLATE",
      });

      mockTemplateRepository.findByIdentificator.mockResolvedValue(uppercaseTemplate);

      const result = await useCase.execute(dto);

      expect(result.template.identificator).toBe("WELCOME-EMAIL-TEMPLATE");
    });

    it("should handle identificator with mixed case", async () => {
      const dto: FindTemplateByIdentificatorDto = {
        identificator: "Welcome-Email-Template",
      };

      const mixedCaseTemplate = TemplateEntity.create({
        ...templateMock,
        identificator: "Welcome-Email-Template",
      });

      mockTemplateRepository.findByIdentificator.mockResolvedValue(mixedCaseTemplate);

      const result = await useCase.execute(dto);

      expect(result.template.identificator).toBe("Welcome-Email-Template");
    });
  });

  describe("Template Data Integrity", () => {
    it("should preserve dates correctly", async () => {
      const dto: FindTemplateByIdentificatorDto = {
        identificator: "date-template",
      };

      const createdDate = new Date("2025-03-15T10:30:00.000Z");
      const updatedDate = new Date("2025-03-16T15:45:00.000Z");

      const dateTemplate = TemplateEntity.create({
        ...templateMock,
        createdAt: createdDate,
        updatedAt: updatedDate,
      });

      mockTemplateRepository.findByIdentificator.mockResolvedValue(dateTemplate);

      const result = await useCase.execute(dto);

      expect(result.template.createdAt).toEqual(createdDate);
      expect(result.template.updatedAt).toEqual(updatedDate);
      expect(result.template.createdAt instanceof Date).toBe(true);
      expect(result.template.updatedAt instanceof Date).toBe(true);
    });

    it("should preserve all field names correctly", async () => {
      const dto: FindTemplateByIdentificatorDto = {
        identificator: "field-template",
      };

      const fields = ["firstName", "lastName", "email", "phoneNumber", "address"];
      const fieldTemplate = TemplateEntity.create({
        ...templateMock,
        fields: fields,
      });

      mockTemplateRepository.findByIdentificator.mockResolvedValue(fieldTemplate);

      const result = await useCase.execute(dto);

      expect(result.template.fields).toEqual(fields);
      fields.forEach((field, index) => {
        expect(result.template.fields[index]).toBe(field);
      });
    });

    it("should preserve email sender correctly", async () => {
      const dto: FindTemplateByIdentificatorDto = {
        identificator: "sender-template",
      };

      const senderTemplate = TemplateEntity.create({
        ...templateMock,
        sender: "custom-sender@company.com",
      });

      mockTemplateRepository.findByIdentificator.mockResolvedValue(senderTemplate);

      const result = await useCase.execute(dto);

      expect(result.template.sender).toBe("custom-sender@company.com");
    });

    it("should preserve subject with special characters", async () => {
      const dto: FindTemplateByIdentificatorDto = {
        identificator: "special-subject-template",
      };

      const subjectTemplate = TemplateEntity.create({
        ...templateMock,
        subject: "Subject with émojis 🎉 and spëcial çhars",
      });

      mockTemplateRepository.findByIdentificator.mockResolvedValue(subjectTemplate);

      const result = await useCase.execute(dto);

      expect(result.template.subject).toBe("Subject with émojis 🎉 and spëcial çhars");
    });
  });

  describe("Repository Interaction", () => {
    it("should call repository only once per execution", async () => {
      const dto: FindTemplateByIdentificatorDto = {
        identificator: "test-template",
      };

      const templateEntity = TemplateEntity.create(templateMock);
      mockTemplateRepository.findByIdentificator.mockResolvedValue(templateEntity);

      await useCase.execute(dto);

      expect(mockTemplateRepository.findByIdentificator).toHaveBeenCalledTimes(1);
    });

    it("should not call other repository methods", async () => {
      const dto: FindTemplateByIdentificatorDto = {
        identificator: "test-template",
      };

      const templateEntity = TemplateEntity.create(templateMock);
      mockTemplateRepository.findByIdentificator.mockResolvedValue(templateEntity);

      await useCase.execute(dto);

      expect(mockTemplateRepository.store).not.toHaveBeenCalled();
      expect(mockTemplateRepository.update).not.toHaveBeenCalled();
      expect(mockTemplateRepository.disable).not.toHaveBeenCalled();
      expect(mockTemplateRepository.findPaginated).not.toHaveBeenCalled();
      expect(mockTemplateRepository.findByDescription).not.toHaveBeenCalled();
    });

    it("should pass exact identificator to repository", async () => {
      const dto: FindTemplateByIdentificatorDto = {
        identificator: "exact-match-template",
      };

      const templateEntity = TemplateEntity.create(templateMock);
      mockTemplateRepository.findByIdentificator.mockResolvedValue(templateEntity);

      await useCase.execute(dto);

      expect(mockTemplateRepository.findByIdentificator).toHaveBeenCalledWith(
        "exact-match-template",
      );
      expect(mockTemplateRepository.findByIdentificator).not.toHaveBeenCalledWith(
        "EXACT-MATCH-TEMPLATE",
      );
      expect(mockTemplateRepository.findByIdentificator).not.toHaveBeenCalledWith(
        "exact match template",
      );
    });
  });
});
