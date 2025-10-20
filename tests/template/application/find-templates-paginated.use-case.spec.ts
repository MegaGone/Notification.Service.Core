import { TemplateEntity } from "../../../src/core/template/domain/entities/template.entity";
import { PrimitiveTemplate } from "../../../src/core/template/domain/entities/template.interface";
import { TEMPLATE_TYPE_ENUM } from "../../../src/core/template/domain/constants/template-type.enum";
import { TemplateRepository } from "../../../src/core/template/domain/repositories/template.repository";
import { FindTemplatesPaginatedDto } from "../../../src/core/template/application/find-templates-paginated/find-templates-paginated.dto";
import { FindTemplatesPaginatedUseCase } from "../../../src/core/template/application/find-templates-paginated/find-templates-paginated.use-case";

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

describe("FindTemplatesPaginatedUseCase", () => {
  let useCase: FindTemplatesPaginatedUseCase;
  let mockTemplateRepository: jest.Mocked<TemplateRepository>;

  beforeEach(() => {
    mockTemplateRepository = templateRepositoryMock();
    useCase = new FindTemplatesPaginatedUseCase(mockTemplateRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("execute", () => {
    it("should successfully return paginated templates", async () => {
      const dto: FindTemplatesPaginatedDto = {
        page: 1,
        pageSize: 10,
      };

      const templates = [
        TemplateEntity.create(templateMock({ identificator: "template-1" })),
        TemplateEntity.create(templateMock({ identificator: "template-2" })),
        TemplateEntity.create(templateMock({ identificator: "template-3" })),
      ];

      mockTemplateRepository.findPaginated.mockResolvedValue({
        count: 3,
        records: templates,
      });

      const result = await useCase.execute(dto);

      expect(result.count).toBe(3);
      expect(result.templates).toHaveLength(3);
      expect(result.templates[0].identificator).toBe("template-1");
      expect(result.templates[1].identificator).toBe("template-2");
      expect(result.templates[2].identificator).toBe("template-3");
      expect(mockTemplateRepository.findPaginated).toHaveBeenCalledWith(1, 10, undefined);
      expect(mockTemplateRepository.findPaginated).toHaveBeenCalledTimes(1);
    });

    it("should return empty array when no templates found", async () => {
      const dto: FindTemplatesPaginatedDto = {
        page: 1,
        pageSize: 10,
      };

      mockTemplateRepository.findPaginated.mockResolvedValue({
        count: 0,
        records: [],
      });

      const result = await useCase.execute(dto);

      expect(result.count).toBe(0);
      expect(result.templates).toEqual([]);
      expect(result.templates).toHaveLength(0);
    });

    it("should filter by enabled templates when enabled is true", async () => {
      const dto: FindTemplatesPaginatedDto = {
        page: 1,
        pageSize: 10,
        enabled: true,
      };

      const templates = [
        TemplateEntity.create(templateMock({ enabled: true, identificator: "enabled-1" })),
        TemplateEntity.create(templateMock({ enabled: true, identificator: "enabled-2" })),
      ];

      mockTemplateRepository.findPaginated.mockResolvedValue({
        count: 2,
        records: templates,
      });

      const result = await useCase.execute(dto);

      expect(result.count).toBe(2);
      expect(result.templates).toHaveLength(2);
      expect(result.templates.every((t) => t.enabled === true)).toBe(true);
      expect(mockTemplateRepository.findPaginated).toHaveBeenCalledWith(1, 10, true);
    });

    it("should filter by disabled templates when enabled is false", async () => {
      const dto: FindTemplatesPaginatedDto = {
        page: 1,
        pageSize: 10,
        enabled: false,
      };

      const templates = [
        TemplateEntity.create(templateMock({ enabled: false, identificator: "disabled-1" })),
        TemplateEntity.create(templateMock({ enabled: false, identificator: "disabled-2" })),
      ];

      mockTemplateRepository.findPaginated.mockResolvedValue({
        count: 2,
        records: templates,
      });

      const result = await useCase.execute(dto);

      expect(result.count).toBe(2);
      expect(result.templates).toHaveLength(2);
      expect(result.templates.every((t) => t.enabled === false)).toBe(true);
      expect(mockTemplateRepository.findPaginated).toHaveBeenCalledWith(1, 10, false);
    });

    it("should not filter when enabled is undefined", async () => {
      const dto: FindTemplatesPaginatedDto = {
        page: 1,
        pageSize: 10,
        enabled: undefined,
      };

      const templates = [
        TemplateEntity.create(templateMock({ enabled: true, identificator: "mixed-1" })),
        TemplateEntity.create(templateMock({ enabled: false, identificator: "mixed-2" })),
      ];

      mockTemplateRepository.findPaginated.mockResolvedValue({
        count: 2,
        records: templates,
      });

      const result = await useCase.execute(dto);

      expect(result.count).toBe(2);
      expect(result.templates).toHaveLength(2);
      expect(mockTemplateRepository.findPaginated).toHaveBeenCalledWith(1, 10, undefined);
    });

    it("should handle different page numbers", async () => {
      const dto: FindTemplatesPaginatedDto = {
        page: 3,
        pageSize: 5,
      };

      const templates = [
        TemplateEntity.create(templateMock({ identificator: "page3-1" })),
        TemplateEntity.create(templateMock({ identificator: "page3-2" })),
      ];

      mockTemplateRepository.findPaginated.mockResolvedValue({
        count: 12,
        records: templates,
      });

      const result = await useCase.execute(dto);

      expect(result.count).toBe(12);
      expect(result.templates).toHaveLength(2);
      expect(mockTemplateRepository.findPaginated).toHaveBeenCalledWith(3, 5, undefined);
    });

    it("should handle different page sizes", async () => {
      const dto: FindTemplatesPaginatedDto = {
        page: 1,
        pageSize: 25,
      };

      const templates = Array.from({ length: 25 }, (_, i) =>
        TemplateEntity.create(templateMock({ identificator: `template-${i + 1}` })),
      );

      mockTemplateRepository.findPaginated.mockResolvedValue({
        count: 50,
        records: templates,
      });

      const result = await useCase.execute(dto);

      expect(result.count).toBe(50);
      expect(result.templates).toHaveLength(25);
      expect(mockTemplateRepository.findPaginated).toHaveBeenCalledWith(1, 25, undefined);
    });

    it("should return all templates with EMAIL type", async () => {
      const dto: FindTemplatesPaginatedDto = {
        page: 1,
        pageSize: 10,
      };

      const templates = [
        TemplateEntity.create(templateMock({ type: TEMPLATE_TYPE_ENUM.EMAIL })),
        TemplateEntity.create(templateMock({ type: TEMPLATE_TYPE_ENUM.EMAIL })),
      ];

      mockTemplateRepository.findPaginated.mockResolvedValue({
        count: 2,
        records: templates,
      });

      const result = await useCase.execute(dto);

      expect(result.templates.every((t) => t.type === TEMPLATE_TYPE_ENUM.EMAIL)).toBe(true);
    });

    it("should return mixed template types", async () => {
      const dto: FindTemplatesPaginatedDto = {
        page: 1,
        pageSize: 10,
      };

      const templates = [
        TemplateEntity.create(templateMock({ type: TEMPLATE_TYPE_ENUM.EMAIL })),
        TemplateEntity.create(templateMock({ type: TEMPLATE_TYPE_ENUM.SMS })),
      ];

      mockTemplateRepository.findPaginated.mockResolvedValue({
        count: 2,
        records: templates,
      });

      const result = await useCase.execute(dto);

      expect(result.templates[0].type).toBe(TEMPLATE_TYPE_ENUM.EMAIL);
      expect(result.templates[1].type).toBe(TEMPLATE_TYPE_ENUM.SMS);
    });

    it("should preserve all template properties", async () => {
      const dto: FindTemplatesPaginatedDto = {
        page: 1,
        pageSize: 10,
      };

      const template = templateMock();
      const templates = [TemplateEntity.create(template)];

      mockTemplateRepository.findPaginated.mockResolvedValue({
        count: 1,
        records: templates,
      });

      const result = await useCase.execute(dto);

      expect(result.templates[0]).toMatchObject({
        id: template.id,
        type: template.type,
        sender: template.sender,
        subject: template.subject,
        description: template.description,
        templateId: template.templateId,
        identificator: template.identificator,
        fields: template.fields,
        enabled: template.enabled,
        createdAt: template.createdAt,
        updatedAt: template.updatedAt,
      });
    });
  });

  describe("Pagination Logic", () => {
    it("should handle first page", async () => {
      const dto: FindTemplatesPaginatedDto = {
        page: 1,
        pageSize: 5,
      };

      const templates = Array.from({ length: 5 }, (_, i) =>
        TemplateEntity.create(templateMock({ identificator: `template-${i + 1}` })),
      );

      mockTemplateRepository.findPaginated.mockResolvedValue({
        count: 20,
        records: templates,
      });

      const result = await useCase.execute(dto);

      expect(result.count).toBe(20);
      expect(result.templates).toHaveLength(5);
    });

    it("should handle last page with fewer items", async () => {
      const dto: FindTemplatesPaginatedDto = {
        page: 3,
        pageSize: 10,
      };

      const templates = Array.from({ length: 3 }, (_, i) =>
        TemplateEntity.create(templateMock({ identificator: `template-${i + 21}` })),
      );

      mockTemplateRepository.findPaginated.mockResolvedValue({
        count: 23,
        records: templates,
      });

      const result = await useCase.execute(dto);

      expect(result.count).toBe(23);
      expect(result.templates).toHaveLength(3);
    });

    it("should handle page size of 1", async () => {
      const dto: FindTemplatesPaginatedDto = {
        page: 1,
        pageSize: 1,
      };

      const templates = [TemplateEntity.create(templateMock())];

      mockTemplateRepository.findPaginated.mockResolvedValue({
        count: 100,
        records: templates,
      });

      const result = await useCase.execute(dto);

      expect(result.count).toBe(100);
      expect(result.templates).toHaveLength(1);
    });

    it("should handle large page size", async () => {
      const dto: FindTemplatesPaginatedDto = {
        page: 1,
        pageSize: 100,
      };

      const templates = Array.from({ length: 50 }, (_, i) =>
        TemplateEntity.create(templateMock({ identificator: `template-${i + 1}` })),
      );

      mockTemplateRepository.findPaginated.mockResolvedValue({
        count: 50,
        records: templates,
      });

      const result = await useCase.execute(dto);

      expect(result.count).toBe(50);
      expect(result.templates).toHaveLength(50);
    });

    it("should handle page beyond available data", async () => {
      const dto: FindTemplatesPaginatedDto = {
        page: 10,
        pageSize: 10,
      };

      mockTemplateRepository.findPaginated.mockResolvedValue({
        count: 50,
        records: [],
      });

      const result = await useCase.execute(dto);

      expect(result.count).toBe(50);
      expect(result.templates).toEqual([]);
    });
  });

  describe("Edge Cases", () => {
    it("should handle page 0", async () => {
      const dto: FindTemplatesPaginatedDto = {
        page: 0,
        pageSize: 10,
      };

      mockTemplateRepository.findPaginated.mockResolvedValue({
        count: 0,
        records: [],
      });

      const result = await useCase.execute(dto);

      expect(mockTemplateRepository.findPaginated).toHaveBeenCalledWith(0, 10, undefined);
    });

    it("should handle negative page number", async () => {
      const dto: FindTemplatesPaginatedDto = {
        page: -1,
        pageSize: 10,
      };

      mockTemplateRepository.findPaginated.mockResolvedValue({
        count: 0,
        records: [],
      });

      await useCase.execute(dto);

      expect(mockTemplateRepository.findPaginated).toHaveBeenCalledWith(-1, 10, undefined);
    });

    it("should handle pageSize of 0", async () => {
      const dto: FindTemplatesPaginatedDto = {
        page: 1,
        pageSize: 0,
      };

      mockTemplateRepository.findPaginated.mockResolvedValue({
        count: 10,
        records: [],
      });

      const result = await useCase.execute(dto);

      expect(result.templates).toEqual([]);
    });

    it("should handle very large count", async () => {
      const dto: FindTemplatesPaginatedDto = {
        page: 1,
        pageSize: 10,
      };

      const templates = Array.from({ length: 10 }, (_, i) =>
        TemplateEntity.create(templateMock({ identificator: `template-${i + 1}` })),
      );

      mockTemplateRepository.findPaginated.mockResolvedValue({
        count: 999999,
        records: templates,
      });

      const result = await useCase.execute(dto);

      expect(result.count).toBe(999999);
      expect(result.templates).toHaveLength(10);
    });

    it("should handle null records by returning empty array", async () => {
      const dto: FindTemplatesPaginatedDto = {
        page: 1,
        pageSize: 10,
      };

      mockTemplateRepository.findPaginated.mockResolvedValue({
        count: 0,
        records: null as any,
      });

      const result = await useCase.execute(dto);

      expect(result.templates).toEqual([]);
    });
  });

  describe("Data Integrity", () => {
    it("should preserve dates in all templates", async () => {
      const dto: FindTemplatesPaginatedDto = {
        page: 1,
        pageSize: 10,
      };

      const date1 = new Date("2025-01-01T00:00:00.000Z");
      const date2 = new Date("2025-02-01T00:00:00.000Z");

      const templates = [
        TemplateEntity.create(templateMock({ createdAt: date1, updatedAt: date1 })),
        TemplateEntity.create(templateMock({ createdAt: date2, updatedAt: date2 })),
      ];

      mockTemplateRepository.findPaginated.mockResolvedValue({
        count: 2,
        records: templates,
      });

      const result = await useCase.execute(dto);

      expect(result.templates[0].createdAt).toEqual(date1);
      expect(result.templates[0].updatedAt).toEqual(date1);
      expect(result.templates[1].createdAt).toEqual(date2);
      expect(result.templates[1].updatedAt).toEqual(date2);
    });

    it("should preserve fields array in all templates", async () => {
      const dto: FindTemplatesPaginatedDto = {
        page: 1,
        pageSize: 10,
      };

      const fields1 = ["name", "email"];
      const fields2 = ["phone", "address"];

      const templates = [
        TemplateEntity.create(templateMock({ fields: fields1 })),
        TemplateEntity.create(templateMock({ fields: fields2 })),
      ];

      mockTemplateRepository.findPaginated.mockResolvedValue({
        count: 2,
        records: templates,
      });

      const result = await useCase.execute(dto);

      expect(result.templates[0].fields).toEqual(fields1);
      expect(result.templates[1].fields).toEqual(fields2);
    });

    it("should handle templates with empty fields", async () => {
      const dto: FindTemplatesPaginatedDto = {
        page: 1,
        pageSize: 10,
      };

      const templates = [TemplateEntity.create(templateMock({ fields: [] }))];

      mockTemplateRepository.findPaginated.mockResolvedValue({
        count: 1,
        records: templates,
      });

      const result = await useCase.execute(dto);

      expect(result.templates[0].fields).toEqual([]);
    });

    it("should maintain template order", async () => {
      const dto: FindTemplatesPaginatedDto = {
        page: 1,
        pageSize: 10,
      };

      const templates = [
        TemplateEntity.create(templateMock({ identificator: "first" })),
        TemplateEntity.create(templateMock({ identificator: "second" })),
        TemplateEntity.create(templateMock({ identificator: "third" })),
      ];

      mockTemplateRepository.findPaginated.mockResolvedValue({
        count: 3,
        records: templates,
      });

      const result = await useCase.execute(dto);

      expect(result.templates[0].identificator).toBe("first");
      expect(result.templates[1].identificator).toBe("second");
      expect(result.templates[2].identificator).toBe("third");
    });
  });

  describe("Repository Interaction", () => {
    it("should call repository only once per execution", async () => {
      const dto: FindTemplatesPaginatedDto = {
        page: 1,
        pageSize: 10,
      };

      mockTemplateRepository.findPaginated.mockResolvedValue({
        count: 0,
        records: [],
      });

      await useCase.execute(dto);

      expect(mockTemplateRepository.findPaginated).toHaveBeenCalledTimes(1);
    });

    it("should not call other repository methods", async () => {
      const dto: FindTemplatesPaginatedDto = {
        page: 1,
        pageSize: 10,
      };

      mockTemplateRepository.findPaginated.mockResolvedValue({
        count: 0,
        records: [],
      });

      await useCase.execute(dto);

      expect(mockTemplateRepository.store).not.toHaveBeenCalled();
      expect(mockTemplateRepository.update).not.toHaveBeenCalled();
      expect(mockTemplateRepository.disable).not.toHaveBeenCalled();
      expect(mockTemplateRepository.findByDescription).not.toHaveBeenCalled();
      expect(mockTemplateRepository.findByIdentificator).not.toHaveBeenCalled();
    });

    it("should pass correct parameters to repository", async () => {
      const dto: FindTemplatesPaginatedDto = {
        page: 5,
        pageSize: 20,
        enabled: true,
      };

      mockTemplateRepository.findPaginated.mockResolvedValue({
        count: 0,
        records: [],
      });

      await useCase.execute(dto);

      expect(mockTemplateRepository.findPaginated).toHaveBeenCalledWith(5, 20, true);
    });
  });
});
