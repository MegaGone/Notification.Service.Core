import { TemplateEntity } from "../../../src/core/template/domain/entities/template.entity";
import { PrimitiveTemplate } from "../../../src/core/template/domain/entities/template.interface";
import { TEMPLATE_TYPE_ENUM } from "../../../src/core/template/domain/constants/template-type.enum";

const templateMock = ((): PrimitiveTemplate => {
  return {
    enabled: true,
    subject: "Test Subject",
    templateId: "TEMPLATE_001",
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

describe("TemplateEntity", () => {
  describe("create", () => {
    it("should create a TemplateEntity instance with all attributes", () => {
      // Arrange - Act
      const entity = TemplateEntity.create(templateMock);

      // Assert
      expect(entity).toBeInstanceOf(TemplateEntity);
      expect(entity.toPrimitive()).toEqual(templateMock);
    });

    it("should create a TemplateEntity instance with only required attributes", () => {
      // Arrange
      const mockAttributes: PrimitiveTemplate = {
        type: TEMPLATE_TYPE_ENUM.SMS,
        sender: "SMS_SENDER",
        subject: "SMS Subject",
        description: "SMS Template",
        templateId: "TEMPLATE_SMS_001",
        fields: ["phone", "message"],
      };

      // Act
      const entity = TemplateEntity.create(mockAttributes);

      // Assert
      expect(entity).toBeInstanceOf(TemplateEntity);
      const primitive = entity.toPrimitive();
      expect(primitive.type).toBe(TEMPLATE_TYPE_ENUM.SMS);
      expect(primitive.sender).toBe("SMS_SENDER");
      expect(primitive.subject).toBe("SMS Subject");
      expect(primitive.description).toBe("SMS Template");
      expect(primitive.templateId).toBe("TEMPLATE_SMS_001");
      expect(primitive.fields).toEqual(["phone", "message"]);
    });

    it("should create an instance with optional fields as undefined", () => {
      // Arrange
      const mockAttributes: PrimitiveTemplate = {
        type: TEMPLATE_TYPE_ENUM.EMAIL,
        sender: "test@example.com",
        subject: "Test Subject",
        description: "Test Description",
        templateId: "TEST_001",
        fields: [],
      };

      // Act
      const entity = TemplateEntity.create(mockAttributes);
      const primitive = entity.toPrimitive();

      // Assert
      expect(primitive.id).toBeUndefined();
      expect(primitive.identificator).toBeUndefined();
      expect(primitive.enabled).toBeUndefined();
      expect(primitive.createdAt).toBeUndefined();
      expect(primitive.updatedAt).toBeUndefined();
    });

    it("should handle empty fields array", () => {
      // Arrange
      const mockAttributes: PrimitiveTemplate = {
        ...templateMock,
        fields: [],
      };

      // Act
      const entity = TemplateEntity.create(mockAttributes);

      // Assert
      expect(entity.toPrimitive().fields).toEqual([]);
    });

    it("should handle fields array with multiple elements", () => {
      // Arrange
      const fields = ["field1", "field2", "field3", "field4", "field5"];
      const mockAttributes: PrimitiveTemplate = {
        ...templateMock,
        fields: fields,
      };

      // Act
      const entity = TemplateEntity.create(mockAttributes);

      // Assert
      expect(entity.toPrimitive().fields).toEqual(fields);
      expect(entity.toPrimitive().fields.length).toBe(5);
    });

    it("should preserve EMAIL template type", () => {
      // Arrange
      const mockAttributes: PrimitiveTemplate = {
        ...templateMock,
        type: TEMPLATE_TYPE_ENUM.EMAIL,
      };

      // Act
      const entity = TemplateEntity.create(mockAttributes);

      // Assert
      expect(entity.toPrimitive().type).toBe(TEMPLATE_TYPE_ENUM.EMAIL);
    });

    it("should preserve SMS template type", () => {
      // Arrange
      const mockAttributes: PrimitiveTemplate = {
        ...templateMock,
        type: TEMPLATE_TYPE_ENUM.SMS,
      };

      // Act
      const entity = TemplateEntity.create(mockAttributes);

      // Assert
      expect(entity.toPrimitive().type).toBe(TEMPLATE_TYPE_ENUM.SMS);
    });
  });

  describe("toPrimitive", () => {
    it("should return a PrimitiveTemplate object with all attributes", () => {
      // Arrange
      const entity = TemplateEntity.create(templateMock);

      // Act
      const primitive = entity.toPrimitive();

      // Assert
      expect(primitive).toEqual(templateMock);
      expect(primitive).toMatchObject({
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

    it("should return an object with properties when optional attributes are not provided", () => {
      // Arrange
      const mockAttributes: PrimitiveTemplate = {
        type: TEMPLATE_TYPE_ENUM.EMAIL,
        sender: "sender@example.com",
        subject: "Subject",
        description: "Description",
        templateId: "TPL_001",
        fields: ["test"],
      };
      const entity = TemplateEntity.create(mockAttributes);

      // Act
      const primitive = entity.toPrimitive();

      // Assert
      expect(primitive).toHaveProperty("id");
      expect(primitive).toHaveProperty("identificator");
      expect(primitive).toHaveProperty("enabled");
      expect(primitive).toHaveProperty("createdAt");
      expect(primitive).toHaveProperty("updatedAt");
    });

    it("should return an independent copy of the object", () => {
      // Arrange
      const entity = TemplateEntity.create(templateMock);

      // Act
      const primitive1 = entity.toPrimitive();
      const primitive2 = entity.toPrimitive();

      // Assert
      expect(primitive1).toEqual(primitive2);
      expect(primitive1).not.toBe(primitive2); // Should not be the same reference
    });

    it("should preserve dates correctly", () => {
      // Arrange
      const createdDate = new Date("2025-03-15T10:30:00.000Z");
      const updatedDate = new Date("2025-03-16T15:45:00.000Z");
      const mockAttributes: PrimitiveTemplate = {
        ...templateMock,
        createdAt: createdDate,
        updatedAt: updatedDate,
      };
      const entity = TemplateEntity.create(mockAttributes);

      // Act
      const primitive = entity.toPrimitive();

      // Assert
      expect(primitive.createdAt).toEqual(createdDate);
      expect(primitive.updatedAt).toEqual(updatedDate);
      expect(primitive.createdAt instanceof Date).toBe(true);
      expect(primitive.updatedAt instanceof Date).toBe(true);
    });

    it("should preserve enabled state when it is false", () => {
      // Arrange
      const mockAttributes: PrimitiveTemplate = {
        ...templateMock,
        enabled: false,
      };
      const entity = TemplateEntity.create(mockAttributes);

      // Act
      const primitive = entity.toPrimitive();

      // Assert
      expect(primitive.enabled).toBe(false);
    });

    it("should preserve enabled state when it is true", () => {
      // Arrange
      const entity = TemplateEntity.create(templateMock);

      // Act
      const primitive = entity.toPrimitive();

      // Assert
      expect(primitive.enabled).toBe(true);
    });
  });

  describe("Reference Behavior", () => {
    it("should return new primitive references on each toPrimitive call", () => {
      // Arrange
      const entity = TemplateEntity.create(templateMock);
      const primitive1 = entity.toPrimitive();

      // Act - Modify primitive values of returned object
      primitive1.subject = "Modified Subject";
      primitive1.enabled = false;

      // Assert - Primitive values should not affect subsequent calls
      const primitive2 = entity.toPrimitive();
      expect(primitive2.subject).toBe(templateMock.subject);
      expect(primitive2.enabled).toBe(templateMock.enabled);
    });

    it("should note that arrays share references (current behavior)", () => {
      // Arrange
      const mockAttributes: PrimitiveTemplate = {
        ...templateMock,
        fields: ["field1", "field2"],
      };
      const entity = TemplateEntity.create(mockAttributes);
      const primitive1 = entity.toPrimitive();

      // Act - Modify the array
      primitive1.fields.push("field3");

      // Assert - Arrays share reference (current behavior)
      // NOTE: This behavior could be improved by making a deep copy
      const primitive2 = entity.toPrimitive();
      expect(primitive2.fields).toEqual(["field1", "field2", "field3"]);
      expect(primitive2.fields.length).toBe(3);
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty strings in required fields", () => {
      // Arrange
      const mockAttributes: PrimitiveTemplate = {
        type: TEMPLATE_TYPE_ENUM.EMAIL,
        sender: "",
        subject: "",
        description: "",
        templateId: "",
        fields: [],
      };

      // Act
      const entity = TemplateEntity.create(mockAttributes);
      const primitive = entity.toPrimitive();

      // Assert
      expect(primitive.sender).toBe("");
      expect(primitive.subject).toBe("");
      expect(primitive.description).toBe("");
      expect(primitive.templateId).toBe("");
    });

    it("should handle strings with whitespace", () => {
      // Arrange
      const mockAttributes: PrimitiveTemplate = {
        ...templateMock,
        sender: "   spaces@example.com   ",
        subject: "  Subject with spaces  ",
        description: "  Description  ",
        templateId: "  TPL_001  ",
        fields: ["  field1  ", "  field2  "],
      };

      // Act
      const entity = TemplateEntity.create(mockAttributes);
      const primitive = entity.toPrimitive();

      // Assert
      expect(primitive.sender).toBe("   spaces@example.com   ");
      expect(primitive.subject).toBe("  Subject with spaces  ");
      expect(primitive.fields).toEqual(["  field1  ", "  field2  "]);
    });

    it("should handle special characters in text fields", () => {
      // Arrange
      const mockAttributes: PrimitiveTemplate = {
        ...templateMock,
        sender: "test+tag@example.com",
        subject: "Subject with émojis 🎉 and spëcial çhars",
        description: "Description with <html> & special chars",
        templateId: "TPL-001_v2.0",
        fields: ["field@1", "field#2", "field$3"],
      };

      // Act
      const entity = TemplateEntity.create(mockAttributes);
      const primitive = entity.toPrimitive();

      // Assert
      expect(primitive.sender).toBe("test+tag@example.com");
      expect(primitive.subject).toBe("Subject with émojis 🎉 and spëcial çhars");
      expect(primitive.description).toBe("Description with <html> & special chars");
      expect(primitive.fields).toEqual(["field@1", "field#2", "field$3"]);
    });

    it("should handle a very long identificator", () => {
      // Arrange
      const longIdentificator = "a".repeat(1000);
      const mockAttributes: PrimitiveTemplate = {
        ...templateMock,
        identificator: longIdentificator,
      };

      // Act
      const entity = TemplateEntity.create(mockAttributes);
      const primitive = entity.toPrimitive();

      // Assert
      expect(primitive.identificator).toBe(longIdentificator);
      expect(primitive.identificator?.length).toBe(1000);
    });
  });
});
