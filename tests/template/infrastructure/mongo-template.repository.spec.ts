import { Model } from "mongoose";
import { TemplateEntity } from "../../../src/core/template/domain/entities/template.entity";
import { PrimitiveTemplate } from "../../../src/core/template/domain/entities/template.interface";
import { TEMPLATE_TYPE_ENUM } from "../../../src/core/template/domain/constants/template-type.enum";
import { MongoTemplateInterface } from "../../../src/core/template/infrastructure/entities/template.interface";
import { MongoTemplateRepository } from "../../../src/core/template/infrastructure/repositories/mongo-template.repository";

// Interfaces para tipado seguro de mocks
interface MockQueryChain {
  exec: jest.MockedFunction<() => Promise<MongoTemplateInterface[]>>;
}

interface MockLimitChain {
  skip: jest.MockedFunction<(skipCount: number) => MockQueryChain>;
}

interface MockSelectChain {
  limit: jest.MockedFunction<(limitCount: number) => MockLimitChain>;
}

interface MockFindChain {
  select: jest.MockedFunction<(fields: string) => MockSelectChain>;
}

// Tipos para filtros de MongoDB
type MongoFilter = Record<string, unknown>;
type MongoUpdateData = Partial<PrimitiveTemplate>;
type MongoQueryOptions = { new: boolean };

interface MockedMongoModel {
  find: jest.MockedFunction<(filter: MongoFilter) => MockFindChain>;
  create: jest.MockedFunction<(doc: PrimitiveTemplate) => Promise<MongoTemplateInterface>>;
  findOne: jest.MockedFunction<(filter: MongoFilter) => Promise<MongoTemplateInterface | null>>;
  countDocuments: jest.MockedFunction<(filter: MongoFilter) => Promise<number>>;
  findOneAndUpdate: jest.MockedFunction<
    (
      filter: MongoFilter,
      update: MongoUpdateData,
      options: MongoQueryOptions,
    ) => Promise<MongoTemplateInterface | null>
  >;

  // Mocks internos expuestos para testing
  _selectMock: jest.MockedFunction<(fields: string) => MockSelectChain>;
  _limitMock: jest.MockedFunction<(limitCount: number) => MockLimitChain>;
  _skipMock: jest.MockedFunction<(skipCount: number) => MockQueryChain>;
  _execMock: jest.MockedFunction<() => Promise<MongoTemplateInterface[]>>;
}

const mongoTemplateMock = (overrides?: Partial<MongoTemplateInterface>): MongoTemplateInterface => {
  return {
    id: "123e4567-e89b-12d3-a456-426614174000",
    type: TEMPLATE_TYPE_ENUM.EMAIL,
    sender: "no-reply@example.com",
    subject: "Test Subject",
    description: "Template Description",
    templateId: "TEMPLATE_001",
    identificator: "welcome-email",
    fields: ["name", "email", "date"],
    enabled: true,
    createdAt: new Date("2025-01-01T00:00:00.000Z"),
    updatedAt: new Date("2025-01-02T00:00:00.000Z"),
    ...overrides,
  } as MongoTemplateInterface;
};

const mongoModelMock = (): MockedMongoModel => {
  const selectMock = jest.fn() as jest.MockedFunction<(fields: string) => MockSelectChain>;
  const limitMock = jest.fn() as jest.MockedFunction<(limitCount: number) => MockLimitChain>;
  const skipMock = jest.fn() as jest.MockedFunction<(skipCount: number) => MockQueryChain>;
  const execMock = jest.fn() as jest.MockedFunction<() => Promise<MongoTemplateInterface[]>>;

  selectMock.mockReturnValue({
    limit: limitMock.mockReturnValue({
      skip: skipMock.mockReturnValue({
        exec: execMock,
      }),
    }),
  });

  return {
    find: jest.fn().mockReturnValue({
      select: selectMock,
    }) as jest.MockedFunction<(filter: MongoFilter) => MockFindChain>,
    create: jest.fn() as jest.MockedFunction<
      (doc: PrimitiveTemplate) => Promise<MongoTemplateInterface>
    >,
    findOne: jest.fn() as jest.MockedFunction<
      (filter: MongoFilter) => Promise<MongoTemplateInterface | null>
    >,
    countDocuments: jest.fn() as jest.MockedFunction<(filter: MongoFilter) => Promise<number>>,
    findOneAndUpdate: jest.fn() as jest.MockedFunction<
      (
        filter: MongoFilter,
        update: MongoUpdateData,
        options: MongoQueryOptions,
      ) => Promise<MongoTemplateInterface | null>
    >,

    _selectMock: selectMock,
    _limitMock: limitMock,
    _skipMock: skipMock,
    _execMock: execMock,
  };
};

describe("MongoTemplateRepository", () => {
  let repository: MongoTemplateRepository;
  let mockModel: MockedMongoModel;
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    mockModel = mongoModelMock();
    repository = new MongoTemplateRepository(mockModel as unknown as Model<MongoTemplateInterface>);
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
    consoleLogSpy.mockRestore();
  });

  describe("store", () => {
    it("should successfully store a template", async () => {
      const templateData: PrimitiveTemplate = {
        type: TEMPLATE_TYPE_ENUM.EMAIL,
        sender: "test@example.com",
        subject: "Test Subject",
        description: "Test Description",
        templateId: "TEMPLATE_001",
        identificator: "test-template",
        fields: ["name", "email"],
        enabled: true,
      };

      const entity = TemplateEntity.create(templateData);
      const mongoRecord = mongoTemplateMock(templateData);

      mockModel.create.mockResolvedValue(mongoRecord as unknown as MongoTemplateInterface);

      const result = await repository.store(entity);

      expect(result).toBeInstanceOf(TemplateEntity);
      expect(result.toPrimitive().identificator).toBe("test-template");
      expect(mockModel.create).toHaveBeenCalledWith(templateData);
      expect(mockModel.create).toHaveBeenCalledTimes(1);
    });

    it("should throw ResponseStatus error when store fails", async () => {
      const templateData: PrimitiveTemplate = {
        type: TEMPLATE_TYPE_ENUM.EMAIL,
        sender: "test@example.com",
        subject: "Test",
        description: "Test",
        templateId: "TEMPLATE_001",
        identificator: "test-template",
        fields: [],
      };

      const entity = TemplateEntity.create(templateData);
      const dbError = new Error("Database connection failed");

      mockModel.create.mockRejectedValue(dbError);

      await expect(repository.store(entity)).rejects.toThrow("Internal server error.");
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("[ERROR][INFRA][MONGO TEMPLATE REPO][STORE]"),
      );
    });

    it("should store template with all properties", async () => {
      const templateData: PrimitiveTemplate = {
        id: "uuid-123",
        type: TEMPLATE_TYPE_ENUM.EMAIL,
        sender: "test@example.com",
        subject: "Test Subject",
        description: "Test Description",
        templateId: "TEMPLATE_001",
        identificator: "test-template",
        fields: ["field1", "field2", "field3"],
        enabled: true,
        createdAt: new Date("2025-01-01"),
        updatedAt: new Date("2025-01-02"),
      };

      const entity = TemplateEntity.create(templateData);
      const mongoRecord = mongoTemplateMock(templateData);

      mockModel.create.mockResolvedValue(mongoRecord as unknown as MongoTemplateInterface);

      const result = await repository.store(entity);

      expect(result.toPrimitive()).toMatchObject({
        id: "uuid-123",
        type: TEMPLATE_TYPE_ENUM.EMAIL,
        sender: "test@example.com",
        subject: "Test Subject",
        fields: ["field1", "field2", "field3"],
      });
    });
  });

  describe("disable", () => {
    it("should successfully disable a template", async () => {
      const mongoRecord = mongoTemplateMock({ enabled: false });

      mockModel.findOneAndUpdate.mockResolvedValue(
        mongoRecord as unknown as MongoTemplateInterface,
      );

      const result = await repository.disable("welcome-email");

      expect(result).toBe(true);
      expect(mockModel.findOneAndUpdate).toHaveBeenCalledWith(
        { identificator: "welcome-email" },
        { enabled: false },
        { new: true },
      );
      expect(mockModel.findOneAndUpdate).toHaveBeenCalledTimes(1);
    });

    it("should return false when template is not found", async () => {
      mockModel.findOneAndUpdate.mockResolvedValue(null as unknown as MongoTemplateInterface);

      const result = await repository.disable("non-existent");

      expect(result).toBe(false);
      expect(mockModel.findOneAndUpdate).toHaveBeenCalledWith(
        { identificator: "non-existent" },
        { enabled: false },
        { new: true },
      );
    });

    it("should return false when disable operation fails", async () => {
      const dbError = new Error("Database error");
      mockModel.findOneAndUpdate.mockRejectedValue(dbError);

      const result = await repository.disable("welcome-email");

      expect(result).toBe(false);
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("[ERROR][INFRA][MONGO TEMPLATE REPO][DISABLE]"),
      );
    });

    it("should handle special characters in identificator", async () => {
      const mongoRecord = mongoTemplateMock({ enabled: false });
      mockModel.findOneAndUpdate.mockResolvedValue(
        mongoRecord as unknown as MongoTemplateInterface,
      );

      await repository.disable("template-with-special-chars-!@#");

      expect(mockModel.findOneAndUpdate).toHaveBeenCalledWith(
        { identificator: "template-with-special-chars-!@#" },
        { enabled: false },
        { new: true },
      );
    });
  });

  describe("findByDescription", () => {
    it("should find template by description", async () => {
      const mongoRecord = mongoTemplateMock({ description: "Test Description" });

      mockModel.findOne.mockResolvedValue(mongoRecord as unknown as MongoTemplateInterface);

      const result = await repository.findByDescription("Test Description");

      expect(result).toBeInstanceOf(TemplateEntity);
      expect(result?.toPrimitive().description).toBe("Test Description");
      expect(mockModel.findOne).toHaveBeenCalledWith({ description: "Test Description" });
      expect(mockModel.findOne).toHaveBeenCalledTimes(1);
    });

    it("should return null when template is not found", async () => {
      mockModel.findOne.mockResolvedValue(null as unknown as MongoTemplateInterface);

      const result = await repository.findByDescription("Non-existent Description");

      expect(result).toBeNull();
      expect(mockModel.findOne).toHaveBeenCalledWith({
        description: "Non-existent Description",
      });
    });

    it("should return null when query fails", async () => {
      const dbError = new Error("Database query failed");
      mockModel.findOne.mockRejectedValue(dbError);

      const result = await repository.findByDescription("Test Description");

      expect(result).toBeNull();
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("[ERROR][MONGO][TEMPLATE][FIND_BY_DESCRIPTION]"),
      );
    });

    it("should handle special characters in description", async () => {
      const description = "Template with special chars !@#$%^&*()";
      const mongoRecord = mongoTemplateMock({ description });

      mockModel.findOne.mockResolvedValue(mongoRecord as unknown as MongoTemplateInterface);

      const result = await repository.findByDescription(description);

      expect(result).not.toBeNull();
      expect(mockModel.findOne).toHaveBeenCalledWith({ description });
    });
  });

  describe("findByIdentificator", () => {
    it("should find template by identificator", async () => {
      const mongoRecord = mongoTemplateMock({ identificator: "welcome-email" });

      mockModel.findOne.mockResolvedValue(mongoRecord as unknown as MongoTemplateInterface);

      const result = await repository.findByIdentificator("welcome-email");

      expect(result).toBeInstanceOf(TemplateEntity);
      expect(result?.toPrimitive().identificator).toBe("welcome-email");
      expect(mockModel.findOne).toHaveBeenCalledWith({ identificator: "welcome-email" });
      expect(mockModel.findOne).toHaveBeenCalledTimes(1);
    });

    it("should return null when template is not found", async () => {
      mockModel.findOne.mockResolvedValue(null as unknown as MongoTemplateInterface);

      const result = await repository.findByIdentificator("non-existent");

      expect(result).toBeNull();
      expect(mockModel.findOne).toHaveBeenCalledWith({ identificator: "non-existent" });
    });

    it("should return null when query fails", async () => {
      const dbError = new Error("Database query failed");
      mockModel.findOne.mockRejectedValue(dbError);

      const result = await repository.findByIdentificator("welcome-email");

      expect(result).toBeNull();
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("[ERROR][MONGO][TEMPLATE][FIND_BY_IDENTIFICATOR]"),
      );
    });

    it("should handle long identificators", async () => {
      const longId = "a".repeat(1000);
      const mongoRecord = mongoTemplateMock({ identificator: longId });

      mockModel.findOne.mockResolvedValue(mongoRecord as unknown as MongoTemplateInterface);

      const result = await repository.findByIdentificator(longId);

      expect(result).not.toBeNull();
      expect(result?.toPrimitive().identificator).toBe(longId);
    });
  });

  describe("findPaginated", () => {
    it("should find paginated templates without filter", async () => {
      const mongoRecords = [
        mongoTemplateMock({ identificator: "template-1" }),
        mongoTemplateMock({ identificator: "template-2" }),
        mongoTemplateMock({ identificator: "template-3" }),
      ];

      mockModel.countDocuments.mockResolvedValue(3);
      mockModel._execMock.mockResolvedValue(mongoRecords as unknown as MongoTemplateInterface[]);

      const result = await repository.findPaginated(1, 10);

      expect(result.count).toBe(3);
      expect(result.records).toHaveLength(3);
      expect(result.records[0]).toBeInstanceOf(TemplateEntity);
      expect(mockModel.countDocuments).toHaveBeenCalledWith({});
      expect(mockModel.find).toHaveBeenCalledWith({});
    });

    it("should find paginated templates with enabled filter true", async () => {
      const mongoRecords = [mongoTemplateMock({ enabled: true })];

      mockModel.countDocuments.mockResolvedValue(1);
      mockModel._execMock.mockResolvedValue(mongoRecords as unknown as MongoTemplateInterface[]);

      const result = await repository.findPaginated(1, 10, true);

      expect(result.count).toBe(1);
      expect(result.records).toHaveLength(1);
      expect(mockModel.countDocuments).toHaveBeenCalledWith({ enabled: true });
      expect(mockModel.find).toHaveBeenCalledWith({ enabled: true });
    });

    it("should calculate correct skip value for pagination", async () => {
      mockModel.countDocuments.mockResolvedValue(50);
      mockModel._execMock.mockResolvedValue([] as unknown as MongoTemplateInterface[]);

      await repository.findPaginated(3, 10);

      expect(mockModel._skipMock).toHaveBeenCalledWith(20); // (3-1) * 10 = 20
    });

    it("should handle page size of 1", async () => {
      const mongoRecord = [mongoTemplateMock()];

      mockModel.countDocuments.mockResolvedValue(100);
      mockModel._execMock.mockResolvedValue(mongoRecord as unknown as MongoTemplateInterface[]);

      const result = await repository.findPaginated(1, 1);

      expect(result.count).toBe(100);
      expect(result.records).toHaveLength(1);
    });

    it("should enforce minimum page size of 1", async () => {
      mockModel.countDocuments.mockResolvedValue(0);
      mockModel._execMock.mockResolvedValue([] as unknown as MongoTemplateInterface[]);

      await repository.findPaginated(1, 0);

      expect(mockModel._limitMock).toHaveBeenCalledWith(1); // Max(1, 0) = 1
    });

    it("should enforce minimum skip of 0", async () => {
      mockModel.countDocuments.mockResolvedValue(0);
      mockModel._execMock.mockResolvedValue([] as unknown as MongoTemplateInterface[]);

      await repository.findPaginated(0, 10);

      expect(mockModel._skipMock).toHaveBeenCalledWith(0); // Max(0, (0-1)*10) = 0
    });

    it("should return empty results when query fails", async () => {
      const dbError = new Error("Database query failed");
      mockModel.countDocuments.mockRejectedValue(dbError);

      const result = await repository.findPaginated(1, 10);

      expect(result.count).toBe(0);
      expect(result.records).toEqual([]);
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("[ERROR][MONGO][TEMPLATE][FIND_PAGINATED]"),
      );
    });

    it("should exclude templateId field from results", async () => {
      const mongoRecords = [mongoTemplateMock()];

      mockModel.countDocuments.mockResolvedValue(1);
      mockModel._execMock.mockResolvedValue(mongoRecords as unknown as MongoTemplateInterface[]);

      await repository.findPaginated(1, 10);

      expect(mockModel._selectMock).toHaveBeenCalledWith("-templateId");
    });

    it("should handle empty results", async () => {
      mockModel.countDocuments.mockResolvedValue(0);
      mockModel._execMock.mockResolvedValue([] as unknown as MongoTemplateInterface[]);

      const result = await repository.findPaginated(1, 10);

      expect(result.count).toBe(0);
      expect(result.records).toEqual([]);
    });
  });

  describe("update", () => {
    it("should successfully update all fields", async () => {
      const updateData: Partial<PrimitiveTemplate> = {
        sender: "updated@example.com",
        subject: "Updated Subject",
        description: "Updated Description",
        fields: ["field1", "field2"],
        templateId: "NEW_TEMPLATE_ID",
      };

      const updatedRecord = mongoTemplateMock(updateData);
      mockModel.findOneAndUpdate.mockResolvedValue(
        updatedRecord as unknown as MongoTemplateInterface,
      );

      const result = await repository.update("welcome-email", updateData);

      expect(result).toBe(true);
      expect(mockModel.findOneAndUpdate).toHaveBeenCalledWith(
        { identificator: "welcome-email" },
        {
          sender: "updated@example.com",
          subject: "Updated Subject",
          description: "Updated Description",
          fields: ["field1", "field2"],
          templateId: "NEW_TEMPLATE_ID",
        },
        { new: true },
      );
      expect(mockModel.findOneAndUpdate).toHaveBeenCalledTimes(1);
    });

    it("should update only sender field", async () => {
      const updateData: Partial<PrimitiveTemplate> = {
        sender: "new@example.com",
      };

      const updatedRecord = mongoTemplateMock(updateData);
      mockModel.findOneAndUpdate.mockResolvedValue(
        updatedRecord as unknown as MongoTemplateInterface,
      );

      const result = await repository.update("welcome-email", updateData);

      expect(result).toBe(true);
      expect(mockModel.findOneAndUpdate).toHaveBeenCalledWith(
        { identificator: "welcome-email" },
        { sender: "new@example.com" },
        { new: true },
      );
    });

    it("should update only subject field", async () => {
      const updateData: Partial<PrimitiveTemplate> = {
        subject: "New Subject",
      };

      const updatedRecord = mongoTemplateMock(updateData);
      mockModel.findOneAndUpdate.mockResolvedValue(
        updatedRecord as unknown as MongoTemplateInterface,
      );

      const result = await repository.update("welcome-email", updateData);

      expect(result).toBe(true);
      expect(mockModel.findOneAndUpdate).toHaveBeenCalledWith(
        { identificator: "welcome-email" },
        { subject: "New Subject" },
        { new: true },
      );
    });

    it("should update only fields array", async () => {
      const updateData: Partial<PrimitiveTemplate> = {
        fields: ["newField1", "newField2"],
      };

      const updatedRecord = mongoTemplateMock(updateData);
      mockModel.findOneAndUpdate.mockResolvedValue(
        updatedRecord as unknown as MongoTemplateInterface,
      );

      const result = await repository.update("welcome-email", updateData);

      expect(result).toBe(true);
      expect(mockModel.findOneAndUpdate).toHaveBeenCalledWith(
        { identificator: "welcome-email" },
        { fields: ["newField1", "newField2"] },
        { new: true },
      );
    });

    it("should return false when template is not found", async () => {
      const updateData: Partial<PrimitiveTemplate> = {
        sender: "test@example.com",
      };

      mockModel.findOneAndUpdate.mockResolvedValue(null as unknown as MongoTemplateInterface);

      const result = await repository.update("non-existent", updateData);

      expect(result).toBe(false);
    });

    it("should return false when update operation fails", async () => {
      const updateData: Partial<PrimitiveTemplate> = {
        sender: "test@example.com",
      };

      const dbError = new Error("Database error");
      mockModel.findOneAndUpdate.mockRejectedValue(dbError);

      const result = await repository.update("welcome-email", updateData);

      expect(result).toBe(false);
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("[ERROR][MONGO][TEMPLATE][UPDATE]"),
      );
    });

    it("should not update fields with undefined values", async () => {
      const updateData: Partial<PrimitiveTemplate> = {
        sender: "test@example.com",
        subject: undefined,
        description: undefined,
      };

      const updatedRecord = mongoTemplateMock();
      mockModel.findOneAndUpdate.mockResolvedValue(
        updatedRecord as unknown as MongoTemplateInterface,
      );

      await repository.update("welcome-email", updateData);

      expect(mockModel.findOneAndUpdate).toHaveBeenCalledWith(
        { identificator: "welcome-email" },
        { sender: "test@example.com" },
        { new: true },
      );
    });

    it("should handle empty fields array", async () => {
      const updateData: Partial<PrimitiveTemplate> = {
        fields: [],
      };

      const updatedRecord = mongoTemplateMock({ fields: [] });
      mockModel.findOneAndUpdate.mockResolvedValue(
        updatedRecord as unknown as MongoTemplateInterface,
      );

      const result = await repository.update("welcome-email", updateData);

      expect(result).toBe(true);
      expect(mockModel.findOneAndUpdate).toHaveBeenCalledWith(
        { identificator: "welcome-email" },
        { fields: [] },
        { new: true },
      );
    });

    it("should handle special characters in update data", async () => {
      const updateData: Partial<PrimitiveTemplate> = {
        subject: "Subject with émojis 🎉 and spëcial çhars",
        description: "Description with <html> & special chars",
      };

      const updatedRecord = mongoTemplateMock(updateData);
      mockModel.findOneAndUpdate.mockResolvedValue(
        updatedRecord as unknown as MongoTemplateInterface,
      );

      const result = await repository.update("welcome-email", updateData);

      expect(result).toBe(true);
    });
  });

  describe("_toDomain", () => {
    it("should convert mongo document to domain entity with all properties", async () => {
      const mongoRecord = mongoTemplateMock({
        id: "uuid-123",
        type: TEMPLATE_TYPE_ENUM.EMAIL,
        sender: "test@example.com",
        subject: "Test Subject",
        description: "Test Description",
        templateId: "TEMPLATE_001",
        identificator: "test-template",
        fields: ["field1", "field2"],
        enabled: true,
        createdAt: new Date("2025-01-01"),
        updatedAt: new Date("2025-01-02"),
      });

      mockModel.findOne.mockResolvedValue(mongoRecord as unknown as MongoTemplateInterface);

      const result = await repository.findByIdentificator("test-template");

      expect(result).toBeInstanceOf(TemplateEntity);
      expect(result?.toPrimitive()).toMatchObject({
        id: "uuid-123",
        type: TEMPLATE_TYPE_ENUM.EMAIL,
        sender: "test@example.com",
        subject: "Test Subject",
        description: "Test Description",
        templateId: "TEMPLATE_001",
        identificator: "test-template",
        fields: ["field1", "field2"],
        enabled: true,
      });
    });

    it("should handle SMS template type", async () => {
      const mongoRecord = mongoTemplateMock({
        type: TEMPLATE_TYPE_ENUM.SMS,
      });

      mockModel.findOne.mockResolvedValue(mongoRecord as unknown as MongoTemplateInterface);

      const result = await repository.findByIdentificator("sms-template");

      expect(result?.toPrimitive().type).toBe(TEMPLATE_TYPE_ENUM.SMS);
    });

    it("should handle disabled templates", async () => {
      const mongoRecord = mongoTemplateMock({
        enabled: false,
      });

      mockModel.findOne.mockResolvedValue(mongoRecord as unknown as MongoTemplateInterface);

      const result = await repository.findByIdentificator("disabled-template");

      expect(result?.toPrimitive().enabled).toBe(false);
    });

    it("should preserve dates correctly", async () => {
      const createdDate = new Date("2025-03-15T10:30:00.000Z");
      const updatedDate = new Date("2025-03-16T15:45:00.000Z");

      const mongoRecord = mongoTemplateMock({
        createdAt: createdDate,
        updatedAt: updatedDate,
      });

      mockModel.findOne.mockResolvedValue(mongoRecord as unknown as MongoTemplateInterface);

      const result = await repository.findByIdentificator("date-template");

      expect(result?.toPrimitive().createdAt).toEqual(createdDate);
      expect(result?.toPrimitive().updatedAt).toEqual(updatedDate);
    });
  });
});
